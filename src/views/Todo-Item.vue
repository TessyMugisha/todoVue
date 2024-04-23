<script setup>
import TodoServices from "../services/TodoServices.js";

import TodoDisplay from "../components/TodoDisplay.vue";

import { ref, onMounted } from "vue";

const lists = ref({});
const message = ref("");

onMounted(() => {
  getListItems()
});

function getListItems()
{
  TodoServices.getListItems()
  .then((response) => {
      lists.value = response.data.lists;
      message.value = "";
    })
    .catch((error) => {
      message.value = "Error: " + error.code + ":" + error.message;
      console.log(error);
    });
}

function addlists() {
  TodoServices.addListItem()
    .then((response) => {
      lists.value = response.data;
      message.value = "";
    })
    .catch((error) => {
      message.value = "Error: " + error.code + ":" + error.message;
      console.log(error);
    });
}
</script>

<template>
  <div id="body">
    <h1>To-Do List</h1>
    <br />
    <h2>{{ message }}</h2>
    <div class="grid-container">
      <TodoDisplay
        v-for="list in lists"
        :key="list.id"
        :list="list"
        @deleted-list="getListItems()"
        
      />
    </div>
  </div>
</template>

<style></style>