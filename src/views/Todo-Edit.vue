<script setup>
import TodoServices from "../services/TodoServices.js";
import ItemDisplay from "../components/ItemDisplay.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ocLogo from "/oc-logo-white.png";
const logoURL = ocLogo;

//import TodoAddItem from "../views/Todo-AddItem.vue";

const router = useRouter();
const message = ref("");
const user = ref({});
const props = defineProps({

  id: {
    required: true,
  },
});

const list = ref({});
const items = ref([]);
const errors = ref({});
const isAdd= ref(false);
const newItem= ref({});
onMounted(() => {
  TodoServices.getList(props.id)
    .then((response) => {
      list.value = response.data.list;
      message.value = "";
    })
    .catch((error) => {
      message.value = "Error: " + error.code + ":" + error.message;
      console.log(error);
    });

    getListItems();
    getUser();
});

function getListItems()
{
  TodoServices.getListItems(props.id, props.value)
    .then((response) => {
      items.value = response.data.items;
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

function updatelist() {
  TodoServices.updateList(list.value.id, list.value)
    .then(() => {
      router.push({ name: "lists" });
    })
    .catch((error) => {
      if (error.response.status == "406") {
        for (let obj of error.response.data) {
          errors.value[obj.attributeName] = obj.message;
        }
      } else {
        message.value = "Error: " + error.code + ":" + error.message;
        console.log(error);
      }
    });
}
function addItem() {
  TodoServices.addListItem(list.value.id , newItem.value)
    .then(() => {
      getListItems();
       
      newItem.value = {};
    })
    .catch((error) => {
      if (error.response.status == "406") {
        for (let obj of error.response.data) {
          errors.value[obj.attributeName] = obj.message;
        }
      } else {
        message.value = "Error: " + error.code + ":" + error.message;
        console.log(error);
      }
    });
}

function updateItem(item) {
  console.log(item)
  TodoServices.updateListItem(list.value.id, item.id, item)
    .then(() => {
      getListItems()
    })
    .catch((error) => {
      if (error.response.status == "406") {
        for (let obj of error.response.data) {
          errors.value[obj.attributeName] = obj.message;
        }
      } else {
        message.value = "Error: " + error.code + ":" + error.message;
        console.log(error);
      }
    });
}

function deleteItem(item) {
  TodoServices.deleteListItem(list.value.id, item.id,)
    .then(() => {
      const index = items.value.findIndex((i) => i.id === item.id);
      items.value.splice(index, 1);
    })
    .catch((error) => {
      console.log(error);
      deleteError.value = true;
    });
}
function cancel() {
  router.push({ name: "lists" });
}


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
  <nav class="navbar shadow">
      <ul class="nav-links">
        <div class="title">
          <li>
            <router-link :to="{ name: 'lists' }">
              <img :src="logoURL" contain />
            </router-link>
          </li>
          <li>
            <a>To-Do list</a>
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
    <h1>Todo Edit</h1>
    <h2>{{ message }}</h2>
    <h4>{{ list.name }} </h4>
    <br />
    <div class="form">
     

      <div class="form-group">
        <label for="name">
          Name
          <span id="nameErr" class="text-error">{{
            errors.name || "*"
          }}</span>
        </label>
        <input v-model="list.name" type="text" id="fname" />
      </div>


    </div>
    <br />
    <button name="add" v-on:click.prevent="isAdd=true">Add Item</button>
    <button class="success" name="Save" v-on:click.prevent="updatelist()">
      Update
    </button>
    <button class="error" name="cancel" v-on:click.prevent="cancel()">Cancel</button>
   
  </div>

<div class="item-container">
  <h3>Name</h3>
  <h3>Description</h3>
  <h3>State</h3>
  <h3>Actions</h3>
</div>

  <div class="item-container">
      <ItemDisplay
        v-for="item in items"
        :key="item.id"
        :item="item"
        @deleted-item="deleteItem"
        @updated-item="updateItem"
      />
      
    </div>

<div class="item-container" v-if="isAdd">
        <div class="grid-item">
          <input v-model="newItem.name" type="text" id="name" />
        </div>
        <div class="grid-item">
          <input v-model="newItem.description" type="text" id="dname" />
        </div>
        <div class="grid-item">
          <select v-model="newItem.state" >
            <option value="in-progress">in-progress</option>
            <option value="complete">complete</option>
            

          </select>
        </div>
        <div class="grid-item">
          <button name="Save" v-on:click.prevent="addItem()">
      Add
    </button></div>
        <div class="grid-item">
          <button name="Cancel" v-on:click.prevent="isAdd=false">Cancel</button>
        </div>
   
</div>

 
</template>


<style></style>
