(function (html) {
  "use strict";
  html.className = html.className.replace(/\bno-js\b/g, "") + " js ";

  const escapeSelector = (id) => CSS.escape(id); // Safely escape CSS selectors

  const debounce = (func, wait) => {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(func, wait);
    };
  };

  const animationTimeline = anime
    .timeline({ easing: "easeInOutCubic", duration: 1200, autoplay: false })
    .add({
      targets: "#loader",
      opacity: 0,
      duration: 1000,
      begin: () => window.scrollTo(0, 0),
    })
    .add({
      targets: "#preloader",
      opacity: 0,
      complete: () => {
        const preloader = document.querySelector("#preloader");
        if (preloader) {
          preloader.style.visibility = "hidden";
          preloader.style.display = "none";
        }
      },
    })
    .add(
      { targets: ".s-header", translateY: [-100, 0], opacity: [0, 1] },
      "-=200"
    )
    .add({
      targets: [".s-intro .text-pretitle", ".s-intro .text-huge-title"],
      translateX: [100, 0],
      opacity: [0, 1],
      delay: anime.stagger(400),
    })
    .add({
      targets: ".circles span",
      keyframes: [
        { opacity: [0, 0.3] },
        {
          opacity: [0.3, 0.1],
          delay: anime.stagger(100, { direction: "reverse" }),
        },
      ],
      delay: anime.stagger(100, { direction: "reverse" }),
    })
    .add({
      targets: ".intro-social li",
      translateX: [-50, 0],
      opacity: [0, 1],
      delay: anime.stagger(100, { direction: "reverse" }),
    })
    .add(
      {
        targets: ".intro-scrolldown",
        translateY: [100, 0],
        opacity: [0, 1],
      },
      "-=800"
    );

  const ssPreloader = function () {
    const preloader = document.querySelector("#preloader");
    const pageWrap = document.querySelector(".s-pagewrap");
    if (!preloader || !pageWrap) return;

    const minDisplayTime = 6000; // Change loader duration here (in milliseconds)
    const startTime = Date.now();

    window.addEventListener("load", function () {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
      setTimeout(() => {
        html.classList.remove("ss-preload");
        html.classList.add("ss-loaded");

        document.querySelectorAll(".ss-animated").forEach((item) => {
          item.classList.remove("ss-animated");
        });

        preloader.style.opacity = "0";
        setTimeout(() => {
          preloader.style.display = "none";
          pageWrap.classList.add("ss-loaded");
          animationTimeline.play();
        }, 1200);
      }, remainingTime);
    });
  };

  const ssMobileMenu = function () {
    const toggleButton = document.querySelector(".mobile-menu-toggle");
    const mainNavWrap = document.querySelector(".main-nav-wrap");
    const siteBody = document.body;

    if (!(toggleButton && mainNavWrap)) return;

    toggleButton.addEventListener("click", (e) => {
      e.preventDefault();
      toggleButton.classList.toggle("is-clicked");
      siteBody.classList.toggle("menu-is-open");
    });

    mainNavWrap.querySelectorAll(".main-nav a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 800px)").matches) {
          toggleButton.classList.remove("is-clicked");
          siteBody.classList.remove("menu-is-open");
        }
      });
    });

    window.addEventListener("resize", debounce(() => {
      if (window.matchMedia("(min-width: 801px)").matches) {
        siteBody.classList.remove("menu-is-open");
        toggleButton.classList.remove("is-clicked");
      }
    }, 200));
  };

  const ssScrollSpy = function () {
    const sections = document.querySelectorAll(".target-section");
    const navLinks = document.querySelectorAll(".main-nav a");

    const navHighlight = () => {
      const scrollY = window.pageYOffset;
      sections.forEach((section) => {
        const height = section.offsetHeight;
        const top = section.offsetTop - 50;
        const id = section.getAttribute("id");
        const selector = `.main-nav a[href*="#${escapeSelector(id)}"]`;

        navLinks.forEach((link) => link.parentNode.classList.remove("current"));

        if (scrollY > top && scrollY <= top + height) {
          const activeLink = document.querySelector(selector);
          if (activeLink) {
            activeLink.parentNode.classList.add("current");
          }
        }
      });
    };

    window.addEventListener("scroll", debounce(navHighlight, 100));
  };

  const ssViewAnimate = function () {
    const blocks = document.querySelectorAll("[data-animate-block]");

    const viewportAnimation = () => {
      const scrollY = window.pageYOffset;
      const viewportHeight = window.innerHeight;

      blocks.forEach((block) => {
        const triggerTop = block.offsetTop + viewportHeight * 0.2 - viewportHeight;
        const blockBottom = triggerTop + block.offsetHeight;
        const inView = scrollY > triggerTop && scrollY <= blockBottom;

        if (inView && !block.classList.contains("ss-animated")) {
          anime({
            targets: block.querySelectorAll("[data-animate-el]"),
            opacity: [0, 1],
            translateY: [100, 0],
            delay: anime.stagger(400, { start: 200 }),
            duration: 800,
            easing: "easeInOutCubic",
            begin: () => {
              block.classList.add("ss-animated");
            },
          });
        }
      });
    };

    window.addEventListener("scroll", debounce(viewportAnimation, 100));
  };

  const ssLightbox = function () {
    const folioLinks = document.querySelectorAll(".folio-list__item-link");
    const modals = [];

    folioLinks.forEach((link) => {
      const modalbox = link.getAttribute("href");
      const content = document.querySelector(modalbox);
      if (!content) return;

      const instance = basicLightbox.create(content, {
        onShow: (instance) => {
          const escListener = (e) => {
            if (e.key === "Escape") instance.close();
          };
          document.addEventListener("keydown", escListener);
        },
      });

      modals.push(instance);
    });

    folioLinks.forEach((link, i) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        modals[i]?.show();
      });
    });
  };

  const ssMoveTo = function () {
    const easeFunctions = {
      easeInOutCubic: function (t, b, c, d) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t * t + b;
        t -= 2;
        return (c / 2) * (t * t * t + 2) + b;
      },
    };
    const triggers = document.querySelectorAll(".smoothscroll");
    const moveTo = new MoveTo(
      {
        tolerance: 0,
        duration: 1200,
        easing: "easeInOutCubic",
        container: window,
      },
      easeFunctions
    );
    triggers.forEach((trigger) => moveTo.registerTrigger(trigger));
  };

  // Initialize all features
  (function ssInit() {
    ssPreloader();
    ssMobileMenu();
    ssScrollSpy();
    ssViewAnimate();
    ssLightbox();
    ssMoveTo();
  })();
})(document.documentElement);
