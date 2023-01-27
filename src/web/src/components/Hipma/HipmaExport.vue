
<template>
	<div class="books">
		<h1>Health Information Export</h1>

		<v-row>
			<v-col
				cols="6"
				sm="6"
				md="6"
			>
				<v-menu
					ref="menu"
					v-model="menu"
					:close-on-content-click="false"
					:return-value.sync="date"
					transition="scale-transition"
					offset-y
					min-width="auto"
				>
					<template v-slot:activator="{ on, attrs }">
						<v-text-field
							v-model="date"
							label="From:"
							prepend-icon="mdi-calendar"
							readonly
							v-bind="attrs"
							v-on="on"
						></v-text-field>
					</template>
					<v-date-picker
					v-model="date"
					no-title
					scrollable
					>
						<v-spacer></v-spacer>
						<v-btn
							text
							color="primary"
							@click="menu = false"
						>
							Cancel
						</v-btn>
						<v-btn
							text
							color="primary"
							@click="$refs.menu.save(date)"
						>
							OK
						</v-btn>
					</v-date-picker>
				</v-menu>
			</v-col>

			<v-col
				cols="6"
				sm="6"
				md="6"
			>
				<v-menu
					ref="menuEnd"
					v-model="menuEnd"
					:close-on-content-click="false"
					:return-value.sync="dateEnd"
					transition="scale-transition"
					offset-y
					min-width="auto"
				>
					<template v-slot:activator="{ on, attrs }">
						<v-text-field
							v-model="dateEnd"
							label="To:"
							prepend-icon="mdi-calendar"
							readonly
							v-bind="attrs"
							v-on="on"
						></v-text-field>
					</template>
					<v-date-picker
					v-model="dateEnd"
					no-title
					scrollable
					>
						<v-spacer></v-spacer>
						<v-btn
							text
							color="primary"
							@click="menuEnd = false"
						>
							Cancel
						</v-btn>
						<v-btn
							text
							color="primary"
							@click="$refs.menuEnd.save(dateEnd)"
						>
							OK
						</v-btn>
					</v-date-picker>
				</v-menu>
			</v-col>
		</v-row>

		<v-row>
			<v-btn
				:loading="loadingExport"
				:disabled="loadingExport"
				color="#F3A901"
				class="pull-right ma-2 white--text"
				@click="exportFile()"
			>
				Export
				<v-icon
					right
					dark
				>
					mdi-cloud-download
				</v-icon>
			</v-btn>
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
		options: {},
		flagAlert: false,
		menu: false,
		date: null,
		menuEnd: false,
		dateEnd: null,
		selected: [],
		loader: null,
		loadingExport: false,
		headers: [
			{ text: "Confirmation Number", value: "confirmation_number", sortable: true},
			{ text: "Request Type", value: "HipmaRequestType", sortable: true},
			{ text: "Request Access to personal information", value: "AccessPersonalHealthInformation", sortable: true},
			{ text: "Applicant", value: "applicantFullName", sortable: true},
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

			setTimeout(() => (this[l] = false), 3000)

			this.loader = null;
		},
	},
	mounted() {
		this.getDataFromApi();
	},
	methods: {
		getDataFromApi() {
		this.loading = true;

			axios
			.get(HIPMA_URL)
			.then((resp) => {
				this.items = resp.data.data;
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
		exportFile () {
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
					"Get a copy of your health information ",
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
					"Copy Health Information",
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
