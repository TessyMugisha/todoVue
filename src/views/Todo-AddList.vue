<script setup>
import TodoServices from "../services/TodoServices.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ocLogo from "/oc-logo-white.png";
const logoURL = ocLogo;


const router = useRouter();
const message = ref("");

const user = ref({});


const lists = ref({});
const errors = ref({});

onMounted(() => {
 
  getUser();
});
function addlists() {
  TodoServices.addList(lists.value)
    .then(() => {
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
function cancel() {
  router.push({ name: "lists" });
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
    <h1>Add lists</h1>
    <h2>{{ message }}</h2>
    <h4>{{ lists.listName }} </h4>
    <br />
    <div class="form">
      

      <div class="form-group">
        <label for="fname">
          Name
          <span id="listNameErr" class="text-error">{{
            errors.listName || "*"
          }}</span>
        </label>
        <input v-model="lists.name" type="text" id="fname" />
      </div>
    </div>
    <br />
    <button class="success" name="Add" v-on:click="addlists()">
      Add
    </button>
    <button name="Cancel" v-on:click.prevent="cancel()">Cancel</button>
  </div>
</template>
