(function () {
    function byId(id) {
        return document.getElementById(id);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length || !dots.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            slides[index].classList.remove("is-active");
            dots[index].classList.remove("is-active");
            index = (next + slides.length) % slides.length;
            slides[index].classList.add("is-active");
            dots[index].classList.add("is-active");
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(dotIndex);
                start();
            });
        });
        start();
    }

    function setupFilters() {
        var input = byId("movieFilterInput");
        var type = byId("typeFilter");
        var year = byId("yearFilter");
        var count = byId("visibleCount");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card='movie']"));
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial && !input.value) {
            input.value = initial;
        }
        function match(card) {
            var query = normalize(input.value);
            var typeValue = type ? normalize(type.value) : "";
            var yearValue = year ? normalize(year.value) : "";
            var text = normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.type,
                card.dataset.category,
                card.dataset.genre,
                card.textContent
            ].join(" "));
            if (query && text.indexOf(query) === -1) {
                return false;
            }
            if (typeValue && normalize(card.dataset.type).indexOf(typeValue) === -1) {
                return false;
            }
            if (yearValue && normalize(card.dataset.year) !== yearValue) {
                return false;
            }
            return true;
        }
        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = match(card);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = String(visible);
            }
        }
        input.addEventListener("input", apply);
        if (type) {
            type.addEventListener("change", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        apply();
    }

    window.setupPlayer = function (videoId, source, coverId) {
        var video = byId(videoId);
        var cover = byId(coverId);
        if (!video || !cover || !source) {
            return;
        }
        var prepared = false;
        function prepare() {
            if (prepared) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.hlsController = hls;
            } else {
                video.src = source;
            }
            prepared = true;
        }
        function play() {
            prepare();
            cover.classList.add("is-hidden");
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        cover.addEventListener("click", play);
        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
