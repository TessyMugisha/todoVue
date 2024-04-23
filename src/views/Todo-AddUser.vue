<script setup>
import TodoServices from "../services/TodoServices.js";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const message = ref("");

const lists = ref({});
const errors = ref({});

function addUsers() {
  TodoServices.addUser(lists.value)
    .then(() => {
      router.push({ name: "login" });
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
  router.push({ name: "login" });
}
</script>

<template>
  <div id="body">
    <h1> Create a To-Do List Account</h1>
    <h2>{{ message }}</h2>
    
    <br />
    <div class="form">
      

      <div class="form-group">
        <label for="name">
         First Name
          <span id="name" class="text-error">{{
            errors.name || "*"
          }}</span>
        </label>
        <input v-model="lists.firstName" type="text" id="name" />
      </div>

      <div class="form-group">
        <label for="dname">
          Last Name
          <span id="dname" class="text-error">{{
            errors.name || "*"
          }}</span>
        </label>
        <input v-model="lists.lastName" type="text" id="dname" />
      </div>
      
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
    <button class="success" name="Save" v-on:click.prevent="addUsers()">
      Create
    </button>
    <button name="Cancel" v-on:click.prevent="cancel()">Cancel</button>
  </div>
</template>



    
