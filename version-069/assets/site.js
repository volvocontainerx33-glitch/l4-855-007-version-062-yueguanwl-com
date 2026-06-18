(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function() {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(current + 1);
      }, 5600);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-global-search]")).forEach(function(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var target = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
      window.location.href = target;
    });
  });

  var cardList = document.querySelector("[data-card-list]");
  if (cardList) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll("[data-card]"));
    var localSearch = document.querySelector("[data-local-search]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var emptyState = document.querySelector("[data-empty-state]");

    function getQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      return (params.get("q") || "").trim();
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function applyFilter() {
      var term = normalize(localSearch ? localSearch.value : "");
      var year = yearFilter ? yearFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var keywords = normalize(card.getAttribute("data-keywords"));
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;

        if (term && keywords.indexOf(term) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    var initialQuery = getQueryFromUrl();
    if (initialQuery && localSearch) {
      localSearch.value = initialQuery;
    }

    [localSearch, yearFilter, typeFilter].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }
})();
