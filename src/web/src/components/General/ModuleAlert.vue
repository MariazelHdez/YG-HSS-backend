<template>
    <v-alert
        prominent
        dismissible
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