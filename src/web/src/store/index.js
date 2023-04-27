import { createStore } from "vuex";

import auth from "./auth";
import profile from "./profile";

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: { auth, profile },
});
