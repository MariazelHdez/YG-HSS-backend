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
								<b>Value<span v-if="midwiferyDuplicated">&nbsp;(Original Request)</span></b>
                            </th>
                            <th v-if="midwiferyDuplicated">
								<b>Value&nbsp;(Duplicated Request)</b>
                            </th>
                        </tr>
                        </thead>
                        <tbody v-if="midwiferyDuplicated">
                            <tr>
                                <td>Your legal first name</td>
                                <td>{{ midwifery.first_name }}</td>
                                <td>{{ midwiferyDuplicated.first_name }}</td>
                            </tr>
                            <tr>
                                <td>Your legal last name</td>
                                <td>{{ midwifery.last_name }}</td>
                                <td>{{ midwiferyDuplicated.last_name }}</td>
                            </tr>

                            <tr>
                                <td>Your preferred name (if different from legal name)</td>
                                <td>{{ midwifery.preferred_name }}</td>
                                <td>{{ midwiferyDuplicated.preferred_name }}</td>
                            </tr>

                            <tr>
                                <td>What pronouns do you use?</td>
                                <td>{{ midwifery.pronouns }}</td>
                                <td>{{ midwiferyDuplicated.pronouns }}</td>
                            </tr>

                            <tr>
                                <td>Date of birth</td>
                                <td>{{ midwifery.date_of_birth }}</td>
                                <td>{{ midwiferyDuplicated.date_of_birth }}</td>
                            </tr>

                            <tr>
                                <td>Do you have Yukon health insurance coverage?</td>
                                <td>{{ options[midwifery.yukon_health_insurance] }}</td>
                                <td>{{ options[midwiferyDuplicated.yukon_health_insurance] }}</td>
                            </tr>

                            <tr>
                                <td>In which city or community is your home located?</td>
                                <td>{{ midwifery.community }}</td>
                                <td>{{ midwiferyDuplicated.community }}</td>
                            </tr>

                            <tr>
                                <td>What is your preferred language?</td>
                                <td>{{ midwifery.language }}</td>
                                <td>{{ midwiferyDuplicated.language }}</td>
                            </tr>

                            <tr>
                                <td>
                                    If accepted into the program, will you need interpretation support to
                                    attend an appointment with an English speaking midwife?
                                </td>
                                <td>{{ options[midwifery.need_interpretation] }}</td>
                                <td>{{ options[midwiferyDuplicated.need_interpretation] }}</td>
                            </tr>
                        </tbody>
                        <tbody v-else >
                            <tr>
                                <td>Your legal first name</td>
                                <td>{{ midwifery.first_name }}</td>
                            </tr>
                            <tr>
                                <td>Your legal last name</td>
                                <td>{{ midwifery.last_name }}</td>
                            </tr>

                            <tr v-if="midwifery.preferred_name">
                                <td>Your preferred name (if different from legal name)</td>
                                <td>{{ midwifery.preferred_name }}</td>
                            </tr>

                            <tr v-if="midwifery.pronouns">
                                <td>What pronouns do you use?</td>
                                <td>{{ midwifery.pronouns }}</td>
                            </tr>

                            <tr v-if="midwifery.date_of_birth">
                                <td>Date of birth</td>
                                <td>{{ midwifery.date_of_birth }}</td>
                            </tr>

                            <tr v-if="midwifery.yukon_health_insurance">
                                <td>Do you have Yukon health insurance coverage?</td>
                                <td>{{ options[midwifery.yukon_health_insurance] }}</td>
                            </tr>

                            <tr v-if="midwifery.community">
                                <td>In which city or community is your home located?</td>
                                <td>{{ midwifery.community }}</td>
                            </tr>

                            <tr v-if="midwifery.language">
                                <td>What is your preferred language?</td>
                                <td>{{ midwifery.language }}</td>
                            </tr>

                            <tr v-if="midwifery.need_interpretation">
                                <td>
                                    If accepted into the program, will you need interpretation support to
                                    attend an appointment with an English speaking midwife?
                                </td>
                                <td>{{ options[midwifery.need_interpretation] }}</td>
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