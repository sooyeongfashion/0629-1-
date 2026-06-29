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

(function () {
  const contactForm = document.querySelector("#contactForm");

  if (!contactForm) return;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const company = contactForm.querySelector("[name='company']").value.trim();
    const phone = contactForm.querySelector("[name='phone']").value.trim();
    const quantity = contactForm.querySelector("[name='quantity']").value.trim();
    const message = contactForm.querySelector("[name='message']").value.trim();

    if (!company) {
      alert("회사명 / 담당자를 입력해주세요.");
      return;
    }

    if (!phone) {
      alert("연락처를 입력해주세요.");
      return;
    }

    if (!quantity) {
      alert("예상 수량을 입력해주세요.");
      return;
    }

    if (!message) {
      alert("문의 내용을 입력해주세요.");
      return;
    }

    const submitBtn = contactForm.querySelector("button[type='submit']");
    const originalText = submitBtn ? submitBtn.innerText : "";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "전송 중...";
    }

    const templateParams = {
      company: company,
      phone: phone,
      quantity: quantity,
      message: message
    };

    emailjs
      .send(
        "sooyeongfactory",
        "template_k9o599q",
        templateParams
      )
      .then(function () {
        alert("문의가 정상적으로 접수되었습니다.");
        contactForm.reset();
      })
      .catch(function (error) {
        console.error("EmailJS Error:", error);
        alert("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
      });
  });
})();

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