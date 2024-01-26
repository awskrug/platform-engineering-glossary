import {
  parseGlossary,
  toOriginalFilename,
  toRenderedFilename,
} from '../workflows/render.js'

describe('parseGlossary', () => {
  test('parseGlossary', async () => {
    await expect(
      parseGlossary(`en,ko
Platform Engineering,플랫폼 엔지니어링
internal developer portal,내부 개발자 포탈
`),
    ).resolves.toStrictEqual({
      'Platform Engineering': '플랫폼 엔지니어링',
      'internal developer portal': '내부 개발자 포탈',
    })
  })
})

describe('toRenderedFilename', () => {
  test('extensions', () => {
    expect(toRenderedFilename('/path/to/foo.md')).toBe(
      '/path/to/foo.rendered.md',
    )
    expect(toRenderedFilename('/path/to/foo.txt')).toBe(
      '/path/to/foo.rendered.txt',
    )
  })
})

describe('toOriginalFilename', () => {
  test('extensions', () => {
    expect(toOriginalFilename('/path/to/foo.rendered.md')).toBe(
      '/path/to/foo.md',
    )
    expect(toOriginalFilename('/path/to/foo.rendered.txt')).toBe(
      '/path/to/foo.txt',
    )
  })

  test('idempotence', () => {
    expect(
      toOriginalFilename(toOriginalFilename('/path/to/foo.rendered.md')),
    ).toBe(toOriginalFilename('/path/to/foo.md'))
  })

  test('position of ".rendered"', () => {
    expect(toOriginalFilename('/path/to/foo.rendered.bar.rendered.md')).toBe(
      '/path/to/foo.rendered.bar.md',
    )
    expect(toOriginalFilename('/path/to.rendered/foo.md')).toBe(
      '/path/to.rendered/foo.md',
    )
    expect(toOriginalFilename('/path/to/foo.rendered')).toBe(
      '/path/to/foo.rendered',
    )
  })
})
