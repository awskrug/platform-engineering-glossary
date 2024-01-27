/* eslint-disable unicorn/no-process-exit */
import fs from 'node:fs/promises'
import path from 'upath'
import { dirname, filename } from 'dirname-filename-esm'
import chalk from 'chalk-template'

export interface RunOptions {
  separator?: string
  silent?: boolean
}

export function run(
  content: string,
  { separator = '\n', silent = false }: RunOptions = {},
): boolean {
  const validate = (condition: boolean, errMessage: string): boolean => {
    if (!condition && !silent) {
      console.error(errMessage)
    }
    return condition
  }

  const results: boolean[] = []

  for (const [index, lineContent] of content
    .replace(/\n$/, '') // rm trailing newline
    .split(separator)
    .entries()) {
    const line = index + 1
    const msg = (message: string): string =>
      chalk`{inverse.italic  line ${line} } ${message}: {red ${lineContent}}`
    const [en, ko, ...rest] = lineContent.split(',')

    if (index === 0) {
      results.push(
        validate(
          en === 'en' && ko === 'ko',
          msg(chalk`Invalid titles. They should be {bold en,ko}`),
        ),
      )
    }

    results.push(
      validate(rest.length === 0, msg('Too many columns')),
      validate(
        en.length === en.trimStart().length &&
          ko.length === ko.trimStart().length,
        msg('Target has a preceding whitespace'),
      ),
      validate(
        en.length === en.trimEnd().length && ko.length === ko.trimEnd().length,
        msg('Target has a trailing whitespace'),
      ),
    )
  }
  return results.every(Boolean)
}

// When the module is imported, do nothing.
if (process.argv[1] === filename(import.meta)) {
  const content = await fs.readFile(
    path.resolve(dirname(import.meta), '../glossary.csv'),
    'utf8',
  )

  const isValid = run(content)

  if (!isValid) {
    process.exit(1)
  }
}
