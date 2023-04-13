<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
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
								<b>Value<span v-if="hipmaDuplicated">&nbsp;(Original Request)</span></b>
                            </th>
							<th v-if="hipmaDuplicated">
								<b>Value&nbsp;(Duplicated Request)</b>
                            </th>
                        </tr>
                        </thead>
						<tbody v-if="hipmaDuplicated">
							<tr>
								<td>Situation</td>
								<td>{{ hipma.hipma_situations_desc }}</td>
								<td>{{ hipmaDuplicated.hipma_situations_desc }}</td>
							</tr>
							<tr>
								<td>First Name Behalf</td>
								<td>{{ hipma.first_name_behalf }}</td>
								<td>{{ hipmaDuplicated.first_name_behalf }}</td>
							</tr>

							<tr>
								<td>Last Name Behalf</td>
								<td>{{ hipma.last_name_behalf }}</td>
								<td>{{ hipmaDuplicated.last_name_behalf }}</td>
							</tr>

							<tr>
								<td>Company Behalf</td>
								<td>{{ hipma.company_or_organization_optional_behalf }}</td>
								<td>{{ hipmaDuplicated.company_or_organization_optional_behalf }}</td>
							</tr>

							<tr>
								<td>Address Behalf</td>
								<td>{{ hipma.address_behalf }}</td>
								<td>{{ hipmaDuplicated.address_behalf }}</td>
							</tr>

							<tr>
								<td>City or Town Behalf</td>
								<td>{{ hipma.city_or_town_behalf }}</td>
								<td>{{ hipmaDuplicated.city_or_town_behalf }}</td>
							</tr>

							<tr>
								<td>Postal Code Behalf</td>
								<td>{{ hipma.postal_code_behalf }}</td>
								<td>{{ hipmaDuplicated.postal_code_behalf }}</td>
							</tr>

							<tr>
								<td>Email Behalf</td>
								<td>{{ hipma.email_address_behalf }}</td>
								<td>{{ hipmaDuplicated.email_address_behalf }}</td>
							</tr>

							<tr>
								<td>Phone Number Behalf</td>
								<td>{{ hipma.phone_number_behalf }}</td>
								<td>{{ hipmaDuplicated.phone_number_behalf }}</td>
							</tr>

                        </tbody>

                        <tbody v-else >
							<tr>
								<td>Situation</td>
								<td>{{ hipma.hipma_situations_desc }}</td>
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
    props: ['hipma', 'hipmaDuplicated', 'hipmaFiles', 'panelModel'],
	data () {
		return {
			loader: null,
			loading: false,
			modelPanel: this.panelModel
		}
	},
	watch: {
		loader () {
			const l = this.loader;
			this[l] = !this[l];

			setTimeout(() => (this[l] = false), 3000)

			this.loader = null;
		},
		panelModel(newValue) {
			this.modelPanel = newValue;
		}
	},

}
</script>