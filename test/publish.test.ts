import { insertId, parseMarkdown } from '../workflows/publish.js'

describe('insertId', () => {
  // eslint-disable-next-line jest/no-commented-out-tests
  // test('throwing error when id already exists', () => {
  //   expect(
  //     insertId({
  //       id: 1234,
  //       content: `---
  //   title: platform engineering
  //   id: 4321
  //   ---

  //   # Platform Enginering
  //   `,
  //     }),
  //   ).toThrow()
  // })

  test('inserting id when id does not exists', () => {
    expect(
      insertId({
        id: 1234,
        content: `---
title: platform engineering
---

# Platform Enginering
`,
      }),
    ).toBe(`---
title: platform engineering
id: 1234
---

# Platform Enginering
`)
  })
})

describe('parseMarkdown', () => {
  test('parseMarkdown', () => {
    expect(
      parseMarkdown(`---
title: platform engineering
tags: platformengineering,idp
id: 1234
---

# Platform Enginering
`),
    ).toStrictEqual({
      title: 'platform engineering',
      tags: 'platformengineering,idp',
      id: 1234,
    })
  })
})
