<template>
    <v-alert
        prominent
        dismissible
        :type="alertType"
        v-model="visible"
    >
        <v-progress-linear
            v-model="value"
            v-show="visible"
            :buffer-value="bufferValue"
            color="grey lighten-2"
        >
        </v-progress-linear>
        <br>
        {{this.alertMessage}}
    </v-alert>
</template>
<script>

export default {
    name: 'ModuleAlert',
    props: ['alertMessage', 'alertType'],
    data: () => ({
        visible: false,
        value: 0,
        bufferValue: 100,
        interval: 0,
    }),
    watch: {
        alertType: function(newVal) {
            if(newVal){
                this.visible = true;
                this.startBuffer();

                setTimeout(()=>{
                    this.visible = false;
                    this.$router.replace({'query': null});
                },5000)

            }
        },
    },
    mounted () {
    },
    beforeDestroy () {
        clearInterval(this.interval)
    },
    methods: {
        startBuffer () {
            clearInterval(this.interval)

            this.interval = setInterval(() => {
                this.value += Math.random() * (8 - 4) + 1
                this.bufferValue += Math.random() * (8 - 4) + 2
            }, 100)
        },
    },
}

</script>