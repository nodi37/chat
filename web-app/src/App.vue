<script setup>
import { ref, reactive, watch } from "vue";
import { decryptMessage } from "./assets/encryptservice";
import { saveMessage } from "./assets/helpfunctions";

import TheChat from "./components/TheChat.vue";
import TheContacts from "./components/TheContacts.vue";
import TheRegister from "./components/TheRegister.vue";
import TheLoader from "./components/TheLoader.vue";

const status = reactive({
  connected: false,
  registered: sessionStorage.getItem("registered") || false,
});

const ws = ref({});
const contacts = ref(JSON.parse(sessionStorage.getItem("contacts")) || []);
const messages = ref(JSON.parse(sessionStorage.getItem("messages")) || []);
const messagesQueue = ref([]);
const currentUser = ref({});
const sender = ref(sessionStorage.getItem("username") || "");

watch(
  () => currentUser.value,
  () => {
    messages.value.forEach((message) => {
      if (message.from === currentUser.value.username) {
        message.read = true;
      }
    });
    sessionStorage.setItem("messages", JSON.stringify(messages.value));
  }
);

function connect() {
  ws.value = new WebSocket("ws://localhost:4321");

  ws.value.addEventListener("open", () => {
    status.connected = true;
    sender.value.length > 0 && login();
  });

  ws.value.addEventListener("error", () => {
    ws.value.close();
  });

  ws.value.addEventListener("close", () => {
    status.connected = false;
    setTimeout(connect, 3000);
  });

  ws.value.addEventListener("message", async (evt) => {
    const data = JSON.parse(evt.data);

    switch (data.msgType) {
      case "registrationResponse":
        if (data.registrationFulfilled) {
          status.registered = true;
          sender.value = sessionStorage.getItem("username");
          sessionStorage.setItem("registered", true);
        } else {
          alert(
            "This user is already registered or something went wrong! Try again!"
          );
          status.registered = false;
          sessionStorage.setItem("registered", 0);
          sessionStorage.setItem("username", "");
          sessionStorage.setItem("password", ""); //I will do smth with this
          sessionStorage.setItem("secret", "");
        }
        break;

      case "encryptedMessage":
        const contact = contacts.value.filter((e) => e.username === data.from);

        if (contact.length < 1) {
          ws.value.send(JSON.stringify({ msgType: "contactRequest", requestedUser: data.from }));
          messagesQueue.value.push({...data});
        } else {
          const pubKey = contact[0].pubKey;
          manageMessage({...data, pubKey});
        }

        break;

      case "contactResponse":
        if (data.found) {
          sessionStorage.setItem("contacts", JSON.stringify([...JSON.parse(sessionStorage.getItem("contacts")),{ username: data.contactName, pubKey: data.pubKey }]));
          contacts.value = [...contacts.value, { username: data.contactName, pubKey: data.pubKey }];
          manageMessageQueue(data.contactName, data.pubKey);
        } else {
          alert("Contact not found active on server!");
        }

        break;

      default:
        break;
    }
  });
}

function login() {
  ws.value.send(
    JSON.stringify({
      msgType: "login",
      username: sender.value,
      password: sessionStorage.getItem("password"),
    })
  );
}

function outgoingMessageHandler(newMessage) {
  messages.value.push(newMessage);
  saveMessage(newMessage);
}

async function manageMessageQueue(contactName, pubKey) {
  const messagesToApply = messagesQueue.value.filter((message)=>message.from===contactName);
  messagesToApply.forEach((message)=>manageMessage({...message, pubKey}))
}

async function manageMessage(messageObj) {
  const decrypted = await decryptMessage(messageObj.message, messageObj.pubKey);
  const newMessage = {
    text: decrypted.data,
    from: messageObj.from,
    type: "incoming",
    read: messageObj.from === currentUser.value.username,
    timestamp: new Date(),
    isVerified: decrypted.isVerified
  };

  messages.value.push(newMessage);
  saveMessage(newMessage);
}

connect();
</script>

<template>
  <TheLoader v-if="!status.connected" />
  <TheRegister :ws="ws" v-if="!status.registered && status.connected" />
  <div v-if="status.connected && status.registered" id="main">
    <TheContacts
      :messages="messages"
      :contacts="contacts"
      :ws="ws"
      @cu="
        (cu) => {
          currentUser = cu;
        }
      "
    />
    <TheChat
      :messages="messages"
      :ws="ws"
      :currentUser="currentUser"
      :sender="sender"
      @newMessage="(newMessage) => outgoingMessageHandler(newMessage)"
    />
  </div>
</template>

<style>
@import "./assets/base.css";
</style>
