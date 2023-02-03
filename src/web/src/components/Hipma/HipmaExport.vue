
<template>
	<div class="hipma-service">
		<span class="title-service">Health Information Export</span>

		<v-row>
			<v-col
				cols="6"
				sm="6"
				md="4"
			>
				<v-menu
					ref="menu"
					v-model="menu"
					:close-on-content-click="false"
					transition="scale-transition"
					offset-y
					min-width="auto"
				>
					<template v-slot:activator="{ on, attrs }">
						<v-text-field
							v-model="date"
							label="From:"
							prepend-icon="mdi-calendar"
							v-bind="attrs"
							v-on="on"
						></v-text-field>
					</template>
					<v-date-picker
						v-model="date"
						no-title
						@input="menu = false"
						@change="updateDate"
					></v-date-picker>
				</v-menu>
			</v-col>

			<v-col
				cols="6"
				sm="6"
				md="4"
			>
				<v-menu
					ref="menuEnd"
					v-model="menuEnd"
					:close-on-content-click="false"
					transition="scale-transition"
					offset-y
					min-width="auto"
				>
					<template v-slot:activator="{ on, attrs }">
						<v-text-field
							v-model="dateEnd"
							label="To:"
							prepend-icon="mdi-calendar"
							v-bind="attrs"
							v-on="on"
						></v-text-field>
					</template>
					<v-date-picker
						v-model="dateEnd"
						no-title
						@input="menuEnd = false"
						@change="updateDate"
					></v-date-picker>
				</v-menu>
			</v-col>
			<v-col
				cols="6"
				sm="12"
				md="4">
				<v-btn
					:loading="loadingExport"
					:disabled="loadingExport"
					color="#F3A901"
					class="pull-right ma-2 white--text apply-btn"
					@click="exportFile()"
					id="export-btn"
				>
					Export
					<v-icon
						right
						dark
					>
						mdi-cloud-download
					</v-icon>
				</v-btn>
				&nbsp;
				<v-btn
					:loading="loadingReset"
					:disabled="loadingReset"
					color="#F3A901"
					class="pull-right ma-2 white--text apply-btn"
					@click="resetInputs()"
					id="export-btn"
				>
					Reset
					<v-icon
						right
						dark
					>
						mdi-restore
					</v-icon>
				</v-btn>
			</v-col>

		</v-row>
		<br>
		<v-data-table
			dense
			v-model="selected"
			show-select
			:items="items"
			:headers="headers"
			:options.sync="options"
			:loading="loading"
			checkbox-color="black"
			:value="selected"
			@toggle-select-all="selectAll"
		>

		</v-data-table>
	</div>
</template>

<script>
const axios = require("axios");
import { HIPMA_URL } from "../../urls.js";
import { HIPMA_EXPORT_FILE_URL } from "../../urls.js";
import { utils, writeFileXLSX  } from 'xlsx';

export default {
	name: "HipmaExport",
	data: () => ({
		loading: false,
		items: [],
		itemsUnfiltered: [],
		options: {},
		flagAlert: false,
		menu: false,
		date: null,
		menuEnd: false,
		dateEnd: null,
		selected: [],
		loader: null,
		loadingExport: false,
		loadingReset: false,
		headers: [
			{ text: "Confirmation Number", value: "confirmation_number", sortable: true},
			{ text: "Request Type", value: "HipmaRequestType", sortable: true},
			{ text: "Request Access to personal information", value: "AccessPersonalHealthInformation", sortable: true},
			{ text: "Applicant", value: "applicantfullname", sortable: true},
			{ text: "Created", value: "created_at", sortable: true},
		],
		page: 1,
		pageCount: 0,
		iteamsPerPage: 10,
	}),
	watch: {
		options: {
			handler() {
				this.getDataFromApi();
			},
			deep: true,
		},
		loader () {
			const l = this.loader;
			this[l] = !this[l];

			setTimeout(() => (this[l] = false), 2000)

			this.loader = null;
		},
	},
	mounted() {
		this.getDataFromApi();
	},
	methods: {
		updateDate(){
			if(this.date !== null && this.dateEnd !== null){
				var date = this.date;
				var dateEnd = this.dateEnd;
				let itemsDate = [];

				this.itemsUnfiltered.forEach(function (value) {
					if(value.created_at > date && value.created_at < dateEnd){
						itemsDate.push(value);
					}
				});

				this.items = itemsDate;
			}
		},
		getDataFromApi() {
		this.loading = true;

			axios
			.get(HIPMA_URL)
			.then((resp) => {
				this.items = resp.data.data;
				this.itemsUnfiltered = resp.data.data;
				//this.pagination.totalLength = resp.data.meta.count;
				//this.totalLength = resp.data.meta.count;
				this.loading = false;
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loading = false;
			});
		},
		selectAll() {
			//event.value - boolen value if needed
			this.selected = this.selected.length === this.items.length
			? []
			: this.items
		},
		resetInputs() {
			this.loader = 'loadingReset';
			this.date = null;
			this.dateEnd = null;
			this.getDataFromApi();
		},
		exportFile () {
			this.loader = 'loadingExport';
			let requests = [];
			let checked = this.selected;

			if(checked.length > 0){
				checked.forEach(function (value) {
					requests.push(value.id);
				});
			}

			axios
			.post(HIPMA_EXPORT_FILE_URL, {
				params: {
					requests: requests,
					dateFrom: this.date,
					dateTo: this.dateEnd
				}
			})
			.then((resp) => {

				const ws = utils.json_to_sheet(resp.data.data);
				const wb = utils.book_new();
				utils.book_append_sheet(wb, ws, "Hipma Requests");

				utils.sheet_add_aoa(ws, [[
					"Confirmation number",
					"First name behalf",
					"Last name behalf",
					"Company or organization optional behalf",
					"Address behalf",
					"City or town behalf",
					"Postal code behalf",
					"Email address behalf",
					"Phone number behalf",
					"First name",
					"Last name",
					"Date of birth",
					"Address",
					"City or town",
					"Postal code",
					"Email address",
					"Phone number",
					"Name of health and social services program area optional ",
					"Indicate the hss system s you would like a record of user activity",
					"Provide details about your request ",
					"Date from ",
					"Date to ",
					"Issued identification",
					"Created at",
					"Updated at",
					"Request Type",
					"Access Personal Health Information",
					"Get a copy of your health information",
					"Situations",
					"Copy activity request",
					"Need help identifying data range",
					"Affirm information accurate"
				]], { origin: "A1" });

				writeFileXLSX(wb, resp.data.fileName);

				this.loading = false;
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loading = false;
			});


			/*
			console.log(this.date);
			console.log(this.dateEnd);
			console.log(this.selected);
			*/
		},
	},
};
</script>
