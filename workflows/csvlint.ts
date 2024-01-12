/* eslint-disable unicorn/no-process-exit */
import path from 'node:path'
import fs from 'node:fs/promises'
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
    .trim()
    .split(separator)
    .entries()) {
    const line = index + 1
    const render = (message: string): string =>
      chalk`{inverse.italic  line ${line} } ${message}: {red ${lineContent}}`
    const [en, ko, ...rest] = lineContent.split(',')

    if (index === 0) {
      results.push(
        validate(
          en === 'en' && ko === 'ko',
          render(chalk`Invalid titles. They should be {bold en,ko}`),
        ),
      )
    }

    results.push(
      validate(rest.length === 0, render('Too many columns')),
      validate(
        en.trimStart().length === en.length &&
          ko.trimStart().length === ko.length,
        render('Target has a preceding whitespace'),
      ),
      validate(
        en.trimEnd().length === en.length && ko.trimEnd().length === ko.length,
        render('Target has a trailing whitespace'),
      ),
    )
  }
  return results.every(Boolean)
}

// When the module is imported, do nothing.
if (process.argv[1] === filename(import.meta)) {
  const content = await fs.readFile(
    path.resolve(dirname(import.meta), '../glossary.csv'),
    {
      encoding: 'utf8',
    },
  )

  const isValid = run(content)

  if (!isValid) {
    process.exit(1)
  }
}