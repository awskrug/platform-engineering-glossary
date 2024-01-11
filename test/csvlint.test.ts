import type { RunOptions } from '../workflows/csvlint.js'
import { run as _run } from '../workflows/csvlint.js'

const run = (content: string, options: RunOptions = {}) =>
  _run(content, { silent: true, ...options })

describe('rules', () => {
  test('valid example', () => {
    expect(
      run(`
en,ko
platform,플랫폼
engineering,엔지니어링`),
    ).toBe(true)
  })

  test('titles', () => {
    expect(
      run(`
en,kor
platform,플랫폼
engineering,엔지니어링`),
    ).toBe(false)
  })

  test('preceding-whitespace', () => {
    expect(
      run(`
en,ko
platform, 플랫폼
engineering,엔지니어링`),
    ).toBe(false)

    expect(
      run(`
en,ko
platform,플랫폼
 engineering,엔지니어링`),
    ).toBe(false)
  })

  test('trailing-whitespace', () => {
    expect(
      run(`
en,ko
platform ,플랫폼
engineering,엔지니어링`),
    ).toBe(false)

    expect(
      run(`
en,kor
platform,플랫폼
engineering,엔지니어링 `),
    ).toBe(false)
  })

  test('too-many-columns', () => {
    expect(
      run(`
en,ko,foo
platform,플랫폼
engineering,엔지니어링`),
    ).toBe(false)

    expect(
      run(`
en,kor
platform,플랫폼,
engineering,엔지니어링`),
    ).toBe(false)
  })
})
