
<template>
    <div class="hipma-service">
        <p class="title-service mb-6">HIPMA Possible Duplicates</p>

        <ModuleAlert v-bind:alertMessage="alertMessage"  v-bind:alertType="alertType"/>
        <Notifications ref="notifier"></Notifications>

        <v-data-table
            dense
            :items="items"
            :headers="headers"
            :options.sync="options"
            :loading="loading"
            :search="search"
			id="duplicateDatatable"
			:item-class= "rowClass"
            :footer-props="{
                'items-per-page-options': [12, 24, 36]
            }"
            :items-per-page="12"
        >

            <template v-slot:[`item.showUrl`]="{ item }" >
                <v-icon color="white" @click="showDetails(item.showUrl)" v-if="item.showUrl">mdi-eye</v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script>
const axios = require("axios");
import Notifications from "../Notifications.vue";
import ModuleAlert from '../General/ModuleAlert.vue';
import { HIPMA_DUPLICATES } from "../../urls.js";

export default {
    name: "HipmaIndex",
    data: () => ({
        loading: false,
        date: null,
        flagAlert: false,
        menu: false,
        dateEnd: null,
        menuEnd: false,
        items: [],
        alertMessage: null,
        alertType: null,
        search: "",
        options: {},
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
			{ text: "Applicant", value: "applicant_full_name", sortable: false},
			{ text: "Date of Birth", value: "date_of_birth", sortable: false},
            { text: "Confirmation Number", value: "confirmation_number", sortable: false},
            { text: "Request Type", value: "hipma_request_type_desc", sortable: false},
            { text: "Created", value: "created_at", sortable: false},
            { text: "", value: "showUrl", sortable: false},
			{ title: '', key: 'data-table-expand' },
        ],
        page: 1,
        pageCount: 0,
        itemsPerPage: 10,
		expanded: [],
		singleExpand: false,
    }),
    components: {
        Notifications,
        ModuleAlert
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
    },
    mounted() {

        if (typeof this.$route.query.message !== undefined && typeof this.$route.query.type !== undefined){
            if(this.$route.query.type == "success"){
                this.$refs.notifier.showSuccess(this.$route.query.message);
            }else{
                this.alertMessage = this.$route.query.message;
                this.alertType = this.$route.query.type;
            }
        }

        this.getDataFromApi();
    },
    methods: {
		rowClass(item) {
			if (item.showUrl) {
				return "row-duplicate-number";
			}
		},
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
            this.selectedStatus = null;
            this.applyDisabled = true;
            this.getDataFromApi();
        },
        getDataFromApi() {
            this.loading = true;

            axios
            .post(HIPMA_DUPLICATES, {
                params: {
                    dateFrom: this.date,
                    dateTo: this.dateEnd,
                }
            })
            .then((resp) => {
                this.items = resp.data.data;
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
                this.selected = this.selected.length === this.items.length
                ? []
                : this.items
        },
        changeSelect(){
            this.applyDisabled = false;
        }
    },
};
</script>
