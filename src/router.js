import { createRouter, createWebHistory } from "vue-router";

import Login from "./views/Login.vue";
import TodoList from "./views/Todo-List.vue";
import AddUser from "./views/Todo-AddUser.vue";
import AddList from "./views/Todo-AddList.vue";
import EditList from "./views/Todo-Edit.vue";
import ItemEdit from "./views/Todo-Item.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: Login,
    },
    {
      path: "/lists",
      name: "lists",
      component: TodoList,
    },
   
    {
      path: "/add",
      name: "addList",
      component: AddList,
    },
  
    
    {
      path: "/user",
      name: "addUser",
      component: AddUser,
    },
    {
      path: "/itemEdit",
      name: "itemEdit",
      component: ItemEdit,
    },
    {
      path: "/edit/:id",
      name: "editList",
      component: EditList,
      props: true,
    },
  ],
});

export default router;