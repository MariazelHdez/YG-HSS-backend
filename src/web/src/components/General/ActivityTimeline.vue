<template>
    <div class="container activity-timeline"> 
      <div class="title">
        <h3>{{ title }}</h3>
      </div>
      <div class="items">
        <TimelineItem v-for="item in data" :key="item.id" :event_id="item.id" :title="item.message" :module_title="item.department" :image_name="item.icon_name" :date="item.event_date"></TimelineItem>
      </div>
    </div>        
</template>

<script>
import { ref } from "vue";
import TimelineItem from "./TimelineItem.vue";

const hasData = ref(false);

export default {
  name: "ActivityTimeline",
  components: {
    TimelineItem
  },
  props: ['title', 'data'],
  watch: {
    data: {
        immediate: true,
        handler(newData) {
          this.hasData = Array.isArray(newData) && newData.length > 0;          
        }
    }
  },   
  data: () => {
    return {  
        hasData: hasData
    }
  }
};
</script>

<style>

</style>