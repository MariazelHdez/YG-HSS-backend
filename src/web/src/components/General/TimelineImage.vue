<template>
    <div class="timeline-image"> 
        <img :src="image_src" width="64px" height="64px"/>
    </div>        
</template>

<script>
export default {
  name: "TimelineImage",
  props: ['image_src'],
  data: () => {
    return {}
  },
};
</script>

<style>
.timeline-image {
  margin: 10px;
}
</style>