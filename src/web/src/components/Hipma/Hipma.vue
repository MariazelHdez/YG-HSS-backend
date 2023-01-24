
<template>
  <div class="books">
    <h1>Health Information Requests</h1>

    <HipmaAlert v-show="flagAlert" v-bind:alertMessage="alertMessage"  v-bind:alertType="alertType"/>

    <v-text-field v-model="search" label="Search"></v-text-field>

    <v-data-table
      dense
      :items="items"
      :headers="headers"
      :options.sync="options"
      :loading="loading"
      :search="search"
    >
    <template v-slot:item.showUrl="{ item }">
        <v-icon @click="showDetails(item.showUrl)">mdi-eye</v-icon>
    </template>
    </v-data-table>
  </div>
</template>

<script>
const axios = require("axios");
import HipmaAlert from './HipmaAlert.vue';
import { HIPMA_URL } from "../../urls.js";

export default {
  name: "HipmaIndex",
  data: () => ({
    loading: false,
    items: [],
    alertMessage: "",
    alertType: "",
    search: "",
    options: {},
    flagAlert: false,
    headers: [
        { text: "Confirmation Number", value: "confirmation_number", sortable: true},
        { text: "Request Type", value: "HipmaRequestType", sortable: true},
        { text: "Request Access to personal information", value: "AccessPersonalHealthInformation", sortable: true},
        { text: "Applicant", value: "applicantFullName", sortable: true},
        { text: "Created", value: "created_at", sortable: true},
        { text: "", value: "status", sortable: true},
        { text: "", value: "showUrl", sortable: false},
    ],
    page: 1,
    pageCount: 0,
    iteamsPerPage: 10,
  }),
  components: {
    HipmaAlert
  },
  watch: {
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    search: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
  },
  created(){
    if (typeof this.$route.query.message !== 'undefined' && typeof this.$route.query.type !== 'undefined'){
      this.flagAlert = true;
      this.alertMessage = this.$route.query.message;
      this.alertType = this.$route.query.type;
    }
  },
  mounted() {
    this.getDataFromApi();
  },
  methods: {
    getDataFromApi() {
      this.loading = true;

      axios
        .get(HIPMA_URL)
        .then((resp) => {
            this.items = resp.data.data;
            //this.pagination.totalLength = resp.data.meta.count;
            //this.totalLength = resp.data.meta.count;
            this.loading = false;
        })
        .catch((err) => console.error(err))
        .finally(() => {
            this.loading = false;
        });
    },
    showDetails (route) {
      console.log(route);
      this.$router.push({ path: route });
    },
  },
};
</script>
