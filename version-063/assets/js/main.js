(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function yearMatches(value, rule) {
    if (!rule) {
      return true;
    }
    var year = parseInt(value || '0', 10);
    if (rule === '2010-2019') {
      return year >= 2010 && year <= 2019;
    }
    if (rule === 'before-2010') {
      return year > 0 && year < 2010;
    }
    return String(value) === rule;
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    function next() {
      show((current + 1) % slides.length);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        window.clearInterval(timer);
        timer = window.setInterval(next, 5000);
      });
    });
    timer = window.setInterval(next, 5000);
  }

  function setupFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-filter-year]');
      var type = scope.querySelector('[data-filter-type]');
      var category = scope.querySelector('[data-filter-category]');
      var list = scope.parentElement.querySelector('[data-card-list]');
      var empty = scope.parentElement.querySelector('[data-filter-empty]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var categoryValue = category ? category.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (ok && yearValue && !yearMatches(card.getAttribute('data-year'), yearValue)) {
            ok = false;
          }
          if (ok && typeValue && String(card.getAttribute('data-type') || '').indexOf(typeValue) === -1) {
            ok = false;
          }
          if (ok && categoryValue && card.getAttribute('data-category') !== categoryValue) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }
      [input, year, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  function setupJumpSearch() {
    var form = document.querySelector('[data-jump-search]');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  }

  window.setupMoviePlayer = function (id, source) {
    var box = document.getElementById(id);
    if (!box) {
      return;
    }
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var started = false;
    var hlsInstance = null;
    function attach() {
      if (started || !video || !source) {
        return;
      }
      started = true;
      if (cover) {
        cover.classList.add('hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', attach);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          attach();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupJumpSearch();
  });
})();
