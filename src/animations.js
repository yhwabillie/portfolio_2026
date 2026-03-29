// src/animations.js
import { ANIMATION_CONFIG } from './config.js';

export function initHeaderReveal({ gsap, ScrollTrigger }) {
  if (!gsap || !ScrollTrigger) return () => {};

  const config = ANIMATION_CONFIG.header;
  const target = document.querySelector(config.selector);
  const headerContainer = target?.querySelector('[data-header-container]');

  if (!target || !headerContainer) return () => {};

  // 초기 상태: Y축 원래 자리
  gsap.set(target, { yPercent: 0 });

  const setFluidState = (nextIsFluid) => {
    target.classList.toggle('is-scrolled', nextIsFluid);
    document.body.classList.toggle('is-scrolled', nextIsFluid);
  };

  // setFluidState를 외부에서도 사용할 수 있도록 전역/윈도우 객체 등에 임시 연결하거나,
  // 혹은 initHeroAnimation 내부에서 처리하도록 구조를 잡습니다.
  window.setHeaderFluid = setFluidState;

  return () => {
    window.setHeaderFluid = null;
  };
}

export function initHeroAnimation({ gsap, ScrollTrigger }) {
  if (!gsap || !ScrollTrigger) return () => {};

  let mainTl = null;
  let bgRotation = null;
  let imgRevealStrays = [];

  const init = () => {
    // 요소를 찾을 수 없으면 중단
    if (!document.querySelector('.hero__content')) return;

    // 1. 초기화: 모든 ScrollTrigger 위치 재계산
    ScrollTrigger.clearScrollMemory();
    window.scrollTo(0, 0);

    // 1.5. 최초 진입 시 타이틀 영역 빠르게 나타나기 (덜컹임 없이 쫀득하게)
    gsap.to('.hero__title-base > *', {
      y: 0, // CSS에서 200px로 세팅된 것을 끌어올림
      opacity: 1, // CSS에서 0으로 세팅된 것을 보여줌
      duration: 1.0, // 타이밍을 살짝 여유를 주면서
      stagger: 0.3, // 뿅뿅뿅 간격 유지
      ease: 'expo.out', // 오버슈트(back)를 없애고 끝에서 쫀쫀하게 달라붙는 expo.out 사용
    });

    // 2. 배경 무한 회전
    bgRotation = gsap.to('.hero-accent', {
      rotation: 360,
      duration: 6,
      repeat: -1,
      ease: 'none',
    });

    // 3. 메인 타임라인 (Hero)
    mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero__scroll-track',
        start: 'top top',
        end: '+=300%',
        pin: '.hero__sticky-wrap',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    mainTl
      .fromTo('.hero__accent-wrap', { width: '28vw' }, { width: '9vw', ease: 'none', duration: 1 })
      // width가 줄어들 때 별표 회전이 멈추거나 꼬이는 현상을 막고,
      // 동시에 역동적으로 굴러가도록 같은 타임라인(<)에 병합합니다.
      .to('.hero__accent-rotate', { rotation: -360, ease: 'none', duration: 0.8 }, '<')
      .to(
        '.hero__accent-shape',
        {
          filter: 'invert(100%)',
          webkitFilter: 'invert(100%)',
          ease: 'none',
          duration: 0.1, // 시간 비중을 확 줄여서 스크롤 시 매우 빠르게(짧은 구간 안에) 변환되도록 함
        },
        '>',
      )
      // 4. invert 효과가 완전히 끝난 직후('>'), 타이틀 이동과 Shade 확장이 이어지도록 체이닝
      .to('.hero__moving-title', { x: '-30%', ease: 'none', duration: 1 }, '>')
      .fromTo(
        '.hero__title-shade',
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 1 },
        '<',
      )
      .to('.hero__desc-wrap', { opacity: 0, y: 40, ease: 'none' }, '>')
      // 5. hero__desc-wrap의 투명도 애니메이션이 시작되는 시점('<')으로 헤더 애니메이션 동기화
      .add(() => {
        if (window.setHeaderFluid) window.setHeaderFluid(true);
      }, '<')
      .add(() => {
        // 역방향 스크롤 시 해제 (0.1초 정도의 매우 짧은 구간 추가)
        if (window.setHeaderFluid) window.setHeaderFluid(false);
      }, '<-=0.01');

    // 마지막으로 모든 트리거 계산 강제 업데이트
    ScrollTrigger.refresh();
  };

  // 'load' 이벤트 시점으로 지연 실행 (사용자 요구사항 반영)
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  // 정리(Cleanup) 함수 반환
  return () => {
    window.removeEventListener('load', init);
    if (bgRotation) bgRotation.kill();
    if (mainTl) {
      if (mainTl.scrollTrigger) mainTl.scrollTrigger.kill();
      mainTl.kill();
    }
    if (imgRevealStrays.length > 0) {
      imgRevealStrays.forEach((tween) => {
        if (tween.scrollTrigger) tween.scrollTrigger.kill();
        tween.kill();
      });
    }
  };
}

export function initAboutAnimation({ gsap, ScrollTrigger }) {
  if (!gsap || !ScrollTrigger) return () => {};

  const init = () => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 769px)', () => {
      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.about__scroll-track',
          start: 'top top',
          end: 'bottom bottom',
          pin: '.about__sticky-wrap',
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      const contents = gsap.utils.toArray('.about__content');

      // 초기 상태 설정
      contents.forEach((content, i) => {
        if (i === 0) {
          gsap.set(content, {
            zIndex: 1,
            width: '100%',
            marginLeft: '0%',
            marginRight: '0%',
          });
        } else {
          gsap.set(content, {
            zIndex: i + 1,
            width: '0%',
            marginLeft: '50%',
            marginRight: '50%',
          });
        }
      });

      // 1. 전역 스케일 애니메이션
      aboutTl.fromTo(
        '.about__img-area',
        { xPercent: -50, yPercent: -50, scale: 0.8 },
        {
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          ease: 'none',
          duration: contents.length,
        },
        0,
      );

      // 2. 순차적 가로 확장
      contents.forEach((content, i) => {
        const title = content.querySelector('.about__title');
        const titleMain = content.querySelector('.about__title-main');
        const titleSub = content.querySelector('.about__title-sub');

        const label = `step-${i}`;
        aboutTl.add(label, i);

        if (i > 0) {
          aboutTl.to(
            content,
            {
              width: '100%',
              marginLeft: '0%',
              marginRight: '0%',
              ease: 'power3.inOut',
              duration: 1,
            },
            label,
          );
        }

        if (title) {
          gsap.set([titleMain, titleSub], {
            y: 0,
            autoAlpha: 1,
          });
        }
      });

      return () => {
        // Cleanup is handled by matchMedia
      };
    });

    ScrollTrigger.refresh();
  };

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  return () => {
    window.removeEventListener('load', init);
    const triggers = ScrollTrigger.getAll();
    triggers.forEach((t) => {
      if (t.trigger === '.about__scroll-track') t.trigger.kill();
    });
  };
}

export function initAboutMainAnimation({ gsap, ScrollTrigger }) {
  if (!gsap || !ScrollTrigger) return () => {};

  const mm = gsap.matchMedia();

  const init = () => {
    // Desktop Animation (Complex 3D + Sequence)
    mm.add('(min-width: 769px)', () => {
      const images = gsap.utils.toArray('.about-main__img');
      const initialTransforms = [
        { x: '-16vw', y: '-80vh', z: '0vw', scale: 3, rotationX: 0, rotationY: 0, rotationZ: 0, skewX: 0, skewY: 0 },
        { x: '-2vw', y: '-48vh', z: '0vh', scale: 2, rotationX: 0, rotationY: 0, rotationZ: 0, skewX: 0, skewY: 0 },
        { x: '27vw', y: '-41vh', z: '0vw', scale: 3, rotationX: 0, rotationY: 0, rotationZ: 0, skewX: 0, skewY: 0 },
      ];

      // 1. Initial Scatter State
      images.forEach((img, idx) => {
        gsap.set(img, {
          ...initialTransforms[idx % initialTransforms.length],
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        });
      });

      // 2. Magnet (Scrub) Timeline
      const magnetTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.about-main',
          start: 'top 95%',
          end: 'top 30%',
          scrub: 1,
        },
      });

      images.forEach((img, index) => {
        magnetTl.to(
          img,
          {
            x: '0vw',
            y: '0vh',
            z: '0vw',
            scale: 1,
            ease: 'none',
          },
          index * 0.1,
        );
      });

      // 3. Entrance (Static Reveal) Timeline
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.about-main',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      entranceTl
        .from('.about-main__title', {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
        })
        .from(
          '.about-main__visual',
          {
            x: -80,
            scale: 0.9,
            opacity: 0,
            duration: 1.5,
            ease: 'expo.out',
          },
          '-=0.8',
        )
        .from(
          '.about-main__paragraph',
          {
            x: 100,
            opacity: 0,
            duration: 1.5,
            ease: 'expo.out',
          },
          '-=1.2',
        )
        .from(
          '.about-main__paragraph p',
          {
            y: 20,
            opacity: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.6',
        );
    });

    // Mobile Optimization
    mm.add('(max-width: 768px)', () => {
      gsap.from('.about-main__paragraph p', {
        y: 20,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-main__sub-text',
          start: 'top 85%',
        },
      });
    });
  };

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  return () => {
    window.removeEventListener('load', init);
    mm.revert();
  };
}
