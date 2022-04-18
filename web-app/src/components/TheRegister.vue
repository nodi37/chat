<script setup>
import { ref } from "vue";
import { generateKeys } from "../assets/encryptservice";

const props = defineProps(["ws"]);

const uInputError = ref(false);
const pInputError = ref(false);

const form = ref({
  username: "",
  password: ""
});

async function submit() {
  if (form.value.username.length < 3) {
    uInputError.value = true;
  } else if (form.value.password.length < 7) {
    pInputError.value = true;
    form.value.password = "";
  } else {
    const secret = prompt(
      "Write some random phrase here to generate encrytption keys. You don't need to remember "
    );
    
    await generateKeys({...form.value.value, secret});
    
    form.value.pubKey = sessionStorage.getItem("pubKey");
    props.ws.send(JSON.stringify({ msgType: "register", ...form.value }));

    sessionStorage.setItem('username', form.value.username);
    sessionStorage.setItem('password', form.value.password); //I will do smth with this
    sessionStorage.setItem('secret', secret);
    sessionStorage.setItem('contacts', JSON.stringify([]));
    sessionStorage.setItem("messages", "[]");

  }
}
</script>

<template>
  <div class="prepare-box">
    <form @submit.prevent class="prepare-box__content">
      <label for="username">Username</label>
      <input
        :class="[uInputError ? 'input-error' : '']"
        type="text"
        id="username"
        v-model="form.username"
        placeholder="Username... at least 4 characters"
      />
      <label for="password">Password</label>
      <input
        :class="[pInputError ? 'input-error' : '']"
        type="password"
        id="password"
        v-model="form.password"
        placeholder="Password... at least 8 characters"
      />
      <button @click="submit()">Register</button>
    </form>
  </div>
</template>
