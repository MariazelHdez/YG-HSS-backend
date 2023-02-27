
<template>
    <div class="hipma-service">
        <span class="title-service">HIPMA Possible Duplicates</span>

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
        >

            <template v-slot:[`item.showUrl`]="{ item }">
                <v-icon color="white" @click="showDetails(item.showUrl)" v-if="item.showUrl">mdi-eye</v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script>
const axios = require("axios");
import Notifications from "../Notifications.vue";
import { HIPMA_DUPLICATES } from "../../urls.js";

export default {
    name: "HipmaIndex",
    data: () => ({
        loading: false,
        date: null,
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
			{ text: "Applicant", value: "applicantfullname", sortable: true},
			{ text: "Date of Birth", value: "date_of_birth", sortable: true},
            { text: "Confirmation Number", value: "confirmation_number", sortable: true},
            { text: "Request Type", value: "HipmaRequestType", sortable: true},
            { text: "Created", value: "created_at", sortable: true},
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
        Notifications
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
        }
    },
};
</script>
