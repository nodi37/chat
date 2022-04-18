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
  if (this.form.username.length < 3) {
    this.uInputError = true;
  } else if (this.form.password.length < 7) {
    this.pInputError = true;
    this.form.password = "";
  } else {
    const secret = prompt(
      "Write some random phrase here to generate encrytption keys. You don't need to remember this."
    );
    
    await generateKeys({...this.form.value, secret});
    
    this.form.pubKey = sessionStorage.getItem("pubKey");
    props.ws.send(JSON.stringify({ msgType: "register", ...this.form }));

    sessionStorage.setItem('username', this.form.username);
    sessionStorage.setItem('password', this.form.password); //I will do smth with this
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
