<template>
	<div class="hipma-service">
		<span class="title-service">Hipma Requests</span>

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
					id="mark-closed"
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

		<HipmaInformation v-bind:hipma="itemsHipma" />

		<HipmaBehalf v-if="itemsHipma.HipmaSituations" v-bind:hipma="itemsHipma" v-bind:hipmaFiles="itemsHipmaFiles"/>

		<HipmaApplicant v-bind:hipma="itemsHipma" />

		<HipmaAttachments v-if="hipmaFiles" v-bind:hipma="itemsHipma" v-bind:hipmaFiles="itemsHipmaFiles"/>

	</div>
</template>

<script>
const axios = require("axios");
import HipmaInformation from './HipmaInformation.vue';
import HipmaBehalf from './HipmaBehalf.vue';
import HipmaApplicant from './HipmaApplicant.vue';
import HipmaAttachments from './HipmaAttachments.vue';
import { HIPMA_SHOW_URL } from "../../urls.js";
import { HIPMA_VALIDATE_URL } from "../../urls.js";
import { HIPMA_CHANGE_STATUS_URL } from "../../urls.js";

export default {
	name: "HipmaDetails",
	data: () => ({
		loading: false,
		itemsHipma: [],
		itemsHipmaFiles: [],
		dialog: false,
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
		this.validateRecord();
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
			.get(HIPMA_SHOW_URL+this.$route.params.hipma_id)
			.then((resp) => {

				this.itemsHipma = resp.data.hipma;
				this.itemsHipmaFiles = resp.data.hipmaFiles;

			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		changeStatus(){
			//Sent it as an array to use the same function for both single and bulk status changes
			var hipmaId = [this.$route.params.hipma_id];

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
		}
	},
};
</script>
