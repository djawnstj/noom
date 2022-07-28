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

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");

form.addEventListener("submit", event => {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("room", { value: input.value }, () => {
        console.log("server is done");
    });
    input.value = "";
});