(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function onImageError(event) {
    event.currentTarget.classList.add('is-missing');
  }

  function initImageFallbacks() {
    document.querySelectorAll('img.poster-img').forEach(function (img) {
      img.addEventListener('error', onImageError);
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.slider-dot'));
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
        dot.setAttribute('aria-selected', dotIndex === index ? 'true' : 'false');
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initCardFilters() {
    document.querySelectorAll('[data-card-filter]').forEach(function (scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var keywordInput = scope.querySelector('[data-filter-keyword]');
      var yearSelect = scope.querySelector('[data-filter-year]');
      var regionSelect = scope.querySelector('[data-filter-region]');
      var empty = scope.querySelector('[data-empty-state]');

      function applyFilter() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [keywordInput, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });
  }

  function movieCardTemplate(movie) {
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-meta="' + escapeHtml(movie.meta) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '">',
      '  <a href="' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <div class="poster-frame">',
      '      <img class="poster-img" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
      '      <span class="card-rating">' + escapeHtml(movie.rating) + '</span>',
      '      <span class="card-type">' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <h3 class="card-title">' + escapeHtml(movie.title) + '</h3>',
      '      <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '      <p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('
');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-page]');
    if (!form || !window.SITE_MOVIES) {
      return;
    }

    var input = form.querySelector('[name="q"]');
    var typeSelect = form.querySelector('[data-search-type]');
    var resultBox = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    var params = new URLSearchParams(window.location.search);

    if (params.get('q')) {
      input.value = params.get('q');
    }

    function render() {
      var keyword = normalize(input.value);
      var type = normalize(typeSelect.value);
      var results = window.SITE_MOVIES.filter(function (movie) {
        var haystack = normalize(movie.title + ' ' + movie.meta + ' ' + movie.oneLine);
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        if (type) {
          matched = matched && normalize(movie.type) === type;
        }
        return matched;
      }).slice(0, 120);

      resultBox.innerHTML = results.map(movieCardTemplate).join('
');
      initImageFallbacks();
      empty.classList.toggle('is-visible', results.length === 0);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
      var nextUrl = new URL(window.location.href);
      if (input.value.trim()) {
        nextUrl.searchParams.set('q', input.value.trim());
      } else {
        nextUrl.searchParams.delete('q');
      }
      window.history.replaceState({}, '', nextUrl.toString());
    });

    input.addEventListener('input', render);
    typeSelect.addEventListener('change', render);
    render();
  }

  function initPlayer() {
    document.querySelectorAll('.video-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var start = shell.querySelector('.player-start');
      var status = shell.parentElement.querySelector('.player-status');
      var source = shell.getAttribute('data-video-url');
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function startPlayback() {
        if (!video || !source) {
          setStatus('当前播放源暂不可用');
          return;
        }

        shell.classList.add('is-playing');
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (video.src !== source) {
            video.src = source;
          }
          video.play().catch(function () {
            setStatus('请再次点击播放器开始播放');
          });
          setStatus('正在使用浏览器原生高清播放');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
              if (data && data.fatal) {
                setStatus('播放加载失败，可刷新页面后重试');
              }
            });
          }
          video.play().catch(function () {
            setStatus('播放器已加载，请再次点击开始播放');
          });
          setStatus('正在初始化高清播放');
          return;
        }

        setStatus('当前浏览器不支持该播放源，请更换现代浏览器访问');
      }

      if (start) {
        start.addEventListener('click', startPlayback);
      }
      if (video) {
        video.addEventListener('click', startPlayback);
      }
    });
  }

  ready(function () {
    initImageFallbacks();
    initHeroSlider();
    initCardFilters();
    initSearchPage();
    initPlayer();
  });
})();
