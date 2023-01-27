<template>

	<v-expansion-panels
        multiple
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Behalf Information</v-expansion-panel-header>
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
								<td>Situation</td>
								<td>{{ hipma.HipmaSituations }}</td>
							</tr>
							<tr>
								<td>First Name Behalf</td>
								<td>{{ hipma.first_name_behalf }}</td>
							</tr>

							<tr>
								<td>Last Name Behalf</td>
								<td>{{ hipma.last_name_behalf }}</td>
							</tr>

							<tr>
								<td>Company Behalf</td>
								<td>{{ hipma.company_or_organization_optional_behalf }}</td>
							</tr>

							<tr>
								<td>Address Behalf</td>
								<td>{{ hipma.address_behalf }}</td>
							</tr>

							<tr>
								<td>City or Town Behalf</td>
								<td>{{ hipma.city_or_town_behalf }}</td>
							</tr>

							<tr>
								<td>Postal Code Behalf</td>
								<td>{{ hipma.postal_code_behalf }}</td>
							</tr>

							<tr>
								<td>Email Behalf</td>
								<td>{{ hipma.email_address_behalf }}</td>
							</tr>

							<tr>
								<td>Phone Number Behalf</td>
								<td>{{ hipma.phone_number_behalf }}</td>
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
    name: 'HipmaBehalf',
    props: ['hipma', 'hipmaFiles'],
	data () {
		return {
			loader: null,
			loading: false
		}
	},
	watch: {
		loader () {
			const l = this.loader;
			this[l] = !this[l];

			setTimeout(() => (this[l] = false), 3000)

			this.loader = null;
		},
	},

}
</script>