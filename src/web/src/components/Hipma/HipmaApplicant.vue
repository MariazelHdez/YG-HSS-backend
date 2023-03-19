<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Applicant's Information</v-expansion-panel-header>
			<v-expansion-panel-content>
                <v-simple-table>
                    <template v-slot:default>
                        <thead class="table-details-header">
                        <tr>
                            <th>
								<b>Field</b>
                            </th>
                            <th>
								<b>Value<span v-if="hipmaDuplicated">&nbsp;(Original Request)</span></b>
                            </th>
                            <th v-if="hipmaDuplicated">
								<b>Value&nbsp;(Duplicated Request)</b>
                            </th>
                        </tr>
                        </thead>
                        <tbody v-if="hipmaDuplicated">
                            <tr>
                                <td>First Name</td>
                                <td>{{ hipma.first_name }}</td>
                                <td>{{ hipmaDuplicated.first_name }}</td>
                            </tr>

                            <tr>
                                <td>Last Name</td>
                                <td>{{ hipma.last_name }}</td>
                                <td>{{ hipmaDuplicated.last_name }}</td>
                            </tr>

                            <tr>
                                <td>Birth Date</td>
                                <td>{{ hipma.date_of_birth }}</td>
                                <td>{{ hipmaDuplicated.date_of_birth }}</td>
                            </tr>

                            <tr>
                                <td>Address</td>
                                <td>{{ hipma.address }}</td>
                                <td>{{ hipmaDuplicated.address }}</td>
                            </tr>

                            <tr>
                                <td>City or Town</td>
                                <td>{{ hipma.city_or_town }}</td>
                                <td>{{ hipmaDuplicated.city_or_town }}</td>
                            </tr>

                            <tr>
                                <td>Postal Code</td>
                                <td>{{ hipma.postal_code }}</td>
                                <td>{{ hipmaDuplicated.postal_code }}</td>
                            </tr>

                            <tr>
                                <td>Email Address</td>
                                <td>{{ hipma.email_address }}</td>
                                <td>{{ hipmaDuplicated.email_address }}</td>
                            </tr>

                            <tr>
                                <td>Phone Number</td>
                                <td>{{ hipma.phone_number }}</td>
                                <td>{{ hipmaDuplicated.phone_number }}</td>
                            </tr>

                        </tbody>

                        <tbody v-else >
                            <tr v-if="hipma.first_name">
                                <td>First Name</td>
                                <td>{{ hipma.first_name }}</td>
                            </tr>

                            <tr v-if="hipma.last_name">
                                <td>Last Name</td>
                                <td>{{ hipma.last_name }}</td>
                            </tr>

                            <tr v-if="hipma.date_of_birth">
                                <td>Birth Date</td>
                                <td>{{ hipma.date_of_birth }}</td>
                            </tr>

                            <tr v-if="hipma.address">
                                <td>Address</td>
                                <td>{{ hipma.address }}</td>
                            </tr>

                            <tr v-if="hipma.city_or_town">
                                <td>City or Town</td>
                                <td>{{ hipma.city_or_town }}</td>
                            </tr>

                            <tr v-if="hipma.postal_code">
                                <td>Postal Code</td>
                                <td>{{ hipma.postal_code }}</td>
                            </tr>

                            <tr v-if="hipma.email_address">
                                <td>Email Address</td>
                                <td>{{ hipma.email_address }}</td>
                            </tr>

                            <tr v-if="hipma.phone_number">
                                <td>Phone Number</td>
                                <td>{{ hipma.phone_number }}</td>
                        </tr>

                        </tbody>
                    </template>
				</v-simple-table>
			</v-expansion-panel-content>
        </v-expansion-panel>

	</v-expansion-panels>

</template>
<script>
export default {
    name: 'HipmaApplicant',
    props: ['hipma', 'hipmaDuplicated', 'panelModel'],
	data () {
		return {
			modelPanel: this.panelModel
		}
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		}
	},

}
</script>