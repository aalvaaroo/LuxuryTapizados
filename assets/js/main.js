const root = document.documentElement;
const progressBar = document.querySelector(".scroll-progress span");
const revealItems = document.querySelectorAll(".reveal");
const tiltItems = document.querySelectorAll("[data-tilt]");
const configTabs = Array.from(document.querySelectorAll(".config-tab"));
const configSlides = Array.from(document.querySelectorAll(".config-slide"));
const configStage = document.querySelector(".config-stage");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.getElementById("year").textContent = new Date().getFullYear();

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${percent}%`;
};

updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

if (!prefersReducedMotion) {
  window.addEventListener(
    "pointermove",
    (event) => {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    },
    { passive: true }
  );
}

window.requestAnimationFrame(() => {
  revealItems.forEach((item) => item.classList.add("is-visible"));
});

tiltItems.forEach((item) => {
  if (prefersReducedMotion) {
    return;
  }

  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 8;
    const rotateX = (0.5 - y) * 8;

    item.style.setProperty("--tilt-x", `${rotateX}deg`);
    item.style.setProperty("--tilt-y", `${rotateY}deg`);
  });

  item.addEventListener("pointerleave", () => {
    item.style.setProperty("--tilt-x", "0deg");
    item.style.setProperty("--tilt-y", "0deg");
  });
});

if (configTabs.length && configSlides.length) {
  let activeIndex = 0;
  let autoRotateId = null;

  const activateSlide = (index) => {
    activeIndex = index;

    configTabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    configSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
  };

  const stopAutoRotate = () => {
    if (autoRotateId) {
      window.clearInterval(autoRotateId);
      autoRotateId = null;
    }
  };

  const startAutoRotate = () => {
    if (prefersReducedMotion) {
      return;
    }

    stopAutoRotate();
    autoRotateId = window.setInterval(() => {
      const nextIndex = (activeIndex + 1) % configTabs.length;
      activateSlide(nextIndex);
    }, 4800);
  };

  configTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateSlide(index);
      startAutoRotate();
    });
  });

  configStage?.addEventListener("mouseenter", stopAutoRotate);
  configStage?.addEventListener("mouseleave", startAutoRotate);

  activateSlide(0);
  startAutoRotate();
}
