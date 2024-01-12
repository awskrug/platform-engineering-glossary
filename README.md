# Platform Engineering Glossary

## 용어집

Platform Engineering 과 관련된 정보를 번역하는데 사용되는 용어집입니다.

[glossary.csv](./glossary.csv) 를 참고해주세요.

## 용어집 사용 환경 세팅

정적인 용어집만으로 충분하다면 csv 파일을 바로 다운로드 받아도 됩니다.

반면에, 용어집을 동적으로 사용하고자 한다면 환경을 세팅해주세요.

```bash
# 최신 node.js(v14.19 / v16.9 이상) 가 설치된 환경이라면
# corepack 을 활성화 할 수 있습니다.
# 단, 필수 사항은 아닙니다.
corepack enable

# pnpm 을 사전 설치한 적이 없어도 corepack 이 설치해 줍니다.
# corepack 활성화를 생략시 직접 pnpm 을 설치한 후 실행해야 합니다.
pnpm install
```

## 번역 아티클 작성 예시

다음과 같이 alice 가 *`foo.md`*, *`bar.txt`* 를 작성하고, bob 이 *`qux.smi`* 를 작성하기로 했다고 가정해보겠습니다.

```
platform-engineering-glossary
├── articles
│   ├── alice
│   │   ├── foo.md
│   │   └── bar.txt
│   └── bob
│       └── qux.smi
└── glossary.csv
```

**glossary.csv**:

용어집은 아래와 같다고 전제해보겠습니다.

```csv
en,ko
platform engineering,플랫폼 엔지니어링
--- 이하 생략 ---
```

**articles/alice/foo.md**:

아티클은 [Mustache](https://mustache.github.io) spec 으로 templating 합니다.

```md
# {{ platform engineering }} 을 소개합니다.

{{ platform engineering }}에 대해 다루어볼까요?
```

다음 실행시,

```bash
pnpm render
```

아티클에 glossary 가 삽입되어 렌더링된 파일이 생성됩니다.

```
platform-engineering-glossary
├── articles
│   ├── alice
│   │   ├── foo.md
│   │   ├── foo.rendered.md
│   │   ├── bar.md
│   │   └── bar.rendered.md
│   └── bob
│       ├── qux.md
│       └── qux.rendered.md
└── glossary.csv
```

**articles/alice/foo.rendered.md**:

```md
# 플랫폼 엔지니어링을 소개합니다.

플랫폼 엔지니어링에 대해 다루어볼까요?
```

참고로 *`*.rendered.*`* 파일은 gitignore 됩니다.

또는, 실시간으로 렌더링할 수도 있습니다.

```bash
pnpm dev
```

<https://github.com/awskrug/platform-engineering-glossary/assets/28584151/ad7deed3-5e06-4948-b495-73ea1c8259d6>
