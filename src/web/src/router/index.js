import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../components/Home.vue";
import NotFound from "../views/NotFound.vue";
import Login from "../components/Login";
import LoginComplete from "../components/LoginComplete";
import Profile from "../components/Profile";
import store from "../store";
import Constellation from "../components/Constellation/Constellation";
import ConstellationDetails from "../components/Constellation/ConstellationDetails";
import Hipma from "../components/Hipma/Hipma";
import HipmaDetails from "../components/Hipma/HipmaDetails";
import HipmaExport from "../components/Hipma/HipmaExport";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/sign-in",
    name: "Login",
    component: Login
  },
  {
    path: "/login-complete",
    name: "LoginComplete",
    component: LoginComplete
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "*",
    name: "Not Found",
    component: NotFound

  },
  {
    path: "/constellation",
    name: "Constellation Health",
    component: Constellation,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/constellation/show/:constellationHealth_id",
    name: "Constellation Health",
    component: ConstellationDetails,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/hipma",
    name: "Health Information",
    component: Hipma,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/hipma/show/:hipma_id",
    name: "Health Information Details",
    component: HipmaDetails,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/hipmaExport",
    name: "Health Information Export",
    component: HipmaExport,
    meta: {
      requiresAuth: true
    }
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  var requiresAuth = to.meta.requiresAuth || false;

  if (!requiresAuth) {
    return next();
  }

  await store.dispatch("checkAuthentication");
  var isAuthenticated = store.getters.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    console.log("You aren't authenticatd, redirecting to sign-in")
    next("/sign-in");
    return;
  }

  return next();
});

export default router;
