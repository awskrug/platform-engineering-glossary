import type { RunOptions } from '../workflows/csvlint.js'
import { run as _run } from '../workflows/csvlint.js'

const run = (options: RunOptions) => _run({ silent: true, ...options })

describe('rules', () => {
  test('valid example', async () => {
    await expect(
      run({
        glossary: `
en,ko
platform,플랫폼
engineering,엔지니어링`,
      }),
    ).resolves.toBe(true)
  })

  test('titles', async () => {
    await expect(
      run({
        glossary: `
en,kor
platform,플랫폼
engineering,엔지니어링`,
      }),
    ).resolves.toBe(false)
  })

  test('preceding-whitespace', async () => {
    await expect(
      run({
        glossary: `
en,ko
platform, 플랫폼
engineering,엔지니어링`,
      }),
    ).resolves.toBe(false)

    await expect(
      run({
        glossary: `
en,ko
platform,플랫폼
 engineering,엔지니어링`,
      }),
    ).resolves.toBe(false)
  })

  test('trailing-whitespace', async () => {
    await expect(
      run({
        glossary: `
en,ko
platform ,플랫폼
engineering,엔지니어링`,
      }),
    ).resolves.toBe(false)

    await expect(
      run({
        glossary: `
en,kor
platform,플랫폼
engineering,엔지니어링 `,
      }),
    ).resolves.toBe(false)
  })

  test('too-many-columns', async () => {
    await expect(
      run({
        glossary: `
en,ko,foo
platform,플랫폼
engineering,엔지니어링`,
      }),
    ).resolves.toBe(false)

    await expect(
      run({
        glossary: `
en,kor
platform,플랫폼,
engineering,엔지니어링`,
      }),
    ).resolves.toBe(false)
  })
})
