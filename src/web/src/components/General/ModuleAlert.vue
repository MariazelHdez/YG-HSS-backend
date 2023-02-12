<template>
    <v-alert
        prominent
        :type="alertType"
    >
    {{this.alertMessage}}
    </v-alert>
</template>
<script>

export default {
    name: 'ModuleAlert',
    props: ['alertMessage', 'alertType'],
    data: () => ({
    }),
}

</script>