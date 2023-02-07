
<template>
    <div class="hipma-service">
        <span class="title-service">HIPMA Requests</span>

        <HipmaAlert v-show="flagAlert" v-bind:alertMessage="alertMessage"  v-bind:alertType="alertType"/>
        
        <v-row>
          <v-col
            class='d-flex'
    				cols="6"
    				sm="6"
    				md="6"
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
        <v-col sm="auto" v-if="removeFilters">
          <v-icon @click="resetInputs"> mdi-filter-remove </v-icon>
        </v-col>
      </v-row>
        <v-row 
            align="center" 
            class="container-actions"
        >
            <v-col
                cols="12"
                sm="3"
                class="actions"
            >
                <v-select
                    :items="itemsBulk"
                    solo
                    label="Bulk Actions"
                    append-icon="mdi-chevron-down"
                    prepend-inner-icon="mdi-layers-triple"
                    color="grey lighten-2"
                    item-color="grey lighten-2"
                    v-model="selectedStatus"
                    @change="changeSelect"
                    id="bulk-accion-select"
                ></v-select>
            </v-col>
            <v-col 
                class="align-start"
                cols="12"
                sm="3"
            >
                <v-btn
                    color="#F3A901"
                    class="ma-2 white--text apply-btn"
                    :disabled="applyDisabled"
                    :loading="loadingApply"
                    @click="changeStatus"
                >
                    Apply
                </v-btn>
            </v-col>
        </v-row>

        <!-- <v-text-field v-model="search" label="Search"></v-text-field> -->

        <v-data-table
            dense
            :items="items"
            :headers="headers"
            :options.sync="options"
            :loading="loading"
            :search="search"
            v-model="selected"
            show-select
            checkbox-color="black"
            :value="selected"
            @toggle-select-all="selectAll"
        >
        <template v-slot:[`item.showUrl`]="{ item }">
            <v-icon @click="showDetails(item.showUrl)">mdi-eye</v-icon>
        </template>
        </v-data-table>
    </div>
</template>

<script>
const axios = require("axios");
import HipmaAlert from './HipmaAlert.vue';
import { HIPMA_URL } from "../../urls.js";
import { HIPMA_CHANGE_STATUS_URL } from "../../urls.js";

export default {
  name: "HipmaIndex",
  data: () => ({
    loading: false,
    date: null,
    menu: false,
    dateEnd: null,
    menuEnd: false,
    items: [],
    alertMessage: "",
    alertType: "",
    search: "",
    options: {},
    flagAlert: false,
    selected: [],
    applyDisabled: true,
    itemsBulk: [{
        text: "Mark as closed",
        value: "closed"
    }],
    selectedStatus: null,
    loader: null,
    loadingApply: false,
    headers: [
        { text: "Confirmation Number", value: "confirmation_number", sortable: true},
        { text: "Request Type", value: "HipmaRequestType", sortable: true},
        { text: "Request Access to personal information", value: "AccessPersonalHealthInformation", sortable: true},
        { text: "Applicant", value: "applicantfullname", sortable: true},
        { text: "Created", value: "created_at", sortable: true},
        { text: "", value: "showUrl", sortable: false},
    ],
    page: 1,
    pageCount: 0,
    iteamsPerPage: 10,
  }),
  components: {
    HipmaAlert
  },
  watch: {
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    search: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    loader () {
        const l = this.loader
        this[l] = !this[l]

        setTimeout(() => (this[l] = false), 2000)

        this.loader = null
    },
  },
    created(){
        if (typeof this.$route.query.message !== 'undefined' && typeof this.$route.query.type !== 'undefined'){
            this.flagAlert = true;
            this.alertMessage = this.$route.query.message;
            this.alertType = this.$route.query.type;
        }
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
    		removeFilters() {
          return this.date || this.dateEnd ;
        },
        resetInputs() {
    			this.date = null;
    			this.dateEnd = null;
    			this.getDataFromApi();
    		},
        getDataFromApi() {
            this.loading = true;

            axios
            .post(HIPMA_URL, {
      				params: {
      					dateFrom: this.date,
      					dateTo: this.dateEnd,
      				}
      			})
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
        showDetails (route) {
            this.$router.push({ path: route });
        },
        selectAll() {
                //event.value - boolen value if needed
                this.selected = this.selected.length === this.items.length
                ? []
                : this.items
        },
        changeSelect(){
            this.applyDisabled = false;
        },
        changeStatus(){
            this.loader = 'loadingApply';
            this.applyDisabled = false;
            let requests = [];
			let checked = this.selected;

			if(checked.length > 0){
				checked.forEach(function (value) {
					requests.push(value.id);
				});
			}

            axios
            .patch(HIPMA_CHANGE_STATUS_URL, {
                params: {
					requests: requests
				}
            })
            .then((resp) => {
                this.getDataFromApi();
                this.selectedStatus = null;
                this.flagAlert = true;
                this.applyDisabled = true;
                this.alertMessage = resp.data.message;
                this.alertType = resp.data.type;
            })
            .catch((err) => console.error(err))
            .finally(() => {
                this.loading = false;
            });
        }
    },
};
</script>
