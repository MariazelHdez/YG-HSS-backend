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
								<td>Do you currently have a family physician?</td>
								<td>{{ constellation.family_physician }}</td>
								<td>{{ constellationDuplicated.family_physician }}</td>
							</tr>

							<tr>
								<td>Who is your current family physician?</td>
								<td>
									{{ constellation.current_family_physician }}
								</td>
								<td>
									{{ constellationDuplicated.current_family_physician }}
								</td>
							</tr>

							<tr>
								<td>Where have you been accessing health care?</td>
								<td>
									{{ constellation.accessing_health_care }}
								</td>
								<td>
									{{ constellationDuplicated.accessing_health_care }}
								</td>
							</tr>

							<tr>
								<td>
									We want to ensure that all types of families and
									people have access to the CSCHC.
								</td>
								<td>{{ constellation.diagnosis }}</td>
								<td>{{ constellationDuplicated.diagnosis }}</td>
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
    name: 'MidwiferyInformation',
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