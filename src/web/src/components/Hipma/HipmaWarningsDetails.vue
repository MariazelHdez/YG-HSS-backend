<template>
	<div class="hipma-warnings details">
		<v-container>
			<v-row class="mb-6" no-gutters>
				<v-col class="align-center" cols="6">
					<span class="title-service">Hipma Warnings Details</span>
				</v-col>
				<v-col
					cols="3"
					sm="12"
					md="3"
					lg="3"
					class="text-right"
				>
					<v-dialog
						v-model="dialog"
						width="500"
					>
						<template v-slot:activator="{ on, attrs }">
						<v-btn
								color="#F3A901"
								class="ma-2 white--text apply-btn"
								v-bind="attrs"
								v-on="on"
								:disabled="confirmDisabled"
							>

							Confirm Duplicate

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
									Confirm Duplicate
								</v-card-title>

								<v-card-text>
									Are you sure you want to confirm duplicate?
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
										@click="confirmDuplicate()"
									>
									Yes
									</v-btn>
								</v-card-actions>
							</v-card>
					</v-dialog>
				</v-col>

				<v-col
					cols="3"
					sm="12"
					md="3"
					lg="3"
					class="d-flex align-center"
				>
					<v-dialog
						v-model="dialogReject"
						width="500"
					>
						<template v-slot:activator="{ on, attrs }">
						<v-btn
								color="#F3A901"
								class="pull-left ma-2 white--text apply-btn"
								dark
								v-bind="attrs"
								v-on="on"
							>

							Reject Warning

							<v-icon
								right
								dark
							>
							mdi-close-circle-outline
							</v-icon>

							</v-btn>
						</template>

							<v-card>
								<v-card-title class="text-h5 white lighten-2">
									Reject Warning
								</v-card-title>

								<v-card-text>
									Are you sure you want to reject this warning?
								</v-card-text>

								<v-divider></v-divider>

								<v-card-actions>
									<v-spacer></v-spacer>
									<v-btn
										color="#757575"
										text
										@click="dialogReject = false"
									>
									No
									</v-btn>

									<v-btn
										color="primary"
										text
										@click="rejectDuplicate()"
									>
									Yes
									</v-btn>
								</v-card-actions>
							</v-card>
					</v-dialog>
				</v-col>
				<v-col lg="1"> </v-col>
			</v-row>
		</v-container>
		<v-container fluid>
			<v-row no-gutters>
				<v-col id="hipmaPanelInformation">
					<v-radio-group
						v-model="primaryValue"
						inline
						id="warning-radio-group"
						class="pull-right"
					>
						<v-radio
							label="Select as Primary (original request)"
							:value="originalRequest"
							class="white--text apply-btn v-btn btn-radio display-inline-block"
							color="white"
							@click="selectPrimary('O')"
						></v-radio>

						<v-radio
							label="Select as Primary (duplicated request)"
							:value="duplicatedRequest"
							class="white--text apply-btn v-btn btn-radio display-inline-block"
							color="white"
							@click="selectPrimary('D')"
						></v-radio>
					</v-radio-group>

					<HipmaInformation
						v-bind:hipma="itemsHipma"
						v-bind:hipmaDuplicated="itemsHipmaDuplicated"
						v-bind:panelModel="panelModel"/>

					<HipmaBehalf
						v-bind:hipma="itemsHipma"
						v-bind:hipmaDuplicated="itemsHipmaDuplicated"
						v-bind:hipmaFiles="itemsHipmaFiles"
						v-bind:panelModel="panelModel"
					/>

					<HipmaApplicant
						v-bind:hipma="itemsHipma"
						v-bind:hipmaDuplicated="itemsHipmaDuplicated"
						v-bind:panelModel="panelModel"
					/>

					<HipmaAttachments v-bind:hipma="itemsHipma"
						v-bind:hipmaDuplicated="itemsHipmaDuplicated"
						v-bind:hipmaFiles="itemsHipmaFiles"
						v-bind:hipmaFilesDuplicated="itemsHipmaFilesDuplicated"
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

import { HIPMA_DUPLICATES_DETAILS } from "../../urls.js";
import { HIPMA_VALIDATE_WARNING_URL } from "../../urls.js";
import { HIPMA_DUPLICATES_PRIMARY } from "../../urls.js";

export default {
	name: "HipmaDetails",
	data: () => ({
		loader: null,
		loadingReject: false,
		itemsHipma: [],
		itemsHipmaFiles: [],
		itemsHipmaDuplicated: [],
		itemsHipmaFilesDuplicated: [],
		dialog: false,
		dialogReject: false,
		panelModel: [0],
		fileName: "",
		primaryValue: null,
		confirmDisabled: true,
		originalRequest: '',
		duplicatedRequest: '',
		typeRequest: null,
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
	watch: {
		loader () {
			const l = this.loader
			this[l] = !this[l]

			setTimeout(() => (this[l] = false), 3000)

			this.loader = null
		},
	},
	methods: {
		selectPrimary(type){
			this.typeRequest = type;
            this.confirmDisabled = false;
        },
		validateRecord() {
			axios
			.get(HIPMA_VALIDATE_WARNING_URL+this.$route.params.duplicate_id)
			.then((resp) => {
				if(!resp.data.flagWarning){
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
				this.itemsHipmaDuplicated = resp.data.hipmaDuplicate;
				this.itemsHipmaFilesDuplicated = resp.data.hipmaFilesDuplicated;
				this.originalRequest = resp.data.hipma.id;
				this.duplicatedRequest = resp.data.hipmaDuplicate.id;

				this.fileName = resp.data.fileName;

			})
			.catch((err) => console.error(err))
			.finally(() => {
			});
		},
		confirmDuplicate(){
			var duplicateId = this.$route.params.duplicate_id;

			axios
			.patch(HIPMA_DUPLICATES_PRIMARY, {
                params: {
					warning: duplicateId,
					request: this.primaryValue,
					type: this.typeRequest
				}
            })
			.then((resp) => {
				this.$router.push({
					path: '/hipmaWarnings',
					query: { message: resp.data.message, type: resp.data.type}
				});

			})
			.catch((err) => console.error(err))
		},
		rejectDuplicate() {
			var duplicateId = this.$route.params.duplicate_id;

			axios
			.patch(HIPMA_DUPLICATES_PRIMARY, {
                params: {
					warning: duplicateId,
					request: this.primaryValue,
					type: this.typeRequest
				}
            })
			.then((resp) => {
				this.$router.push({
					path: '/hipmaWarnings',
					query: { message: resp.data.message, type: resp.data.type}
				});

			})
			.catch((err) => console.error(err))
		},
	},
};
</script>
