<template>
    <div class="timeline-item" :class="itemClass" v-if="hasData"> 
        <TimelineImage :image_src="imageSource"></TimelineImage>
        <div class="item-details">
          <div class="event-title">{{ title }}</div>
          <div class="module-name">{{ module_title }}</div>
          <div class="date">{{ calcDate }}</div>
        </div>
    </div>        
</template>

<script>
import { ref } from "vue";
import TimelineImage from "./TimelineImage.vue";
import moment from "moment";

const hasData = ref(false);

export default {
  name: "TimelineItem",
  components: {
    TimelineImage
  },
  props: ["event_id", "date", "title", "module_title", "image_name"],
  watch: {
    event_id: {
      immediate: true,
      handler(newData) {
        this.hasData = newData > 0;          
      }
    }
  },      
  data: () => {
    return {  
      hasData: hasData
    }
  },
  computed: {
    itemClass: function() {
      return `item-${this.event_id}`;
    },
    imageSource: function() {
      return `/assets/images/${this.image_name}`;
    },
    calcDate: function() {
      return moment(this.date).fromNow();
    }
  }
};
</script>

<style>
.timeline-item {
  display: flex;
}

.module-name, .date {
  font-size: small;
  color: #999999;
}

</style>