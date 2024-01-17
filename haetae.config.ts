import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'
import { $, configure, utils, git } from 'haetae'
import { Octokit } from '@octokit/action'
import github from '@actions/github'
import { dirname } from 'dirname-filename-esm'
import path from 'upath'
import {
  extensions,
  toOriginalFilename,
  getAuthor,
} from './workflows/render.js'
import {
  extractFrontMatter,
  loadConfig,
  publish,
  createDevToAxiosInstance,
  edit,
  insertId,
} from './workflows/publish.js'

export default configure({
  commands: {
    publish: {
      env: () => {
        // REF($GITHUB_REF): https://docs.github.com/en/actions/learn-github-actions/variables
        assert(
          github.context.ref === 'refs/heads/main',
          'Only push(NOT PR) to main is allowed',
        )
        return {}
      },
      run: async () => {
        await $`pnpm render`
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const affectedArticles = (await utils.changedFiles(
          [`articles/**/*.rendered.md`],
          {
            filterByExistence: true,
          },
        )) as string[]

        console.log(affectedArticles)
        const config = await loadConfig()

        const publishOps: (() => Promise<void>)[] = []
        const editOps: (() => Promise<void>)[] = []

        for (const article of affectedArticles) {
          const content = await fs.readFile(article, 'utf8')
          const frontMatter = extractFrontMatter(content)
          if (!frontMatter?.ci || frontMatter?.platform !== 'dev.to') {
            continue
          }

          const author = getAuthor(article)
          const apiKey = process.env[config[author]['dev.to'].apiKey] as string
          assert(apiKey, `No API key for ${author}`)
          const devTo = createDevToAxiosInstance(apiKey)

          if (frontMatter.id) {
            console.log(`[id: ${frontMatter.id}] ${article} will be edited. `)
            editOps.push(async () => {
              console.log(`[id: ${frontMatter.id}] Editing ${article} ...`)
              await edit({
                id: frontMatter.id!,
                content,
                instance: devTo,
              })
            })
          } else {
            console.log(`[new] ${article} will be published. `)
            publishOps.push(async () => {
              console.log(`[new] Publishing ${article} ...`)
              const id = await publish({
                content,
                instance: devTo,
              })
              const original = toOriginalFilename(article)
              console.log(`[new] Inserting id(${id}) into ${original}`)
              const newContent = await insertId({
                id,
                content: await fs.readFile(original, 'utf8'),
              })
              console.log(`Writing ${original}`)
              await fs.writeFile(original, newContent)
              await $`git add ${original}`
            })
          }
        }
        console.log(
          `${editOps.length + publishOps.length} ops will be executed.`,
        )

        // To lower the possibility of error in the middle of the API calls,
        // separate the API calls from the for-loop above.
        for (const op of editOps) {
          await op()
          await setTimeout(1000) // To avoid rate-limiting
        }
        // Editing is idempotent, while publishing is not.
        // So publish later than editing.
        for (const op of publishOps) {
          await op()
          await setTimeout(1000) // To avoid rate-limiting
        }

        if (publishOps.length > 0) {
          console.log(`A new article is published. Committing and pushing ...`)
          const message = `chore(publish): sync id from dev.to

[skip ci]`
          await $`git commit -m ${message}` // message is quoted(escaped) automatically by execa
          await $`git push`
        }
      },
    },
    comment: {
      env: () => {
        // REF($GITHUB_REF): https://docs.github.com/en/actions/learn-github-actions/variables
        assert(
          github.context.ref === 'refs/heads/main' ||
            github.context.eventName === 'pull_request',
          'Only PR (Not push) is allowed. For push (Not PR), only the branch main is exception.',
        )
        return {}
      },
      run: async () => {
        await $`pnpm render`
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const affectedArticles = (await utils.changedFiles(
          [`articles/**/*.rendered${extensions}`],
          {
            filterByExistence: true,
          },
        )) as string[]
        if (github.context.ref === 'refs/heads/main') {
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const changedFiles = (await git.changedFiles({
          // This is the base branch's (not PR branch's) commit of the PR
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          from: github.context.payload.pull_request!.base.sha as string,
        })) as string[]

        const sideEffects = affectedArticles
          .map((f) => toOriginalFilename(f))
          .filter((file) => !changedFiles.includes(file))
        const pr = github.context.issue
        const octokit = new Octokit()
        const branch = await git.branch()
        // eslint-disable-next-line unicorn/prefer-ternary
        if (sideEffects.length === 0) {
          await octokit.issues.createComment({
            ...pr,
            issue_number: pr.number,
            body: `✅ 사이드 이펙트가 감지되지 않았습니다.
*(PR 에 포함되지 않은 파일들의 렌더링에 영향이 없습니다.)*`,
          })
        } else {
          await octokit.issues.createComment({
            ...pr,
            issue_number: pr.number,
            body: `⚠️ 사이드 이펙트가 감지되었습니다.
아래의 파일들은 PR 에 포함되지 않지만 렌더링에 영향을 받습니다.

${affectedArticles
  .map((f) => toOriginalFilename(f))
  .map((f) => f.replace(dirname(import.meta), ''))
  .map((f) => (f.startsWith('/') ? f.slice(1) : f))
  .map(
    (f) =>
      `- *[\`${f}\`](${path.join(
        github.context.payload.repository?.html_url,
        'blob',
        branch,
        f,
      )})*`,
  )
  .join('\n')}`,
          })
        }
      },
    },
  },
}) as unknown
