<template>
  <div class="home">
    <h1>Dashboard</h1>

    <div class="row">
      <div class="col-md-6">
        <v-card class="mt-5" color="#ffffff">
          <v-card-title>Another card</v-card-title>
          <v-card-text>This is the body of the text</v-card-text>
        </v-card>
        
      </div>
      <div class="col-md-6">
        <v-card class="mt-5" color="#ffffff">
          <StatusChart :title="'Status'" :data="data" @filterSelected="filterSelected"></StatusChart>       
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
import StatusChart from "./Chart/Status.vue";
import { ref } from "vue";
import { setData } from "../helper/index";
import { SUBMISSION_STATUS_URL } from "../urls";

const labelColors = [
  { label: "New/Unread", color: "#41b883" },
  { label: "Closed", color: "#dd3e22" },
  { label: "Declined", color: "#f3b228" },
  { label: "Entered", color: "#1a1aff" }
];

const dtData = ref({});
dtData.value = setData([0, 0, 0, 0], labelColors);

const getDataFromApi = (actionId, actionVal) => {
  axios
  .get(`${SUBMISSION_STATUS_URL}/${actionId}/${actionVal}`)
  .then((resp) => {
    const curData = resp.data.data
    const data = curData.map(x => x.submissions);
    const labels = curData.map(x => ({label: x.status, color: labelColors.filter(y => y.label === x.status)[0].color }))
    dtData.value = setData(data, labels);
  })
  .catch((err) => console.error(err));
};

export default {
  name: "Home",
  components: {
    StatusChart
  },
  data: () => ({
    data: dtData
  }),
  methods: {
    filterSelected: (val) => {
      const actionId = val.slice(0, 1) === "W" ? "week" : "month";
      getDataFromApi(actionId, val);
    },
  },
  mounted() {
    getDataFromApi("week", "W20230130");
  },
};
</script>
