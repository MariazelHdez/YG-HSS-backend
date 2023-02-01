<template>

	<v-expansion-panels
        multiple
		v-model="modelPanel"
    >
        <v-expansion-panel class="mb-6">
			<v-expansion-panel-header>Contact Information</v-expansion-panel-header>
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
							<tr v-if="midwifery.preferred_phone">
								<td>Your preferred phone number</td>
								<td>{{ midwifery.preferred_phone }}</td>
							</tr>

							<tr v-if="midwifery.preferred_email">
								<td>Your preferred email address</td>
								<td>{{ midwifery.preferred_email }}</td>
							</tr>

							<tr v-if="midwifery.okay_to_leave_message">
								<td>Is it okay to leave a message at this phone number?</td>
								<td>{{ options[midwifery.okay_to_leave_message] }}</td>
							</tr>

							<tr v-if="midwifery.prefer_to_be_contacted">
								<td>How would you prefer to be contacted?</td>
								<td>{{ midwifery.preferred_contact }}</td>
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
    name: 'MidwiferyContactInformation',
    props: ['midwifery', 'options','panelModel'],
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