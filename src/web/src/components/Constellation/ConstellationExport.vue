<template>
  <div class="constellation-service">
    <span class="title-service">Constellation Health Requests</span>

    <ConstellationAlert
      v-show="flagAlert"
      v-bind:alertMessage="alertMessage"
      v-bind:alertType="alertType"
    />
    <v-row align="center" class="container-actions">
      <v-col cols="12" sm="2">
        <v-select
          :items="bulkActions"
          v-model="actionSelected"
          label="Status"
          append-icon="mdi-chevron-down"
          prepend-inner-icon="mdi-layers-triple"
          color="grey lighten-2"
          item-color="grey lighten-2"
          id="bulk-accion-select"
        >
        </v-select>
      </v-col>
      <v-col class="align-start" cols="12" sm="2">
        <v-menu
          ref="menu1"
          v-model="menu1"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="dateFormattedMin"
              label="From:"
              prepend-icon="mdi-calendar"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="dateMin"
            no-title
            @input="menu1 = false"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col class="align-start" cols="12" sm="2">
        <v-menu
          ref="menu2"
          v-model="menu2"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="dateFormattedMax"
              label="To:"
              prepend-icon="mdi-calendar"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="dateMax"
            no-title
            @input="menu2 = false"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col sm="auto" v-if="removeFilters">
        <v-icon @click="setFilters"> mdi-filter-remove </v-icon>
      </v-col>
      <v-col>
        <v-btn
          :loading="loading"
          :disabled="loading"
          color="#F3A901"
          class="pull-right white--text"
          @click="exportFile"
          id="export-btn"
        >
          Export
          <v-icon right dark> mdi-cloud-download </v-icon>
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
    </v-data-table>
  </div>
</template>

<script>
const axios = require("axios");
import ConstellationAlert from "./ConstellationAlert.vue";
import { CONSTELLATION_URL } from "../../urls.js";
import { CONSTELLATION_EXPORT_FILE_URL } from "../../urls.js";
import { utils, writeFileXLSX } from "xlsx";

export default {
  name: "ConstellationIndex",
  data: () => ({
    loading: false,
    selected: [],
    items: [],
    bulkActions: [],
    actionSelected: "",
    actionToFilter: "",
    itemsSelected: [],
    alertMessage: "",
    alertType: "",
    search: "",
    options: {},
    flagAlert: false,
    page: 1,
    pageCount: 0,
    iteamsPerPage: 10,
    alignments: "center",
    dateMin: "",
    dateFormattedMin: "",
    dateMax: "",
    dateFormattedMax: "",
    menu1: false,
    menu2: false,
  }),
  computed: {
    headers() {
      return [
        {
          text: "Legal Name",
          value: "your_legal_name",
          width: "15%",
          sortable: true,
        },
        {
          text: "Date of Birth",
          value: "date_of_birth",
          width: "11%",
          sortable: true,
        },
        {
          text: "Do you have a family physician?",
          value: "family_physician",
          width: "15%",
          sortable: true,
        },
        {
          text: "Diagnosis/History",
          value: "diagnosis",
          sortable: true,
        },
        {
          text: "Created",
          value: "created_at",
          width: "15%",
          sortable: true,
          filter: (value) => {
            if (!this.dateFormattedMin || !this.dateFormattedMax) return true;
            const dateMin = new Date(Date.parse(this.dateMin));
            const dateMax = new Date(Date.parse(this.dateMax));
            const date = new Date(Date.parse(value.substr(0, 10)));

            return date >= dateMin && date <= dateMax;
          },
        },
        {
          text: "Status",
          value: "status",
          sortable: true,
          width: "10%",
          filter: (value) => {
            if (!this.actionToFilter) return true;
            return value === this.actionToFilter;
          },
        },
      ];
    },
    removeFilters() {
      return this.dateMin || this.dateMax || this.actionToFilter;
    },
  },
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
    dateMin() {
      this.dateFormattedMin = this.formatDate(this.dateMin);
    },
    dateMax() {
      this.dateFormattedMax = this.formatDate(this.dateMax);
    },
    actionSelected() {
      let action = this.bulkActions.filter((element) => element.value == this.actionSelected);
      this.actionToFilter = action[0].text;
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
          this.bulkActions = resp.data.dataStatus.filter((element) => element.value != 4);
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
    formatDate(date) {
      if (!date) return null;
      const [year, month, day] = date.split("-");
      return `${month}/${day}/${year}`;
    },
    setFilters() {
      this.dateMin = "";
      this.dateMax = "";
      this.actionSelected = "";
    },
    exportFile() {
      var idArray = [];
      this.itemsSelected.forEach((e) => {
        idArray.push(e.constellation_health_id);
      });
      axios
        .post(CONSTELLATION_EXPORT_FILE_URL, {newStatus: idArray})
        .then((resp) => {
          const ws = utils.json_to_sheet(resp.data.dataConstellation);
          const wb = utils.book_new();
          utils.book_append_sheet(wb, ws, "Constellation Requests");

          utils.sheet_add_aoa(
            ws,
            [
              [
                "First name",
                "Last name",
                "Is this your legal name?",
                "Legal name",
                "Pronouns",
                "Date of birth",
                "Do you have a Yukon health care card?",
                "Health care card number",
                "Health care card number",
                "YHCIP",
                "Postal code",
                "Prefer to be contacted",
                "Phone Number",
                "Email",
                "Leave phone message",
                "Language prefer to receive services",
                "Interpretation support",
                "Family physician",
                "Current family physician",
                "Accessing health care",
                "Diagnosis or history",
                "Demographic groups",
                "Include family members",
                "created_at",
              ],
            ],
            { origin: "A1" }
          );

          writeFileXLSX(wb, "Constellation_request.xlsx");

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
