const socket = io();

const localContainer = document.querySelector("#localContainer");
const localVideo = localContainer.querySelector("#localVideo");
const localMute = localContainer.querySelector("#localMute");
const localCam = localContainer.querySelector("#localCam");

class MediaStream {

    constructor(media) {
        this.media = media;
    }

    media;
    isMuted = false;
    isFlimed = true;

}

let localStream;

const getMedia = async () => {
    try {
        localStream = new MediaStream(await navigator.mediaDevices.getUserMedia(
            {
                audio: true,
                video: true,
            }))

        localVideo.srcObject = localStream.media;
    } catch(e) {
        console.log(e);
    }
}

getMedia();

localMute.addEventListener("click", () => {
    localStream.isMuted = !localStream.isMuted;

    if (localStream.isMuted) {
        localMute.innerText = "un mute"
    } else {
        localMute.innerText = "mute"
    }
});

localCam.addEventListener("click", () => {
    localStream.isFlimed = !localStream.isFlimed;

    if (localStream.isFlimed) {
        localCam.innerText = "camera off"
    } else {
        localCam.innerText = "camera on"
    }
});
