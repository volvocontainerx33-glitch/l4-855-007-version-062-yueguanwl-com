document.addEventListener('DOMContentLoaded', function() {
  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function activateSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, position) {
      slide.classList.toggle('is-active', position === current);
    });
    thumbs.forEach(function(thumb, position) {
      thumb.classList.toggle('is-active', position === current);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function() {
      activateSlide(current + 1);
    }, 6200);
  }

  thumbs.forEach(function(thumb) {
    thumb.addEventListener('click', function() {
      var index = Number(thumb.getAttribute('data-slide')) || 0;
      activateSlide(index);
      startSlider();
    });
  });

  if (prev) {
    prev.addEventListener('click', function() {
      activateSlide(current - 1);
      startSlider();
    });
  }

  if (next) {
    next.addEventListener('click', function() {
      activateSlide(current + 1);
      startSlider();
    });
  }

  startSlider();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.js-search-input'));
  var regionFilters = Array.prototype.slice.call(document.querySelectorAll('.js-region-filter'));
  var yearFilters = Array.prototype.slice.call(document.querySelectorAll('.js-year-filter'));
  var categoryFilters = Array.prototype.slice.call(document.querySelectorAll('.js-category-filter'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
  var noResults = document.querySelector('.no-results');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getValue(list) {
    return list.length ? normalize(list[0].value) : '';
  }

  function applyFilters() {
    if (!cards.length || !searchInputs.length && !regionFilters.length && !yearFilters.length && !categoryFilters.length) {
      return;
    }

    var keyword = getValue(searchInputs);
    var region = getValue(regionFilters);
    var year = getValue(yearFilters);
    var category = getValue(categoryFilters);
    var visible = 0;

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' '));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }
      if (region && cardRegion !== region) {
        matched = false;
      }
      if (year && cardYear !== year) {
        matched = false;
      }
      if (category && cardCategory !== category) {
        matched = false;
      }

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.hidden = visible !== 0;
    }
  }

  searchInputs.concat(regionFilters, yearFilters, categoryFilters).forEach(function(control) {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });
});
