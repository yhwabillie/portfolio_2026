// src/main.js
import { initHeaderReveal, initHeroAnimation, initAboutAnimation, initAboutMainAnimation, initWorksAnimation, initCareerAnimation, initMarqueeAnimation, initFooterAnimation, initHeaderTheme, setupGsapDefaults } from './animations.js';

/**
 * 1. Lenis 초기화 (Smooth Scroll)
 * 전역에서 부드러운 스크롤을 관리합니다.
 */
let lenis;
const initLenis = () => {
  if (typeof Lenis !== 'undefined') {
    // GSAP 기본 설정 적용
    setupGsapDefaults(gsap);

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    window.lenis = lenis;

    // ScrollTrigger와 Lenis 동기화
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP Ticker를 사용하여 Lenis.raf 호출 (프레임 동기화 최적화)
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000); // gsap.ticker는 초 단위, lenis는 밀리초 단위 필요
    });

    // Ticker의 지연 시간 설정 (부드러운 움직임 보색)
    gsap.ticker.lagSmoothing(0);
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
          
          // lenis가 stop() 상태이면 scrollTo가 작동하지 않거나 지연되므로 즉시 start() 호출
          if (lenis) lenis.start();

          if (lenis) {
            lenis.scrollTo(targetId, { duration: 1.2 });
          } else {
            const targetEl = document.querySelector(targetId);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
          }
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

/**
 * 3. 데스크탑 헤더 네비게이션 스크롤 이동
 */
const initHeaderNav = () => {
  const headerLinks = document.querySelectorAll('.header__nav-list-item a[href^="#"]');
  headerLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetElement, { duration: 1.2 });
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });
};

/**
 * 4. 테마 전환 (Light/Dark Mode)
 */
const initTheme = () => {
  const themeBtn = document.querySelector('[data-theme-change]');
  if (!themeBtn) return;

  // 로컬 스토리지에서 테마 확인
  let currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // 아이콘 토글 함수 (문/선)
  const toggleIcon = (theme) => {
    if (theme === 'dark') {
      themeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn__icon lucide lucide-sun-icon lucide-sun"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>`;
    } else {
      themeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn__icon lucide lucide-moon-icon lucide-moon"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>`;
    }
  };

  // 초기 아이콘 세팅
  toggleIcon(currentTheme);

  themeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    
    if (currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    localStorage.setItem('theme', currentTheme);
    toggleIcon(currentTheme);
  });
};

/**
 * 3. 플로팅 버튼 동작 로직
 */
const initFloatingButton = () => {
  const btn = document.getElementById('btn-scroll-top');
  if (!btn) return;

  // Show/hide based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  });

  // Scroll to hero section on click
  btn.addEventListener('click', () => {
    if (lenis) {
      lenis.scrollTo('#hero', { duration: 1.2 });
    } else {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
};

// 5. 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLenis();
  initMobileMenu();
  initHeaderNav();
  initFloatingButton();

  // 4. Hero 애니메이션 최적화 모듈 호출
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // console.log('[Main] Registering animations...');
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
    initHeaderTheme({ gsap, ScrollTrigger });

    // Works 섹션 애니메이션
    initWorksAnimation({ gsap, ScrollTrigger });

    // Career 섹션 애니메이션
    initCareerAnimation({ gsap, ScrollTrigger });

    // Marquee CTA 애니메이션 (try-catch로 보호하여 단독 실행 보장)
    try {
      // console.log('[Main] Calling initMarqueeAnimation...');
      initMarqueeAnimation({ gsap, ScrollTrigger });
      // console.log('[Main] initMarqueeAnimation finished.');
    } catch (e) {
      console.error('[Main] initMarqueeAnimation failed to execute:', e);
    }

    // 8. Footer 애니메이션 (Matter.js + GSAP)
    try {
      // console.log('[Main] Calling initFooterAnimation...');
      initFooterAnimation({ gsap, ScrollTrigger });
      // console.log('[Main] initFooterAnimation finished.');
    } catch (e) {
      console.error('[Main] initFooterAnimation failed to execute:', e);
    }
    // 9. 최종 위치 갱신 (모든 섹션의 Pinning 및 높이 변화 반영)
    // 약간의 지연을 주어 모든 레이아웃 계산이 완료된 후 정확하게 측정합니다.
    setTimeout(() => {
      ScrollTrigger.refresh();
      // console.log('[Main] Final ScrollTrigger refresh completed.');
    }, 100);
  }
});
