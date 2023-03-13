import Vue from "vue";
import VueRouter from "vue-router";
// import Home from "../components/Home.vue";
import NotFound from "../views/NotFound.vue";
import Login from "../components/Login";
import LoginComplete from "../components/LoginComplete";
import Profile from "../components/Profile";
import store from "../store";
import Constellation from "../components/Constellation/Constellation";
import ConstellationDetails from "../components/Constellation/ConstellationDetails";
import ConstellationExport from "../components/Constellation/ConstellationExport"
import ConstellationAnalytics from "../components/Constellation/ConstellationAnalytics";
import Hipma from "../components/Hipma/Hipma";
import HipmaDetails from "../components/Hipma/HipmaDetails";
import HipmaExport from "../components/Hipma/HipmaExport";
import HipmaAnalytics from "../components/Hipma/HipmaAnalytics";
import HipmaWarnings from "../components/Hipma/HipmaWarnings";
import HipmaWarningsDetails from "../components/Hipma/HipmaWarningsDetails";
import Midwifery from "../components/Midwifery/Midwifery";
import MidwiferyDetails from "../components/Midwifery/MidwiferyDetails";
import MidwiferyExport from "../components/Midwifery/MidwiferyExport";
import MidwiferyAnalytics from "../components/Midwifery/MidwiferyAnalytics";
import MidwiferyWarnings from "../components/Midwifery/MidwiferyWarnings";
import MidwiferyWarningsDetails from "../components/Midwifery/MidwiferyWarningsDetails";

import Dashboard from "../components/Dashboard.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
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
      requiresAuth: true,
      permissions: [
        "constellation_view"
      ]
    }
  },
  {
    path: "/constellation/show/:constellationHealth_id",
    name: "Constellation Health",
    component: ConstellationDetails,
    meta: {
      requiresAuth: true,
      permissions: [
        "constellation_view"
      ]
    }
  },
  {
    path: "/constellationExport",
    name: "Constellation Export",
    component: ConstellationExport,
    meta: {
      requiresAuth: true,
      permissions: [
        "constellation_view"
      ]
    }
  },
  {
    path: "/constellationAnalytics",
    name: "Constellation Analytics",
    component: ConstellationAnalytics,
    meta: {
      requiresAuth: true,
      permissions: [
        "constellation_view"
      ]
    }
  },
  {
    path: "/hipma",
    name: "Health Information",
    component: Hipma,
    meta: {
      requiresAuth: true,
      permissions: [
        "hipma_view"
      ]
    }
  },
  {
    path: "/hipma/show/:hipma_id",
    name: "Health Information Details",
    component: HipmaDetails,
    meta: {
      requiresAuth: true,
      permissions: [
        "hipma_view"
      ]
    }
  },
  {
    path: "/hipmaExport",
    name: "Health Information Export",
    component: HipmaExport,
    meta: {
      requiresAuth: true,
      permissions: [
        "hipma_view"
      ]
    }
  },
  {
    path: "/hipmaAnalytics",
    name: "Hipma Analytics",
    component: HipmaAnalytics,
    meta: {
      requiresAuth: true,
      permissions: [
        "hipma_view"
      ]
    }
  },
  {
    path: "/midwifery",
    name: "Midwifery",
    component: Midwifery,
    meta: {
      requiresAuth: true,
      permissions: [
        "midwifery_view"
      ]
    }
  },
  {
    path: "/midwifery/show/:midwifery_id",
    name: "Midwifery Details",
    component: MidwiferyDetails,
    meta: {
      requiresAuth: true,
      permissions: [
        "midwifery_view"
      ]
    }
  },
  {
    path: "/midwiferyExport",
    name: "Midwifery Export",
    component: MidwiferyExport,
    meta: {
      requiresAuth: true,
      permissions: [
        "midwifery_view"
      ]
    }
  },
  {
    path: "/midwiferyAnalytics",
    name: "Midwifery Analytics",
    component: MidwiferyAnalytics,
    meta: {
      requiresAuth: true,
      permissions: [
        "midwifery_view"
      ]
    }
  },
  {
    path: "/hipmaWarnings",
    name: "Hipma Warnings",
    component: HipmaWarnings,
    meta: {
      requiresAuth: true,
      permissions: [
        "hipma_view"
      ]
    }
  },
  {
    path: "/hipmaWarnings/details/:duplicate_id",
    name: "Hipma Warnings Details",
    component: HipmaWarningsDetails,
    meta: {
      requiresAuth: true,
      permissions: [
        "hipma_view"
      ]
    }
  },
  {
    path: "/midwiferyWarnings",
    name: "Midwifery Warnings",
    component: MidwiferyWarnings,
    meta: {
      requiresAuth: true,
      permissions: [
        "midwifery_view"
      ]
    }
  },
  {
    path: "/midwiferyWarnings/details/:duplicate_id",
    name: "Midwifery Warnings Details",
    component: MidwiferyWarningsDetails,
    meta: {
      requiresAuth: true,
      permissions: [
        "midwifery_view"
      ]
    }
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth || false;
  const permissions = to.meta?.permissions ?? [];

  if (!requiresAuth && permissions.length === 0) {
    return next();
  }

  await store.dispatch("checkAuthentication");
  var isAuthenticated = store.getters.isAuthenticated;
  const userPermissions = store.getters.dbUser.permissions ?? [];

  // Validate authentication
  if (requiresAuth && !isAuthenticated) {
    console.log("You aren't authenticatd, redirecting to sign-in")
    next("/sign-in");
    return;
  }

  // Validate permissions
  let validate = false;
  if (userPermissions.length > 0) {
    validate = permissions.every((x) => {
      return userPermissions.find((p) => p.permission_name === x) !== undefined;
    });
  }
  
  if (!validate) {
    next("/");
    return;
  }

  return next();
});

export default router;
