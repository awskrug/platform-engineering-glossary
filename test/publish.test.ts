import {
  insertId,
  extractFrontMatter,
  extractRawFrontMatter,
  setFrontMatter,
  setPublished,
} from '../workflows/publish.js'

describe('extractRawFrontMatter', () => {
  test('when frontmatter exists', () => {
    expect(
      extractRawFrontMatter(`---
title: Platform Engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
---

# Platform Enginering
`),
    ).toBe(`title: Platform Engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
`)

    expect(
      extractRawFrontMatter(`
---
title: Platform Engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
---

# Platform Enginering
`),
    ).toBe(`title: Platform Engineering
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
title: Platform Engineering

# Platform Enginering
`),
    ).toBeUndefined()

    expect(
      extractRawFrontMatter(`title: Platform Engineering
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
title: Platform Engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
---

# Platform Enginering
`),
    ).toStrictEqual({
      title: 'Platform Engineering',
      tags: 'platformengineering,idp',
      ci: false,
      platform: 'dev.to',
      id: 1234,
    })

    expect(
      extractFrontMatter(`
---
title: Platform Engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
---

# Platform Enginering
`),
    ).toStrictEqual({
      title: 'Platform Engineering',
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
title: Platform Engineering

# Platform Enginering
`),
    ).toBeUndefined()
    expect(
      extractFrontMatter(`title: Platform Engineering
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
          title: 'Platform Engineering!!!!!!',
          ci: true,
          tags: 'idp,platformengineering',
          slug: 'about-platform-engineering',
        },
        content: `---
title: Platform Engineering
tags: platformengineering,idp
ci: false
platform: dev.to
id: 1234
---

# Platform Enginering
`,
      }),
    ).toBe(`---
title: Platform Engineering!!!!!!
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
  test('when `id` already exists', async () => {
    await expect(
      insertId({
        id: 1234,
        content: `---
title: Platform Engineering
id: 4321
---

# Platform Enginering
`,
      }),
    ).rejects.toThrow('id already exists.')
  })

  test('when Frontmatter does not exist', async () => {
    await expect(
      insertId({
        id: 1234,
        content: '# Platform Enginering',
      }),
    ).rejects.toThrow('Frontmatter does not exist.')
  })

  test('when `id` does not exist', async () => {
    await expect(
      insertId({
        id: 1234,
        content: `---
# comment
title: Platform Engineering
---

# Platform Enginering
`,
      }),
    ).resolves.toBe(`---
# comment
title: Platform Engineering
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
# comment
title: {{ Platform Engineering }}
---

# Platform Enginering
`,
      }),
    ).resolves.toBe(`---
# comment
title: {{ Platform Engineering }}
id: 1234
---

# Platform Enginering
`)
  })
})

describe('setPublished', () => {
  test('when `published` exists', async () => {
    await expect(
      setPublished({
        published: true,
        content: `---
# comment
title: Platform Engineering
published: true
---

# Platform Enginering
`,
      }),
    ).resolves.toBe(`---
# comment
title: Platform Engineering
published: true
---

# Platform Enginering
`)
    await expect(
      setPublished({
        published: false,
        content: `---
# comment
title: Platform Engineering
published: true
---

# Platform Enginering
`,
      }),
    ).resolves.toBe(`---
# comment
title: Platform Engineering
published: false
---

# Platform Enginering
`)
  })

  test('when Frontmatter does not exist', async () => {
    await expect(
      setPublished({
        published: true,
        content: '# Platform Enginering',
      }),
    ).rejects.toThrow('Frontmatter does not exist.')
  })

  test('when `published` does not exist', async () => {
    await expect(
      setPublished({
        published: true,
        content: `---
title: Platform Engineering
---

# Platform Enginering
`,
      }),
    ).rejects.toThrow('`published` should exist in Frontmatter.')
  })

  test('with mustache template', async () => {
    await expect(
      setPublished({
        published: true,
        content: `---
# comment
title: {{ Platform Engineering }}
published: false
---

# {{ Platform Engineering }}에 대해
`,
      }),
    ).resolves.toBe(`---
# comment
title: {{ Platform Engineering }}
published: true
---

# {{ Platform Engineering }}에 대해
`)
  })
})
