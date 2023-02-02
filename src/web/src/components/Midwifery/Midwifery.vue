
<template>
    <div class="midwifery-service">
        <span class="title-service">Midwifery Requests</span>

        <MidwiferyAlert v-show="flagAlert" v-bind:alertMessage="alertMessage"  v-bind:alertType="alertType"/>

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
import MidwiferyAlert from './MidwiferyAlert.vue';
import { MIDWIFERY_URL } from "../../urls.js";
import { MIDWIFERY_CHANGE_STATUS_URL } from "../../urls.js";

export default {
  name: "MidwiferyIndex",
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
    itemsBulk: [],
    selectedStatus: null,
    headers: [
        { text: "Preferred Name", value: "preferred_name", sortable: true},
        { text: "Phone", value: "preferred_phone", sortable: true},
        { text: "Email", value: "preferred_email", sortable: true},
        { text: "Is this your first pregnancy?", value: "first_pregnancy", sortable: true},
        { text: "Due Date", value: "due_date", sortable: true},
        { text: "Preferred Birth Location", value: "birth_locations", sortable: true},
        { text: "Medical Concerns with Pregnancy", value: "medical_concerns", sortable: true},
        { text: "Major Medical Conditions", value: "major_medical_conditions", sortable: true},
        { text: "Do you identify with any of these groups and communities?", value: "do_you_identify_with_one_or_more_of_these_groups_and_communitie", sortable: true},
        { text: "Created", value: "created_at", sortable: true},
        { text: "", value: "status_description", sortable: true},
        { text: "", value: "showUrl", sortable: false},
    ],
    page: 1,
    pageCount: 0,
    iteamsPerPage: 10,
  }),
  components: {
    MidwiferyAlert
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
            .get(MIDWIFERY_URL)
            .then((resp) => {
                this.items = resp.data.data;
                this.itemsBulk = resp.data.dataStatus;
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

                axios
                .patch(MIDWIFERY_CHANGE_STATUS_URL, {
                    params: {
                        requests: requests,
                        requestStatus: this.selectedStatus
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
        }
    },
};
</script>
