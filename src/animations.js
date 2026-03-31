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

  // setFluidState를 외부에서도 사용할 수 있도록 전역/윈도우 객체 등에 임시 연결
  window.setHeaderFluid = setFluidState;

  return () => {
    window.setHeaderFluid = null;
  };
}

export function initHeroAnimation({ gsap, ScrollTrigger }) {
  if (!gsap || !ScrollTrigger) return () => {};

  let mainTl = null;
  let bgRotation = null;

  const init = () => {
    if (!document.querySelector('.hero__content')) return;

    ScrollTrigger.clearScrollMemory();
    window.scrollTo(0, 0);

    gsap.to('.hero__title-base > *', {
      y: 0,
      opacity: 1,
      duration: 1.0,
      stagger: 0.3,
      ease: 'expo.out',
    });

    bgRotation = gsap.to('.hero-accent', {
      rotation: 360,
      duration: 6,
      repeat: -1,
      ease: 'none',
    });

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
      .to('.hero__accent-rotate', { rotation: -360, ease: 'none', duration: 0.8 }, '<')
      .to(
        '.hero__accent-shape',
        { filter: 'invert(100%)', webkitFilter: 'invert(100%)', ease: 'none', duration: 0.1 },
        '>',
      )
      .to('.hero__moving-title', { x: '-30%', ease: 'none', duration: 1 }, '>')
      .fromTo(
        '.hero__title-shade',
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 1 },
        '<',
      )
      .to('.hero__desc-wrap', { opacity: 0, y: 40, ease: 'none' }, '>')
      .add(() => {
        if (window.setHeaderFluid) window.setHeaderFluid(true);
      }, '<')
      .add(() => {
        if (window.setHeaderFluid) window.setHeaderFluid(false);
      }, '<-=0.01');

    ScrollTrigger.refresh();
  };

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  return () => {
    window.removeEventListener('load', init);
    if (bgRotation) bgRotation.kill();
    if (mainTl) {
      if (mainTl.scrollTrigger) mainTl.scrollTrigger.kill();
      mainTl.kill();
    }
  };
}

export function initAboutAnimation({ gsap, ScrollTrigger }) {
  if (!gsap || !ScrollTrigger) return () => {};

  const init = () => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1195px)', () => {
      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.about__scroll-track',
          start: 'top top',
          end: '+=400%', // CSS height에 의존하지 않고 애니메이션 구간을 강제로 확보하여 속도를 늦춤
          pin: '.about__sticky-wrap',
          scrub: 2,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      const contents = gsap.utils.toArray('.about__content');
      contents.forEach((content, i) => {
        if (i === 0) {
          gsap.set(content, { zIndex: 1, width: '100%', marginLeft: '0%', marginRight: '0%' });
        } else {
          gsap.set(content, { zIndex: i + 1, width: '0%', marginLeft: '50%', marginRight: '50%' });
        }
      });

      // 배경 이미지 스케일링은 전체 타임라인 구간에 걸쳐 서서히 진행되도록 충분한 시간(duration) 할당
      aboutTl.fromTo(
        '.about__img-area',
        { xPercent: -50, yPercent: -50, scale: 0.8 },
        { xPercent: -50, yPercent: -50, scale: 1, ease: 'none', duration: contents.length * 1.5 },
        0,
      );

      // 각 카드 섹션이 일정한 간격(1.5초)으로 순차적으로 열리도록 명시적(position parameter)으로 타임라인에 배치
      contents.forEach((content, i) => {
        if (i > 0) {
          aboutTl.to(
            content,
            { width: '100%', marginLeft: '0%', marginRight: '0%', ease: 'power2.inOut', duration: 1.5 },
            (i - 0.5) * 1.5, // i=1일때 0.75부터, i=2일때 2.25부터 열리기 시작 (겹치지 않고 연속성 줌)
          );
        }
      });

      // 마지막 카드(데이터 시각화)가 다 열린 후에도 바로 화면이 풀려서 위로 올라가지 않고,
      // 그 상태 그대로 잠시 머무르며 감상할 수 있도록 유휴(버퍼) 시간을 타임라인 끝부분에 추가합니다.
      aboutTl.to({}, { duration: 1.5 });
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
  };
}

export function initAboutMainAnimation({ gsap, ScrollTrigger }) {
  if (!gsap || !ScrollTrigger) return () => {};
  const mm = gsap.matchMedia();

  const init = () => {
    mm.add('(min-width: 1195px)', () => {
      const images = gsap.utils.toArray('.about-main__img');
      const initialTransforms = [
        { x: '-16vw', y: '-80vh', scale: 3 },
        { x: '-2vw', y: '-48vh', scale: 2 },
        { x: '27vw', y: '-41vh', scale: 3 },
      ];

      images.forEach((img, idx) => {
        gsap.set(img, {
          ...initialTransforms[idx % initialTransforms.length],
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        });
      });

      gsap
        .timeline({ scrollTrigger: { trigger: '.about-main', start: 'top 95%', end: 'top 30%', scrub: 1 } })
        .to(images, { x: '0vw', y: '0vh', scale: 1, ease: 'none', stagger: 0.1 });

      gsap
        .timeline({
          scrollTrigger: { trigger: '.about-main', start: 'top 60%', toggleActions: 'play none none reverse' },
        })
        .from('.about-main__text em', { yPercent: 120, duration: 1.2, ease: 'power3.out', stagger: 0.2 })
        .from('.about-main__visual', { x: -80, scale: 0.9, opacity: 0, duration: 1.5, ease: 'expo.out' }, '-=0.8')
        .from('.about-main__paragraph', { x: 100, opacity: 0, duration: 1.5, ease: 'expo.out' }, '-=1.2')
        .from(
          '.about-main__paragraph p',
          { y: 20, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' },
          '-=0.6',
        );

      const accentTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.about-main',
          start: 'top top',
          end: '+=100%',
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });
      gsap.utils.toArray('.about-main__accent').forEach((accent) => {
        accentTl.to(accent, { backgroundSize: '100% 100%', ease: 'none' });
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

export function initWorksAnimation({ gsap, ScrollTrigger }) {
  if (!gsap || !ScrollTrigger) return () => {};
  const mm = gsap.matchMedia();

  const init = () => {
    const items = gsap.utils.toArray('.works__item');
    const overlays = gsap.utils.toArray('.works__item-overlay');
    const projectTitles = gsap.utils.toArray('.works__top-project-item');
    const projectContents = gsap.utils.toArray('.works__bottom-content-item');
    const projectSkills = gsap.utils.toArray('.works__bottom-skills-item');

    mm.add('(min-width: 1280px)', () => {
      gsap.to(['.works__top', '.works__bottom'], {
        opacity: 1,
        duration: 1,
        scrollTrigger: { trigger: '.works', start: 'top 30%', toggleActions: 'play none none reverse' },
      });

      let currentIndex = 0;
      // 초기 셋업 (첫 번째 아이템을 제외한 모든 요소를 시작 마스크 위치로 배치)
      projectTitles.forEach((title, i) => {
        if (i !== 0) {
          gsap.set([title, projectContents[i], projectSkills[i]], { yPercent: 100, opacity: 0 });
          gsap.set(overlays[i], { opacity: 1 });
        } else {
          gsap.set([title, projectContents[i], projectSkills[i]], { yPercent: 0, opacity: 1 });
          gsap.set(overlays[i], { opacity: 0 });
        }
      });

      const switchItem = (nextIndex, direction) => {
        if (currentIndex === nextIndex) return;

        const yPercentIn = direction === 1 ? 100 : -100;
        const yPercentOut = direction === 1 ? -100 : 100;

        const currentTitle = projectTitles[currentIndex];
        const currentBottoms = [projectContents[currentIndex], projectSkills[currentIndex]];
        const nextTitle = projectTitles[nextIndex];
        const nextBottoms = [projectContents[nextIndex], projectSkills[nextIndex]];

        // 기존 텍스트 아웃
        if (currentTitle) {
          gsap.to(currentTitle, { yPercent: yPercentOut, opacity: 0, zIndex: 1, duration: 0.4, ease: 'power3.inOut', overwrite: true });
          gsap.to(currentBottoms, { yPercent: yPercentOut, opacity: 0, zIndex: 1, duration: 0.4, ease: 'power3.inOut', overwrite: true });
          gsap.to(overlays[currentIndex], { opacity: 1, duration: 0.4, overwrite: true });
        }

        // 새 텍스트 인
        if (nextTitle) {
          gsap.fromTo(
            nextTitle,
            { yPercent: yPercentIn, opacity: 0, zIndex: 1 },
            { yPercent: 0, opacity: 1, zIndex: 10, duration: 0.4, ease: 'power3.inOut', overwrite: true }
          );
          gsap.fromTo(
            nextBottoms,
            { yPercent: yPercentIn, opacity: 0, zIndex: 1 },
            { yPercent: 0, opacity: 1, zIndex: 10, duration: 0.4, ease: 'power3.inOut', stagger: 0.05, overwrite: true }
          );
          gsap.to(overlays[nextIndex], { opacity: 0, duration: 0.4, overwrite: true });
        }

        currentIndex = nextIndex;
      };

      items.forEach((item, index) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 50%',
          end: 'bottom 50%',
          onEnter: () => switchItem(index, 1),
          onEnterBack: () => switchItem(index, -1),
        });
      });

      // 프로젝트별 완벽한 스크롤 스냅(기능: 화면 중앙 정렬) 추가
      if (items.length > 0) {
        ScrollTrigger.create({
          trigger: '.works',
          start: 'top top',
          end: 'bottom bottom',
          snap: {
            snapTo: (progress, self) => {
              const scrollPos = window.scrollY || document.documentElement.scrollTop;
              let minDistance = Infinity;
              let targetProgress = progress;

              items.forEach((item) => {
                const rect = item.getBoundingClientRect();
                // 절대 좌표계에서의 요소 중앙 Y값
                const itemCenterV = rect.top + scrollPos + rect.height / 2;
                
                // 해당 요소의 중앙을 화면 중앙에 맞추기 위해 필요한 스크롤 Y 목표값
                const targetScrollY = itemCenterV - window.innerHeight / 2;
                
                // 현재 스크롤 위치와 목표 위치까지의 픽셀 거리 계산
                const distance = Math.abs(targetScrollY - scrollPos);
                
                if (distance < minDistance) {
                  minDistance = distance;
                  targetProgress = (targetScrollY - self.start) / (self.end - self.start);
                }
              });

              // 타임라인 범위(0~1)를 벗어나지 않도록 클램핑
              return Math.max(0, Math.min(1, targetProgress));
            },
            duration: { min: 0.2, max: 0.5 },
            delay: 0.15, // 스크롤이 딱 멈추고 나서 살짝 뒤에 스냅 시작
            ease: 'power2.inOut',
          },
        });
      }
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

/**
 * 6. Marquee CTA 애니메이션 (User Reference Adaption)
 */
export const initMarqueeAnimation = ({ gsap, ScrollTrigger }) => {
  if (!gsap || !ScrollTrigger) return () => {};

  const init = () => {
    document.querySelectorAll('.marquee_cta_wrap').forEach((element) => {
      if (element.dataset.scriptInitialized) return;
      element.dataset.scriptInitialized = 'true';

      const marquees = element.querySelectorAll('[data-marquee-scroll-direction-target]');

      marquees.forEach((marquee) => {
        const marqueeContent = marquee.querySelector('[data-marquee-collection-target]');
        const marqueeScroll = marquee.querySelector('[data-marquee-scroll-target]');

        if (!marqueeContent || !marqueeScroll) return;

        const {
          marqueeSpeed: speed,
          marqueeDirection: direction,
          marqueeDuplicate: duplicate,
          marqueeScrollSpeed: scrollSpeed,
        } = marquee.dataset;

        const marqueeSpeedAttr = parseFloat(speed) || 1;
        const marqueeDirectionAttr = direction === 'right' ? 1 : -1;
        const duplicateAmount = parseInt(duplicate || 0);
        const scrollSpeedAttr = parseFloat(scrollSpeed) || 0;

        const speedMultiplier = window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;
        let marqueeSpeed = marqueeSpeedAttr * (marqueeContent.offsetWidth / window.innerWidth) * speedMultiplier;

        // Handle scroll speed styling locally
        marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
        marqueeScroll.style.width = `${scrollSpeedAttr * 2 + 100}%`;
        marqueeScroll.style.overflow = 'hidden';

        // Duplicate node explicitly for marquee infinite loop
        if (duplicateAmount > 0) {
          const fragment = document.createDocumentFragment();
          for (let i = 0; i < duplicateAmount; i++) {
            fragment.appendChild(marqueeContent.cloneNode(true));
          }
          marqueeScroll.appendChild(fragment);
        }

        // Configure explicit row display to prevent vertical stacking issues locally
        marqueeScroll.style.display = 'flex';
        marqueeScroll.style.flexFlow = 'row nowrap';

        const marqueeItems = marquee.querySelectorAll('[data-marquee-collection-target]');
        if (marqueeItems.length === 0) return;

        const animation = gsap
          .to(marqueeItems, {
            xPercent: -100,
            repeat: -1,
            duration: marqueeSpeed,
            ease: 'linear',
          })
          .totalProgress(0.5);

        gsap.set(marqueeItems, {
          xPercent: marqueeDirectionAttr === 1 ? 100 : -100,
        });

        animation.timeScale(marqueeDirectionAttr);
        animation.play();

        marquee.setAttribute('data-marquee-status', 'normal');

        let scrollTimeout;

        ScrollTrigger.create({
          trigger: marquee,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            if (self.direction === 0) return;

            // 사용자 니즈 반영: "스크롤 변환에 따른 즉각적인 반응 확인 및 로그 증명"
            const velocity = self.getVelocity();
            const velocityScale = Math.abs(velocity) / 300;

            // 위로 올릴 때 정방향(Left), 내릴 때 방향 역전(Right) -> 참조 코드 원본 규칙 복구!
            const isInverted = self.direction === 1; // 내릴 때(1) 역전시킴
            const currentDirection = isInverted ? -marqueeDirectionAttr : marqueeDirectionAttr;
            const directionString = currentDirection === 1 ? 'right' : 'left';

            // [증명용 로그] 스크롤 방향과 계산된 마키 흐름 배율을 콘솔에 찍습니다.
            console.log(
              `[Marquee 상태] 스크롤 방향: ${self.direction > 0 ? '내림(Down) 👇' : '올림(Up) 👆'} | 마키 흐름: ${directionString.toUpperCase()} ➡️ | 속도 배율: ${(currentDirection * (1 + velocityScale)).toFixed(2)}배`,
            );

            // 스크롤 중일 때 방향과 증폭된 속도를 즉각 적용
            gsap.to(animation, {
              timeScale: currentDirection * (1 + velocityScale),
              duration: 0.15,
              overwrite: true,
            });

            marquee.setAttribute('data-marquee-status', isInverted ? 'inverted' : 'normal');
            marquee.setAttribute('data-marquee-direction', directionString); // <- CSS가 이걸 참조할수도 있으므로 실제 속성도 반전시킴

            // 스크롤이 끝나는 찰나 마지막 방향을 유지하며 속도만 1배속으로 감속 복구
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
              console.log(
                `[Marquee 감속 처리] 스크롤 멈춤 감지 ✋ -> 현재 방향(${directionString.toUpperCase()}) 유지, 1배속으로 안정화`,
              );
              gsap.to(animation, {
                timeScale: currentDirection,
                duration: 0.6,
                ease: 'power3.out',
                overwrite: true,
              });
              marquee.setAttribute('data-marquee-status', isInverted ? 'inverted' : 'normal');
              marquee.setAttribute('data-marquee-direction', directionString);
            }, 150);
          },
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: marquee,
            start: '0% 100%',
            end: '100% 0%',
            scrub: 0.5, // 슬라이드의 떨림 현상 방지를 위해 0에서 0.5로 개선
          },
        });

        const scrollStart = marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
        const scrollEnd = -scrollStart;

        tl.fromTo(marqueeScroll, { x: `${scrollStart}vw` }, { x: `${scrollEnd}vw`, ease: 'none' });
      });
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
  };
};
