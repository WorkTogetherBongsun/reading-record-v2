# 📚 웹/앱 개발 핵심 가이드: Night Reading 프로젝트 사례

이 문서는 `Night Reading` 프로젝트를 개발하며 적용된 핵심적인 웹/앱 개발 기술과 개념들을 정리한 가이드입니다.

---

## 1. 하이브리드 아키텍처 (SPA + MPA)
우리 프로젝트는 **Next.js**를 사용하여 Single Page Application(SPA)의 부드러운 사용자 경험과 Multi Page Application(MPA)의 구조적 이점을 결합했습니다.

- **SPA (Single Page Application)**: 전체 페이지를 다시 로드하지 않고 필요한 부분만 동적으로 업데이트합니다. Next.js의 `Link` 컴포넌트나 `router`를 통해 부드러운 화면 전환을 구현했습니다.
- **MPA (Multi Page Application) 요소**: `/record/[id]`와 같은 **Dynamic Routes**를 사용하여 각 날짜별로 고유한 URL(고유 주소)을 부여했습니다. 이는 공유가 쉽고, 새로고침 시에도 상태가 유지되는 장점이 있습니다.

## 2. 실시간 데이터베이스 연동 (Firebase)
전통적인 REST API 방식 대신 **Firebase Firestore**의 실시간 구독(Real-time Subscription) 모델을 사용했습니다.

- **onSnapshot**: DB의 데이터가 변경될 때마다 서버에 다시 요청하지 않고도 클라이언트 앱이 즉각적으로 UI를 업데이트합니다.
- **NoSQL 구조**: JSON과 유사한 유연한 문서 구조를 사용하여 데이터 모델 변경(예: `type` 필드 추가)에 빠르게 대응할 수 있습니다.
- **Hierarchical Data**: `notes (일 단위)` -> `records (문장 단위)`로 이어지는 계층 구조를 통해 데이터를 체계적으로 관리합니다.

## 3. 스타일링 시스템 (SCSS & Responsive Design)
단순한 CSS 대신 전처리기인 **SCSS**를 사용하여 코드의 재사용성과 가독성을 높였습니다.

- **Variables ($)**: 색상, 폰트 크기 등을 변수로 관리하여 일관된 디자인 시스템(다크 테마)을 유지합니다.
- **Nesting**: HTML 구조에 맞게 스타일을 중첩시켜 코드의 계층을 명확히 합니다.
- **Dark Mode First**: 밤에 독서하는 사용자를 고려하여 어두운 배경과 눈이 편한 대비를 기본으로 설계했습니다.

## 4. 배포 자동화 (CI/CD)
**GitHub**와 **Vercel**을 연동하여 코드 품질 관리와 배포를 자동화했습니다.

- **Git Branch Management**: 로컬 개발 -> 커밋/푸시 -> 자동 배포로 이어지는 워크플로우를 경험했습니다.
- **Environment Variables**: API Key와 같은 민감한 정보를 환경 변수로 관리하여 보안을 강화합니다.
- **Build Optimization**: Next.js의 빌드 과정을 통해 코드를 압축하고 최적화하여 사용자에게 빠른 속도를 제공합니다.

## 5. 디버그 및 생산성 도구
- **Debug Mode**: 개발자만 접근 가능한 숨겨진 기능(더블 클릭 등)을 통해 과거 데이터를 조작하거나 테스트하는 유연한 개발 방식을 적용했습니다.
- **TypeScript**: 코드 작성 단계에서 타입 에러를 잡아내어 런타임 오류를 최소화했습니다.

---

> **봉순이의 조언!** 🐶
> 좋은 앱은 화려한 기술보다 **사용자의 맥락(밤에 책을 읽는 상황)**을 얼마나 잘 이해하고 있는지가 더 중요해요. 이 문서가 앞으로 더 멋진 앱을 만드시는 데 밑거름이 되길 바랍니다! 🌙✨
