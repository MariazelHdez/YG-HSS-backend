<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Medical Information</v-expansion-panel-header>
			<v-expansion-panel-content>
                <v-simple-table>
                    <template v-slot:default>
                        <thead class="table-details-header">
                        <tr>
                            <th>
								<b>Field</b>
                            </th>
                            <th>
								<b>Value<span v-if="midwiferyDuplicated">&nbsp;(Original Request)</span></b>
                            </th>
							<th v-if="midwiferyDuplicated">
								<b>Value&nbsp;(Duplicated Request)</b>
							</th>
                        </tr>
                        </thead>
						<tbody v-if="midwiferyDuplicated">
							<tr>
								<td>When was the first day of your last period?</td>
								<td>{{ midwifery.when_was_the_first_day_of_your_last_period_ }}</td>
								<td>{{ midwiferyDuplicated.when_was_the_first_day_of_your_last_period_ }}</td>
							</tr>

							<tr>
								<td>When is this baby due?</td>
								<td>{{ midwifery.due_date }}</td>
								<td>{{ midwiferyDuplicated.due_date }}</td>
							</tr>

							<tr>
								<td>Has this due date been confirmed by ultrasound?</td>
								<td>{{ options[midwifery.date_confirmed] }}</td>
								<td>{{ options[midwiferyDuplicated.date_confirmed] }}</td>
							</tr>

							<tr>
								<td>Is this your first pregnancy?</td>
								<td>{{ options[midwifery.first_pregnancy] }}</td>
								<td>{{ options[midwiferyDuplicated.first_pregnancy] }}</td>
							</tr>

							<tr>
								<td>How many vaginal births have you had?</td>
								<td>{{ midwifery.how_many_vaginal_births }}</td>
								<td>{{ midwiferyDuplicated.how_many_vaginal_births }}</td>
							</tr>

							<tr>
								<td>How many C-section births have you had?</td>
								<td>{{ midwifery.how_many_c_section_births }}</td>
								<td>{{ midwiferyDuplicated.how_many_c_section_births }}</td>
							</tr>

							<tr>
								<td>
									Have you had any complications with a previous pregnancy or labour?
								</td>
								<td>{{ options[midwifery.complications_with_previous] }}</td>
								<td>{{ options[midwiferyDuplicated.complications_with_previous] }}</td>
							</tr>

							<tr>
								<td>C-section births Details</td>
								<td>{{ midwifery.provide_details }}</td>
								<td>{{ midwiferyDuplicated.provide_details }}</td>
							</tr>

							<tr>
								<td>
									Have you had a midwife before?
								</td>
								<td>{{ options[midwifery.midwife_before] }}</td>
								<td>{{ options[midwiferyDuplicated.midwife_before] }}</td>
							</tr>

							<tr>
								<td>Where would you like to give birth?</td>
								<td>{{ midwifery.birth_locations }}</td>
								<td>{{ midwiferyDuplicated.birth_locations }}</td>
							</tr>

							<tr>
								<td>
									Do you know of any medical concerns with your current pregnancy?
								</td>
								<td>{{ options[midwifery.medical_concerns] }}</td>
								<td>{{ options[midwiferyDuplicated.medical_concerns] }}</td>
							</tr>

							<tr>
								<td>Medical Concerns Details</td>
								<td>{{ midwifery.provide_details2 }}</td>
								<td>{{ midwiferyDuplicated.provide_details2 }}</td>
							</tr>

							<tr>
								<td>
									Have you received care from a primary health care provider for this pregnancy?
								</td>
								<td>{{ options[midwifery.have_you_had_primary_health_care] }}</td>
								<td>{{ options[midwiferyDuplicated.have_you_had_primary_health_care] }}</td>
							</tr>
						</tbody>
                        <tbody v-else >
							<tr v-if="midwifery.when_was_the_first_day_of_your_last_period_">
								<td>When was the first day of your last period?</td>
								<td>{{ midwifery.when_was_the_first_day_of_your_last_period_ }}</td>
							</tr>

							<tr v-if="midwifery.due_date">
								<td>When is this baby due?</td>
								<td>{{ midwifery.due_date }}</td>
							</tr>

							<tr v-if="midwifery.date_confirmed">
								<td>Has this due date been confirmed by ultrasound?</td>
								<td>{{ options[midwifery.date_confirmed] }}</td>
							</tr>

							<tr v-if="midwifery.first_pregnancy">
								<td>Is this your first pregnancy?</td>
								<td>{{ options[midwifery.first_pregnancy] }}</td>
							</tr>

							<tr v-if="midwifery.how_many_vaginal_births || midwifery.how_many_vaginal_births =='0'">
								<td>How many vaginal births have you had?</td>
								<td>{{ midwifery.how_many_vaginal_births }}</td>
							</tr>

							<tr v-if="midwifery.how_many_c_section_births || midwifery.how_many_c_section_births =='0'">
								<td>How many C-section births have you had?</td>
								<td>{{ midwifery.how_many_c_section_births }}</td>
							</tr>

							<tr v-if="midwifery.complications_with_previous">
								<td>
									Have you had any complications with a previous pregnancy or labour?
								</td>
								<td>{{ options[midwifery.complications_with_previous] }}</td>
							</tr>

							<tr v-if="midwifery.provide_details">
								<td>C-section births Details</td>
								<td>{{ midwifery.provide_details }}</td>
							</tr>

							<tr v-if="midwifery.midwife_before">
								<td>
									Have you had a midwife before?
								</td>
								<td>{{ options[midwifery.midwife_before] }}</td>
							</tr>

							<tr v-if="midwifery.birth_locations">
								<td>Where would you like to give birth?</td>
								<td>{{ midwifery.birth_locations }}</td>
							</tr>

							<tr v-if="midwifery.medical_concerns">
								<td>
									Do you know of any medical concerns with your current pregnancy?
								</td>
								<td>{{ options[midwifery.medical_concerns] }}</td>
							</tr>

							<tr v-if="midwifery.provide_details2">
								<td>Medical Concerns Details</td>
								<td>{{ midwifery.provide_details2 }}</td>
							</tr>

							<tr v-if="midwifery.have_you_had_primary_health_care">
								<td>
									Have you received care from a primary health care provider for this pregnancy?
								</td>
								<td>{{ options[midwifery.have_you_had_primary_health_care] }}</td>
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
    name: 'MidwiferyMedicalInformation',
    props: ['midwifery', 'midwiferyDuplicated', 'options', 'panelModel'],
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