<template>
	<div class="hipma-service details">
		<v-container>
			<v-row class="mb-6" no-gutters>
				<v-col class="d-flex align-center">
					<span class="title-service">Hipma Warnings Details</span>
				</v-col>
			</v-row>
		</v-container>
		<v-container>
			<v-row no-gutters>
				<v-col id="hipmaPanelInformation">
					<HipmaInformation v-bind:hipma="itemsHipma" v-bind:panelModel="panelModel"/>

					<HipmaBehalf
						v-if="itemsHipma.HipmaSituations
						|| itemsHipma.first_name_behalf
						|| itemsHipma.last_name_behalf
						|| itemsHipma.company_or_organization_optional_behalf
						|| itemsHipma.address_behalf
						|| itemsHipma.city_or_town_behalf
						|| itemsHipma.postal_code_behalf
						|| itemsHipma.email_address_behalf"
						v-bind:hipma="itemsHipma" v-bind:hipmaFiles="itemsHipmaFiles"
						v-bind:panelModel="panelModel"
					/>

					<HipmaApplicant v-bind:hipma="itemsHipma" v-bind:panelModel="panelModel"/>

					<HipmaAttachments v-bind:hipma="itemsHipma"
						v-bind:hipmaFiles="itemsHipmaFiles"
						v-bind:panelModel="panelModel"
					/>
				</v-col>
				<v-col lg="1"> </v-col>
			</v-row>
		</v-container>
	</div>
</template>

<script>
const axios = require("axios");
import HipmaInformation from './HipmaInformation.vue';
import HipmaBehalf from './HipmaBehalf.vue';
import HipmaApplicant from './HipmaApplicant.vue';
import HipmaAttachments from './HipmaAttachments.vue';
//
import { HIPMA_DUPLICATES_DETAILS } from "../../urls.js";
import { HIPMA_VALIDATE_URL } from "../../urls.js";
import { HIPMA_CHANGE_STATUS_URL } from "../../urls.js";
import html2pdf from "html2pdf.js";

export default {
	name: "HipmaDetails",
	data: () => ({
		loader: null,
		loadingExport: false,
		itemsHipma: [],
		itemsHipmaFiles: [],
		dialog: false,
		panelModel: [0],
		fileName: "",
	}),

	components: {
		HipmaInformation,
		HipmaBehalf,
		HipmaApplicant,
		HipmaAttachments
	},
	created(){

	},
	mounted() {
		//this.validateRecord();
		this.getDataFromApi();
	},
	watch: {
		loader () {
			const l = this.loader
			this[l] = !this[l]

			setTimeout(() => (this[l] = false), 3000)

			this.loader = null
		},
	},
	methods: {
		validateRecord() {
			axios
			.get(HIPMA_VALIDATE_URL+this.$route.params.duplicate_id)
			.then((resp) => {
				if(!resp.data.flagHipma){
					this.$router.push({
						path: '/hipmaWarnings',
						query: { message: resp.data.message, type: resp.data.type}
					});
				}else{
					this.getDataFromApi();
				}
			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		getDataFromApi() {
			axios
			.get(HIPMA_DUPLICATES_DETAILS+this.$route.params.duplicate_id)
			.then((resp) => {

				this.itemsHipma = resp.data.hipma;
				this.itemsHipmaFiles = resp.data.hipmaFiles;
				this.fileName = resp.data.fileName;

			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		changeStatus(){
			//Sent it as an array to use the same function for both single and bulk status changes
			var hipmaId = [this.$route.params.duplicate_id];

			axios
			.patch(HIPMA_CHANGE_STATUS_URL, {
                params: {
					requests: hipmaId
				}
            })
			.then((resp) => {
				this.$router.push({
					path: '/hipma',
					query: { message: resp.data.message, type: resp.data.type}
				});

			})
			.catch((err) => console.error(err))
		},
		exportToPDF() {
			this.loader = 'loadingExport';
			this.panelModel = [0];
			var namePdf = this.fileName;

			setTimeout(function() {
				html2pdf(document.getElementById("hipmaPanelInformation"), {
						margin: 5,
						filename: namePdf,
						pagebreak: {
							mode: ['avoid-all', 'css', 'legacy']
						}
				});
			}, 500);
		},
	},
};
</script>
