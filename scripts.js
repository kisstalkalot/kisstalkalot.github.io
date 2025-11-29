const mediaList = [
  {
    title: "gelato",
    artist: "jaydes", 
    audio: "song.mp3",  // Path to audio
    bg: "bg.mp4",       // Path to video background
    cover: "cover.png"   // Path to cover art
  },
]
// --- ELEMENTS ---
const enterScreen = document.getElementById("enter-screen");
const centerWrapper = document.getElementById("center-wrapper");
const container = document.getElementById("container");
const bgLayer = document.getElementById("bg-layer");
const bgVideo = document.getElementById("bgVideo");
const bgVideoNext = document.getElementById("bgVideoNext");

// Player Elements
const audioPlayer = document.getElementById("audio-player");
const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn"); // New pause button
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");
// const volumeSlider = document.getElementById("volumeSlider"); // Removed volume slider
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist"); 
const trackCover = document.getElementById("track-cover");

// UI Elements
const hoverUid = document.querySelector(".hover-uid");
const bioToggle = document.getElementById("bio-toggle");

let currentTrackIndex = 0;
let isPlaying = false;

// --- INITIALIZATION ---

function loadTrack(index) {
  // Cycle through tracks if reaching start or end
  if (index < 0) index = mediaList.length - 1;
  if (index >= mediaList.length) index = 0;
  
  currentTrackIndex = index;
  const track = mediaList[index];

  // Set Info
  trackTitle.innerText = track.title || "Unknown Track";
  trackArtist.innerText = track.artist || "Unknown Artist"; 
  trackCover.src = track.cover || "pfp.webp";
  
  // Set Audio
  audioPlayer.src = track.audio;
  // Don't call .load() here, let play() handle it for smoother background loading after user interaction

  // Set Background (Crossfade)
  const currentVideo = bgLayer.querySelector('.active');
  const nextVideo = currentVideo.id === 'bgVideo' ? bgVideoNext : bgVideo;
  
  // Only update if the background video source is different
  if(nextVideo.src !== track.bg) {
    nextVideo.src = track.bg || "bg.mp4";
  }

  // Swap classes for fade (will be triggered on play)
  nextVideo.classList.add('active');
  currentVideo.classList.remove('active');

  // Maintain play state
  if (isPlaying) {
    playMedia();
  } else {
    updatePlayIcon(false);
  }
}

// Global function to handle all media playback (needed for initial play)
function playMedia() {
    isPlaying = true;
    
    // Play PFP/Cover Art (if it's a GIF/Animated image) - Fixed image not showing up if onerror triggered previously
    trackCover.src = mediaList[currentTrackIndex].cover || "pfp.webp";

    // Play Audio
    audioPlayer.play().catch(e => console.error("Audio play failed:", e));
    
    // Play Background Video
    const activeVideo = bgLayer.querySelector('.active');
    activeVideo.play().catch(e => console.error("Video play failed:", e));
    
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
  // Hide/Show the two separate buttons
  playBtn.style.display = playing ? 'none' : 'flex';
  pauseBtn.style.display = playing ? 'flex' : 'none';
}


// Start with first track preloaded
loadTrack(0);

// --- EVENT LISTENERS ---

enterScreen.addEventListener("click", () => {
  enterScreen.style.opacity = 0;
  setTimeout(() => enterScreen.remove(), 700);

  // Show the wrapper (contains both cards)
  centerWrapper.style.opacity = 1;
  centerWrapper.style.pointerEvents = "auto";

  // Initial Volume: Use 50% since slider is removed
  audioPlayer.volume = 0.5;
  
  // Start playing
  playMedia();
});

// Play/Pause - Now using two separate buttons for better CSS control
playBtn.addEventListener("click", playMedia);
pauseBtn.addEventListener("click", pauseMedia);


// Audio Progress
audioPlayer.addEventListener("timeupdate", (e) => {
  const { duration, currentTime } = e.srcElement;
  if (!duration) return; // Prevent division by zero
  const progressPercent = (currentTime / duration) * 100;
  progressBar.style.width = `${progressPercent}%`;
});

// Skip (Click Progress Bar)
progressContainer.addEventListener("click", (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  const duration = audioPlayer.duration;
  if (!duration) return;
  
  audioPlayer.currentTime = (clickX / width) * duration;
});

// Auto Next (Optional: Keep for cycling through songs)
audioPlayer.addEventListener("ended", () => {
  loadTrack(currentTrackIndex + 1);
});

// --- VISUAL EFFECTS (Parallax & Hover) ---

document.addEventListener("mousemove", e => {
  // Lower divisor = more movement
  const x = (e.clientX - window.innerWidth / 2) / 45; 
  const y = (e.clientY - window.innerHeight / 2) / 45;

  document.documentElement.style.setProperty("--move-x", `${x}px`);
  document.documentElement.style.setProperty("--move-y", `${y}px`);
});

// Helper function to update player width
function updatePlayerWidth() {
  const containerWidth = container.offsetWidth;
  document.documentElement.style.setProperty("--card-width", `${containerWidth}px`);
}

// Initial width set
updatePlayerWidth();

hoverUid.addEventListener('mouseenter', () => {
  container.classList.add('extended');
});

hoverUid.addEventListener('mouseleave', () => {
  container.classList.remove('extended');
});

// Observe width change to update player width
const resizeObserver = new ResizeObserver(entries => {
  updatePlayerWidth();
});

resizeObserver.observe(container);

bioToggle.addEventListener('click', () => {
  container.classList.toggle('show-more');
});
