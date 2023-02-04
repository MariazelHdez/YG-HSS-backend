<template>
	<div class="midwifery details">
		<span class="title-service">Midwifery Requests</span>

		<v-row>
			<v-col
				cols="10"
				sm="6"
				md="10"
			>
				<v-dialog
					v-model="dialog"
					width="500"
				>
					<template v-slot:activator="{ on, attrs }">
						<v-btn
							color="#F3A901"
							class="pull-right"
							dark
							v-bind="attrs"
							v-on="on"
						>

						Mark as closed

						<v-icon
							right
							dark
						>
						mdi-check-circle-outline
						</v-icon>

						</v-btn>
					</template>

					<v-card>
						<v-card-title class="text-h5 white lighten-2">
							Mark as closed
						</v-card-title>

						<v-card-text>
							Are you sure you want to mark this entry as closed?
						</v-card-text>

						<v-divider></v-divider>

						<v-card-actions>
							<v-spacer></v-spacer>
							<v-btn
							color="#757575"
							text
							@click="dialog = false"
							>
							No
							</v-btn>

							<v-btn
							color="primary"
							text
							@click="changeStatus()"
							>
							Yes
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</v-col>

			<v-col
				cols="2"
				sm="6"
				md="2"
			>
				<v-btn
					color="#F3A901"
					class="pull-right"
					dark
					@click="exportToPDF"
				>

					Export selected

					<v-icon
						right
						dark
					>
					mdi-file-move
					</v-icon>

				</v-btn>
			</v-col>
		</v-row>

		<div id="midwiferyPanels">
			<MidwiferyInformation v-bind:midwifery="itemsMidwifery" v-bind:options="optionsMidwifery"
				v-bind:panelModel="panelModel"
			/>

			<MidwiferyContactInformation v-bind:midwifery="itemsMidwifery" v-bind:options="optionsMidwifery"
				v-bind:panelModel="panelModel"
			/>

			<MidwiferyMedicalInformation v-bind:midwifery="itemsMidwifery" v-bind:options="optionsMidwifery"
				v-bind:panelModel="panelModel"
			/>

			<MidwiferyOtherMedicalInformation
				v-if="itemsMidwifery.menstrual_cycle_length
				|| itemsMidwifery.family_physician
				|| itemsMidwifery.physician_s_name
				|| itemsMidwifery.major_medical_conditions
				|| itemsMidwifery.provide_details3"
				v-bind:midwifery="itemsMidwifery" v-bind:options="optionsMidwifery"
				v-bind:panelModel="panelModel"
			/>

			<MidwiferyDemographicInformation
				v-if="itemsMidwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie
					|| itemsMidwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that"
				v-bind:midwifery="itemsMidwifery" v-bind:panelModel="panelModel"
			/>

		</div>

	</div>
</template>

<script>
const axios = require("axios");
import MidwiferyInformation from './MidwiferyInformation.vue';
import MidwiferyContactInformation from './MidwiferyContactInformation.vue';
import MidwiferyMedicalInformation from './MidwiferyMedicalInformation.vue';
import MidwiferyOtherMedicalInformation from './MidwiferyOtherMedicalInformation.vue';
import MidwiferyDemographicInformation from './MidwiferyDemographicInformation.vue';
import { MIDWIFERY_SHOW_URL } from "../../urls.js";
import { MIDWIFERY_VALIDATE_URL } from "../../urls.js";
import { MIDWIFERY_CHANGE_STATUS_URL } from "../../urls.js";
import html2pdf from "html2pdf.js";

export default {
	name: "MidwiferyDetails",
	data: () => ({
		loading: false,
		itemsMidwifery: [],
		optionsMidwifery: [],
		dialog: false,
		panelModel: [0],
		fileName: "",
		idStatusClosed: null,
	}),
	components: {
		MidwiferyInformation,
		MidwiferyContactInformation,
		MidwiferyMedicalInformation,
		MidwiferyOtherMedicalInformation,
		MidwiferyDemographicInformation
	},
	created(){

	},
	mounted() {
		this.validateRecord();
	},
	methods: {
		validateRecord() {
			axios
			.get(MIDWIFERY_VALIDATE_URL+this.$route.params.midwifery_id)
			.then((resp) => {
				if(!resp.data.flagMidwifery){
					this.$router.push({
						path: '/midwifery',
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
			.get(MIDWIFERY_SHOW_URL+this.$route.params.midwifery_id)
			.then((resp) => {

				this.itemsMidwifery = resp.data.midwifery;
				this.optionsMidwifery = resp.data.options;
				this.fileName = resp.data.fileName;
				this.idStatusClosed = resp.data.midwiferyStatusClosed;

			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		changeStatus(){
			//Sent it as an array to use the same function for both single and bulk status changes
			var midwiferyId = [this.$route.params.midwifery_id];

			axios
			.patch(MIDWIFERY_CHANGE_STATUS_URL, {
                params: {
					requests: midwiferyId,
					requestStatus: this.idStatusClosed
				}
            })
			.then((resp) => {

				this.$router.push({
					path: '/midwifery',
					query: { message: resp.data.message, type: resp.data.type}
				});

			})
			.catch((err) => console.error(err))
		},
		exportToPDF() {
			this.panelModel = [0];
			var namePdf = this.fileName;

			setTimeout(function() {
				html2pdf(document.getElementById("midwiferyPanels"), {
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
