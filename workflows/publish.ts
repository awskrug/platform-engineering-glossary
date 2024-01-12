import type { AxiosInstance } from 'axios'
import assert from 'node:assert/strict'
import yaml from 'yaml'
import axios from 'axios'

export interface FrontMatter extends Record<string, unknown> {
  title: string
  published?: boolean
  description?: string
  tags?: string
  series?: string
  cover_image?: string
  ci?: boolean
  id?: number
}

export function parseMarkdown(content: string): FrontMatter {
  assert(content.startsWith('---\n'), 'Frontmatter is missing')
  const frontmatter = content.slice('---\n'.length, content.indexOf('\n---\n'))
  assert(frontmatter, 'Frontmatter is missing')
  return yaml.parse(frontmatter) as FrontMatter
}

export interface InsertIdOptions {
  id: number
  content: string
}

export function insertId({ id, content }: InsertIdOptions): string {
  const frontmatter = parseMarkdown(content)
  assert(!frontmatter.id, 'id already exists.')
  return content.replace('\n---\n', `\nid: ${id}\n---\n`)
}

export function createAxiosInstance(apiKey: string) {
  return axios.create({
    baseURL: 'https://dev.to/api/',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
  })
}

export interface PublishOptions {
  content: string
  instance: AxiosInstance
}

export async function publish({
  content,
  instance,
}: PublishOptions): Promise<string> {
  interface Response {
    id: number
  }
  const res = await instance.post<Response>('/articles', {
    article: {
      body_markdown: content,
    },
  })
  return insertId({ id: res.data.id, content })
}

export interface EditOptions {
  id: number
  content: string
  instance: AxiosInstance
}

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
