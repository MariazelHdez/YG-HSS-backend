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
      :server-items-length="totalLength"
      :search="search"
    ></v-data-table>
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
    totalLength: 0,
    headers: [
        { text: "Legal Name", value: "your_legal_name" },
        { text: "Date of Birth", value: "date_of_birth" },
        { text: "Do you have a family physician?", value: "family_physician" },
        { text: "Diagnosis/History", value: "diagnosis" },
        { text: "Created", value: "created_at" },
        { text: "", value: "View" },
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
        .post(
          "http://localhost:3000/api/constellation",
          this.options
        )
        .then((resp) => {
          console.log(resp.data);
          this.items = resp.data.data;
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
