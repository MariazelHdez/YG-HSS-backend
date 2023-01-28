
<template>
    <div class="hipma-service">
        <span class="title-service">HIPMA Requests</span>
        <HipmaAlert v-show="flagAlert" v-bind:alertMessage="alertMessage"  v-bind:alertType="alertType"/>

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
                    class="ma-2 white--text"
                    :disabled="applyDisabled"
                    @click="changeStatus"
                    id="apply-btn"
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
//@change=""
export default {
  name: "HipmaIndex",
  data: () => ({
    loading: false,
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
    headers: [
        { text: "Confirmation Number", value: "confirmation_number", sortable: true},
        { text: "Request Type", value: "HipmaRequestType", sortable: true},
        { text: "Request Access to personal information", value: "AccessPersonalHealthInformation", sortable: true},
        { text: "Applicant", value: "applicantFullName", sortable: true},
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
                this.$router.push({
					path: '/hipma',
					query: { message: resp.data.message, type: resp.data.type}
				});
            })
            .catch((err) => console.error(err))
            .finally(() => {
                this.loading = false;
            });
        }
    },
};
</script>
