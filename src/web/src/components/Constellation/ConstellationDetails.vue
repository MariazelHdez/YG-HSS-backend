<template>
  <div class="books">
    <h1>Constellation Health Requests</h1>

      <v-expansion-panels
        multiple
      >
        <v-expansion-panel>
          <v-expansion-panel-header>Applicant Personal Information</v-expansion-panel-header>
          <v-expansion-panel-content>
                <v-simple-table>
                    <template v-slot:default>
                        <thead class="table-details-header">
                        <tr>
                            <th>
                              <b>Field</b>
                            </th>
                            <th>
                              <b>Value</b>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>First Name</td>
                            <td>{{ itemsConstellation.first_name }}</td>
                        </tr>
                        <tr>
                            <td>Last Name</td>
                            <td>{{ itemsConstellation.last_name }}</td>
                        </tr>
                        <tr>
                            <td>Is this your legal name?</td>
                            <td>{{ itemsConstellation.is_this_your_legal_name_ }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.your_legal_name">
                            <td>Legal Name</td>
                            <td>{{ itemsConstellation.your_legal_name }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.pronouns">
                            <td>Pronouns</td>
                            <td>{{ itemsConstellation.pronouns }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.date_of_birth">
                            <td>Date of birth</td>
                            <td>{{ itemsConstellation.date_of_birth }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.have_yhcip">
                            <td>Do you have a Yukon health care card?</td>
                            <td>{{ itemsConstellation.have_yhcip }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.yhcip">
                            <td>Health care card number</td>
                            <td>{{ itemsConstellation.yhcip }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.health_care_card">
                            <td>Health care card number</td>
                            <td>{{ itemsConstellation.health_care_card }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.province">
                            <td>Which province or territory is this card from?</td>
                            <td>{{ itemsConstellation.province }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.postal_code">
                            <td>Postal code</td>
                            <td>{{ itemsConstellation.postal_code }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.prefer_to_be_contacted">
                            <td>How would you prefer to be contacted?</td>
                            <td>{{ itemsConstellation.prefer_to_be_contacted }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.phone_number">
                            <td>Phone number</td>
                            <td>{{ itemsConstellation.phone_number }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.email_address">
                            <td>Email Address</td>
                            <td>{{ itemsConstellation.email_address }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.leave_phone_message">
                            <td>Is it okay to leave a message at this number?</td>
                            <td>{{ itemsConstellation.leave_phone_message }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.language_prefer_to_receive_services">
                            <td>What language would you prefer to receive services in?</td>
                            <td>{{ itemsConstellation.language_prefer_description }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.preferred_language">
                            <td>Other language</td>
                            <td>{{ itemsConstellation.preferred_language }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.interpretation_support">
                            <td>If accepted, would you prefer interpretation support to attend appointments with an English provider?</td>
                            <td>{{ itemsConstellation.interpretation_support }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.demographics_groups">
                            <td>Do you identify with one or more of these groups?</td>
                            <td>{{ itemsConstellation.demographic_description }}</td>
                        </tr>
                        </tbody>
                    </template>
                </v-simple-table>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>Other Information</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-simple-table>
                    <template v-slot:default>
                        <thead class="table-details-header">
                        <tr>
                            <th>
                              <b>Field</b>
                            </th>
                            <th>
                              <b>Value</b>
                            </th>
                        </tr>
                        </thead>
                        <tbody>

                        <tr v-if="itemsConstellation.family_physician">
                            <td>Do you currently have a family physician?</td>
                            <td>{{ itemsConstellation.family_physician }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.current_family_physician">
                            <td>Who is your current family physician?</td>
                            <td>{{ itemsConstellation.current_family_physician }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.accessing_health_care">
                            <td>Where have you been accessing health care?</td>
                            <td>{{ itemsConstellation.accessing_health_care }}</td>
                        </tr>

                        <tr v-if="itemsConstellation.diagnosis">
                            <td>We want to ensure that all types of families and people have access to the CSCHC.</td>
                            <td>{{ itemsConstellation.diagnosis }}</td>
                        </tr>
                        </tbody>
                    </template>
                </v-simple-table>
          </v-expansion-panel-content>
        </v-expansion-panel>

      </v-expansion-panels>

      <ConstellationFamilyMembers v-bind:familyMembers="itemsConstellationFamily"/>

  </div>
</template>

<script>
const axios = require("axios");
import ConstellationFamilyMembers from './ConstellationFamilyMembers.vue';
import { CONSTELLATION_SHOW_URL } from "../../urls.js";
import { CONSTELLATION_VALIDATE_URL } from "../../urls.js";

export default {
  name: "Grid",
  data: () => ({
    loading: false,
    itemsConstellation: [],
    itemsConstellationFamily: [],
  }),
  components: {
    ConstellationFamilyMembers
  },
  created(){
    this.validateRecord();
  },
  mounted() {
    this.getDataFromApi();
  },
  methods: {
    validateRecord() {
      axios
        .get(CONSTELLATION_VALIDATE_URL+this.$route.params.constellationHealth_id)
        .then((resp) => {
            if(!resp.data.flagConstellation){
              this.$router.push({
                path: '/constellation',
                query: { message: resp.data.message, type: resp.data.type}
              });
            }
        })
        .catch((err) => console.error(err))
        .finally(() => {
        });
    },
    getDataFromApi() {
      axios
        .get(CONSTELLATION_SHOW_URL+this.$route.params.constellationHealth_id)
        .then((resp) => {

            this.itemsConstellation = resp.data.dataConstellation;
            this.itemsConstellationFamily = resp.data.dataConstellationFamily;

        })
        .catch((err) => console.error(err))
        .finally(() => {
        });
    },
  },
};
</script>
