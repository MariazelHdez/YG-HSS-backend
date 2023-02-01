<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Other Medical Information</v-expansion-panel-header>
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

							<tr v-if="midwifery.menstrual_cycle_length || midwifery.menstrual_cycle_length =='0'">
								<td>What is your average menstrual cycle length?</td>
								<td>{{ midwifery.menstrual_cycle_length }}</td>
							</tr>

							<tr v-if="midwifery.family_physician">
								<td>
									Do you have a family physician?
								</td>
								<td>{{ options[midwifery.family_physician] }}</td>
							</tr>

							<tr v-if="midwifery.physician_s_name">
								<td>What is your physician's name?</td>
								<td>{{ midwifery.physician_s_name }}</td>
							</tr>

							<tr v-if="midwifery.major_medical_conditions">
								<td>
									Do you have any major medical conditions such as Type 1 diabetes or epilepsy?
								</td>
								<td>{{ options[midwifery.major_medical_conditions] }}</td>
							</tr>

							<tr v-if="midwifery.provide_details3">
								<td>Medical Conditions Details</td>
								<td>{{ midwifery.provide_details3 }}</td>
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
    name: 'MidwiferyOtherMedicalInformation',
    props: ['midwifery', 'options', 'panelModel'],
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