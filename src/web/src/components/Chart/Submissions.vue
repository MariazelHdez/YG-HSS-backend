<template>
    <div class="container chart">        
        <div class="chart-header">
            <h3 class="title">{{ title }}</h3>
            <div class="filter">
                <v-select
                    label="Filter"
                    v-model="filterValue"
                    :items="filterItems"
                    item-text="label"
                    item-value="id"
                    @change="updatedSelectValue"
                >                
                </v-select>
            </div>
        </div>
        <div class="chart-wrapper">
            <Bar v-if="hasData" :data="data" :options="options"></Bar>
            <div class="no-data" v-else>
              <h3>No data found.</h3>
            </div>
        </div>
    </div>        
</template>

<script>
import { ref } from "vue";
import { Chart as CharJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js"
import { Bar } from "vue-chartjs"
import { getFilterList } from "../../helper/index"

CharJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const dtOptions =  ref({});
const filterList = getFilterList();
const hasData = ref(false);

export default {
  name: "SubmissionsChart",
  components: {
    Bar
  },
  props: ['title', 'data'],
  watch: {
    data: {
        immediate: true,
        handler(newData) {
          this.hasData = false;
          newData.datasets.forEach((ds) => {
            if (ds.data.length > 0) {
              this.hasData = true;
            }
          });
        }
    }
  },
  emits: [
    'filterSelected'
  ],    
  data: () => {
    return {  
        options: dtOptions,
        filterItems: filterList,
        filterValue: filterList[0],
        hasData: hasData
    }
  },
  methods: {
    updatedSelectValue(val) {
        this.$emit("filterSelected", val);
    }
  }
};
</script>

<style>
.chart-header {
    display: flex;
}

.chart-header .title {
    flex: 1;
}
</style>