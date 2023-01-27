
<template>
  <div class="books">
    <h1>Constellation Health Requests</h1>

    <ConstellationAlert 
    v-show="flagAlert" 
    v-bind:alertMessage="alertMessage" 
     v-bind:alertType="alertType"
     />

    <v-text-field 
    v-model="search" 
    label="Search">
    </v-text-field>

    <v-data-table
      dense
      :items="items"
      :headers="headers"
      :options.sync="options"
      :loading="loading"
      :search="search"
    >
    <template  v-slot:[`item.showUrl`]="{ item }">
        <v-icon @click="showDetails(item.showUrl)">mdi-eye</v-icon>
    </template>
    </v-data-table>
  </div>
</template>

<script>
const axios = require("axios");
import ConstellationAlert from './ConstellationAlert.vue';
import { CONSTELLATION_URL } from "../../urls.js";

export default {
  name: "ConstellationIndex",
  data: () => ({
    loading: false,
    items: [],
    alertMessage: "",
    alertType: "",
    search: "",
    options: {},
    flagAlert: false,
    headers: [
        { text: "Legal Name", value: "your_legal_name", sortable: true},
        { text: "Date of Birth", value: "date_of_birth", sortable: true},
        { text: "Do you have a family physician?", value: "family_physician", sortable: true},
        { text: "Diagnosis/History", value: "diagnosis", sortable: true},
        { text: "Created", value: "created_at", sortable: true},
        { text: "", value: "status", sortable: true},
        { text: "", value: "showUrl", sortable: false},
    ],
    page: 1,
    pageCount: 0,
    iteamsPerPage: 10,
  }),
  components: {
    ConstellationAlert
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
    if(typeof this.$route.query.message !== 'undefined' && typeof this.$route.query.type !== 'undefined')
    {
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
        .get(CONSTELLATION_URL)
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
      this.$router.push({ path: route });
    },
  },
};
</script>
