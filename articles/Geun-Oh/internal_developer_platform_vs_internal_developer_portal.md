---
platform: dev.to
title: {{ Internal Developer Platform }} vs {{ Internal Developer Portal }}
description: {{ Internal Developer Platform }}과 {{ Internal Developer Portal }}의 차이와 시너지 효과.
tags: platformengineering,platform,internaldeveloperplatform,internaldeveloperportal
cover_image: https://substackcdn.com/image/fetch/w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93c4c8fe-87ed-4bc2-9077-6cc57bdea089_4042x2705.png
published: false
organization_id: 8203
ci: true
slug: internal-developer-platform-vs-internal-developer-portal
id: 1758825
---

---

<small>**알림**: \*이 글은 Substack.com의 [Romaric Philogene](https://substack.com/@rophilogene)님께서 작성하신 [**_Internal Developer Platform vs. Internal Developer Portal_**](https://romaricphilogene.substack.com/p/platform-engineering-7-internal-developer) 을 번역(의역)한 것입니다.\*</small>

---

# {{ Platform Engineering }} #7: {{ Internal Developer Platform }}(Internal Developer Platform) vs. {{ Internal Developer Portal }}(Internal Developer Portal)

여러분 안녕하세요 👋,

저는 [Qovery](https://www.qovery.com/)({{ Internal Developer Platform }})의 CEO이자 공동창업자인 Romaric Philogene 이고, 이 글은 제가 Substack에 올리는 7번째 글이네요. 제 이전 글에서, 저는 2024년의 {{ Platform Engineering }}에 대한 예상들을 공유했었죠.

오늘 저는 {{ Internal Developer Platform }}(Internal Developer Platform)과 {{ Internal Developer Portal }}(Internal Developer Portal)이 무엇이고, 이 두 플랫폼이 어떻게 {{ Platform Engineer }}(Platform Engineer)들에 의해 사용되어 그들의 운영(operation)과는 별개 관점으로 어떻게 그들의 개발자들에게 {{ Self-Service }}(Self-Service)를 제공하고자 하는 공동 목적을 달성하는지 명확히 하고자 합니다.

![Internal Developer Platform vs. Internal Developer Portal](https://substackcdn.com/image/fetch/w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93c4c8fe-87ed-4bc2-9077-6cc57bdea089_4042x2705.png)

요약(TLDR;)

> {{ Internal Developer Portal }}은 직관적인 인터페이스(interface)를 제공하지만, {{ Internal Developer Platform }}은 엔진으로서 자동화(automation)와 통합(integration)을 목적으로 동작합니다.

- **{{ Internal Developer Platform }}**: 개발자들이 전반적인 소프트웨어 개발 수명 주기(SDLC)를 자동적으로 관리할 수 있도록 하는 종합적인 도구와 프로세스(process)의 모음이다. 이는 다양한 개발(development), 운영(deployment), 모니터링(monitoring) 도구들을 하나의 결합된 시스템에 통합했으며, {{ DevOps }}(DevOps)사례들을 가속화합니다.

- **{{Internal Developer Portal }}**: 개발자들이 필요로 하는 도구, 자원, 문서 등을 쉽게 접근할 수 있도록 하는 사용자 친화적인 인터페이스입니다. 이는 기저에 있는 {{ Internal Developer Platform }}과 타 IT 자원들과의 상호작용을 간편하게 만들어줍니다.

- **{{ Synergistic Use }}**: {{ Internal Developer Platform }} 과 {{ Internal Developer Portal }}을 함께 사용하는 것은 {{ Self-Service }} 경험을 향상시킵니다. {{ Internal Developer Portal }}이 개발자들이 {{ Internal Developer Platform }}을 효율적으로 활용할 수 있도록 하는 유연하고(streamline) 접근이 용이한 프론트엔드(front-end) 인터페이스을 제공하고, {{ Internal Developer Platform }}이 프로세스 자동화, 통합, 함수화(functionalization) 등의 핵심적인 백엔드(back-end) 동작을 제공합니다.

## {{ Internal Developer Platform }}이란 무엇인가?

{{ Internal Developer Platform }}은 개발자들이 개발에서 배포까지의 전체 애플리케이션(application) 생명 주기를 자동으로 관리할 수 있도록 하는 환경입니다. 이는 애플리케이션 개발 및 관리에 있어 IT와 {{ DevOps }}에 크게 의존하고 있기에 나타나는 비효율성과 상호의존성에 대한 해답으로써 나타났습니다.

![Dialog of key features](https://substackcdn.com/image/fetch/w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8e3d90c0-e73f-4d77-94de-284bfbc09ae9_1612x410.jpeg)

종합적인 도구와 서비스를 제공함으로써, {{ Internal Developer Platform }}은 개발자들이 독립적으로 애플리케이션을 구성, 배포, 관리할 수 있도록하여 효율성과 생산성을 향상시켰습니다.

![Role of Internal Developer Platform](https://substackcdn.com/image/fetch/w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F828b65b3-bfad-49e5-9669-cc208f116a12_2708x1148.jpeg)

## 어떻게 구성하나요?

{{ Internal Developer Platform }}의 발달 이전에, 소프트웨어 개발 프로세스는 지연과 비효율성에 의해 종종 속도가 저하되고는 했습니다. 개발자들은 자신들의 작업 흐름에 중요한 외부 팀(IT 부서 / {{ DevOps }} 엔지니어 / SRE 등 조직에 따라 다릅니다. 이에 대한 추가적인 얘기를 하지는 않겠습니다.)들에 의존하면서 개발 속도가 저하되고, 환경에 대한 일관성을 잃으며, 자율성이 제한되었습니다.

![Common Challenge of Software Development 1/2](https://substackcdn.com/image/fetch/w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4d343fa9-5938-4b9a-978f-6b0b82cbbe57_1551x873.jpeg)

이것이 유연하고 통합된 환경을 제공하여 의존성을 최소화하고 {{ Agile }}(Agile)하고 즉각적인 개발 프로세스를 조성하도록 도와주는 {{ Internal Developer Platform }}이 작용하는 곳입니다.

![Common Challenge of Software Development 2/2](https://substackcdn.com/image/fetch/w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffa82095a-5940-4c80-89e0-05d0988ffaa8_1549x873.jpeg)

{{ Internal Developer Platform }}은 유연하게 기존의 {{ DevOps }}와 기술 스택(stack)들에 통합되고, 기존의 프로세스를 유연하게 하고 강화하는 통합 계층으로써 동작합니다. 이는 소프트웨어 개발, 배포, 관리 등에 사용되는 다양한 도구와 서비스가 융합되는 중앙 집중화된 플랫폼을 제공함으로써 생태계에 부합합니다. 이러한 통합은 더욱 효율적인 워크플로우, 더 나은 자원 관리, 개발에서 배포로의 더 부드러운 전이를 가능하게 합니다. 코딩, 테스팅, 배포, 그리고 {{ Infrastructure }}(Infrastructure) 관리를 통해, {{ Internal Developer Platform }}은 기존 스택의 효용을 향상시켜 보다 응집력 있고 {{ Agile }}하며 개발자 친화적입니다.

{{ Internal Developer Platform }}이 소프트웨어 개발자들의 문제의 일부를 해결하는 것은 맞지만, 모든 것을 해결하지는 않는다. 이곳이 {{ Internal Developer Portal }}이 필요한 지점입니다.

## {{ Internal Developer Portal }}이 무엇인가?

{{ Internal Developer Portal }}은 IT 자원들에 대한 출입문입니다. 이것은 개발자들이 도구, 애플리케이션, API, 문서, 그리고 지원 사항에 대해 접근할 수 있도록 하는 사용자 인터페이스입니다. 이는 접근성과 사용성에 초점을 두어 디자인되는데, 당신의 IT {{ Infrastructure }}의 '얼굴'을 생각하면 이해하기 어렵지 않습니다.

![Spotify Backstage UI - open-source Internal Developer Portal](https://substackcdn.com/image/fetch/w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ffd1c9a-41a4-4d96-83b8-d1671164b764_1600x930.png)

잘 디자인된 {{ Internal Developer Portal }} 새로운 도구와 기술에 대한 학습 곡선을 상당히 줄입니다. 이는 자원, 기능 통합에 대한 접근을 유연하게 만들고, 때로는 API 목록, 문서 라이브러리, 그리고 토론회 등의 기능을 포함할 수도 있습니다.

## 향상된 {{ Self-Service }}를 위한 시너지 효과

진짜 마법은 {{ Internal Developer Platform }}과 {{ Internal Developer Portal }}이 함께 사용될 때 발생합니다. {{ Internal Developer Platform }}은 강력한 백엔드 인프라와 자동화 기능을 제공하는 반면, {{ Internal Developer Portal }}은 사용자 친화적인 프론트엔드 인터페이스을 제공합니다. 이러한 시너지 효과는 개발자들에게 {{ Self-Service }} 경험을 다음과 같은 몇 가지 방법으로 향상시킵니다.

1. **간편화된 접근**: {{ Internal Developer Portal }}은 개발자들이 복잡한 기능성을 가지는 {{ Internal Developer Platform }}의 복잡함을 파헤치지 않고서도 조작하기 쉽도록 만들어줍니다.
   다

2. **향상된 생산성**: 포털을 통해 접근하는 {{ Internal Developer Platform }}의 자동화된 프로세스는 수작업을 줄이고 개발 워크플로우를 유연하게 만듭니다.

3. **향상된 공동작업**: 포털을 통해 공유된 자원과 도구는 개발자, QA, 그리고 다른 운영 조직들 간의 공동 작업을 용이하게 만듭니다.

4. **더 나은 자원 관리**: 포털은 {{ Internal Developer Platform }}에 대한 통찰과 분석을 제공하고, 조직이 자원의 사용과 성능을 최적화하는 것을 돕습니다.

## 그래서 어떻게 선택하죠?

{{ Internal Developer Platform }}과 {{ Internal Developer Portal }}은 별개의 목적을 수행하지만, 이들을 통합하여 사용하면 개발자들에게 {{ Self-Service }} 경험을 크게 향상시킬 수 있습니다. {{ Internal Developer Platform }}은 엔진 역할을 하며 자동화와 통합을 주도하는 반면, {{ Internal Developer Portal }}은 직관적인 인터페이스를 제공하여 이러한 강력한 기능에 쉽게 접근할 수 있도록 합니다. 플랫폼 엔지니어에게 이 두 가지 도구의 장점을 이해하고 활용하는 것은 보다 효율적이고 자율적이며 개발자 친화적인 환경을 구축하는 데 핵심적입니다.
