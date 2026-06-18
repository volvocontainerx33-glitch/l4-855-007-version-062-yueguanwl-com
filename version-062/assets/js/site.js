(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : '');
    var selected = normalize(filterSelect ? filterSelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedSelected = !selected || haystack.indexOf(selected) !== -1;
      var shouldShow = matchedKeyword && matchedSelected;

      card.classList.toggle('is-hidden', !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }

  window.initMoviePlayer = function (mediaUrl) {
    var video = document.querySelector('[data-player="movie"]');
    var overlay = document.querySelector('.player-overlay');
    var hasMedia = false;
    var hlsInstance = null;

    if (!video || !mediaUrl) {
      return;
    }

    function attachMedia() {
      if (hasMedia) {
        return;
      }

      hasMedia = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = mediaUrl;
    }

    function play() {
      attachMedia();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      video.setAttribute('controls', 'controls');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', play, { once: true });
    video.addEventListener('ended', function () {
      if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
        hlsInstance.stopLoad();
      }
    });
  };
})();
