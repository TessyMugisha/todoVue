<script setup>
import TodoServices from "../services/TodoServices.js";
import { ref, onMounted } from "vue";
const props = defineProps(["item"]);
const emit = defineEmits(["deletedItem", "updatedItem"]);

const show = ref(false);
const hidden = ref(false);
const deleteError = ref(false);

function deletedItem() {
  emit("deletedItem", props.item);
 
}
function updatedItem() {
  emit("updatedItem", props.item);
}

onMounted(() => {
  console.log(props);
})


</script>
<template>
  
  <div class="grid-item">
    <span v-if="!show">{{ props.item.name }}</span>
    <input v-else v-model="props.item.name" type="text" id="dname" />
  </div>
  <div class="grid-item">
    <span v-if="!show">{{ props.item.description }}</span>
    <input v-else v-model="props.item.description" type="text" id="oname" />
  </div>
  <div class="grid-item">
    <span v-if="!show">{{ props.item.state }}</span>
    <select v-else v-model="props.item.state">
      <option value="in-progress">in-progress</option>
      <option value="complete">complete</option>
    </select>
  </div>
  <div class="grid-item">
    <button v-if="!show" @click="show = true">Edit</button>
    <button v-else @click="show = false; updatedItem()">Save</button>
  </div>
  <div class="grid-item">
    <button @click="deletedItem">Delete</button>
  </div>
</template>

<style></style>

