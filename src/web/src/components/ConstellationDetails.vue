<template>
  <div class="books">
    <h1>Constellation Health Requests</h1>

     <v-expansion-panels
        v-model="panel"
        :disabled="disabled"
        multiple
      >
        <v-expansion-panel>
          <v-expansion-panel-header>Applicant Information</v-expansion-panel-header>
          <v-expansion-panel-content>
                <v-simple-table>
                    <template v-slot:default>
                        <thead>
                        <tr>
                            <th class="text-center">
                            Field
                            </th>
                            <th class="text-center">
                            Value
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
                        <tr>
                            <td>Legal Name</td>
                            <td>{{ itemsConstellation.your_legal_name }}</td>
                        </tr>
                        <tr>
                            <td>Pronouns</td>
                            <td>{{ itemsConstellation.pronouns }}</td>
                        </tr>
                        <tr>
                            <td>Date of birth</td>
                            <td>{{ itemsConstellation.date_of_birth }}</td>
                        </tr>
                        <tr>
                            <td>YHCIP</td>
                            <td>{{ itemsConstellation.yhcip }}</td>
                        </tr>
                        <tr>
                            <td>Postal code</td>
                            <td>{{ itemsConstellation.postal_code }}</td>
                        </tr>
                        <tr>
                            <td>Phone number</td>
                            <td>{{ itemsConstellation.phone_number }}</td>
                        </tr>
                        <tr>
                            <td>Email Address</td>
                            <td>{{ itemsConstellation.email_address }}</td>
                        </tr>
                        <tr>
                            <td>Preferred language</td>
                            <td>{{ itemsConstellation.language_prefer_to_receive_services }}</td>
                        </tr>
                        </tbody>
                    </template>
                </v-simple-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
  
        <v-expansion-panel>
          <v-expansion-panel-header>Demographic Information</v-expansion-panel-header>
          <v-expansion-panel-content>

          </v-expansion-panel-content>
        </v-expansion-panel>
  
        <v-expansion-panel>
          <v-expansion-panel-header>Panel 3</v-expansion-panel-header>
          <v-expansion-panel-content>

          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

  </div>
</template>

<script>
const axios = require("axios");

export default {
  name: "Grid",
  data: () => ({
    loading: false,
    itemsConstellation: [],
  }),
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
  mounted() {
    this.getDataFromApi();
  },
  methods: {
    getDataFromApi() {
      this.loading = true;

      axios
        .get("http://localhost:3000/api/constellation/show")
        .then((resp) => {

            this.itemsConstellation = resp.data.dataConstellation;
            //this.pagination.totalLength = resp.data.meta.count;
            //this.totalLength = resp.data.meta.count;

            //console.log(this.totalLength);

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
