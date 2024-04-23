<script setup>
import TodoServices from "../services/TodoServices.js";
import { ref } from "vue";
import { useRouter } from "vue-router";
import ocLogo from "/oc-logo-white.png";
const logoURL = ocLogo;

const router = useRouter();
const message = ref("");

const lists = ref({});
const errors = ref({});

function getUser() {
  TodoServices.loginUser(lists.value)
    .then((response) => {
      localStorage.setItem('token', response.data.token)
      router.push({ name: "lists" });
    })
    .catch((error) => {
      if (error.response != null && error.response.status == "406") {
        for (let obj of error.response.data) {
          if (obj.attributeName === undefined) {
            obj.attributeName = "idNumber";
          }
          errors.value[obj.attributeName] = obj.message;
        }
      } else {
        message.value = "Error: " + error.code + ":" + error.message;
        console.log(error);
        console.log(error);
      }
    });
}
function cancel() {
  router.push({ name: "addUser" });
}
</script>

<template>
<nav class="navbar shadow">
  <ul class="nav-links">
    <div class="title">
      <li>
        <router-link :to="{ name: 'lists' }">
          <img :src="logoURL" contain />
        </router-link>
      </li>
      <li>
        <a>{{ title }}</a>
      </li>
    </div>
  </ul>
  
</nav>

  <div id="body">
    <h1> LOGIN</h1>
    <h2>{{ message }}</h2>
    <br />
    <div class="form">
      
      <div class="form-group">
        <label for="Uname">
          UserName
          <span id="Uname" class="text-error">{{
            errors.name || "*"
          }}</span>
        </label>
        <input v-model="lists.username" type="text" id="Uname" />
      </div>

      <div class="form-group">
        <label for="pname">
          Password
          <span id="pname" class="text-error">{{
            errors.name || "*"
          }}</span>
        </label>
        <input v-model="lists.password" type="text" id="pname" />
      </div> 

    </div>
    <br />
    <button class="success" name="Save" v-on:click.prevent="getUser()">
      LOGIN
    </button>
  
    <button name="Cancel" v-on:click.prevent="cancel()">Create Account</button>
  </div>
</template>



    
