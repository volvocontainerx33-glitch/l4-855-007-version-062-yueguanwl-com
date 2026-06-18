
function initMoviePlayer(videoId, buttonId, overlayId, streamUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const overlay = document.getElementById(overlayId);
  let attached = false;
  let hlsInstance = null;

  if (!video || !button || !overlay || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      attached = true;
      return;
    }

    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      attached = true;
      return;
    }

    video.src = streamUrl;
    attached = true;
  }

  function startPlayback() {
    attachStream();
    overlay.classList.add("is-hidden");
    const playback = video.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  function togglePlayback() {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  }

  overlay.addEventListener("click", startPlayback);
  button.addEventListener("click", function (event) {
    event.stopPropagation();
    startPlayback();
  });
  video.addEventListener("click", togglePlayback);
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      overlay.classList.remove("is-hidden");
    }
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
