
(function () {
  const results = document.getElementById("search-results");
  const heading = document.getElementById("search-heading");
  const form = document.querySelector(".search-page-form");
  const input = form ? form.querySelector("input[name='q']") : null;
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();

  if (input) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function card(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"movie-card-link\" href=\"" + escapeHtml(movie.href) + "\">" +
      "<span class=\"movie-poster\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span>" +
      "<span class=\"movie-badge\">" + escapeHtml(movie.type) + "</span>" +
      "<span class=\"movie-play\">▶</span>" +
      "</span>" +
      "<span class=\"movie-card-body\">" +
      "<span class=\"movie-meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></span>" +
      "<h3>" + escapeHtml(movie.title) + "</h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<span class=\"movie-tags\">" + tags + "</span>" +
      "</span>" +
      "</a>" +
      "</article>";
  }

  if (!results || !heading || typeof SITE_MOVIES === "undefined") {
    return;
  }

  if (!query) {
    return;
  }

  const words = normalize(query).split(/\s+/).filter(Boolean);
  const matched = SITE_MOVIES.filter(function (movie) {
    const text = normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      movie.summary,
      (movie.tags || []).join(" ")
    ].join(" "));
    return words.every(function (word) {
      return text.includes(word);
    });
  }).slice(0, 120);

  heading.textContent = matched.length ? "搜索结果" : "未找到相关影片";
  results.innerHTML = matched.length ? matched.map(card).join("") : "<div class=\"empty-state\">没有匹配的影片</div>";
})();
