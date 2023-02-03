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
          <StatusChart :title="'Status'" :data="statusData" @filterSelected="scFilterSelected"></StatusChart>       
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card class="mt-5" color="#ffffff">
          <SubmissionsChart :title="'Submissions'" :data="submissionsData" @filterSelected="sFilterSelected"></SubmissionsChart>       
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
import StatusChart from "../Chart/Status.vue";
import SubmissionsChart from "../Chart/Submissions.vue";
import { ref } from "vue";
import { setSubmissionsStatusData, setSubmissionsData } from "../../helper/index";
import { HIPMA_STATUS_URL, HIPMA_SUBMISSIONS_URL } from "../../urls";

const labelColors = [
  { label: "Open", color: "#41b883" },
  { label: "Closed", color: "#dd3e22" },
];

const scData = ref({});
const sData = ref({});
scData.value = setSubmissionsStatusData([0, 0, 0, 0], labelColors);

const getSubmissionsStatusDataFromApi = (actionId, actionVal) => {
  axios
  .get(`${HIPMA_STATUS_URL}/${actionId}/${actionVal}`)
  .then((resp) => {
    const curData = resp.data.data
    const data = curData.map(x => x.submissions);
    const labels = curData.map(x => ({label: x.status, color: labelColors.filter(y => y.label === x.status)[0].color }))
    scData.value = setSubmissionsStatusData(data, labels);
  })
  .catch((err) => console.error(err));
};

const getSubmissionsDataFromApi = (actionId, actionVal) => {
  axios
  .get(`${HIPMA_SUBMISSIONS_URL}/${actionId}/${actionVal}`)
  .then((resp) => {
    const curData = resp.data
    const datasets = [];
    const labels = Object.entries(curData.labels).map((x) => x[0]);
    Object.entries(curData.data).forEach((g) => {
      const data = curData.data[g[0] ?? 0] ?? [];
      if (data) {
        const ds = {
          label: g[0],
          data: data.map((x) => x.submissions),
        };
        datasets.push(ds);
      }
    })
    sData.value = setSubmissionsData(datasets, labels);
  })
  .catch((err) => console.error(err));
};

export default {
  name: "Home",
  components: {
    StatusChart,
    SubmissionsChart
  },
  data: () => ({
    statusData: scData,
    submissionsData: sData
  }),
  methods: {
    scFilterSelected: (val) => {
      const actionId = val.slice(0, 1) === "W" ? "week" : "month";
      getSubmissionsStatusDataFromApi(actionId, val);
    },
    sFilterSelected: (val) => {
      const actionId = val.slice(0, 1) === "W" ? "week" : "month";
      getSubmissionsDataFromApi(actionId, val);
    },
  },
  mounted() {
    getSubmissionsStatusDataFromApi("week", "W20230130");
    getSubmissionsDataFromApi("week", "W20230130");
  },
};
</script>
