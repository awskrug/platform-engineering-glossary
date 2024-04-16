import type { Rec } from '@haetae/common'
import assert from 'node:assert/strict'
import { $, configure, utils, core } from 'haetae'
import { extensions } from './workflows/render.js'
import { detectSideEffects, publishArticles } from './workflows/publish.js'
import {
  commentOnPr,
  isPr,
  isPushToMain,
  prNumber,
} from './workflows/github.js'

function handleErr<A extends { store: core.StoreConnector }, R>(
  func: (options: A) => Promise<R>,
): (options: A) => Promise<R> {
  return async (options: A) => {
    try {
      return await func(options)
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default configure({
  commands: {
    publish: {
      env: () => {
        assert(isPr() || isPushToMain(), 'Only push to main or PR is allowed.')
      },
      run: handleErr(async ({ store }) => {
        interface RecordData extends Rec {
          [pr: number]: {
            hasSideEffects?: boolean
          }
        }
        // eslint-disable-next-line unicorn/consistent-function-scoping
        const loadAffectedArticles = async (): Promise<string[]> => {
          await $`pnpm render`
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          return (await utils.changedFiles(
            [`articles/**/*.rendered${extensions}`],
            {
              filterByExistence: true,
            },
          )) as string[]
        }
        const affectedArticles = await loadAffectedArticles()

        const messages: string[] = []

        console.log('affectedArticles:', affectedArticles)

        const { hasSideEffects, message: sideEffectDetectionMessage } =
          await detectSideEffects(affectedArticles)
        const previousRecord = await store.getRecord<RecordData>()

        // PR 의 처음(undefined)이거나, "이전"에 side effect 가 있었거나(true), "이번"에 side effect 가 있을때(hasSideEffects) 메시지를 남긴다.
        if (
          isPr() &&
          (hasSideEffects ||
            [true, undefined].includes(
              previousRecord?.data[prNumber()]?.hasSideEffects,
            ))
        ) {
          messages.push(sideEffectDetectionMessage)
        }

        const { needPush, message: draftUrlLinkMessage } =
          await publishArticles(affectedArticles)

        if (needPush) {
          messages.push(draftUrlLinkMessage)
          console.log(`Frontmatter is updated. Committing and pushing ...`)
          const message = `articles: update Frontmatter

[skip ci]`
          await $`git commit -m ${message}` // message is quoted(escaped) automatically by execa
          await $`git pull`
          await $`git push`

          // To override Reserved Record Data,
          // clear memoized changedFiles
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          utils.changedFiles.clear()
          // and reload affectedArticles
          await loadAffectedArticles()
        }
        if (isPr() && messages.length > 0) {
          await commentOnPr(
            messages
              .map((m) => m.trim())
              .filter(Boolean)
              .join('\n\n'),
          )
        }
        if (isPr()) {
          return {
            [prNumber()]: {
              hasSideEffects,
            },
          }
        }
      }),
    },
  },
}) as unknown
