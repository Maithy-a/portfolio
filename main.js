(function (documentElement) {
  "use strict";
  documentElement.className =
    documentElement.className.replace(/\bno-js\b/g, "") + " js ";

  // Debounce function to limit the rate of execution
  const debounce = (callback, delay) => {
    let timeoutId;
    return function () {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  };

  // Animation timeline for page load effects
  const pageLoadAnimation = anime
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
        const preloaderElement = document.querySelector("#preloader");
        if (preloaderElement) {
          preloaderElement.style.visibility = "hidden";
          preloaderElement.style.display = "none";
        }
      },
    })
    .add(
      { targets: ".s-header", translateY: [-100, 0], opacity: [0, 1] },
      "-=200"
    )
    .add({
      targets: [
        ".s-intro .text-pretitle",
        ".s-intro .text-huge-title",
        ".s-intro .h5",
      ],
      translateX: [100, 0],
      opacity: [0, 1],
      delay: anime.stagger(400),
    })
    .add({
      targets: ".intro-social li",
      translateX: [-50, 0],
      opacity: [0, 1],
      delay: anime.stagger(100, { direction: "reverse" }),
    })
    .add(
      { targets: ".intro-scrolldown", translateY: [100, 0], opacity: [0, 1] },
      "-=800"
    )
    .add({
      complete: () => {
        anime({
          targets: ".circles span",
          opacity: [
            { value: 0.5, duration: 2000 },
            { value: 0.3, duration: 2000 },
          ],
          easing: "easeInOutSine",
          direction: "alternate",
          loop: true,
          delay: anime.stagger(150),
        });
      },
    });

  // Handle preloader and page load
  (function () {
    const preloader = document.querySelector("#preloader");
    const pageContent = document.querySelector(".s-pagewrap");
    if (!preloader || !pageContent) return;

    const startTime = Date.now();
    window.addEventListener("load", function () {
      const loadDuration = Date.now() - startTime;
      const delay = Math.max(0, 4500 - loadDuration);
      setTimeout(() => {
        documentElement.classList.remove("ss-preload");
        documentElement.classList.add("ss-loaded");
        document.querySelectorAll(".ss-animated").forEach((element) => {
          element.classList.remove("ss-animated");
        });
        preloader.style.opacity = "0";
        setTimeout(() => {
          preloader.style.display = "none";
          pageContent.classList.add("ss-loaded");
          pageLoadAnimation.play();
        }, 1200);
      }, delay);
    });
  })();

  // Mobile menu toggle functionality
  (function () {
    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const navMenu = document.querySelector(".main-nav-wrap");
    const body = document.body;
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener("click", (event) => {
      event.preventDefault();
      menuToggle.classList.toggle("is-clicked");
      body.classList.toggle("menu-is-open");
    });

    navMenu.querySelectorAll(".main-nav a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 800px)").matches) {
          menuToggle.classList.remove("is-clicked");
          body.classList.remove("menu-is-open");
        }
      });
    });

    window.addEventListener(
      "resize",
      debounce(() => {
        if (window.matchMedia("(min-width: 801px)").matches) {
          body.classList.remove("menu-is-open");
          menuToggle.classList.remove("is-clicked");
        }
      }, 200)
    );
  })();

  // Scroll-based navigation highlighting
  (function () {
    const sections = document.querySelectorAll(".target-section");
    const navLinks = document.querySelectorAll(".main-nav a");

    const escapeCSS =
      CSS.escape ||
      function (str) {
        return str.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, "\\$1");
      };

    window.addEventListener(
      "scroll",
      debounce(() => {
        const scrollPosition = window.pageYOffset;
        let isHighlighted = false;
        sections.forEach((section) => {
          const sectionHeight = section.offsetHeight;
          const sectionTop = section.offsetTop - 50;
          const sectionId = section.getAttribute("id");
          if (
            scrollPosition > sectionTop &&
            scrollPosition <= sectionTop + sectionHeight &&
            !isHighlighted
          ) {
            const selector = `.main-nav a[href*="#${escapeCSS(sectionId)}"]`;
            const activeLink = document.querySelector(selector);
            if (activeLink) {
              navLinks.forEach((link) =>
                link.parentNode.classList.remove("current")
              );
              activeLink.parentNode.classList.add("current");
              isHighlighted = true;
            }
          }
        });
      }, 100)
    );
  })();

  // Animate blocks on scroll
  (function () {
    const animatedBlocks = document.querySelectorAll("[data-animate-block]");
    window.addEventListener(
      "scroll",
      debounce(() => {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        animatedBlocks.forEach((block) => {
          const blockTop = block.offsetTop + 0.2 * windowHeight - windowHeight;
          const blockBottom = blockTop + block.offsetHeight;
          if (
            scrollPosition > blockTop &&
            scrollPosition <= blockBottom &&
            !block.classList.contains("ss-animated")
          ) {
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
      }, 100)
    );
  })();

  // Lightbox for portfolio items
  (function () {
    const portfolioLinks = document.querySelectorAll(".folio-list__item-link");
    const lightboxes = [];
    portfolioLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const content = document.querySelector(href);
      if (!content) return;
      const lightbox = basicLightbox.create(content, {
        onShow: (instance) => {
          document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") instance.close();
          });
        },
      });
      lightboxes.push(lightbox);
    });

    portfolioLinks.forEach((link, index) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        lightboxes[index]?.show();
      });
    });
  })();

  // Smooth scrolling for anchor links
  (function () {
    const smoothScrollLinks = document.querySelectorAll(".smoothscroll");
    const moveTo = new MoveTo(
      {
        tolerance: 0,
        duration: 3200,
        easing: "easeInOutCubic",
        container: window,
      },
      {
        easeInOutCubic: function (t, start, change, duration) {
          t /= duration / 2;
          if (t < 1) return (change / 2) * t * t * t + start;
          t -= 2;
          return (change / 2) * (t * t * t + 2) + start;
        },
      }
    );
    smoothScrollLinks.forEach((link) => moveTo.registerTrigger(link));
  })();
})(document.documentElement);
