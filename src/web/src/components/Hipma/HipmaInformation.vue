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
								<b>Value<span v-if="hipmaDuplicated">&nbsp;(Original Request)</span></b>
                            </th>
                            <th v-if="hipmaDuplicated">
								<b>Value&nbsp;(Duplicated Request)</b>
                            </th>
                        </tr>
                        </thead>

                        <tbody v-if="hipmaDuplicated">
                            <tr>
                                <td>What type of request do you want to make?</td>
                                <td>{{ hipma.hipma_request_type_desc }}</td>
                                <td>{{ hipmaDuplicated.hipma_request_type_desc }}</td>
                            </tr>
                            <tr>
                                <td>
                                    Are you requesting access to your own personal health information or
                                    making a request on behalf of another individual?
                                </td>
                                <td>{{ hipma.access_personal_health_information }}</td>
                                <td>{{ hipmaDuplicated.access_personal_health_information }}</td>
                            </tr>

                            <tr>
                                <td>Name of Health and Social Services program area</td>
                                <td>{{ hipma.name_of_health_and_social_services_program_area_optional_ }}</td>
                                <td>{{ hipmaDuplicated.name_of_health_and_social_services_program_area_optional_ }}</td>
                            </tr>

                            <tr>
                                <td>Indicate the HSS system(s) you would like a record of user activity for</td>
                                <td>{{ hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ }}</td>
                                <td>{{ hipmaDuplicated.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ }}</td>
                            </tr>

                            <tr>
                                <td>Request Details</td>
                                <td>{{ hipma.provide_details_about_your_request_ }}</td>
                                <td>{{ hipmaDuplicated.provide_details_about_your_request_ }}</td>
                            </tr>

                            <tr>
                                <td>Date From</td>
                                <td>{{ hipma.date_from_ }}</td>
                                <td>{{ hipmaDuplicated.date_from_ }}</td>
                            </tr>

                            <tr>
                                <td>Date To</td>
                                <td>{{ hipma.date_to_ }}</td>
                                <td>{{ hipmaDuplicated.date_to_ }}</td>
                            </tr>

                            <tr>
                                <td>Date range is unknown</td>
                                <td>{{ hipma.date_range_is_unknown_or_i_need_help_identifying_the_date_range }}</td>
                                <td>{{ hipmaDuplicated.date_range_is_unknown_or_i_need_help_identifying_the_date_range }}</td>
                            </tr>

                            <tr v-if="hipmaDuplicated.cp_health_info ||  hipma.cp_health_info">
                                <td>How do you want to access the records?</td>
                                <td>{{ hipma.cp_health_info }}</td>
                                <td>{{ hipmaDuplicated.cp_health_info }}</td>
                            </tr>

                            <tr v-if="hipmaDuplicated.cp_act_req ||  hipma.cp_act_req">
                                <td>How do you want to access the records?</td>
                                <td>{{ hipma.cp_act_req }}</td>
                                <td>{{ hipmaDuplicated.cp_act_req }}</td>
                            </tr>

                            <tr>
                                <td>I affirm the information above to be true and accurate</td>
                                <td>{{ hipma.i_affirm_the_information_above_to_be_true_and_accurate_ }}</td>
                                <td>{{ hipmaDuplicated.i_affirm_the_information_above_to_be_true_and_accurate_ }}</td>
                            </tr>

                        </tbody>

                        <tbody v-else >
                            <tr>
                                <td>What type of request do you want to make?</td>
                                <td>{{ hipma.hipma_request_type_desc }}</td>
                            </tr>
                            <tr>
                                <td>
                                    Are you requesting access to your own personal health information or
                                    making a request on behalf of another individual?
                                </td>
                                <td>{{ hipma.access_personal_health_information }}</td>
                            </tr>

                            <tr v-if="hipma.name_of_health_and_social_services_program_area_optional_">
                                <td>Name of Health and Social Services program area</td>
                                <td>{{ hipma.name_of_health_and_social_services_program_area_optional_ }}</td>
                            </tr>

                            <tr v-if="hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ">
                                <td>Indicate the HSS system(s) you would like a record of user activity for</td>
                                <td>{{ hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ }}</td>
                            </tr>

                            <tr v-if="hipma.provide_details_about_your_request_">
                                <td>Request Details</td>
                                <td>{{ hipma.provide_details_about_your_request_ }}</td>
                            </tr>

                            <tr v-if="hipma.date_from_">
                                <td>Date From</td>
                                <td>{{ hipma.date_from_ }}</td>
                            </tr>

                            <tr v-if="hipma.date_to_">
                                <td>Date To</td>
                                <td>{{ hipma.date_to_ }}</td>
                            </tr>

                            <tr>
                                <td>Date range is unknown</td>
                                <td>{{ hipma.date_range_is_unknown_or_i_need_help_identifying_the_date_range }}</td>
                            </tr>

                            <tr v-if="hipma.cp_health_info">
                                <td>How do you want to access the records?</td>
                                <td>{{ hipma.cp_health_info }}</td>
                            </tr>

                            <tr v-if="hipma.cp_act_req">
                                <td>How do you want to access the records?</td>
                                <td>{{ hipma.cp_act_req }}</td>
                            </tr>

                            <tr>
                                <td>I affirm the information above to be true and accurate</td>
                                <td>{{ hipma.i_affirm_the_information_above_to_be_true_and_accurate_ }}</td>
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
    name: 'HipmaInformation',
    props: ['hipma', 'hipmaDuplicated', 'panelModel'],
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