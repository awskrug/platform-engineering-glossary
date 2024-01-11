/* eslint-disable unicorn/no-process-exit */
import path from 'node:path'
import fs from 'node:fs/promises'
import { dirname, filename } from 'dirname-filename-esm'
import chalk from 'chalk-template'

export interface RunOptions {
  glossary?: string // raw glossary in csv format
  separator?: string
  silent?: boolean
}

export async function run({
  glossary,
  separator = '\n',
  silent = false,
}: RunOptions = {}): Promise<boolean> {
  const validate = (condition: boolean, errMessage: string): boolean => {
    if (!condition && !silent) {
      console.error(errMessage)
    }
    return condition
  }

  const results: boolean[] = []
  if (!glossary) {
    // eslint-disable-next-line no-param-reassign
    glossary = await fs.readFile(
      path.resolve(dirname(import.meta), '../glossary.csv'),
      {
        encoding: 'utf8',
      },
    )
  }

  for (const [index, lineContent] of glossary
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
  const isValid = await run()

  if (!isValid) {
    process.exit(1)
  }
}
