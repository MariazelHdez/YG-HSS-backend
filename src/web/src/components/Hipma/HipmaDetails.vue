<template>
	<div class="books">
		<h1>Hipma Requests</h1>

		<HipmaInformation v-bind:hipma="itemsHipma" />

		<HipmaBehalf v-bind:hipma="itemsHipma" v-bind:hipmaFiles="itemsHipmaFiles"/>

		<HipmaApplicant v-bind:hipma="itemsHipma" />

	</div>
</template>

<script>
const axios = require("axios");
import HipmaInformation from './HipmaInformation.vue';
import HipmaBehalf from './HipmaBehalf.vue';
import HipmaApplicant from './HipmaApplicant.vue';
import { HIPMA_SHOW_URL } from "../../urls.js";
import { HIPMA_VALIDATE_URL } from "../../urls.js";

export default {
  name: "HipmaDetails",
  data: () => ({
    loading: false,
    itemsHipma: [],
    itemsHipmaFiles: [],
  }),

  components: {
    HipmaInformation,
	HipmaBehalf,
	HipmaApplicant
  },

  created(){
    this.validateRecord();
  },
  mounted() {
    this.getDataFromApi();
  },
  methods: {
    validateRecord() {
      axios
        .get(HIPMA_VALIDATE_URL+this.$route.params.hipma_id)
        .then((resp) => {
            if(!resp.data.flagHipma){
              this.$router.push({
                path: '/hipma',
                query: { message: resp.data.message, type: resp.data.type}
              });
            }
        })
        .catch((err) => console.error(err))
        .finally(() => {
        });
    },
    getDataFromApi() {
      axios
        .get(HIPMA_SHOW_URL+this.$route.params.hipma_id)
        .then((resp) => {

            this.itemsHipma = resp.data.hipma;
            this.itemsHipmaFiles = resp.data.hipmaFiles;

        })
        .catch((err) => console.error(err))
        .finally(() => {
        });
    },
  },
};
</script>
