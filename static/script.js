let localStream;
let peerConnection;
let ws;

let micEnabled = true;
let cameraEnabled = true;

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

async function joinRoom() {
  const room = document.getElementById("room").value;

  ws = new WebSocket(`ws://localhost:8000/ws/${room}`);

  ws.onmessage = async (message) => {
    const data = JSON.parse(message.data);

    if (data.offer) {
      await peerConnection.setRemoteDescription(data.offer);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      ws.send(JSON.stringify({ answer }));
    }

    if (data.answer) {
      await peerConnection.setRemoteDescription(data.answer);
    }

    if (data.candidate) {
      await peerConnection.addIceCandidate(data.candidate);
    }

    if (data.chat) {
      showMessage("Friend: " + data.chat);
    }
  };

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  document.getElementById("localVideo").srcObject = localStream;

  peerConnection = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    document.getElementById("remoteVideo").srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(JSON.stringify({ candidate: event.candidate }));
    }
  };

  ws.onopen = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    ws.send(JSON.stringify({ offer }));
  };
}

/* 🎤 MIC */
function toggleMic() {
  micEnabled = !micEnabled;

  localStream.getAudioTracks().forEach(track => {
    track.enabled = micEnabled;
  });
}

/* 📷 CAMERA */
function toggleCamera() {
  cameraEnabled = !cameraEnabled;

  localStream.getVideoTracks().forEach(track => {
    track.enabled = cameraEnabled;
  });
}

/* 💬 CHAT */
function sendMessage() {
  const msg = document.getElementById("msg").value;

  ws.send(JSON.stringify({ chat: msg }));

  showMessage("You: " + msg);

  document.getElementById("msg").value = "";
}

function showMessage(msg) {
  const box = document.getElementById("chatBox");

  const p = document.createElement("p");
  p.innerText = msg;

  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}