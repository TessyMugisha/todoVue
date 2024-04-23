<script setup>
import TodoServices from "../services/TodoServices.js";
import { ref, onMounted } from "vue";
const props = defineProps(["list"]);
const emit = defineEmits(["deletedList"]);

const show = ref(false);
const deleteError = ref(false);

function deletedList() {
  emit("deletedList");
}

onMounted(() => {
  console.log(props);
})

function deleteList(id) {
  TodoServices.deleteList(id)
    .then((response) => {
      show.value = false;
      deleteError.value = false;
      deletedList();
    })
    .catch((error) => {
      console.log(error);
      deleteError.value = true;
    });
}
</script>
<template>
  
  <div class="grid-item">
    {{ props.list.name }}
  </div>
  <div class="grid-item">
    <router-link
      :to="{ name: 'editList', params: {id: props.list.id} }"
      custom
      v-slot="{ navigate }"
    >
      <button @click="navigate" role="link">Edit</button>
    </router-link>
  </div>
  <div class="grid-item">
    <button @click="deleteList(props.list.id)" role="link">Delete</button>
  </div>

  <div v-if="show" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <span @click="show = false" class="close">&times;</span>
        <p v-if="!deleteError">
          Are you sure you want to delete <br />
          {{ props.List.firstName }} {{ props.List.lastName }}?
        </p>
        <p v-if="deleteError">
          Error deleting<br />{{ props.List.firstName }}
          {{ props.List.lastName }}.
        </p>
      </div>
      <br />
      <div class="modal-body">
        <button v-if="!deleteError" v-on:click="show = false">
          No, cancel
        </button>
        <button
          v-if="!deleteError"
          class="error"
          v-on:click="deleteList(props.List.id)"
        >
          Yes, delete
        </button>
        <button
          v-if="deleteError"
          v-on:click="
            deleteError = false;
            show = false;
          "
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style></style>
