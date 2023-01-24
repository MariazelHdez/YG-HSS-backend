<template>

	<v-expansion-panels
        multiple
    >
        <v-expansion-panel>
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

							<tr v-if="hipmaFiles._statutory_declaration_of_parental_or_guardianship_status">
								<td>Declaration of Parental or Guardianship Status</td>

								<td>
									<v-btn
										:loading="loading"
										:disabled="loading"
										color="blue"
										class="ma-2 white--text"
										@click="downloadFile(hipmaFiles._statutory_declaration_of_parental_or_guardianship_status.id)"
									>
										Download:
										&nbsp;{{hipmaFiles._statutory_declaration_of_parental_or_guardianship_status.file_fullName}}
										<v-icon
										right
										dark
										>
										mdi-cloud-upload
										</v-icon>
									</v-btn>
								</td>
							</tr>

							<tr v-if="hipmaFiles._minor_s_consent_to_release_of_information_if_applicable_">
								<td>Minor's Consent to Release of Information</td>

								<td>
									<v-btn
										:loading="loading"
										:disabled="loading"
										color="blue"
										class="ma-2 white--text"
										@click="downloadFile(hipmaFiles._minor_s_consent_to_release_of_information_if_applicable_.id)"
									>
										Download:
										&nbsp;{{hipmaFiles._minor_s_consent_to_release_of_information_if_applicable_.file_fullName}}
										<v-icon
										right
										dark
										>
										mdi-cloud-upload
										</v-icon>
									</v-btn>
								</td>
							</tr>

							<tr v-if="hipmaFiles._court_order_identifying_custody_of_the_minor">
								<td>Court order identifying custody of the Minor</td>

								<td>
									<v-btn
										:loading="loading"
										:disabled="loading"
										color="blue"
										class="ma-2 white--text"
										@click="downloadFile(hipmaFiles._court_order_identifying_custody_of_the_minor.id)"
									>
										Download:
										&nbsp;{{hipmaFiles._court_order_identifying_custody_of_the_minor.file_fullName}}
										<v-icon
										right
										dark
										>
										mdi-cloud-upload
										</v-icon>
									</v-btn>
								</td>
							</tr>

							<tr v-if="hipmaFiles._statutory_declaration_of_substitute_decision_maker_status">
								<td>Declaration of Substitute Decision Maker Status</td>

								<td>
									<v-btn
										:loading="loading"
										:disabled="loading"
										color="blue"
										class="ma-2 white--text"
										@click="downloadFile(hipmaFiles._statutory_declaration_of_substitute_decision_maker_status.id)"
									>
										Download:
										&nbsp;{{hipmaFiles._statutory_declaration_of_substitute_decision_maker_status.file_fullName}}
										<v-icon
										right
										dark
										>
										mdi-cloud-upload
										</v-icon>
									</v-btn>
								</td>
							</tr>

							<tr v-if="hipmaFiles._physician_affirmation_confirm_auth">
								<td>
									Physician Affirmation of Capacity under HIPMA or Confirmation of authority
									to act as Substitute Decision Maker
								</td>

								<td>
									<v-btn
										:loading="loading"
										:disabled="loading"
										color="blue"
										class="ma-2 white--text"
										@click="downloadFile(hipmaFiles._physician_affirmation_confirm_auth.id)"
									>
										Download:
										&nbsp;{{hipmaFiles._physician_affirmation_confirm_auth.file_fullName}}
										<v-icon
										right
										dark
										>
										mdi-cloud-upload
										</v-icon>
									</v-btn>
								</td>
							</tr>

							<tr v-if="hipmaFiles._confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece">
								<td>
									Confirmation of Authority to Exercise Rights or Powers of a Deceased Person
								</td>

								<td>
									<v-btn
										:loading="loading"
										:disabled="loading"
										color="blue"
										class="ma-2 white--text"
										@click=
										"downloadFile(hipmaFiles._confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece.id)"
									>
										Download:
										&nbsp;{{hipmaFiles._confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece.file_fullName}}
										<v-icon
										right
										dark
										>
										mdi-cloud-upload
										</v-icon>
									</v-btn>
								</td>
							</tr>

							<tr v-if="hipmaFiles._letters_of_administration_or_grant_of_probate">
								<td>
									Letters of Administration or Grant of Probate
								</td>

								<td>
									<v-btn
										:loading="loading"
										:disabled="loading"
										color="blue"
										class="ma-2 white--text"
										@click="downloadFile(hipmaFiles._letters_of_administration_or_grant_of_probate.id)"
									>
										Download:
										&nbsp;{{hipmaFiles._letters_of_administration_or_grant_of_probate.file_fullName}}
										<v-icon
										right
										dark
										>
										mdi-cloud-upload
										</v-icon>
									</v-btn>
								</td>
							</tr>

							<tr v-if="hipmaFiles._consent_to_release_of_information">
								<td>
									Consent to Release Information
								</td>

								<td>
									<v-btn
										:loading="loading"
										:disabled="loading"
										color="blue"
										class="ma-2 white--text"
										@click="downloadFile(hipmaFiles._consent_to_release_of_information.id)"
									>
										Download:
										&nbsp;{{hipmaFiles._consent_to_release_of_information.file_fullName}}
										<v-icon
										right
										dark
										>
										mdi-cloud-upload
										</v-icon>
									</v-btn>
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
const axios = require("axios");
import { HIPMA_DOWNLOAD_FILE_URL } from "../../urls.js";

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
	methods: {
		downloadFile (idDownload) {
			this.loader = 'loading';
			axios
			.get(HIPMA_DOWNLOAD_FILE_URL+idDownload)
			.then((resp) => {
				//this.items = resp.data.data;
				console.log(resp);
			})
			.catch((err) => console.error(err))
			.finally(() => {
				this.loading = false;
			});

		}
	},

}
</script>