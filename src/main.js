// src/main.js
import { initHeaderReveal, initHeroAnimation, initAboutAnimation, initAboutMainAnimation, initWorksAnimation, initMarqueeAnimation } from './animations.js';

/**
 * 1. Lenis 초기화 (Smooth Scroll)
 * 전역에서 부드러운 스크롤을 관리합니다.
 */
let lenis;
const initLenis = () => {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
};

/**
 * 2. 모바일 메뉴 (Side Nav) 로직 개선
 */
const initMobileMenu = () => {
  // 열기 버튼이 외부에 있으므로 document에서 전체 검색
  const openButtons = document.querySelectorAll('[data-mobile-menu-open]');
  // 메뉴 베이스 (사이드 렌더링 컨테이너)
  const mobileMenus = document.querySelectorAll('[data-mobile-menu-base]');

  if (mobileMenus.length === 0 || openButtons.length === 0) return;

  mobileMenus.forEach((element) => {
    // 중복 초기화 방지
    if (element.dataset.scriptInitialized) return;
    element.dataset.scriptInitialized = 'true';

    // 필수 요소 탐색
    const overlay = element.querySelector('[data-mobile-menu-overlay]');
    const navContent = element.querySelector('.side-menu__nav'); // 실제 움직이는 박스
    const closeTriggers = element.querySelectorAll('[data-mobile-menu-close], [data-mobile-menu-overlay]');
    const links = element.querySelectorAll('[data-mobile-menu-nav-item]');

    if (!overlay || !navContent) {
      console.warn('모바일 메뉴 필수 요소를 찾을 수 없습니다.');
      return;
    }

    let isActive = false;
    let tl;

    // GSAP MatchMedia를 통한 반응형 애니메이션 설정
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      tl = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
          gsap.set(element, { display: 'none' });
          if (lenis) lenis.start();
        },
      });

      // 애니메이션 레이어 구성
      tl.set(element, { display: 'flex' }) // 시작 시 flex로 변경
        .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'none' })
        .fromTo(
          navContent,
          { xPercent: -100, autoAlpha: 0 },
          { xPercent: 0, autoAlpha: 1, duration: 0.8, ease: 'power4.out' },
          '<0.1',
        )
        .fromTo(
          links,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' },
          '<0.3',
        );
    });

    // 토글 함수
    const toggleMenu = () => {
      if (!tl) return;
      if (!isActive) {
        if (lenis) lenis.stop();
        tl.play();
        isActive = true;
      } else {
        tl.reverse();
        isActive = false;
      }
    };

    const closeMenu = () => {
      if (!tl || !isActive) return;
      tl.reverse();
      isActive = false;
    };

    // 이벤트 리스너 연결
    openButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu();
      });
    });

    closeTriggers.forEach((trigger) => {
      trigger.addEventListener('click', closeMenu);
    });

    // 내부 링크 클릭 시 자동 닫기 및 스크롤 핸들링
    const anchorLinks = element.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
          e.preventDefault();
          closeMenu();

          // 애니메이션 종료 후 스크롤 이동을 위한 타이밍 지연
          setTimeout(() => {
            if (lenis) {
              lenis.scrollTo(targetId, { duration: 1.2 });
            } else {
              document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
            }
          }, 600);
        }
      });
    });

    // ESC 키 핸들링
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isActive) closeMenu();
    });

    // 리사이즈 시 메뉴 닫기 (데스크탑 전환 시 대비)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && isActive) closeMenu();
    });
  });
};

// 3. 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initMobileMenu();

  // 4. Hero 애니메이션 최적화 모듈 호출
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    console.log('[Main] Registering animations...');
    // ScrollTrigger 플러그인 등록 (필수)
    gsap.registerPlugin(ScrollTrigger);

    // Hero 애니메이션 초기화 (Pinning 발생으로 페이지 길이 변화)
    initHeroAnimation({ gsap, ScrollTrigger });

    // About 애니메이션 초기화 (Pinning 및 스크롤 애니메이션)
    initAboutAnimation({ gsap, ScrollTrigger });

    // About Main 애니메이션 (이미지 분산 및 복귀)
    initAboutMainAnimation({ gsap, ScrollTrigger });

    // Header Reveal 초기화 (변경된 페이지 길이를 감지하여 정확한 위치 계산)
    initHeaderReveal({ gsap, ScrollTrigger });

    // Works 섹션 애니메이션
    initWorksAnimation({ gsap, ScrollTrigger });

    // Marquee CTA 애니메이션 (try-catch로 보호하여 단독 실행 보장)
    try {
      console.log('[Main] Calling initMarqueeAnimation...');
      initMarqueeAnimation({ gsap, ScrollTrigger });
      console.log('[Main] initMarqueeAnimation finished.');
    } catch (e) {
      console.error('[Main] initMarqueeAnimation failed to execute:', e);
    }
  }
});
