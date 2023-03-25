
<template>
	<div class="midwifery-service">
		<span class="title-service">Midwifery Export</span>

		<v-row>
			<v-col
				cols="6"
				sm="6"
				md="8"
				class='d-flex'
			>
			<v-select
				:items="itemsStatus"
				:menu-props="{ maxHeight: '400' }"
				label="Select"
				multiple
				persistent-hint
				v-model="selectedStatus"
				@change="changeSelect"
				id="export-status-select"
			></v-select>
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
				<v-col sm="auto" id="reset-btn">
          <v-icon @click="resetInputs"> mdi-filter-remove </v-icon>
        </v-col>
				<v-btn
					:loading="loadingExport"
					:disabled="loadingExport"
					color="#F3A901"
					class="ma-2 white--text apply-btn"
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
			</v-col>
		</v-row>
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
import { MIDWIFERY_URL } from "../../urls.js";
import { MIDWIFERY_EXPORT_FILE_URL } from "../../urls.js";
import { utils, writeFileXLSX  } from 'xlsx';

export default {
	name: "MidwiferyExport",
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
		itemsStatus: [],
		selectedStatus: null,
		loader: null,
		loadingExport: false,
		loadingReset: false,
		headers: [
			{ text: "Preferred Name", value: "preferred_name", sortable: true},
			{ text: "Phone", value: "preferred_phone", sortable: true},
			{ text: "Email", value: "preferred_email", sortable: true},
			{ text: "Is this your first pregnancy?", value: "first_pregnancy", sortable: true},
			{ text: "Due Date", value: "due_date", sortable: true},
			{ text: "Preferred Birth Location", value: "birth_locations", sortable: true},
			{ text: "Medical Concerns with Pregnancy", value: "medical_concerns", sortable: true},
			{ text: "Major Medical Conditions", value: "major_medical_conditions", sortable: true},
			{ text: "Status", value: "status_description", sortable: true},
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
				this.getDataFromApi();
			}
		},
		changeSelect(){
			this.getDataFromApi();
		},
		getDataFromApi() {
			this.loading = true;
			axios
			.post(MIDWIFERY_URL, {
				params: {
					dateFrom: this.date,
					dateTo: this.dateEnd,
					status: this.selectedStatus
				}
			})
			.then((resp) => {
				this.items = resp.data.data;
				this.itemsStatus = resp.data.dataStatus.filter((element) => element.value != 4);
				this.loading = false;
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loading = false;
			});
		},
		selectAll() {
			this.selected = this.selected.length === this.items.length
			? []
			: this.items
		},
		resetInputs() {
			this.loader = 'loadingReset';
			this.date = null;
			this.dateEnd = null;
			this.selectedStatus = null;
			this.getDataFromApi();
		},
		exportFile () {
			this.loader = 'loadingExport';
			let requests = [];
			let checked = this.selected;
			console.log(checked.length);
			if(checked.length > 0){
				checked.forEach(function (value) {
					requests.push(value.id);
				});
			}

			axios
			.post(MIDWIFERY_EXPORT_FILE_URL, {
				params: {
					requests: requests,
					dateFrom: this.date,
					dateTo: this.dateEnd,
					status: this.selectedStatus
				}
			})
			.then((resp) => {

				const ws = utils.json_to_sheet(resp.data.data);
				const wb = utils.book_new();
				utils.book_append_sheet(wb, ws, "Midwifery Requests");

				utils.sheet_add_aoa(ws, [[
					"Confirmation number",
					"First name",
					"Last name",
					"Preferred name",
					"Pronouns",
					"Yukon health insurance",
					"Need interpretation",
					"Preferred phone",
					"Preferred email",
					"Is okay to leave message",
					"Date confirmed",
					"Is this your first pregnancy?",
					"How many vaginal births",
					"How many c-section births",
					"Complications with previous",
					"Provide details",
					"Midwife before",
					"Medical Concerns with Pregnancy",
					"Provide details2",
					"Have you had primary healthcare?",
					"Menstrual cycle length",
					"Family physician",
					"Physician's name",
					"Major medical conditions",
					"Provide details3",
					"Do you identify with one or more of these groups and communities",
					"How did you find out about the midwifery clinic",
					"Birth location",
					"Preferred contact",
					"Date of birth",
					"When was the first day of your last period",
					"Due date",
					"Created at",
					"Updated at",
					"Community located",
					"Preferred language"
				]], { origin: "A1" });

				writeFileXLSX(wb, resp.data.fileName);

				this.loading = false;
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loading = false;
			});
		},
	},
};
</script>
