(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = all('[data-hero-slide]', root);
    var dots = all('[data-hero-dot]', root);
    if (!slides.length) return;
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
      });
    });

    setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initSearchRedirect() {
    all('form[action="./search.html"]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) return;
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function initCardFilters() {
    all('[data-card-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-card-search]');
      var chips = all('[data-filter-value]', scope);
      var cards = all('.movie-card, .rank-card', scope);
      var empty = scope.querySelector('[data-empty-message]');
      var activeValue = '';
      if (!cards.length) return;

      function apply() {
        var query = text(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute('data-search') || card.textContent);
          var ok = (!query || haystack.indexOf(query) !== -1) && (!activeValue || haystack.indexOf(activeValue) !== -1);
          card.classList.toggle('is-hidden', !ok);
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle('show', visible === 0);
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) input.value = q;
        input.addEventListener('input', apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) { item.classList.remove('active'); });
          chip.classList.add('active');
          activeValue = text(chip.getAttribute('data-filter-value'));
          apply();
        });
      });

      apply();
    });
  }

  window.initMoviePlayer = function (url) {
    var player = document.querySelector('.watch-player');
    if (!player || !url) return;
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var button = player.querySelector('.player-button');
    if (!video || !cover) return;
    var ready = false;
    var hls = null;

    function prepare() {
      if (ready) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ maxBufferLength: 30 });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      prepare();
      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) promise.catch(function () {});
    }

    cover.addEventListener('click', play);
    cover.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        play();
      }
    });
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchRedirect();
    initCardFilters();
  });
})();
