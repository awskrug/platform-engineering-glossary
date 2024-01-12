import { parseGlossary } from '../workflows/render.js'

describe('parseGlossary', () => {
  test('parseGlossary', () => {
    expect(
      parseGlossary(`en,ko
platform engineering,플랫폼 엔지니어링
IDP,내부 개발자 포탈
  `),
    ).toStrictEqual({
      'platform engineering': '플랫폼 엔지니어링',
      IDP: '내부 개발자 포탈',
    })
  })
})
