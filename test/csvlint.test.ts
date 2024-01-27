import type { RunOptions } from '../workflows/csvlint.js'
import { run as _run } from '../workflows/csvlint.js'

const run = (content: string, options: RunOptions = {}) =>
  _run(content, { silent: true, ...options })

describe('rules', () => {
  test('valid example', () => {
    expect(
      run(`
en,ko
Platform Engineering,플랫폼 엔지니어링
Internal Developer Platform,내부 개발자 플랫폼`),
    ).toBe(true)
  })

  test('titles', () => {
    expect(
      run(`
en,kor
Platform Engineering,플랫폼 엔지니어링
Internal Developer Platform,내부 개발자 플랫폼`),
    ).toBe(false)
  })

  test('preceding-whitespace', () => {
    expect(
      run(`
en,ko
Platform Engineering ,플랫폼 엔지니어링
Internal Developer Platform,내부 개발자 플랫폼`),
    ).toBe(false)

    expect(
      run(`
en,ko
Platform Engineering,플랫폼 엔지니어링
 Internal Developer Platform,내부 개발자 플랫폼`),
    ).toBe(false)
  })

  test('trailing-whitespace', () => {
    expect(
      run(`
en,ko
Platform Engineering ,플랫폼 엔지니어링
Internal Developer Platform,내부 개발자 플랫폼`),
    ).toBe(false)

    expect(
      run(`
en,ko
Platform Engineering,플랫폼 엔지니어링
Internal Developer Platform,내부 개발자 플랫폼 `),
    ).toBe(false)
  })

  test('too-many-columns', () => {
    expect(
      run(`
en,ko,foo
Platform Engineering,플랫폼 엔지니어링
Internal Developer Platform,내부 개발자 플랫폼`),
    ).toBe(false)

    expect(
      run(`
en,ko
Platform Engineering,플랫폼 엔지니어링,
Internal Developer Platform,내부 개발자 플랫폼`),
    ).toBe(false)
  })
})
