import fs from 'node:fs/promises'
import path from 'upath'
import { globby } from 'globby'
import { dirname, filename } from 'dirname-filename-esm'
import mustache from 'mustache'

export async function parseGlossary(
  content?: string,
): Promise<Record<string, string>> {
  if (!content) {
    // eslint-disable-next-line no-param-reassign
    content = await fs.readFile(
      path.resolve(dirname(import.meta), '../glossary.csv'),
      'utf8',
    )
  }
  return Object.fromEntries(
    content
      .trim()
      .split('\n')
      .slice(1)
      .map((lineContent) => lineContent.split(',') as [string, string]),
  )
}

/**
 * @example
 * toRenderedFilename('/path/to/foo.md') // => '/path/to/foo.rendered.md'
 */
export function toRenderedFilename(filename: string): string {
  const parsedFilename = path.parse(filename)
  return path.resolve(
    parsedFilename.dir,
    `${parsedFilename.name}.rendered${parsedFilename.ext}`,
  )
}

/**
 * @example
 * toOriginalFilename('/path/to/foo.rendered.md') // => '/path/to/foo.md'
 */
export function toOriginalFilename(filename: string): string {
  const { dir, name, ext } = path.parse(filename)
  return path.resolve(dir, `${name.replace(/\.rendered$/, '')}${ext}`)
}

// e.g. author is alice when the article is '/path/to/articles/alice/foo.md'
export function getAuthor(filename: string): string {
  return path
    .resolve(filename)
    .replace(path.resolve(dirname(import.meta), '../articles'), '')
    .split('/')
    .find(Boolean)! // This predicate filters out an empty string when created by split('/')
}

interface RenderOptions {
  filename: string // full absolute path
  glossary?: Record<string, string>
}

export async function render({
  filename,
  glossary,
}: RenderOptions): Promise<string> {
  // eslint-disable-next-line no-param-reassign
  glossary = glossary || (await parseGlossary())
  const content = await fs.readFile(filename, 'utf8')
  const renderedContent = mustache.render(content, glossary)
  await fs.writeFile(toRenderedFilename(filename), renderedContent, 'utf8')
  return renderedContent
}

export const extensions =
  '.{md,srt,srt,sbv,sub,lrc,cap,smi,sami,rt,vtt,ttml,dfxp,txt}'

// When the module is imported, do nothing.
if (process.argv[1] === filename(import.meta)) {
  const dir = dirname(import.meta)
  const articles = await globby([
    path.resolve(dir, `../articles/*/**/*${extensions}`),
    '!**/*.rendered.*',
  ])

  const glossary = await parseGlossary()
  await Promise.all(articles.map((filename) => render({ filename, glossary })))
}
