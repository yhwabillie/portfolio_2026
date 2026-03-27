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
      .to('.hero__desc-wrap', { opacity: 0, duration: 0.5, ease: 'none' }, '>')
      // 5. hero__desc-wrap의 투명도 애니메이션이 시작되는 시점('<')으로 헤더 애니메이션 동기화
      .add(() => {
        if (window.setHeaderFluid) window.setHeaderFluid(true);
      }, '<')
      .add(() => {
        // 역방향 스크롤 시 해제 (0.1초 정도의 매우 짧은 구간 추가)
        if (window.setHeaderFluid) window.setHeaderFluid(false);
      }, '<-=0.01');

    // 이미지 각자가 스스로 화면 밑바닥(top bottom)에 닿을 때만 개별적으로 켜지도록 완전히 독립 계산
    const images = gsap.utils.toArray('.about__image-wrap img');
    imgRevealStrays = [];

    images.forEach((img) => {
      const imgTween = gsap.fromTo(
        img,
        { opacity: 0 }, // 제자리에서 투명하게만 대기
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top bottom-=200',
            end: '+=300', // 약 200px 스크롤 내에 스크럽을 통한 투명도 1 전환
            scrub: 1,
          },
        },
      );
      imgRevealStrays.push(imgTween);
    });

    // 알려주신 비율과 스케일을 그대로 GSAP 속성 객체로 분리하여 vw, vh 단위를 강제 보존
    const initialTransforms = [
      { x: '-16vw', y: '-80vh', z: '0px', scale: 3, rotationX: 0, rotationY: 0, rotationZ: 0, skewX: 0, skewY: 0 },
      { x: '17vw', y: '-68vh', z: '0px', scale: 2, rotationX: 0, rotationY: 0, rotationZ: 0, skewX: 0, skewY: 0 },
      { x: '27vw', y: '-41vh', z: '0px', scale: 3, rotationX: 0, rotationY: 0, rotationZ: 0, skewX: 0, skewY: 0 },
    ];
    const targetTransform = {
      x: '0vw',
      y: '0vh',
      z: '0px',
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      skewX: 0,
      skewY: 0,
    };

    // 초기 Transform 및 will-change를 실제 DOM에 최우선적으로 적용
    images.forEach((img, idx) => {
      gsap.set(img, {
        ...initialTransforms[idx],
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
      });
    });

    // [2단계] 위치 애니메이션: 브라우저 환경에 따라 길이가 유동적이므로, 고정 px(+=1000)을 버리고 두 요소 사이의 물리적 거리를 기준으로 1:1 동기화시킴
    const resetTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.about__sticky-wrap',
        start: 'top 80%', // 상단에서 60% (기존 20% 대비 스크롤을 훨씬 덜 내린 이른 시점)에 도달하면 복귀 모션 먼저 시작
        endTrigger: '.about__second-bg', // 닫히는 트리거 기준점인 second-bg를 도착선으로 설정
        end: 'top 80%', // second-bg가 80% 지점에 도착하는 순간 복귀 애니메이션을 무조건 100% 완료하도록 수학적으로 묶음! (opacity 60%보다 무조건 먼저 끝남 보장)
        scrub: true, // 딜레이 잔상을 제거하여 resize 시에도 싱크가 어긋나지 않게 꽉 잡아줌
      },
    });

    // 각 이미지의 Transform 복구 (위치와 스케일)
    images.forEach((img, index) => {
      resetTl.fromTo(
        img,
        initialTransforms[index],
        {
          ...targetTransform,
          ease: 'none',
          immediateRender: false,
        },
        index * 0.1, // 순차적(stagger) 진입
      );
    });

    // about__second-bg 진입 시점에 맞춰 3가지 요소가 자석처럼 순서대로 빠르게 닫히는 타임라인
    const snapTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.about__second-bg',
        // 투명도가 먼저 꺼진 다음(top 60%) 크기가 줄어들어야(top 50%) 하므로 50%로 셋팅
        start: 'top 50%',
        toggleActions: 'play reverse play reverse', // 스크럽 없이 한 번에 지정된 속도로 팍 닫힘
      },
    });

    // GSAP이 자동 역계산 시 픽셀(px)로 변환하는 것을 막기 위해, CSS의 원본 단위(vw)를 명시적으로 fromTo로 전달
    snapTl
      .fromTo('.about__button-wrap', { width: '13vw' }, { width: '0vw', ease: 'power3.inOut', duration: 0.6 })
      .fromTo('.lottie__wrap', { width: '10vw' }, { width: '0vw', ease: 'power3.inOut', duration: 0.6 }, '<0.1')
      .fromTo(
        '.about__image-resize',
        { width: '18vw', willChange: 'width, height' },
        { width: '0vw', ease: 'power3.inOut', duration: 0.6 },
        '<0.1',
      );

    imgRevealStrays.push(snapTl);

    // opacity만 스크럽(늘어짐) 없이 지정 지점에 닿자마자 "번쩍!" 하고 즉각 사라지도록 별도 분리
    const btnOpacityTween = gsap.fromTo(
      '.about__visual-btn, .lottie-arrow, .about__image-wrap', // 요소가 닫히기 전에 반짝! 하고 사라질 세 가지 공통 타겟
      { opacity: 1, willChange: 'opacity' },
      {
        opacity: 0,
        ease: 'power1.out',
        duration: 0.1, // 스크롤과 무관하게 0.1초 만에 찰나로 번쩍 사라짐
        scrollTrigger: {
          trigger: '.about__second-bg',
          // 기존 'top 50%' -> 'top 60%' 변경: 크기가 줄어들기 전(top 50%)에 투명도가 제일 먼저(top 60%) 사라짐
          start: 'top 60%',
          toggleActions: 'play none none reverse', // 아래로 계속 스크롤할 때는 투명상태 유지, 완전히 위로 올렸을 때만 원상복구(reverse)
        },
      },
    );
    imgRevealStrays.push(btnOpacityTween);

    // about__second-bg 상단이 브라우저 상단에 닿았을 때, 빅 텍스트들이 순서대로 아래로 내려감
    const bigTextTween = gsap.to('.about__line .big-text__base', {
      y: 200, // 스크롤을 내릴수록 글씨가 200px 씩 아래로 내려감 (화면 뒤로 빠지는 효과)
      ease: 'power1.inOut',
      scrollTrigger: {
        trigger: '.about__second-bg',
        start: 'top -20%', // 닫히는 모션이 일어나고 조금 뒤부터 진입
        end: 'top -120%', // 이 지점까지 스크롤하는 동안 '무조건' y: 200 도달을 보장함
        scrub: 1, // 스크롤을 빨리하면 빨리 내려가고, 멈추면 멈춤 (스킵 불가)
      },
    });
    imgRevealStrays.push(bigTextTween);

    imgRevealStrays.push(resetTl);

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
