# 이윤화 | UI Developer Portfolio 2026

웹 접근성과 인터랙티브 UI 시스템을 구축하는 UI 개발자, 이윤화의 2026년 포트폴리오입니다.  
Vite와 SCSS, GSAP을 활용하여 고성능의 매끄러운 스크롤 경험과 감각적인 애니메이션을 구현했습니다.

---

## 🚀 기술 스택 (Tech Stack)

- **Core**: HTML5, JavaScript (ES6+), Vite 5
- **Styling**: SCSS (Modular Architecture), Vanilla CSS
- **Animations**: GSAP (ScrollTrigger, ScrollTo, TextPlugin)
- **Physics Engine**: Matter.js (Interactive Footer)
- **Smooth Scroll**: Lenis
- **Deployment**: Vercel Ready

---

## ✨ 핵심 기능 (Key Features)

### 1. 매끄러운 스크롤 인터랙션 (GSAP & Lenis)
- `Lenis`를 활용한 부드러운 관성 스크롤 구현.
- `ScrollTrigger` 기반의 섹션별 핀(Pinned) 애니메이션 및 텍스트 리빌(Reveal) 효과.

### 2. 다이나믹 물리 엔진 푸터 (Matter.js)
- 푸터 영역 진입 시 `Matter.js`를 이용한 오브젝트 낙하 애니메이션.
- 사용자가 직접 마우스로 오브젝트를 드래그하고 던질 수 있는 인터랙션 제공.

### 3. 지능형 테마 시스템 (Dark/Light Mode)
- 사용자 시스템(OS) 설정에 따른 자동 테마 전환 (`prefers-color-scheme`).
- 메뉴바 폰트 및 배경색의 실시간 반전 모드 지원.
- `localStorage`를 통한 테마 설정 유지.

### 4. 고도화된 웹 최적화 및 SEO
- **성능**: 폰트 프리로드(Preload) 및 외부 리소스 사전 연결(Preconnect) 적용.
- **공유**: Supabase 스토리지를 활용한 고해상도 OG 이미지 및 Twitter Cards 세팅 완료.
- **웹 접근성**: 시맨틱 마크업 준수 및 스크린 리더 호환성 고려.

---

## 📁 주요 디렉토리 구조 (Structure)

```text
src/
├── assets/         # 이미지, 비디오, JSON 에셋
├── styles/         # SCSS 스타일 가이드
│   ├── base/       # Reset, Fonts, Global
│   ├── layout/     # Section-based Styles (Hero, About, Works, Footer)
│   └── utils/      # Mixins, Functions, Variables
├── animations.js   # GSAP 및 Matter.js 로직
└── main.js         # 앱 초기화 및 테마/이벤트 핸들링
public/             # 파비콘 및 정적 리소스
index.html          # 메인 마크업 (SEO & Meta Tags 최적화)
```

---

## 🛠 실행 방법 (Usage)

### 1. 패키지 설치
```bash
pnpm install
```

### 2. 로컬 개발 서버 실행
```bash
pnpm dev
```

### 3. 프로덕션 빌드
```bash
pnpm build
```

### 4. 빌드 결과물 미리보기
```bash
pnpm preview
```

---

## 📄 라이선스 (License)
© 2026 Lee Yun Hwa. All rights reserved.
