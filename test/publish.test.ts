import {
  insertId,
  extractFrontMatter,
  extractRawFrontMatter,
  setFrontMatter,
} from '../workflows/publish.js'

describe('extractRawFrontMatter', () => {
  test('when frontmatter exists', () => {
    expect(
      extractRawFrontMatter(`---
title: platform engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
---

# Platform Enginering
`),
    ).toBe(`title: platform engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
`)

    expect(
      extractRawFrontMatter(`
---
title: platform engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
---

# Platform Enginering
`),
    ).toBe(`title: platform engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
`)
  })

  test('when frontmatter does not exist', () => {
    expect(extractRawFrontMatter(`# Platform Enginering`)).toBeUndefined()
    expect(
      extractRawFrontMatter(`---
title: platform engineering

# Platform Enginering
`),
    ).toBeUndefined()

    expect(
      extractRawFrontMatter(`title: platform engineering
---

# Platform Enginering
`),
    ).toBeUndefined()
  })

  test('when frontmatter is empty', () => {
    expect(extractRawFrontMatter(`---\n---`)).toBeUndefined()
    expect(extractRawFrontMatter(`---\n\n---`)).toBeUndefined()
    expect(extractRawFrontMatter(`---\n  \n---`)).toBeUndefined()
    expect(extractRawFrontMatter(`---\n \n \n---`)).toBeUndefined()
  })
})

describe('extractFrontMatter', () => {
  test('when frontmatter exists', () => {
    expect(
      extractFrontMatter(`---
title: platform engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
---

# Platform Enginering
`),
    ).toStrictEqual({
      title: 'platform engineering',
      tags: 'platformengineering,idp',
      ci: false,
      platform: 'dev.to',
      id: 1234,
    })

    expect(
      extractFrontMatter(`
---
title: platform engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
---

# Platform Enginering
`),
    ).toStrictEqual({
      title: 'platform engineering',
      tags: 'platformengineering,idp',
      ci: false,
      platform: 'dev.to',
      id: 1234,
    })
  })

  test('when frontmatter does not exist', () => {
    expect(extractFrontMatter(`# Platform Enginering`)).toBeUndefined()
    expect(
      extractFrontMatter(`---
title: platform engineering

# Platform Enginering
`),
    ).toBeUndefined()
    expect(
      extractFrontMatter(`title: platform engineering
---

# Platform Enginering
`),
    ).toBeUndefined()
  })

  test('when frontmatter is empty', () => {
    expect(extractFrontMatter(`---\n---`)).toBeUndefined()
    expect(extractFrontMatter(`---\n\n---`)).toBeUndefined()
    expect(extractFrontMatter(`---\n  \n---`)).toBeUndefined()
    expect(extractFrontMatter(`---\n \n \n---`)).toBeUndefined()
    expect(
      extractFrontMatter(`---

---

# Platform Enginering
`),
    ).toBeUndefined()
  })
})

describe('setFrontMatter', () => {
  test('when frontmatter exists', () => {
    expect(
      setFrontMatter({
        frontMatter: {
          title: 'platform engineering!!!!!!',
          ci: true,
          tags: 'idp,platformengineering',
          slug: 'about-platform-engineering',
        },
        content: `---
title: platform engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
---

# Platform Enginering
`,
      }),
    ).toBe(`---
title: platform engineering!!!!!!
tags: idp,platformengineering
ci: true
platform: dev.to
id: 1234
slug: about-platform-engineering
---

# Platform Enginering
`)
  })
})

describe('insertId', () => {
  test('when id already exists', async () => {
    await expect(
      insertId({
        id: 1234,
        content: `---
title: platform engineering
id: 4321
---

# Platform Enginering
`,
      }),
    ).rejects.toThrow('id already exists.')
  })

  test('when frontmatter does not exist', async () => {
    await expect(
      insertId({
        id: 1234,
        content: '# Platform Enginering',
      }),
    ).rejects.toThrow('Frontmatter does not exist.')
  })

  test('when id does not exist', async () => {
    await expect(
      insertId({
        id: 1234,
        content: `---
title: platform engineering
---

# Platform Enginering
`,
      }),
    ).resolves.toBe(`---
title: platform engineering
id: 1234
---

# Platform Enginering
`)
  })

  test('with mustache template', async () => {
    await expect(
      insertId({
        id: 1234,
        content: `---
title: {{ platform engineering }}
---

# Platform Enginering
`,
      }),
    ).resolves.toBe(`---
title: {{ platform engineering }}
id: 1234
---

# Platform Enginering
`)
  })
})
