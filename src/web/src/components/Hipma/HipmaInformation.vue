<template>

	<v-expansion-panels
        multiple
    >
        <v-expansion-panel>
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
								<b>Value</b>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>What type of request do you want to make?</td>
                            <td>{{ hipma.HipmaRequestType }}</td>
                        </tr>
                        <tr>
                            <td>
								Are you requesting access to your own personal health information or
								making a request on behalf of another individual?
							</td>
                            <td>{{ hipma.AccessPersonalHealthInformation }}</td>
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
							<td v-if="hipma.date_range_is_unknown_or_i_need_help_identifying_the_date_range">Yes</td>
							<td v-else>No</td>
                        </tr>

                        <tr v-if="hipma.CopyHealthInformation">
                            <td>How do you want to access the records?</td>
                            <td>{{ hipma.CopyHealthInformation }}</td>
                        </tr>

                        <tr v-if="hipma.HipmaCopyActivityRequest">
                            <td>How do you want to access the records?</td>
                            <td>{{ hipma.HipmaCopyActivityRequest }}</td>
                        </tr>

                        <tr>
							<td>I affirm the information above to be true and accurate</td>
							<td v-if="hipma.i_affirm_the_information_above_to_be_true_and_accurate_">Yes</td>
							<td v-else>No</td>
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
    props: ['hipma'],

}
</script>