/* const socket = new WebSocket(`ws://${window.location.host}`);
const messageList = document.querySelector("#messageList");
const nickForm = document.querySelector("#nickNameForm");
const messageForm = document.querySelector("#messageForm");

socket.addEventListener("open", () => {
    console.log("Connected to Socket Server!");
});

socket.addEventListener("close", () => {
    console.log("closed Socket Server");
});

socket.addEventListener("error", (err) => {
    console.log(`socket err : ${err}`);
});

socket.addEventListener("message", (msg) => {
    const li = document.createElement("li");
    li.innerText = msg.data;
    messageList.append(li);
    console.log(`from the server : ${msg.data}`);
});

const makeMessage = (type, value) => {
    const msg = {type, value};
    return JSON.stringify(msg);
}

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const messageInput = messageForm.querySelector("#messageInput");
    socket.send(makeMessage("message", messageInput.value));
    const li = document.createElement("li");
    li.innerText = `You:  ${messageInput.value}`
    messageForm.append(li); 
    messageInput.value = ""
})

nickForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nickInput = nickForm.querySelector("#nickNameInput");
    socket.send(makeMessage("nickName", nickInput.value));
    nickInput.value = "";
}) */

const socket = io();

const enterRoom = document.querySelector("#enterRoom");
const enterForm = enterRoom.querySelector("#enterForm");
const nameInput = enterRoom.querySelector("#nameInput");
const roomInput = enterForm.querySelector("#roomInput");

const chatRoom = document.querySelector("#chatRoom");
const roomTitle = chatRoom.querySelector("#roomTitle");
const chats = chatRoom.querySelector("#chats");
const chatForm = chatRoom.querySelector("#chatForm");
const chatInput = chatRoom.querySelector("#chatInput");

let roomNo = -1;

chatRoom.hidden = true;

const inputNum = (event) => {
    event.value = event.value.replace(/[^0-9]/ig, '');
}

const showRoom = () => {
    enterRoom.hidden = true;
    chatRoom.hidden = false;
}

enterForm.addEventListener("submit", event => {
    event.preventDefault();
    roomNo = roomInput.value;
    socket.emit("room", roomNo, nameInput.value, showRoom);
    roomTitle.innerText = `Room ${roomNo}`;
    roomInput.value = "";
});

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    socket.emit("chat", roomNo, chatInput.value, () => {
        createChat(`You: ${chatInput.value}`)
        chatInput.value = "";
    });
});

const createChat = (msg) => {
    const chat = document.createElement("li");
    chat.innerText = msg;
    chats.appendChild(chat);
}

socket.on("chat", (name, msg) => createChat(`${name}: ${msg}`));

socket.on("join", (name) => createChat(`${name} Joined!`));

socket.on("quit", (name) => createChat(`${name} left.`));

socket.on("room_change", msg => console.log(msg));