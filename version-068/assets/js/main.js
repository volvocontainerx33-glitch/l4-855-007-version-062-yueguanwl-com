
(function () {
  const mobileToggle = document.querySelector(".mobile-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      const expanded = mobileToggle.getAttribute("aria-expanded") === "true";
      mobileToggle.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
      mobileToggle.textContent = expanded ? "☰" : "×";
    });
  }

  document.querySelectorAll(".site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
    });
  });

  const carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    const previous = carousel.querySelector(".hero-prev");
    const next = carousel.querySelector(".hero-next");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        const active = slideIndex === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        reset();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        reset();
      });
    });

    show(0);
    start();
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    const section = panel.closest("section");
    const grid = section ? section.querySelector(".filterable-grid") : null;
    const items = grid ? Array.from(grid.querySelectorAll(".movie-card")) : [];
    const keywordInput = panel.querySelector(".page-filter");
    const regionSelect = panel.querySelector(".region-filter");
    const yearSelect = panel.querySelector(".year-filter");
    const emptyState = section ? section.querySelector(".empty-state") : null;

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      const keyword = normalize(keywordInput ? keywordInput.value : "");
      const region = normalize(regionSelect ? regionSelect.value : "");
      const year = normalize(yearSelect ? yearSelect.value : "");
      let visible = 0;

      items.forEach(function (item) {
        const text = normalize([
          item.dataset.title,
          item.dataset.region,
          item.dataset.type,
          item.dataset.year,
          item.dataset.genre
        ].join(" "));
        const matchesKeyword = !keyword || text.includes(keyword);
        const matchesRegion = !region || normalize(item.dataset.region) === region;
        const matchesYear = !year || normalize(item.dataset.year) === year;
        const matches = matchesKeyword && matchesRegion && matchesYear;
        item.hidden = !matches;
        if (matches) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [keywordInput, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  });
})();
