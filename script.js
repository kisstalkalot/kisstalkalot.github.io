const mediaList = [
  {
    title: "gelato",
    artist: "jaydes", 
    audio: "song.mp3",
    bg: "bg.mp4",
    cover: "cover.png"
  },
];

// ELEMENTS
const enterScreen = document.getElementById("enter-screen");
const centerWrapper = document.getElementById("center-wrapper");
const container = document.getElementById("container");

const bgLayer = document.getElementById("bg-layer");
const bgVideo = document.getElementById("bgVideo");
const bgVideoNext = document.getElementById("bgVideoNext");

// Player Elements
const audioPlayer = document.getElementById("audio-player");
const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");

const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const trackCover = document.getElementById("track-cover");

// UI
const hoverUid = document.querySelector(".hover-uid");
const bioToggle = document.getElementById("bio-toggle");

const infoToggle = document.getElementById("info-toggle");
const sysinfoText = document.getElementById("sysinfo-text");

let currentTrackIndex = 0;
let isPlaying = false;

// LOAD TRACK
function loadTrack(index) {
  if (index < 0) index = mediaList.length - 1;
  if (index >= mediaList.length) index = 0;
  
  currentTrackIndex = index;
  const track = mediaList[index];

  trackTitle.innerText = track.title || "Unknown Track";
  trackArtist.innerText = track.artist || "Unknown Artist"; 
  trackCover.src = track.cover || "pfp.webp";

  audioPlayer.src = track.audio;

  // Background Crossfade
  const currentVideo = bgLayer.querySelector('.active');
  const nextVideo = currentVideo.id === 'bgVideo' ? bgVideoNext : bgVideo;

  if (nextVideo.src !== track.bg) {
    nextVideo.src = track.bg || "bg.mp4";
  }

  nextVideo.classList.add('active');
  currentVideo.classList.remove('active');

  if (isPlaying) {
    playMedia();
  } else {
    updatePlayIcon(false);
  }
}

function playMedia() {
  isPlaying = true;

  trackCover.src = mediaList[currentTrackIndex].cover || "pfp.webp";
  audioPlayer.play().catch(e => {});
  
  const activeVideo = bgLayer.querySelector('.active');
  activeVideo.play().catch(e => {});

  updatePlayIcon(true);
}

function pauseMedia() {
  isPlaying = false;
  audioPlayer.pause();

  const activeVideo = bgLayer.querySelector('.active');
  activeVideo.pause();

  updatePlayIcon(false);
}

function updatePlayIcon(playing) {
  playBtn.style.display = playing ? 'none' : 'flex';
  pauseBtn.style.display = playing ? 'flex' : 'none';
}

// INIT
loadTrack(0);

// ENTER SCREEN
enterScreen.addEventListener("click", () => {
  enterScreen.style.opacity = 0;
  setTimeout(() => enterScreen.remove(), 700);

  centerWrapper.style.opacity = 1;
  centerWrapper.style.pointerEvents = "auto";

  audioPlayer.volume = 0.5;

  playMedia();
});

// PLAY/PAUSE
playBtn.addEventListener("click", playMedia);
pauseBtn.addEventListener("click", pauseMedia);

// PROGRESS
audioPlayer.addEventListener("timeupdate", (e) => {
  const { duration, currentTime } = e.srcElement;
  if (!duration) return;
  progressBar.style.width = `${(currentTime / duration) * 100}%`;
});

progressContainer.addEventListener("click", (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  const duration = audioPlayer.duration;
  if (!duration) return;
  audioPlayer.currentTime = (clickX / width) * duration;
});

audioPlayer.addEventListener("ended", () => {
  loadTrack(currentTrackIndex + 1);
});

// PARALLAX
document.addEventListener("mousemove", e => {
  const x = (e.clientX - window.innerWidth / 2) / 45; 
  const y = (e.clientY - window.innerHeight / 2) / 45;

  document.documentElement.style.setProperty("--move-x", `${x}px`);
  document.documentElement.style.setProperty("--move-y", `${y}px`);
});

// PLAYER WIDTH SYNC
function updatePlayerWidth() {
  const containerWidth = container.offsetWidth;
  document.documentElement.style.setProperty("--card-width", `${containerWidth}px`);
}
updatePlayerWidth();

const resizeObserver = new ResizeObserver(entries => {
  updatePlayerWidth();
});
resizeObserver.observe(container);

// ABOUT TOGGLE
bioToggle.addEventListener('click', () => {
  container.classList.toggle('show-more');
  updateContainerWidth();
});

// HOVER UID LIFT
hoverUid.addEventListener('mouseenter', () => {
  container.classList.add('extended');
});
hoverUid.addEventListener('mouseleave', () => {
  container.classList.remove('extended');
});

// SYSTEM INFO FUCKING MAGIC
async function getSystemInfo() {
  let ip = "loading...";

  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    ip = data.ip;
  } catch {
    ip = "unavailable";
  }

  // GPU detection
  let gpu = "Unknown GPU";
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  } catch (e) {}

  let cpu = navigator.hardwareConcurrency
    ? navigator.hardwareConcurrency + " threads"
    : "Unknown CPU";

  let ram = navigator.deviceMemory
    ? navigator.deviceMemory + " GB"
    : "Unknown";

  let res = `${window.screen.width}x${window.screen.height}`;
  let browser = navigator.userAgent;

  sysinfoText.innerHTML = `
    <i>ur ip:</i> ${ip}<br><br>
  `;
}

// INFO TAB TOGGLE
infoToggle.addEventListener("click", () => {
  const isOn = container.classList.toggle("show-info");
  if (isOn) getSystemInfo();
  updateContainerWidth();
});


function updateContainerWidth() {
  // If neither tab is open, shrink back to normal width
  if (!container.classList.contains("show-more") &&
      !container.classList.contains("show-info")) {
    container.style.width = "300px";
  } else {
    // If any tab is open, expand
    container.style.width = "500px";
  }

  updatePlayerWidth(); // keep player synced
}


