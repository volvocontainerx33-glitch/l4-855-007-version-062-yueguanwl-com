(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  });

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function filterCards(query, year) {
    var keyword = normalize(query);
    var yearValue = normalize(year);
    var cards = document.querySelectorAll('[data-movie-card]');

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
      card.classList.toggle('is-hidden', !(matchKeyword && matchYear));
    });
  }

  var localSearch = document.querySelector('[data-local-search]');
  var localSelect = document.querySelector('[data-local-select]');

  if (localSearch || localSelect) {
    var runLocalFilter = function () {
      filterCards(localSearch ? localSearch.value : '', localSelect ? localSelect.value : '');
    };

    if (localSearch) {
      localSearch.addEventListener('input', runLocalFilter);
    }

    if (localSelect) {
      localSelect.addEventListener('change', runLocalFilter);
    }
  }

  var searchInput = document.querySelector('[data-search-page-input]');

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    searchInput.value = query;
    filterCards(query, '');
    searchInput.addEventListener('input', function () {
      filterCards(searchInput.value, '');
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.onload = function () {
      callback(window.Hls);
    };
    document.head.appendChild(script);
  }

  window.MoviePlayer = {
    mount: function (streamUrl) {
      var video = document.querySelector('[data-player-video]');
      var cover = document.querySelector('[data-player-cover]');
      var startButton = document.querySelector('[data-player-start]');
      var attached = false;

      if (!video || !streamUrl) {
        return;
      }

      function playVideo() {
        if (attached) {
          video.play().catch(function () {});
          return;
        }

        attached = true;

        if (cover) {
          cover.classList.add('is-hidden');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.play().catch(function () {});
          return;
        }

        loadHls(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = streamUrl;
            video.play().catch(function () {});
          }
        });
      }

      if (cover) {
        cover.addEventListener('click', playVideo);
      }

      if (startButton) {
        startButton.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
          video.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }

      video.addEventListener('click', function () {
        if (!attached || video.paused) {
          playVideo();
        }
      });
    }
  };
})();
