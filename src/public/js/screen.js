const socket = io();

const videoContainer = document.querySelector("#videoContainer");
const localContainer = videoContainer.querySelector("#localContainer");
const localVideo = videoContainer.querySelector("#localVideo");
const startCaptureBtn = videoContainer.querySelector("#startCaptureBtn");
const stopCaptureBtn = videoContainer.querySelector("#stopCaptureBtn");

const printScreenCaptureOptions = () => {
   if (localVideo.srcObject){
       const videoTrack = localVideo.srcObject.getVideoTracks()[0];
       console.info("Track settings:");
       console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
       console.info("Track constraints:");
       console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
   }
}

startCaptureBtn.addEventListener("click", async () => {
    const constrains = { 
        video: { 
            cursor: "always",
            frameRate: 40, 
        }, 
        audio: false,
    };

    try {
        const stream = await navigator.mediaDevices.getDisplayMedia(constrains);
        localVideo.srcObject = stream;
    } catch (e) {
        console.error("error in startCaptureBtn click event: " + e);
    }

    printScreenCaptureOptions()

});

stopCaptureBtn.addEventListener("click", () => {
    let tracks = localVideo.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    printScreenCaptureOptions();
    localVideo.srcObject = null;
});