<template>
  <div class="constellation-service">
    <span class="title-service">Constellation Health Requests</span>
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
			item-key="constellation_health_id"
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
import { CONSTELLATION_URL, CONSTELLATION_EXPORT_FILE_URL } from "../../urls.js";
import { utils, writeFileXLSX } from "xlsx";
export default {
  name: "ConstellationIndex",
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
  }),
  computed: {
    headers() {
      return [
        {
          text: "Legal Name",
          value: "your_legal_name",
          width: "15%",
          sortable: true,
        },
        {
          text: "Date of Birth",
          value: "date_of_birth",
          width: "11%",
          sortable: true,
        },
        {
          text: "Do you have a family physician?",
          value: "family_physician",
          width: "15%",
          sortable: true,
        },
        {
          text: "Diagnosis/History",
          value: "diagnosis",
          sortable: true,
        },
        {
          text: "Created",
          value: "created_at",
          width: "15%",
          sortable: true,
          filter: (value) => {
            if (!this.dateFormattedMin || !this.dateFormattedMax) return true;
            const dateMin = new Date(Date.parse(this.dateMin));
            const dateMax = new Date(Date.parse(this.dateMax));
            const date = new Date(Date.parse(value.substr(0, 10)));

            return date >= dateMin && date <= dateMax;
          },
        },
        {
          text: "Status",
          value: "status",
          sortable: true,
          width: "10%",
          filter: (value) => {
            if (!this.actionToFilter) return true;
            return value === this.actionToFilter;
          },
        },
      ];
    },
  },
  components: {
  },
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
        .post(CONSTELLATION_URL, {
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
      var idArray = [];
      this.itemsSelected.forEach((e) => {
        idArray.push(e.constellation_health_id);
      });
      axios
        .post(CONSTELLATION_EXPORT_FILE_URL, {
				params: {
					requests: idArray,
					status: this.actionSelected,
					dateFrom: this.dateMin,
					dateTo: this.dateMax
				}
			}).then((resp) => {
          const ws = utils.json_to_sheet(resp.data.dataConstellation);
          const wb = utils.book_new();
          utils.book_append_sheet(wb, ws, "Constellation Requests");

          utils.sheet_add_aoa(
            ws,
            [
              [
                "First name",
                "Last name",
                "Is this your legal name?",
                "Legal name",
                "Pronouns",
                "Date of birth",
                "Do you have a Yukon health care card?",
                "Health care card number",
                "YHCIP",
                "Postal code",
                "Prefer to be contacted",
                "Phone Number",
                "Email",
                "Leave phone message",
                "Language prefer to receive services",
                "Interpretation support",
                "Family physician",
                "Current family physician",
                "Accessing health care",
                "Diagnosis or history",
                "Demographic groups",
                "Include family members",
                "created_at",
              ],
            ],
            { origin: "A1" }
          );
          const ws2 = utils.json_to_sheet(resp.data.dataFamilyMembers);
          utils.book_append_sheet(wb, ws2, "Const. Health Family Members");
          utils.sheet_add_aoa(
            ws2,
            [
              [
                "Client name",
                "First name family member",
                "Last name family member",
                "Legal name family member",
                "Pronouns family member",
                "Date of birth family member",
                "Do you have a Yukon health care card?",
                "Health care card number",
                "Which province or territory is this card from?",
                "YHCIP family member",
                "Relationship",
                "Language prefer to receive services",
                "Other language",
                "Interpretation support",
                "Family physician",
                "Current family physician",
                "Accessing health care family member",
                "Diagnosis or history family member",
                "Demographic groups family member",
              ],
            ],
            { origin: "A1" }
          );

          writeFileXLSX(wb, "Constellation_request.xlsx");

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
