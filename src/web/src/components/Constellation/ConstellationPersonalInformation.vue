<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
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
								<b>Value&nbsp;(Original Request)</b>
                            </th>
                            <th>
								<b>Value&nbsp;(Duplicated Request)</b>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr>
								<td>First Name</td>
								<td>{{ constellation.first_name }}</td>
								<td>{{ constellationDuplicated.first_name }}</td>
							</tr>
							<tr>
								<td>Last Name</td>
								<td>{{ constellation.last_name }}</td>
								<td>{{ constellationDuplicated.last_name }}</td>
							</tr>
							<tr>
								<td>Is this your legal name?</td>
								<td>
									{{ constellation.is_this_your_legal_name_ }}
								</td>
								<td>
									{{ constellationDuplicated.is_this_your_legal_name_ }}
								</td>
							</tr>

							<tr>
								<td>Legal Name</td>
								<td>{{ constellation.your_legal_name }}</td>
								<td>{{ constellationDuplicated.your_legal_name }}</td>
							</tr>

							<tr>
								<td>Pronouns</td>
								<td>{{ constellation.pronouns }}</td>
								<td>{{ constellationDuplicated.pronouns }}</td>
							</tr>

							<tr>
								<td>Date of birth</td>
								<td>{{ constellation.date_of_birth }}</td>
								<td>{{ constellationDuplicated.date_of_birth }}</td>
							</tr>

							<tr>
								<td>Do you have a Yukon health care card?</td>
								<td>{{ constellation.have_yhcip }}</td>
								<td>{{ constellationDuplicated.have_yhcip }}</td>
							</tr>

							<tr>
								<td>Health care card number</td>
								<td>{{ constellation.yhcip }}</td>
								<td>{{ constellationDuplicated.yhcip }}</td>
							</tr>

							<tr>
								<td>Health care card number</td>
								<td>{{ constellation.health_care_card }}</td>
								<td>{{ constellationDuplicated.health_care_card }}</td>
							</tr>

							<tr>
								<td>
									Which province or territory is this card from?
								</td>
								<td>{{ constellation.province }}</td>
								<td>{{ constellationDuplicated.province }}</td>
							</tr>

							<tr>
								<td>Postal code</td>
								<td>{{ constellation.postal_code }}</td>
								<td>{{ constellationDuplicated.postal_code }}</td>
							</tr>

							<tr>
								<td>How would you prefer to be contacted?</td>
								<td>
									{{ constellation.prefer_to_be_contacted }}
								</td>
								<td>
									{{ constellationDuplicated.prefer_to_be_contacted }}
								</td>
							</tr>

							<tr>
								<td>Phone number</td>
								<td>{{ constellation.phone_number }}</td>
								<td>{{ constellationDuplicated.phone_number }}</td>
							</tr>

							<tr>
								<td>Email Address</td>
								<td>{{ constellation.email_address }}</td>
								<td>{{ constellationDuplicated.email_address }}</td>
							</tr>

							<tr>
								<td>Is it okay to leave a message at this number?</td>
								<td>{{ constellation.leave_phone_message }}</td>
								<td>{{ constellationDuplicated.leave_phone_message }}</td>
							</tr>

							<tr>
								<td>
									What language would you prefer to receive services
									in?
								</td>
								<td>
									{{ constellation.language_prefer_description }}
								</td>
								<td>
									{{ constellationDuplicated.language_prefer_description }}
								</td>
							</tr>

							<tr>
								<td>Other language</td>
								<td>{{ constellation.preferred_language }}</td>
								<td>{{ constellationDuplicated.preferred_language }}</td>
							</tr>

							<tr>
								<td>
									If accepted, would you prefer interpretation support
									to attend appointments with an English provider?
								</td>
								<td>
									{{ constellation.interpretation_support }}
								</td>
								<td>
									{{ constellationDuplicated.interpretation_support }}
								</td>
							</tr>

							<tr>
								<td>
									Do you identify with one or more of these groups?
								</td>
								<td>
									{{ constellation.demographic_description }}
								</td>
								<td>
									{{ constellationDuplicated.demographic_description }}
								</td>
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
    name: 'ConstellationPersonalInformation',
    props: ['constellation', 'constellationDuplicated', 'panelModel'],
	data() {
		return {
			modelPanel: this.panelModel
		};
	},
	watch: {
		panelModel(newValue) {
			this.modelPanel = newValue;
		}
	},
}
</script>