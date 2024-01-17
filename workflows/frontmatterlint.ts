import fs from 'node:fs/promises'
import path from 'upath'
import { globby } from 'globby'
import { dirname } from 'dirname-filename-esm'
import { $ } from 'execa'
import { extractFrontMatter } from './publish.js'

await $`pnpm render`

const articles = await globby([
  path.resolve(dirname(import.meta), `../articles/*/**/*.rendered.md`),
])

for (const article of articles) {
  // Lint frontmatter
  extractFrontMatter(await fs.readFile(article, 'utf8'))
}
