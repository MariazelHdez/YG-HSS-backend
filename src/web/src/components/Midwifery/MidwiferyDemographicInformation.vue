<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Demographic Information</v-expansion-panel-header>
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
								<td>Do you identify with any of these groups and communities?</td>
								<td>{{ midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie }}</td>
								<td>{{ midwiferyDuplicated.do_you_identify_with_one_or_more_of_these_groups_and_communitie }}</td>
							</tr>

							<tr>
								<td>How did you find out about the program?</td>
								<td>{{ midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that }}</td>
								<td>{{ midwiferyDuplicated.how_did_you_find_out_about_the_midwifery_clinic_select_all_that }}</td>
							</tr>
						</tbody>
                        <tbody v-else >
							<tr v-if="midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie">
								<td>Do you identify with any of these groups and communities?</td>
								<td>{{ midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie }}</td>
							</tr>

							<tr v-if="midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that">
								<td>How did you find out about the program?</td>
								<td>{{ midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that }}</td>
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
    name: 'MidwiferyDemographicInformation',
    props: ['midwifery', 'midwiferyDuplicated', 'panelModel'],
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