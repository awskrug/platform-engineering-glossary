import type { AxiosInstance } from 'axios'
import type { JSONValue } from 'types-json'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'
import yaml from 'yaml'
import axios from 'axios'
import { dirname } from 'dirname-filename-esm'
import { $ } from 'execa'
import mustache from 'mustache'
import { parseGlossary } from './render.js'

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
    !frontMatter.ci || frontMatter.slug,
    'slug must be defined when ci is true',
  )
  assert(
    frontMatter.ci === undefined || typeof frontMatter.ci === 'boolean',
    'ci must be undefined or boolean',
  )
  assert(
    frontMatter.platform === undefined || frontMatter.platform === 'dev.to',
    `platform must be undefined or 'dev.to'`,
  )
  return frontMatter
}

export interface SetFrontMatterOptions {
  frontMatter: FrontMatter
  content: string
}

/**
 * content should be prerendered
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

export function createDevToAxiosInstance(apiKey: string) {
  return axios.create({
    baseURL: 'https://dev.to/api/',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
  })
}

export interface EditOptions {
  id: number
  content: string
  instance: AxiosInstance
}

/**
 * Idempotent.
 */
export async function edit({
  id,
  content,
  instance,
}: EditOptions): Promise<void> {
  await instance.put(`/articles/${id}`, {
    article: {
      body_markdown: content,
    },
  })
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
}: PublishOptions): Promise<number> {
  const frontMatter = extractFrontMatter(content)
  assert(frontMatter, 'Frontmatter does not exist.')
  const shouldPostEdit = frontMatter.slug && frontMatter.title
  if (!shouldPostEdit) {
    const res = await instance.post<{ id: number }>('/articles', {
      article: {
        body_markdown: content,
        organization_id: frontMatter?.organization_id,
      },
    })
    return res.data.id
  }
  const res = await instance.post<{ id: number }>('/articles', {
    article: {
      body_markdown: setFrontMatter({
        frontMatter: {
          ...frontMatter,
          title: frontMatter.slug,
        },
        content,
      }),
      organization_id: frontMatter?.organization_id,
    },
  })
  const { id } = res.data
  console.log(`[id: ${id}] Published.`)
  await setTimeout(1000) // To avoid rate-limiting
  await edit({
    id,
    content,
    instance,
  })
  return id
}

/**
 * Load articles/config.yaml
 */
export async function loadConfig(): Promise<Config> {
  await $`pnpm lint:config`
  const config = yaml.parse(
    await fs.readFile(
      path.resolve(dirname(import.meta), '../articles/config.yaml'),
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
