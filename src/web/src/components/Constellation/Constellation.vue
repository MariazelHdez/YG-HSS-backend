<template>
  <div class="constellation-service">
    <span class="title-service">Constellation Health Requests</span>

    <ConstellationAlert
      v-show="flagAlert"
      v-bind:alertMessage="alertMessage"
      v-bind:alertType="alertType"
    />

    <v-row 
      align="center" 
      class="container-actions"
    >
      <v-col
        cols="12"
        sm="3"
        class="actions"
      >
        <v-select
          :items="builkActions"
          solo
          label="Bulk Actions"
          append-icon="mdi-chevron-down"
          prepend-inner-icon="mdi-layers-triple"
          color="grey lighten-2"
          item-color="grey lighten-2"
          @change="enterBuilkAction"
          id="bulk-accion-select"
        >
        </v-select>
      </v-col>
      <v-col 
        class="align-start"
        cols="12"
        sm="3"
      >
        <v-btn 
          color="#F3A901"
          class="ma-2 white--text"
          id="apply-btn"
          @click="submitBuilk"
        >
          Apply
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      dense
      v-model="selected"
      show-select
      item-key="constellation_health_id"
      :items="items"
      :headers="headers"
      :options.sync="options"
      :loading="loading"
      :search="search"
      @input="enterSelect"
    >
      <template v-slot:[`item.showUrl`]="{ item }">
        <v-icon @click="showDetails(item.showUrl)">mdi-eye</v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
const axios = require("axios");
import ConstellationAlert from "./ConstellationAlert.vue";
import { CONSTELLATION_URL } from "../../urls.js";

export default {
  name: "ConstellationIndex",
  data: () => ({
    loading: false,
    items: [],
    builkActions: [
      "Entered into EMR content",
      "Declined content",
      "Closed content",
    ],
    actionSelected: "",
    itemsSelected: [],
    alertMessage: "",
    alertType: "",
    search: "",
    options: {},
    flagAlert: false,
    headers: [
      { text: "Legal Name", value: "your_legal_name", width: '10%',sortable: true },
      { text: "Date of Birth", value: "date_of_birth", width: '10%',sortable: true },
      {
        text: "Do you have a family physician?",
        value: "family_physician",
        width: '10%',
        sortable: true,
      },
      { text: "Diagnosis/History", value: "diagnosis", sortable: true },
      { text: "Created", value: "created_at", width: '15%',sortable: true },
      { text: "Status", value: "status", sortable: true },
      { text: "", value: "showUrl", sortable: false },
    ],
    page: 1,
    pageCount: 0,
    iteamsPerPage: 10,
    alignments: "center",
  }),
  components: {
    ConstellationAlert,
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
  created() {
    if (
      typeof this.$route.query.message !== "undefined" &&
      typeof this.$route.query.type !== "undefined"
    ) {
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
          this.items = this.items.filter((element) => element.status != 4);
          this.items.forEach((element) => {
            element.status = this.validateStatus(element.status);
          });
          //this.pagination.totalLength = resp.data.meta.count;
          //this.totalLength = resp.data.meta.count;
          this.loading = false;
        })
        .catch((err) => console.error(err))
        .finally(() => {
          this.loading = false;
        });
    },
    showDetails(route) {
      this.$router.push({ path: route });
    },
    enterSelect() {
      this.itemsSelected = this.selected;
    },
    validateStatus(id) {
      let statusDescription = {
        1: "New/Unread",
        2: "Entered",
        3: "Declined",
        4: "Closed",
      };
      return statusDescription[id];
    },
    enterBuilkAction(value) {
      this.actionSelected = value;
    },
    submitBuilk() {
      let statusSelected = {
        "Entered into EMR content": "Entered",
        "Declined content": "Declined",
        "Closed content": "Closed",
      };
      if ((this.actionSelected != "")) {
        this.itemsSelected.forEach((element) => {
          let postUrl = CONSTELLATION_URL + "/changeStatus/" + element.constellation_health_id;
          let setStatus = statusSelected[this.actionSelected];
          axios
            .patch(postUrl, { newStatus: setStatus })
            .then(() => {
              this.loading = false;
            })
            .catch((err) => console.error(err))
            .finally(() => {
              this.loading = false;
            });
        });
        window.location.reload();
      }
    },
  },
};
</script>
