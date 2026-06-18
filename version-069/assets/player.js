(function() {
  function startPlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var stream = shell.getAttribute("data-stream");

    if (!video || !stream) {
      return;
    }

    function playVideo() {
      shell.classList.add("is-playing");

      if (!video.getAttribute("data-ready")) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        } else {
          video.src = stream;
        }
        video.setAttribute("data-ready", "1");
      }

      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {
          shell.classList.remove("is-playing");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function() {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function() {
      if (!video.seeking) {
        shell.classList.remove("is-playing");
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".video-player")).forEach(startPlayer);
})();
