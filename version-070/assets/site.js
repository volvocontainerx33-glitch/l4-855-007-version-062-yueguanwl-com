(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var start = function () {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                window.clearInterval(timer);
                timer = null;
                start();
            });
        });

        start();
    }

    var cardList = document.querySelector('[data-card-list]');
    if (cardList) {
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
        var input = document.querySelector('[data-filter-input]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var yearSelect = document.querySelector('[data-filter-year]');

        var applyFilters = function () {
            var query = input ? input.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title || '',
                    card.dataset.genre || '',
                    card.dataset.region || '',
                    card.dataset.type || '',
                    card.dataset.year || ''
                ].join(' ').toLowerCase();
                var ok = true;
                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }
                if (type && card.dataset.type !== type) {
                    ok = false;
                }
                if (year && card.dataset.year !== year) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
            });
        };

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    }

    var setupPlayer = function (video) {
        if (!video || video.dataset.ready === '1') {
            return;
        }
        var source = video.dataset.src;
        if (!source) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._stream = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
        video.dataset.ready = '1';
    };

    document.querySelectorAll('.video-shell').forEach(function (shell) {
        var video = shell.querySelector('.movie-player');
        var cover = shell.querySelector('.play-cover');
        if (!video) {
            return;
        }
        var play = function () {
            setupPlayer(video);
            var result = video.play();
            if (result && typeof result.then === 'function') {
                result.catch(function () {});
            }
            if (cover) {
                cover.classList.add('is-hidden');
            }
        };
        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
    });

    var searchResults = document.getElementById('searchResults');
    var searchStatus = document.getElementById('searchStatus');
    var searchInput = document.getElementById('searchInput');

    if (searchResults && window.SiteLibrary) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (searchInput) {
            searchInput.value = query;
        }

        var escapeHtml = function (value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        var buildCard = function (movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '">' +
                '<div class="card-poster">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="card-type">' + escapeHtml(movie.type) + '</span>' +
                    '<span class="card-year">' + escapeHtml(movie.year) + '</span>' +
                '</div>' +
                '<div class="card-body">' +
                    '<span class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</span>' +
                    '<h3>' + escapeHtml(movie.title) + '</h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</a>';
        };

        var renderSearch = function (keyword) {
            var normalized = keyword.trim().toLowerCase();
            var list = window.SiteLibrary;
            if (normalized) {
                list = list.filter(function (movie) {
                    return [
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.genre,
                        movie.oneLine,
                        (movie.tags || []).join(' ')
                    ].join(' ').toLowerCase().indexOf(normalized) !== -1;
                });
            } else {
                list = list.slice(0, 24);
            }
            searchResults.innerHTML = list.slice(0, 96).map(buildCard).join('');
            if (searchStatus) {
                searchStatus.textContent = normalized ? '搜索结果：' + keyword : '热门搜索';
            }
        };

        renderSearch(query);
    }
})();
