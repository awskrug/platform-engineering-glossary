import type { AxiosInstance } from 'axios'
import type { JSONValue } from 'types-json'
import fs from 'node:fs/promises'
import path from 'upath'
import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'
import yaml from 'yaml'
import axios from 'axios'
import { dirname } from 'dirname-filename-esm'
import { $ } from 'execa' // not using haetae's, because of test of loadConfig
import mustache from 'mustache'
import github from '@actions/github'
import { git } from 'haetae'
import {
  getAuthor,
  parseGlossary,
  render,
  toOriginalFilename,
} from './render.js'
import { branchOnPr, commentOnPr, isPr, isPushToMain } from './github.js'

const projectRoot = path.resolve(dirname(import.meta), '..')

export interface FrontMatter extends Record<string, JSONValue | undefined> {
  title?: string
  published?: boolean
  description?: string
  tags?: string
  series?: string
  cover_image?: string
  organization_id?: number
  platform?: 'dev.to'
  ci?: boolean
  slug?: string
  id?: number
}

export interface ExtractRawFrontMatterOptions {
  removeDelimiter?: boolean
}

/**
 * content should be prerendered
 */
export function extractRawFrontMatter(
  content: string,
  { removeDelimiter = true }: ExtractRawFrontMatterOptions = {},
): string | undefined {
  const rawFrontMatter = content.match(
    /^---\s*\n([\S\s]*?)\s*\n---\s*\n/gm,
  )?.[0]

  // Lint
  for (const line of rawFrontMatter?.split('\n') || []) {
    if (line.trim()) {
      assert(
        !line.startsWith(' ') && !line.startsWith('\t'),
        'Frontmatter must not be indented.',
      )
    }
  }
  if (removeDelimiter) {
    return rawFrontMatter?.replace(/^---\s*\n/, '').replace(/---\s*\n$/, '')
  }
  return rawFrontMatter
}

/**
 * content should be prerendered
 */
export function extractFrontMatter(content: string): FrontMatter | undefined {
  const rawFrontMatter = extractRawFrontMatter(content)

  if (!rawFrontMatter) {
    return undefined
  }

  const frontMatter = yaml.parse(rawFrontMatter) as FrontMatter

  assert(frontMatter, 'Parsing error of FrontMatter.')

  assert(
    frontMatter.platform === undefined || frontMatter.platform === 'dev.to',
    '`platform` must be undefined or "dev.to"',
  )

  if (frontMatter.platform === 'dev.to') {
    assert(
      frontMatter.ci === undefined || typeof frontMatter.ci === 'boolean',
      '`ci` must be undefined or boolean',
    )

    assert(
      frontMatter.organization_id === undefined ||
        typeof frontMatter.organization_id === 'number',
      '`organization_id` must be undefined or number',
    )
    if (frontMatter.ci) {
      assert(
        frontMatter.slug && typeof frontMatter.slug === 'string',
        '`slug` must be defined when `ci` is true',
      )
      assert(
        typeof frontMatter.published === 'boolean',
        '`published` must be defined when `ci` is true',
      )
    }
  }
  return frontMatter
}

export interface SetFrontMatterOptions {
  frontMatter: FrontMatter
  content: string
}

/**
 * Returns a new content with the new frontmatter.
 * Comments will be removed from the frontmatter
 * `content` should be pre-rendered({{  }}).
 */
export function setFrontMatter({
  frontMatter,
  content,
}: SetFrontMatterOptions): string {
  const oldFrontmatter = extractFrontMatter(content)
  const rawFrontMatter = extractRawFrontMatter(content)
  assert(rawFrontMatter, 'Frontmatter to merge does not exist.')
  const newRawFrontMatter = yaml.stringify(
    {
      ...oldFrontmatter,
      ...frontMatter,
    },
    {
      lineWidth: 0,
    },
  )
  return content.replace(rawFrontMatter, newRawFrontMatter)
}

export interface InsertIdOptions {
  id: number
  content: string
}

/**
 * Returns a new content with new `id`.
 * `id` must not pre-exist.
 * `content` do not need to be pre-rendered({{  }}).
 */
export async function insertId({
  id,
  content,
}: InsertIdOptions): Promise<string> {
  const frontMatter = extractFrontMatter(
    mustache.render(content, await parseGlossary()),
  )
  assert(frontMatter, 'Frontmatter does not exist.')
  assert(!frontMatter.id, 'id already exists.')
  const rawfrontMatter = extractRawFrontMatter(content)
  return content.replace(rawfrontMatter!, `${rawfrontMatter}id: ${id}\n`)
}

interface SetPublishedOptions {
  published: boolean
  content: string
}

/**
 * Returns a new content with new `published`.
 * `published` must pre-exist.
 * `content` do not need to be pre-rendered({{  }}).
 */
export async function setPublished({
  published,
  content,
}: SetPublishedOptions): Promise<string> {
  const frontMatter = extractFrontMatter(
    mustache.render(content, await parseGlossary()),
  )
  assert(frontMatter, 'Frontmatter does not exist.')
  assert(
    typeof frontMatter.published === 'boolean',
    '`published` should exist in Frontmatter.',
  )
  const rawFrontMatter = extractRawFrontMatter(content)!
  const newRawFrontMatter = rawFrontMatter.replace(
    /\npublished:\s*(true|false)\s*\n/,
    `\npublished: ${published}\n`,
  )
  return content.replace(rawFrontMatter, newRawFrontMatter)
}

export function createDevToAxiosInstance(apiKey: string) {
  return axios.create({
    baseURL: 'https://dev.to/api/',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
  })
}

interface Response {
  id: number
  url: string
}

export interface EditOptions {
  content: string
  instance: AxiosInstance
  id?: number
  applySlug?: boolean
}

/**
 * Idempotent.
 */
export async function edit({
  content,
  instance,
  id = extractFrontMatter(content)?.id,
  applySlug = false,
}: EditOptions): Promise<Response> {
  assert(id, 'id must be defined.')
  if (applySlug) {
    const frontMatter = extractFrontMatter(content)
    assert(frontMatter?.slug, 'slug must be defined.')
    const temporaryContent = setFrontMatter({
      frontMatter: {
        title: frontMatter.slug,
      },
      content,
    })
    await instance.put<Response>(`/articles/${id}`, {
      article: {
        body_markdown: temporaryContent,
      },
    })
    await setTimeout(1000) // To avoid rate-limiting
  }
  const res = await instance.put<Response>(`/articles/${id}`, {
    article: {
      body_markdown: content,
    },
  })
  return {
    id: res.data.id,
    url: res.data.url,
  }
}

export interface Config {
  [author: string]: {
    'dev.to': {
      apiKey: string
    }
  }
}

export interface PublishOptions {
  content: string
  instance: AxiosInstance
}

export async function publish({
  content,
  instance,
}: PublishOptions): Promise<Response> {
  const frontMatter = extractFrontMatter(content)
  assert(frontMatter, 'Frontmatter does not exist.')
  assert(!frontMatter.id, '`id` must not pre-exist.')

  const shouldPostEdit = frontMatter.slug && frontMatter.title
  const res = await instance.post<Response>('/articles', {
    article: {
      body_markdown: shouldPostEdit
        ? setFrontMatter({
            frontMatter: {
              title: frontMatter.slug,
            },
            content,
          })
        : content,
      organization_id: frontMatter?.organization_id,
    },
  })

  const { id, url } = res.data
  console.log(`[id: ${id}] Published.`)

  if (shouldPostEdit) {
    await setTimeout(1000) // To avoid rate-limiting
    await edit({
      content,
      instance,
      id,
    })
  }

  return {
    id,
    url,
  }
}

/**
 * Load articles/config.yaml
 */
export async function loadConfig(): Promise<Config> {
  await $`pnpm lint:config`
  const config = yaml.parse(
    await fs.readFile(
      path.resolve(projectRoot, 'articles/config.yaml'),
      'utf8',
    ),
  ) as Config
  return config
}

export interface GetOrgIdOptions {
  instance: AxiosInstance
  name: string // e.g. https://dev.to/${name}
}

export async function getOrgId({
  instance,
  name,
}: GetOrgIdOptions): Promise<number> {
  const res = await instance.get<{ id: number }>(`/organizations/${name}`)
  return res.data.id
}

/**
 * Returns a message if there are side effects.
 * Call this function only from PR
 */
export async function detectSideEffects(affectedArticles: string[]) {
  if (!isPr()) {
    return {
      hasSideEffects: false,
      message: '',
    }
  }

  // assert(
  //   github.context.eventName === 'pull_request',
  //   'Only PR (Not push) is allowed.',
  // )
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const changedFiles = (await git.changedFiles({
    // This is the base branch's (not PR branch's) commit of the PR
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    from: github.context.payload.pull_request!.base.sha as string,
  })) as string[]

  const sideEffects = affectedArticles
    .map((f) => toOriginalFilename(f))
    .filter((file) => !changedFiles.includes(file))
  if (sideEffects.length === 0) {
    return {
      hasSideEffects: false,
      message: `✅ 사이드 이펙트가 감지되지 않았습니다.
*(PR 에 포함되지 않은 파일들의 렌더링에 영향이 없습니다.)*`,
    }
  }

  return {
    hasSideEffects: true,
    message: `⚠️ 사이드 이펙트가 감지되었습니다.
아래의 파일들은 PR 에 포함되지 않지만 렌더링에 영향을 받습니다.

${affectedArticles
  .map((f) => toOriginalFilename(f))
  .map((f) => f.replace(projectRoot, ''))
  .map((f) => (f.startsWith('/') ? f.slice(1) : f))
  .map(
    (f) =>
      `- *[\`${f}\`](${path.join(
        github.context.payload.repository!.html_url!,
        'blob',
        branchOnPr(),
        f,
      )})*`,
  )
  .join('\n')}`,
  }
}

export async function publishArticles(affectedArticles: string[]) {
  const config = await loadConfig()

  const publishOps: (() => Promise<{ url: string }>)[] = []
  const editOps: (() => Promise<void>)[] = []
  let needPush = false // true if a new commit(push) is needed
  for (const article of affectedArticles) {
    if (!article.endsWith('.md')) {
      continue
    }
    const content = await fs.readFile(article, 'utf8')
    const frontMatter = extractFrontMatter(content)
    if (!frontMatter?.ci || frontMatter?.platform !== 'dev.to') {
      continue
    }

    try {
      assert(
        // main 에 대한 push 가 아니라면,
        // id 가 있어야 하고(=이미 배포된 상태),
        // 그도 아니라면(=신규 글) published 가 false 여야 한다.
        isPushToMain() || frontMatter.id || frontMatter.published === false,
        `For new articles on PR, \`published\` must be false. Modify ${toOriginalFilename(
          article,
        )}`,
      )
    } catch (error) {
      await commentOnPr(
        `🚨 PR에 포함된 신규 아티클은 \`published: false\` 이어야 합니다.
PR에서는 Draft 로 퍼블리시되며, Merge 되면 자동으로 정식 포스트로 전환됩니다.`,
      )
      throw error
    }

    const author = getAuthor(article)

    assert(config[author], `${author} is not in config`)
    const apiKey = process.env[config[author]['dev.to'].apiKey] as string
    assert(apiKey, `No API key($${apiKey}) for ${author}`)
    const devTo = createDevToAxiosInstance(apiKey)

    if (frontMatter.published && isPr()) {
      continue
    }

    if (frontMatter.id) {
      console.log(`[id: ${frontMatter.id}] ${article} will be edited. `)
      const isNewArticleMergedToMain = Boolean(
        isPushToMain() && frontMatter.id && frontMatter.published === false,
      )
      needPush = needPush || isNewArticleMergedToMain
      editOps.push(async () => {
        if (!isNewArticleMergedToMain) {
          console.log(`[id: ${frontMatter.id}] Editing ${article} ...`)
          await edit({
            content,
            instance: devTo,
            applySlug: isNewArticleMergedToMain,
          })
          return
        }

        const original = toOriginalFilename(article)
        console.log(
          `[new] Setting \`published: true\` id(${frontMatter.id}) into ${original}`,
        )
        const newOriginalContent = await setPublished({
          published: true,
          content: await fs.readFile(original, 'utf8'),
        })
        await fs.writeFile(original, newOriginalContent)
        await $`git add ${original}`
        console.log(`[id: ${frontMatter.id}] Editing ${article} ...`)
        await edit({
          content: await render({ filename: original }),
          instance: devTo,
          applySlug: isNewArticleMergedToMain,
        })
      })
    } else {
      needPush = true
      console.log(`[new] ${article} will be published. `)
      publishOps.push(async () => {
        console.log(`[new] Publishing ${article} ...`)
        const { id, url } = await publish({
          content,
          instance: devTo,
        })
        const original = toOriginalFilename(article)
        console.log(`[new] Inserting id(${id}) into ${original}`)
        const newContent = await insertId({
          id,
          content: await fs.readFile(original, 'utf8'),
        })
        await fs.writeFile(original, newContent)
        await $`git add ${original}`
        return { url }
      })
    }
  }

  // To lower the possibility of error in the middle of the API calls,
  // separate the API calls from the for-loop above.
  for (const op of editOps) {
    await op()
    await setTimeout(1000) // To avoid rate-limiting
  }
  // Editing is idempotent, while publishing is not.
  // So publish later than editing.
  const urls: string[] = []
  for (const op of publishOps) {
    const { url } = await op()
    urls.push(url)
    await setTimeout(1000) // To avoid rate-limiting
  }

  const message =
    urls.length > 0
      ? // dev.to 에서 draft 는 url 에 ?preview=<secret code> 가 있어야 접그할 수 있다.
        // 현재 이 값은 API 로 제공되지 않으므로, 로그인 된 상태에서 대시보드(https://dev.to/dashboard)로 가는 것만이 유효한 링크이다.
        `신규 아티클이 Draft 로 배포되었습니다.
*([dev.to](https://dev.to) 에 로그인 된 상태에서만 링크가 유효합니다.)*

${urls.map((url) => `- [${url}](https://dev.to/dashboard)`).join('\n')}`
      : ''
  return {
    needPush, // true if a new commit(push) is needed
    message,
  }
}
