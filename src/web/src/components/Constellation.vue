
<template>
  <div class="books">
    <h1>Constellation Health Requests</h1>

    <v-text-field v-model="search" label="Search"></v-text-field>

    <v-data-table
      dense
      :items="items"
      :headers="headers"
      :options.sync="options"
      :loading="loading"
      :search="search"
    ><slot name="first" /></v-data-table>
  </div>
</template>

<script>
const axios = require("axios");

export default {
  name: "Grid",
  data: () => ({
    loading: false,
    items: [],
    search: "",
    options: {},

    headers: [
        { text: "Legal Name", value: "your_legal_name", sortable: true},
        { text: "Date of Birth", value: "date_of_birth", sortable: true},
        { text: "Do you have a family physician?", value: "family_physician", sortable: true},
        { text: "Diagnosis/History", value: "diagnosis", sortable: true},
        { text: "Created", value: "created_at", sortable: true},
        { text: "", value: "status", sortable: true},
        { text: "", value: "actions", sortable: false},
    ],
    page: 1,
    pageCount: 0,
    iteamsPerPage: 10,
  }),
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
  mounted() {
    this.getDataFromApi();
  },
  methods: {
    getDataFromApi() {
      this.loading = true;

      axios
        .get("http://localhost:3000/api/constellation/")
        .then((resp) => {

            this.items = resp.data.data;
            //this.pagination.totalLength = resp.data.meta.count;
            //this.totalLength = resp.data.meta.count;

            //console.log(this.totalLength);

            this.loading = false;
        })
        .catch((err) => console.error(err))
        .finally(() => {
            this.loading = false;
        });
    },
  },
};
</script>
