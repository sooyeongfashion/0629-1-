/**
 * 수영패션 | SOOYEONG FASHION
 * script.js — 인터랙션 스크립트
 */

'use strict';

/* ========================================
   1. 유틸리티
   ======================================== */

/**
 * 여러 셀렉터를 한 번에 선택
 * @param {string} selector
 * @param {Document|Element} scope
 * @returns {NodeList}
 */
const $$ = (selector, scope = document) => scope.querySelectorAll(selector);

/**
 * 단일 셀렉터 선택
 * @param {string} selector
 * @param {Document|Element} scope
 * @returns {Element|null}
 */
const $ = (selector, scope = document) => scope.querySelector(selector);


/* ========================================
   2. 헤더 스크롤 이펙트
   ======================================== */
const initHeaderScroll = () => {
  const header = $('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 페이지 로드 시 즉시 실행
};


/* ========================================
   3. 모바일 햄버거 메뉴 토글
   ======================================== */
const initMobileMenu = () => {
  const btn        = $('#hamburgerBtn');
  const menu       = $('#mobileMenu');
  const mobileLinks = $$('.mobile-link', menu);

  if (!btn || !menu) return;

  /** 메뉴 열기 / 닫기 토글 */
  const toggle = (forceClose = false) => {
    const isOpen = menu.classList.contains('open');

    if (forceClose || isOpen) {
      // 닫기
      menu.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    } else {
      // 열기
      menu.classList.add('open');
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // 백그라운드 스크롤 잠금
    }
  };

  // 햄버거 버튼 클릭
  btn.addEventListener('click', () => toggle());

  // 모바일 메뉴 링크 클릭 시 메뉴 닫기
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggle(true));
  });

  // 메뉴 영역 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      toggle(true);
    }
  });

  // ESC 키로 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(true);
  });
};


/* ========================================
   4. 부드러운 스크롤 (앵커 링크)
   ======================================== */
const initSmoothScroll = () => {
  // href가 '#'으로 시작하는 모든 앵커 링크
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = $(targetId);
      if (!target) return;

      e.preventDefault();

      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
        10
      ) || 72;

      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerH;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    });
  });
};


/* ========================================
   5. 스크롤 진입 애니메이션 (IntersectionObserver)
   ======================================== */
const initRevealOnScroll = () => {
  // 모든 섹션 제목, 카드, 그리드 아이템에 'reveal' 클래스 부여
  const targets = [
    '.section-label',
    '.section-title',
    '.section-desc',
    '.about-image-wrap',
    '.about-text',
    '.factory-banner',
    '.strength-card',
    '.contact-info',
    '.contact-form-wrap',
  ];

  targets.forEach(selector => {
    $$(selector).forEach((el, i) => {
      el.classList.add('reveal');
      // 동일 유형 요소는 순서대로 딜레이 부여 (최대 3단계)
      const delayClass = `reveal-delay-${Math.min(i % 4, 3)}`;
      el.classList.add(delayClass);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // 한 번만 실행
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  $$('.reveal').forEach(el => observer.observe(el));
};


/* ========================================
   6. 활성화 메뉴 하이라이트 (Scroll Spy)
   ======================================== */
const initScrollSpy = () => {
  const sections  = $$('main > section[id]');
  const navLinks  = $$('.gnb-link');

  if (!sections.length || !navLinks.length) return;

  const headerH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
    10
  ) || 72;

  const onScroll = () => {
    let currentId = '';

    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= headerH + 60) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};


/* ========================================
   7. Contact 폼 유효성 검사 및 제출 처리
   ======================================== */
const initContactForm = () => {
  const form = $('#contactForm');
  if (!form) return;

  /** 필드 에러 표시 */
  const showError = (input, message) => {
    // 기존 에러 메시지 제거
    const existing = input.parentElement.querySelector('.form-error');
    if (existing) existing.remove();

    input.style.borderColor = '#c0504a';
    input.style.boxShadow   = '0 0 0 3px rgba(192, 80, 74, 0.12)';

    const errEl = document.createElement('p');
    errEl.className   = 'form-error';
    errEl.textContent = message;
    errEl.style.cssText = 'font-size:0.75rem; color:#c06050; margin-top:0.35rem;';
    input.parentElement.appendChild(errEl);
  };

  /** 필드 에러 초기화 */
  const clearError = (input) => {
    const existing = input.parentElement.querySelector('.form-error');
    if (existing) existing.remove();
    input.style.borderColor = '';
    input.style.boxShadow   = '';
  };

  /** 전화번호 형식 검증 (느슨한 패턴) */
  const isValidPhone = (value) => /^[\d\s\-+().]{7,20}$/.test(value.trim());

  // 실시간 에러 초기화
  $$('.form-input, .form-textarea', form).forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const company = $('#company', form);
    const phone   = $('#phone', form);
    const message = $('#message', form);

    let isValid = true;

    // 회사명 / 성함 검증
    if (!company.value.trim()) {
      showError(company, '회사명 또는 성함을 입력해 주세요.');
      isValid = false;
    } else {
      clearError(company);
    }

    // 연락처 검증
    if (!phone.value.trim()) {
      showError(phone, '연락처를 입력해 주세요.');
      isValid = false;
    } else if (!isValidPhone(phone.value)) {
      showError(phone, '올바른 전화번호 형식으로 입력해 주세요.');
      isValid = false;
    } else {
      clearError(phone);
    }

    // 문의 내용 검증
    if (!message.value.trim()) {
      showError(message, '문의 내용을 입력해 주세요.');
      isValid = false;
    } else {
      clearError(message);
    }

    if (!isValid) return;

    // ── 제출 성공 처리 ──
    // 실제 서비스 연동 시 이 부분을 fetch/axios 등 API 호출로 교체하세요.
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent  = '전송 중...';
    submitBtn.disabled     = true;
    submitBtn.style.opacity = '0.7';

    // 서버 응답을 시뮬레이션하는 딜레이 (실제 구현 시 제거)
    setTimeout(() => {
      alert('문의가 접수되었습니다.\n빠른 시일 내에 연락드리겠습니다. 감사합니다.');
      form.reset();

      submitBtn.textContent  = originalText;
      submitBtn.disabled     = false;
      submitBtn.style.opacity = '';
    }, 600);
  });
};


/* ========================================
   8. 현재 연도 자동 삽입 (저작권)
   ======================================== */
const initCopyrightYear = () => {
  const copyEl = $('.footer-copy');
  if (!copyEl) return;

  const year = new Date().getFullYear();
  copyEl.textContent = copyEl.textContent.replace(/\d{4}/, year);
};


/* ========================================
   9. CSS 변수 폴백 — 헤더 높이를 JS에서도 읽기 쉽게
   ======================================== */
const syncHeaderHeight = () => {
  const header = $('.site-header');
  if (!header) return;

  const updateHeight = () => {
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  };

  updateHeight();
  window.addEventListener('resize', updateHeight, { passive: true });
};


/* ========================================
   DOMContentLoaded — 모든 모듈 초기화
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  syncHeaderHeight();      // 헤더 높이 변수 동기화 (먼저 실행)
  initHeaderScroll();      // 헤더 스크롤 이펙트
  initMobileMenu();        // 햄버거 메뉴
  initSmoothScroll();      // 부드러운 앵커 스크롤
  initRevealOnScroll();    // 진입 애니메이션
  initScrollSpy();         // 활성 메뉴 하이라이트
  initContactForm();       // 폼 유효성 검사 & 제출
  initCopyrightYear();     // 연도 자동 갱신
});
