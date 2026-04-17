(() => {
  "use strict";

  const selectors = {
    header: document.getElementById("site-header"),
    floatingCta: document.getElementById("floating-cta"),
    hero: document.querySelector(".hero"),
    revealTargets: document.querySelectorAll(
      ".section-heading, .artist-card, .lineup-card, .schedule-day, .tickets-panel, .feature-card, .gallery-item, .apply-card, .faq-item, .final-cta-panel",
    ),
    faqItems: document.querySelectorAll(".faq-item"),
    heroVideo: document.querySelector(".hero-video"),
    anchorLinks: document.querySelectorAll('a[href^="#"]'),
    menuToggle: document.getElementById("menu-toggle"),
    siteNav: document.getElementById("site-nav"),
    siteNavLinks: document.querySelectorAll(".site-nav-link"),
    statSection: document.querySelector(".hype-strip"),
    statNumbers: document.querySelectorAll(".stat-number"),
    gallerySlides: document.querySelectorAll(".gallery-slide"),
  };

  const state = {
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  };

  function init() {
    handleHeaderState();
    setupScrollListeners();
    setupRevealAnimations();
    setupFaqAccordion();
    setupSmoothAnchorBehavior();
    setupVideoPlaybackFallback();
    setupMobileCtaVisibility();
    setupMenu();
    setupStatCounters();
    setupGalleryCarousel();
  }

  function setupMenu() {
    const { menuToggle, siteNav, siteNavLinks } = selectors;
    if (!menuToggle || !siteNav) return;

    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.classList.toggle("is-active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu",
      );
      document.body.classList.toggle("menu-open", isOpen);
    });

    siteNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu = siteNav.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);

      if (!clickedInsideMenu && !clickedToggle) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  function closeMenu() {
    const { menuToggle, siteNav } = selectors;
    if (!menuToggle || !siteNav) return;

    siteNav.classList.remove("is-open");
    menuToggle.classList.remove("is-active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
  }

  function setupScrollListeners() {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleHeaderState();
          setupMobileCtaVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function handleHeaderState() {
    if (!selectors.header) return;

    const isScrolled = window.scrollY > 24;
    selectors.header.classList.toggle("is-scrolled", isScrolled);
  }

  function setupMobileCtaVisibility() {
    const cta = document.getElementById("floating-cta");
    const hero = document.querySelector(".hero");
    const footer = document.querySelector(".site-footer");

    if (!cta || !hero || !footer) return;

    const isMobile = () => window.innerWidth <= 820;

    const updateCtaVisibility = () => {
      if (!isMobile()) {
        cta.classList.remove("is-visible");
        return;
      }

      const heroBottom = hero.getBoundingClientRect().bottom;
      const footerTop = footer.getBoundingClientRect().top;
      const viewportHeight = window.innerHeight;

      const pastHero = heroBottom < 120;
      const nearFooter = footerTop < viewportHeight - 120;

      if (pastHero && !nearFooter) {
        cta.classList.add("is-visible");
      } else {
        cta.classList.remove("is-visible");
      }
    };

    updateCtaVisibility();

    window.addEventListener("scroll", updateCtaVisibility, { passive: true });
    window.addEventListener("resize", updateCtaVisibility);
  }

  function setupRevealAnimations() {
    if (!selectors.revealTargets.length) return;

    selectors.revealTargets.forEach((element) => {
      element.classList.add("reveal");
    });

    if (state.prefersReducedMotion || !("IntersectionObserver" in window)) {
      selectors.revealTargets.forEach((element) => {
        element.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, io) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    selectors.revealTargets.forEach((element) => observer.observe(element));
  }

  function setupFaqAccordion() {
    if (!selectors.faqItems.length) return;

    selectors.faqItems.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;

        selectors.faqItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.open) {
            otherItem.open = false;
          }
        });
      });
    });
  }

  function setupSmoothAnchorBehavior() {
    if (!selectors.anchorLinks.length) return;

    selectors.anchorLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#" || href === "#!") return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();

        const headerOffset = selectors.header
          ? selectors.header.offsetHeight
          : 0;
        const targetTop =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          headerOffset -
          12;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: state.prefersReducedMotion ? "auto" : "smooth",
        });
      });
    });
  }

  function setupVideoPlaybackFallback() {
    const video = document.querySelector(".hero-video");
    if (!video) return;

    // Safari-friendly autoplay state
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const tryPlay = async () => {
      try {
        await video.play();
      } catch (error) {
        console.warn("Autoplay blocked:", error);
        video.setAttribute("controls", "controls");
      }
    };

    if (document.readyState === "complete") {
      tryPlay();
    } else {
      window.addEventListener("load", tryPlay, { once: true });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        video.pause();
        return;
      }

      tryPlay();
    });
  }

  function setupStatCounters() {
    const { statSection, statNumbers } = selectors;
    if (!statSection || !statNumbers.length) return;

    let hasAnimated = false;

    const formatValue = (value, prefix = "", suffix = "") => {
      return `${prefix}${value.toLocaleString()}${suffix}`;
    };

    const animateCounter = (element) => {
      const target = Number(element.dataset.target || 0);
      const prefix = element.dataset.prefix || "";
      const suffix = element.dataset.suffix || "";
      const duration = 1800;
      const startTime = performance.now();

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(target * easedProgress);

        element.textContent = formatValue(currentValue, prefix, suffix);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.textContent = formatValue(target, prefix, suffix);
        }
      };

      requestAnimationFrame(step);
    };

    const startCounters = () => {
      if (hasAnimated) return;
      hasAnimated = true;
      statNumbers.forEach((number) => animateCounter(number));
    };

    if (!("IntersectionObserver" in window)) {
      startCounters();
      return;
    }

    const observer = new IntersectionObserver(
      (entries, io) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          startCounters();
          io.unobserve(entry.target);
        });
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(statSection);
  }

  function setupGalleryCarousel() {
    const { gallerySlides } = selectors;
    if (!gallerySlides.length) return;

    let currentIndex = 0;
    const totalSlides = gallerySlides.length;
    const intervalDuration = 5000;

    const showSlide = (index) => {
      gallerySlides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
    };

    showSlide(currentIndex);

    window.setInterval(() => {
      currentIndex = (currentIndex + 1) % totalSlides;
      showSlide(currentIndex);
    }, intervalDuration);
  }

  init();
})();
