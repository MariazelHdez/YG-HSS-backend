import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import vuetify from "./plugins/vuetify";

const app = createApp(App);

axios.defaults.withCredentials = true;

//app.config.productionTip = false;

app.use(router);
app.use(store);
app.use(vuetify);
app.mount("#app");
