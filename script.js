/**
 * 수영패션 | SOOYEONG FASHION
 * script.js — 인터랙션 스크립트
 */

'use strict';

/* ========================================
   1. 유틸리티
   ======================================== */
const $  = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => scope.querySelectorAll(sel);


/* ========================================
   2. 헤더 스크롤 이펙트
   ======================================== */
const initHeaderScroll = () => {
  const header = $('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};


/* ========================================
   3. 모바일 햄버거 메뉴 토글
   ======================================== */
const initMobileMenu = () => {
  const btn         = $('#hamburgerBtn');
  const menu        = $('#mobileMenu');
  const mobileLinks = $$('.mobile-link', menu);
  if (!btn || !menu) return;

  const toggle = (forceClose = false) => {
    const isOpen = menu.classList.contains('open');
    const closing = forceClose || isOpen;

    menu.classList.toggle('open', !closing);
    btn.classList.toggle('active', !closing);
    btn.setAttribute('aria-expanded', String(!closing));
    menu.setAttribute('aria-hidden',  String(closing));
    document.body.style.overflow = closing ? '' : 'hidden';
  };

  btn.addEventListener('click', () => toggle());
  mobileLinks.forEach(l => l.addEventListener('click', () => toggle(true)));

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) toggle(true);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(true);
  });
};


/* ========================================
   4. 부드러운 스크롤 (앵커 링크)
   ======================================== */
const initSmoothScroll = () => {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;

      e.preventDefault();
      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
        10
      ) || 72;

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - headerH,
        behavior: 'smooth',
      });
    });
  });
};


/* ========================================
   5. 스크롤 진입 애니메이션 (IntersectionObserver)
   ======================================== */
const initRevealOnScroll = () => {
  const selectors = [
    '.section-label', '.section-title', '.section-desc',
    '.about-image-wrap', '.about-text', '.factory-banner',
    '.strength-card',
    '.portfolio-filter', '.portfolio-item',
    '.portfolio-cta',
    '.contact-info', '.contact-form-wrap',
  ];

  selectors.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal', `reveal-delay-${Math.min(i % 4, 3)}`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  $$('.reveal').forEach(el => observer.observe(el));
};


/* ========================================
   6. Scroll Spy — 활성 메뉴 하이라이트
   ======================================== */
const initScrollSpy = () => {
  const sections = $$('main > section[id]');
  const navLinks = $$('.gnb-link');
  if (!sections.length || !navLinks.length) return;

  const getHeaderH = () => parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
    10
  ) || 72;

  const onScroll = () => {
    let currentId = '';
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= getHeaderH() + 80) {
        currentId = sec.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};


/* ========================================
   7. 포트폴리오 카테고리 필터
   ======================================== */
const initPortfolioFilter = () => {
  const filterBtns = $$('.filter-btn');
  const items      = $$('.portfolio-item');
  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 활성 버튼 교체
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;

        if (match) {
          item.classList.remove('hidden');
          // 재진입 애니메이션
          item.classList.remove('fade-in');
          void item.offsetWidth; // reflow
          item.classList.add('fade-in');
        } else {
          item.classList.add('hidden');
          item.classList.remove('fade-in');
        }
      });
    });
  });
};


/* ========================================
   8. Contact 폼 유효성 검사 & EmailJS 전송
   ======================================== */
const initContactForm = () => {
  const form = $('#contactForm');
  if (!form) return;

  emailjs.init({
  publicKey: "Ic7qj6wJXal7m8n27",
});

  const showError = (input, msg) => {
    clearError(input);
    input.style.borderColor = '#c0504a';
    input.style.boxShadow = '0 0 0 3px rgba(192,80,74,0.12)';

    const el = document.createElement('p');
    el.className = 'form-error';
    el.textContent = msg;
    el.style.cssText = 'font-size:.75rem;color:#c06050;margin-top:.35rem;font-family:inherit;';
    input.parentElement.appendChild(el);
  };

  const clearError = (input) => {
    input.parentElement.querySelector('.form-error')?.remove();
    input.style.borderColor = '';
    input.style.boxShadow = '';
  };

  const isValidPhone = (v) => /^[\d\s\-+().]{7,20}$/.test(v.trim());

  $$('.form-input, .form-textarea', form).forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const company = $('#company', form);
    const phone = $('#phone', form);
    const quantity = $('#quantity', form);
    const message = $('#message', form);

    let valid = true;

    if (!company.value.trim()) {
      showError(company, '회사명 또는 성함을 입력해 주세요.');
      valid = false;
    } else {
      clearError(company);
    }

    if (!phone.value.trim()) {
      showError(phone, '연락처를 입력해 주세요.');
      valid = false;
    } else if (!isValidPhone(phone.value)) {
      showError(phone, '올바른 전화번호 형식으로 입력해 주세요.');
      valid = false;
    } else {
      clearError(phone);
    }

    if (!message.value.trim()) {
      showError(message, '문의 내용을 입력해 주세요.');
      valid = false;
    } else {
      clearError(message);
    }

    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = '전송 중...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    try {
      await emailjs.send("sooyeongfactory", "template_n8gs5bs", {
        company: company.value.trim(),
        phone: phone.value.trim(),
        quantity: quantity.value.trim() || "미입력",
        message: message.value.trim(),
        time: new Date().toLocaleString("ko-KR"),
      });

      alert('상담 신청이 완료되었습니다.\n빠른 시간 내 연락드리겠습니다.');
      form.reset();
    } catch (error) {
      console.error("EmailJS Error:", error);
console.log("status =", error.status);
console.log("text =", error.text);
alert(`전송 실패: ${error.status} / ${error.text}`);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
    }
  });
};


/* ========================================
   9. 헤더 높이 CSS 변수 동기화
   ======================================== */
const syncHeaderHeight = () => {
  const header = $('.site-header');
  if (!header) return;
  const update = () =>
    document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
  update();
  window.addEventListener('resize', update, { passive: true });
};


/* ========================================
   10. 저작권 연도 자동 갱신
   ======================================== */
const initCopyrightYear = () => {
  const el = $('.footer-copy');
  if (el) el.textContent = el.textContent.replace(/\d{4}/, new Date().getFullYear());
};


/* ========================================
   DOMContentLoaded — 초기화
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  syncHeaderHeight();
  initHeaderScroll();
  initMobileMenu();
  initSmoothScroll();
  initRevealOnScroll();
  initScrollSpy();
  initPortfolioFilter();   // ← 포트폴리오 필터 (신규)
  initContactForm();
  initCopyrightYear();
});