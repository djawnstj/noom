
class MediaStream {

    constructor(media) {
        this.media = media;
    }

    setMedia(media) {
        this.media = media;
    }

    media;
    isMuted = false;
    isFlimed = true;

}

const socket = io();

const enterRoomContainer = document.querySelector("#enterRoomContainer");
const enterRoomForm = enterRoomContainer.querySelector("#enterRoomForm");

const videoContainer = document.querySelector("#videoContainer");
const localContainer = videoContainer.querySelector("#localContainer");
const localVideo = localContainer.querySelector("#localVideo");
const localMute = localContainer.querySelector("#localMute");
const localCam = localContainer.querySelector("#localCam");
const localCams = localContainer.querySelector("#localCams")

const localStream = new MediaStream();
let peerStream;

let camId;
let roomId;
/** @type {RTCPeerConnection} */
let myPeerConnection;

const getCameras = async () => {
    try {
        navigator.mediaDevices.getUserMedia({audio: true, video: true})
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput")

        camId = cameras[0].deviceId;
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
    const constrains = {
        audio: true,
        video: {
            facingMode: "user",
            deviceId: {
                exact: camId
            }
        }
    }
    try {
        await localStream.setMedia(await navigator.mediaDevices.getUserMedia(constrains));

        localVideo.srcObject = localStream.media;

    } catch (e) {
        console.log(`error in setMedia(): ${e.message}`);
    }
}

const initMedia = async () => {
    
    enterRoomContainer.hidden = true;
    videoContainer.hidden = false;

    await setMedia(camId)
    makeConnection();
}

const makeConnection = () => {
    myPeerConnection = new RTCPeerConnection();

    myPeerConnection.addEventListener("icecandidate", (data) => {
        socket.emit("webRTC_ice", data.candidate, roomId); 
    }); 

    myPeerConnection.addEventListener("addstream", async (data) => {
        peerStream = new MediaStream(data.stream);

        const peerContainer = videoContainer.querySelector("#peerContainer");
        const peerVideo = videoContainer.querySelector("#peerVideo");
        const peerMute = peerContainer.querySelector("#peerMute");
        const peerCam = peerContainer.querySelector("#peerCam");

         peerVideo.srcObject = peerStream.media;
    });

    localStream.media.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream.media));
}

getCameras()

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
    if (myPeerConnection) {
        const videoTrack = localStream.media.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
});

enterRoomForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    roomId = enterRoomForm.querySelector("#enterRoomInput").value;
    await initMedia();

    await socket.emit("enter_video", roomId);
});

socket.on("join_video", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit("webRTC_offer", offer, roomId);
});

socket.on("webRTC_offer", async (offer) => {
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("webRTC_answer", answer, roomId);
});

socket.on("webRTC_answer", (answer) => {
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("webRTC_ice", (ice) => {
    myPeerConnection.addIceCandidate(ice);
});

