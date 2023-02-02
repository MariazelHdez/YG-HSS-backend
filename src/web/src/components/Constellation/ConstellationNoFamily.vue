<template>
  <v-expansion-panels multiple v-model="modelPanel">
    <v-expansion-panel class="mb-6">
      <v-expansion-panel-header>
        Family Members Information
      </v-expansion-panel-header>
      <v-expansion-panel>
        <v-expansion-panel-content class="panel-content-familyMember">
          <v-expansion-panels multiple v-model="modelPanel">
            <v-expansion-panel class="mb-3">
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
                        <td>Include family members?</td>
                        <td>No, I don’t want to include anyone else on this application</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
<script>
export default {
  name: "ConstellationNoFamilyMembers",
  props: ["panelModel"],
  data() {
    return {
      modelPanel: this.panelModel,
    };
  },
  watch: {
    panelModel(newValue) {
      this.modelPanel = newValue;
    },
  },
};
</script>
