<template>
   <v-alert prominent :type="types">
    {{this.alertMessage}}
    </v-alert>
</template>
<script>

export default {
    name: 'ConstellationAlert',
    props: ['alertMessage'],
    data() {
      return {
        types: "success"
      };
    }
}

</script>