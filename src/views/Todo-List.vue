

<script setup>
import TodoServices from "../services/TodoServices.js";

import TodoDisplay from "../components/TodoDisplay.vue";
import { useRouter } from "vue-router";

import { ref, onMounted } from "vue";

import ocLogo from "/oc-logo-white.png";
const logoURL = ocLogo;


const lists = ref({});
const user = ref({});
const message = ref("");

onMounted(() => {
  getLists();
  getUser();
});

function getLists()
{
  TodoServices.getLists()
  .then((response) => {
      lists.value = response.data.lists;
      message.value = "";
    })
    .catch((error) => {
      message.value = "Error: " + error.code + ":" + error.message;
      console.log(error);
    });
}
function getUser()
{
  TodoServices.getUser()
  .then((response) => {
      user.value = response.data.user;
      message.value = "";
    })
    .catch((error) => {
      message.value = "Error: " + error.code + ":" + error.message;
      console.log(error);
    });
}

function addlists() {
  TodoServices.addList()
    .then((response) => {
      lists.value = response.data;
      message.value = "";
    })
    .catch((error) => {
      message.value = "Error: " + error.code + ":" + error.message;
      console.log(error);
    });
}
const router = useRouter();
function logout()
{
  TodoServices.logoutUser()
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
</script>

<template>
  <div>
    <nav class="navbar shadow" v-if="user && Object.keys(user).length">
      <ul class="nav-links">
        <div class="title">
          <li>
            <router-link :to="{ name: 'lists' }">
              <img :src="logoURL" contain />
            </router-link>
          </li>
          <li>
            <a>todo list</a>
          </li>
         
        </div>
      </ul>
      <ul class="nav-links">
        <div class="menu">
          <li>
            <router-link :to="{ name: 'lists' }"><a>LIST</a></router-link>
          </li>
         
          <li>
            <router-link :to="{ name: 'addList' }"
              ><a>ADD LIST</a></router-link
            >
          </li>
          <li>
           <button  name="Save" v-on:click.prevent="logout()">LOGOUT</button>
          </li>

          <li>
            <a style="text-align: center">{{ user.firstName + ' ' + user.lastName }}</a>
          </li>
          
        </div>
      </ul>
    </nav>
    <div id="body">
      <h1>To-Do List</h1>
      <br />
      <h2>{{ message }}</h2>
      <div class="grid-container">
        <TodoDisplay
          v-for="list in lists"
          :key="list.id"
          :list="list"
          @deleted-list="getLists()"
        />
      </div>
    </div>
  </div>
</template>


<style></style>