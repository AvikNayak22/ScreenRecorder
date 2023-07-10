// Initialize variables
let stream = null,
  audio = null,
  mixedStream = null,
  chunks = [],
  recorder = null;
let startButton = null,
  stopButton = null,
  downloadButton = null,
  recordedVideo = null;

// Asynchronous function to set up the screen and audio streams
async function setupStream() {
  try {
    // Request access to the user's screen
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    // Request access to the user's audio
    audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    // Set up video feedback
    setupVideoFeedback();
  } catch (err) {
    console.error(err);
  }
}

// Set up the video feedback by assigning the stream to a video element
function setupVideoFeedback() {
  if (stream) {
    const video = document.querySelector(".video-feedback");
    video.srcObject = stream;
    video.play();
  } else {
    console.warn("No stream available");
  }
}

// Start the recording process
async function startRecording() {
  // Set up the screen and audio streams
  await setupStream();

  if (stream && audio) {
    // Combine the screen and audio streams into a mixed stream
    mixedStream = new MediaStream([
      ...stream.getTracks(),
      ...audio.getTracks(),
    ]);

    // Create a MediaRecorder object to record the mixed stream
    recorder = new MediaRecorder(mixedStream);
    recorder.ondataavailable = handleDataAvailable;
    recorder.onstop = handleStop;
    recorder.start(1000); // Start recording with a time interval of 1 second

    // Disable the start button and enable the stop button
    startButton.disabled = true;
    stopButton.disabled = false;

    console.log("Recording started");
  } else {
    console.warn("No stream available.");
  }
}

// Stop the recording process
function stopRecording() {
  recorder.stop();

  // Enable the start button and disable the stop button
  startButton.disabled = false;
  stopButton.disabled = true;
}

// Handle the data available event by pushing the data chunks to an array
function handleDataAvailable(e) {
  chunks.push(e.data);
}

// Handle the stop event
function handleStop(e) {
  // Create a Blob from the recorded data chunks
  const blob = new Blob(chunks, { type: "video/mp4" });
  chunks = [];

  // Set up the download button with the recorded video URL and enable it
  downloadButton.href = URL.createObjectURL(blob);
  downloadButton.download = "video.mp4";
  downloadButton.disabled = false;

  // Set up the recorded video element with the recorded video URL
  recordedVideo.src = URL.createObjectURL(blob);
  recordedVideo.load();
  recordedVideo.onloadeddata = function () {
    // Show the recorded video and scroll to it
    const rc = document.querySelector(".recorded-video-wrap");
    rc.classList.remove("hidden");
    rc.scrollIntoView({ behavior: "smooth", block: "start" });

    recordedVideo.play();
  };

  // Stop the screen and audio streams
  stream.getTracks().forEach((track) => track.stop());
  audio.getTracks().forEach((track) => track.stop());

  console.log("Recording stopped");
}

// Event listener for when the window loads
window.addEventListener("load", () => {
  // Assign the buttons and elements to their corresponding variables
  startButton = document.querySelector(".start-recording");
  stopButton = document.querySelector(".stop-recording");
  downloadButton = document.querySelector(".download-video");
  recordedVideo = document.querySelector(".recorded-video");

  // Add event listeners to the start and stop buttons
  startButton.addEventListener("click", startRecording);
  stopButton.addEventListener("click", stopRecording);
});

