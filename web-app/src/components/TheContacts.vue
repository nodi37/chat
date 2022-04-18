<script setup>
import { computed, ref } from "vue";
const searchKeyword = ref("");
const props = defineProps(["ws", "contacts", "messages"]);
const emit = defineEmits(["cu"]);

const filteredContacts = computed(() => {
  return filterContacts(searchKeyword.value);
});

const searchForUser = () => {
  const username = prompt("Type user You want to add:");
  if(username===sessionStorage.getItem("username")){
    alert("You can't add yourself as a contact!");
  } else if(findOneContact(username).length>0) {
    alert("This user is already on contact list!");
    searchKeyword.value = username;
  } else {
    props.ws.send(JSON.stringify({ msgType: "contactRequest", requestedUser: username }));
  }
 
};

const setCurrentUser = (username) => {
  const userToEmit = props.contacts.filter((e) =>e.username === username)[0];
  emit("cu", userToEmit);
};

function countUnreadMessage(username) {
  let i = 0;
  props.messages.forEach(element => {
    (element.from===username && !element.read)&&i++;
  });
  return i;
}

function filterContacts(contactName){
  return props.contacts.filter((e)=>e.username.toLowerCase().includes(contactName.toLowerCase()));
}

function findOneContact(contactName) {
  return props.contacts.filter((e)=>e.username.toLowerCase() === contactName.toLowerCase());
}

</script>

<template>
  <aside>
    <div class="sidebar-top">
      <input v-model="searchKeyword" placeholder="Search in contacts..." />
    </div>
    <ul class="contacts-list" v-if="searchKeyword.length > 0">
      <li
        v-for="contact in filteredContacts"
        :key="contacts.indexOf(contact)"
        @click="setCurrentUser(contact.username)"
        data-pubkey=""
      >
        <span>{{ contact.username }}</span>
        <span v-if="countUnreadMessage(contact.username)">{{ countUnreadMessage(contact.username) }} new messages!</span>
      </li>
    </ul>
    <ul class="contacts-list" v-else>
      <li
        v-for="contact in props.contacts"
        :key="contacts.indexOf(contact)"
        @click="setCurrentUser(contact.username)"
      >
        <span>{{ contact.username }}</span>
        <span class="contact__new-message-indicator" v-if="countUnreadMessage(contact.username)">{{ countUnreadMessage(contact.username) }} new messages!</span>
      </li>
    </ul>
    <button class="add-btn" @click="searchForUser">Add contact</button>
  </aside>
</template>
