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
            <Doughnut v-if="hasData" :data="data" :options="options"></Doughnut>
            <div class="no-data" v-else>
              <h3>No data found.</h3>
            </div>
        </div>
    </div>        
</template>

<script>
import { ref } from "vue";
import { Chart as CharJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "vue-chartjs"
import { getFilterList } from "../../helper/index"

CharJS.register(ArcElement, Tooltip, Legend);

const dtOptions =  ref({});
const filterList = getFilterList();
const hasData = ref(false);

export default {
  name: "StatusChart",
  components: {
    Doughnut
  },
  props: ['title', 'data'],
  watch: {
    data: {
        immediate: true,
        handler(newData) {
          this.hasData = false;
          if (newData.datasets[0].data.length > 0) {
            this.hasData = true;
            const total = newData.datasets[0].data.reduce((x,y) => parseInt(x)+parseInt(y));
            dtOptions.value = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        title: {
                        display: true,
                        text: `Total: ${total}`,
                        align: "start"
                        },
                        position: "right",
                        align: "end"
                    }
                }
            };
          }
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