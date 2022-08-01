
const socket = io();

const enterRoomContainer = document.querySelector("#enterRoomContainer");
const enterRoomForm = enterRoomContainer.querySelector("#enterRoomForm");

const videoContainer = document.querySelector("#videoContainer");
const localContainer = videoContainer.querySelector("#localContainer");
const localVideo = localContainer.querySelector("#localVideo");
const localMute = localContainer.querySelector("#localMute");
const localCam = localContainer.querySelector("#localCam");
const localCams = localContainer.querySelector("#localCams")

class MediaStream {

    constructor(media) {
        this.media = media;
    }

    media;
    isMuted = false;
    isFlimed = true;

}

let localStream;

const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput")

        setMedia(cameras[0].deviceId);
        cameras.forEach(cam => {
            const option = document.createElement("option");
            option.value = cam.deviceId;
            option.innerText = cam.label;
            if (cameras[0].deviceId === cam.deviceId) option.selected = true;
            localCams.appendChild(option);
        });
        
    } catch (e) {
        console.log(`error in getCameras(): ${e.message}`);
    }
}

const setMedia = async (camId) => {
    const constrains = { audio: true, video: { facingMode: "user", deviceId: { exact: camId } } }
    try {
        localStream = new MediaStream(await navigator.mediaDevices.getUserMedia(constrains));

        localVideo.srcObject = localStream.media;

    } catch(e) {
        console.log(`error in setMedia(): ${e.message}`);
    }
}

localMute.addEventListener("click", () => { 
    if (!localStream) return;
    else if (!localStream.media) return;
    else if (!localStream.media.getAudioTracks()) return;

    try {
        localStream.media.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
        localStream.isMuted = !localStream.isMuted;
    
        if (localStream.isMuted) {
            localMute.innerText = "un mute";
        } else {
            localMute.innerText = "mute";
        }
    } catch (e) {
        console.log(`error in localMute button event: ${e.message}`);
    }
});

localCam.addEventListener("click", () => {
    if (!localStream) return;
    else if (!localStream.media) return;
    else if (!localStream.media.getVideoTracks()) return;

    try {
        localStream.media.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
        localStream.isFlimed = !localStream.isFlimed;
    
        if (localStream.isFlimed) {
            localCam.innerText = "turn camera off"
        } else {
            localCam.innerText = "turn camera on"
        }
    } catch (e) {
        console.log(`error in localCam button event: ${e.message}`);
    }
});

localCams.addEventListener("input", async () => {
    await setMedia(localCams.value);
});

enterRoomForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = enterRoomForm.querySelector("#enterRoomInput");
    socket.emit("enter_video", input.value);

    enterRoomContainer.hidden = true;
    videoContainer.hidden = false;

    await getCameras();
});