<script setup>
import { ref, watch, computed } from "vue";
import { encryptMessage } from "../assets/encryptservice";

const props = defineProps(["currentUser", "ws", "sender", "messages"]);
const emit = defineEmits(['newMessage']);
const form = ref(null);
const message = ref("");
const messageBox = ref(null)
const messages = computed(()=>{
  if(props.currentUser.username){
    return props.messages.filter((el)=>el.from === props.currentUser.username || el.to === props.currentUser.username);
  } else {
    return [];
  }
});



const sendMessage = async () => {
  if (
    message.value.length > 0 &&
    props.sender.length > 0 &&
    props.currentUser.username
  ) {
    const encrypted = await encryptMessage(
      message.value,
      props.currentUser.pubKey
    );
    
    props.ws.send(
      JSON.stringify({
        msgType: "encryptedMessage",
        message: encrypted,
        from: props.sender,
        to: props.currentUser.username
      })
    );
    emit('newMessage', {text: message.value, type: 'outgoing', to: props.currentUser.username, read: true, timestamp: new Date()});
    message.value = "";
  }
};

watch(() => messages.value, () => {
  setTimeout(()=>{
    messageBox.value.scrollTop = messageBox.value.scrollHeight;
  }, 500);  
});


function parseDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-GB",{hour: "2-digit", minute: "2-digit", weekday: "short",});
}

function listenForEnter(e) {
  if(e.keyCode === 13 && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
    sendMessage();
  }
}

</script>

<template>
  <div class="chat">
    <div v-if="!props.currentUser.username" class="chat__overlay"><p class="chat__overlay-text">Choose chat partner.</p></div>
    <div class="chat__top">
      <h1>Chat with {{ props.currentUser.username }}</h1>
    </div>
    <div ref="messageBox" class="chat__messages-box">
      <div v-for="message in messages" :key="messages.indexOf(message)" :class="`message message--${message.type}`">
          <div class="message__info">
            <span class="message__timestamp">{{ parseDate(message.timestamp) }}</span>
            <span v-if="message.type==='incoming'" class="message__status">{{ message.isVerified?'Verified by PGP &check;':'This message is not verified &cross;' }}</span>
            <span v-else class="message__status">Encrypted by PGP &check;</span>
          </div>
          <p class="message__text">{{ message.text }}</p>
      </div>
    </div>
    <form ref="form" class="chat__new-message-box" @submit.prevent="sendMessage" @keyup="listenForEnter">
      <textarea v-model="message" placeholder="Your message here..."></textarea>
      <button>Send</button>
    </form>
  </div>
</template>
