<template>
  <div class="home">
    <div class="row">
      <div class="col-md-7">
        <v-card class="mt-5" color="#ffffff">
          <SubmissionsChart :title="'Submissions'" :data="submissionsData" @filterSelected="sFilterSelected"></SubmissionsChart>
        </v-card>  
        <v-card class="mt-5" color="#ffffff">
          <StatusChart :title="'Status'" :data="statusData" @filterSelected="scFilterSelected"></StatusChart>
        </v-card>
            
      </div>
      <div class="col-md-5">
        <ActivityTimeline :title="'Activity Timeline'" :data="atData"></ActivityTimeline>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
import StatusChart from "./Chart/Status.vue";
import SubmissionsChart from "./Chart/Submissions.vue";
import ActivityTimeline from "./General/ActivityTimeline.vue";
import { ref } from "vue";
import { setSubmissionsStatusData, setSubmissionsData } from "../helper/index";
import { SUBMISSION_STATUS_URL, SUBMISSION_URL, AUDIT_TIMELINE_URL } from "../urls";

const labelColors = [
  { label: "New/Unread", color: "#41b883" },
  { label: "Closed", color: "#dd3e22" },
  { label: "Declined", color: "#f3b228" },
  { label: "Entered", color: "#1a1aff" },
  {label: 'Open', color: '#0097A9'}
];

const atData = ref([]);
const scData = ref({});
const sData = ref({});
scData.value = setSubmissionsStatusData([0, 0, 0, 0], labelColors);

const getSubmissionsStatusDataFromApi = (actionId, actionVal) => {
  axios
  .get(`${SUBMISSION_STATUS_URL}/${actionId}/${actionVal}`)
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
  .get(`${SUBMISSION_URL}/${actionId}/${actionVal}`)
  .then((resp) => {    
    sData.value = setSubmissionsData(resp);
  })
  .catch((err) => console.error(err));
};

const getAuditTimelineDataFromApi = () => {
  axios
  .get(`${AUDIT_TIMELINE_URL}`)
  .then((resp) => {    
    atData.value = resp.data.data;
  })
  .catch((err) => console.error(err));
}

export default {
  name: "Home",
  components: {
    StatusChart,
    SubmissionsChart,
    ActivityTimeline
  },
  data: () => ({
    statusData: scData,
    submissionsData: sData,
    atData: atData
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
    getAuditTimelineDataFromApi();
  },
};
</script>
