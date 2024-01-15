import fs from 'node:fs/promises'
import path from 'upath'
import { globby } from 'globby'
import { dirname, filename } from 'dirname-filename-esm'
import mustache from 'mustache'

export function parseGlossary(content: string): Record<string, string> {
  return Object.fromEntries(
    content
      .trim()
      .split('\n')
      .slice(1)
      .map((lineContent) => lineContent.split(',') as [string, string]),
  )
}

interface RenderOptions {
  filename: string // full absolute path
  glossary: Record<string, string>
}

async function render({ filename, glossary }: RenderOptions): Promise<void> {
  const content = await fs.readFile(filename, { encoding: 'utf8' })
  const renderedContent = mustache.render(content, glossary)
  // '/path/to/foo.md' is rendered as '/path/to/foo.rendered.md'
  const parsedFilename = path.parse(filename)
  const renderedFilename = path.resolve(
    parsedFilename.dir,
    `${parsedFilename.name}.rendered${parsedFilename.ext}`,
  )
  await fs.writeFile(renderedFilename, renderedContent, {
    encoding: 'utf8',
  })
}

// When the module is imported, do nothing.
if (process.argv[1] === filename(import.meta)) {
  const dir = dirname(import.meta)
  const articles = await globby([
    path.resolve(
      dir,
      '../articles/*/**/*.{md,srt,srt,sbv,sub,lrc,cap,smi,sami,rt,vtt,ttml,dfxp,txt}',
    ),
    '!**/*.rendered.*',
  ])

  const glossary = parseGlossary(
    await fs.readFile(path.resolve(dir, '../glossary.csv'), {
      encoding: 'utf8',
    }),
  )

  await Promise.all(articles.map((filename) => render({ filename, glossary })))
}
