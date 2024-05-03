import Vue from "vue";
import VueRouter from "vue-router";

import AuthLayout from "@/views/Auth/AuthLayout.vue";
import DisplayLayout from "@/views/DisplayLayout.vue";
import NewDashboardLayout from "@/views/NewDashboardLayout.vue";

//import Home from "../views/Home.vue";
//import ProductList from "../views/Product/ProductList.vue";
import ProductAdd from "../views/Product/ProductAdd.vue";
//import ProductForm from "../views/Product/ProductForm.vue";
import ProductDisplay from "../views/Product/ProductDisplay.vue";

//import FamilyList from "../views/Family/FamilyList.vue";
import FamilyForm from "../views/Family/FamilyForm.vue";

//import EquipmentList from "../views/Equipment/EquipmentList.vue";
import EquipmentForm from "../views/Equipment/EquipmentForm.vue";

//import GroupList from "../views/Group/GroupList.vue";
import GroupForm from "../views/Group/GroupForm.vue";

import DataLoader from "../views/DataLoader.vue";

Vue.use(VueRouter);

let authPages = {
  path: "/",
  component: AuthLayout,
  children: [
    {
      path: "",
      redirect: "/login"
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Auth/Login.vue")
    },
    {
      path: "/forgot-password",
      name: "ForgotPassword",
      component: () => import("../views/Auth/ForgotPassword.vue")
    },
    {
      path: "/reset-password",
      name: "ResetPassword",
      component: () => import("../views/Auth/ResetPassword.vue")
    }
    // {
    //   path: "*",
    //   name: "NotFound",
    //   component: () => import("../views/NotFound.vue"),
    // }
  ]
};

// let dashboardPages = {
//   path: "/",
//   component: DashboardLayout,
//   name: "Dashboard",
//   props: true,
//   children: [
//     {
//       path: "/product",
//       name: "ProductList",
//       component: ProductList,
//       props: route => ({ page: parseInt(route.query.page) })
//     },
//     {
//       path: "/family",
//       name: "FamilyList",
//       component: FamilyList,
//       props: route => ({ page: parseInt(route.query.page) })
//     },
//     {
//       path: "/equipment",
//       name: "EquipmentList",
//       component: EquipmentList,
//       props: route => ({ page: parseInt(route.query.page) })
//     },
//     {
//       path: "/group",
//       name: "GroupList",
//       component: GroupList,
//       props: route => ({ page: parseInt(route.query.page) })
//     },
//     {
//       path: "/about",
//       name: "About",
//       // route level code-splitting
//       // this generates a separate chunk (about.[hash].js) for this route
//       // which is lazy-loaded when the route is visited.
//       component: () =>
//         import(/* webpackChunkName: "about" */ "../views/About.vue")
//     }
//   ]
// };

let dashboardPages = {
  path: "/",
  component: NewDashboardLayout,
  name: "Dashboard",
  props: true,
  children: [
    {
      path: "search/product",
      name: "ProductList",
      component: () => import("../views/Search/ProductList.vue"),
      props: route => ({
        page: parseInt(route.query.page),
        keyword: route.query.keyword,
        primary_search_field: route.query.primary_search_field,
        search_category: route.query.search_category,
        secondary_search_filter: route.query.secondary_search_filter,
        option_select: route.query.option_select
          ? parseInt(route.query.option_select)
          : ""
      })
    },
    {
      path: "search/family",
      name: "FamilyList",
      component: () => import("../views/Search/FamilyList.vue"),
      props: route => ({
        page: parseInt(route.query.page),
        keyword: route.query.keyword,
        primary_search_field: route.query.primary_search_field,
        search_category: route.query.search_category,
        secondary_search_filter: route.query.secondary_search_filter,
        option_select: route.query.option_select
          ? parseInt(route.query.option_select)
          : ""
      })
    },
    {
      path: "search/equipment",
      name: "EquipmentList",
      component: () => import("../views/Search/EquipmentList.vue"),
      props: route => ({
        page: parseInt(route.query.page),
        keyword: route.query.keyword,
        primary_search_field: route.query.primary_search_field,
        search_category: route.query.search_category,
        secondary_search_filter: route.query.secondary_search_filter,
        option_select: route.query.option_select
          ? parseInt(route.query.option_select)
          : ""
      })
    },
    {
      path: "search/group",
      name: "GroupList",
      component: () => import("../views/Search/GroupList.vue"),
      props: route => ({
        page: parseInt(route.query.page),
        keyword: route.query.keyword,
        primary_search_field: route.query.primary_search_field,
        search_category: route.query.search_category,
        secondary_search_filter: route.query.secondary_search_filter,
        option_select: route.query.option_select
          ? parseInt(route.query.option_select)
          : ""
      })
    },
    {
      path: "product/new",
      name: "ProductAdd",
      component: ProductAdd
    },
    {
      path: "/product/:id",
      name: "ProductForm",
      component: () => import("../views/Product/ProductForm.vue"),
      props: true
    },
    {
      path: "family/new",
      name: "NewFamily",
      component: FamilyForm
    },
    {
      path: "/family/:id",
      name: "FamilyForm",
      component: FamilyForm
    },
    {
      path: "equipment/new",
      name: "NewEquipment",
      component: EquipmentForm
    },
    {
      path: "equipment/:id",
      name: "EquipmentForm",
      component: EquipmentForm
    },
    {
      path: "group/new",
      name: "NewGroup",
      component: GroupForm
    },
    {
      path: "group/:id",
      name: "GroupForm",
      component: GroupForm
    },
    {
      path: "dataloader",
      name: "DataLoader",
      component: DataLoader
    },
    {
      path: "users",
      name: "UserList",
      component: () => import("../views/User/UserList.vue"),
      props: route => ({ page: parseInt(route.query.page) })
    }
    // {
    //   path: "*",
    //   name: "NotFound",
    //   component: () => import("../views/NotFound.vue"),
    // }
  ]
};

let displayPages = {
  path: "/",
  component: DisplayLayout,
  children: [
    {
      path: "product/view/:id",
      name: "ProductDisplay",
      component: ProductDisplay
    },
  ]
};
const routes = [authPages, dashboardPages, displayPages];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL ? process.env.BASE_URL : "/",
  routes
});

export default router;
