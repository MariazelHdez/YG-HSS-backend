<template>
    <v-alert
        prominent
        :type="alertType"
        v-model="visible"
    >
		<v-row align="center">
			<v-col class="grow">
				{{this.alertMessage}}
			</v-col>
			<v-col class="shrink">
				<v-btn
					icon
					@click="closeAlert"
				>
					<v-icon>mdi-close-circle</v-icon>
				</v-btn>
			</v-col>
		</v-row>
    </v-alert>
</template>
<script>

export default {
    name: 'ModuleAlert',
    props: ['alertMessage', 'alertType'],
    data: () => ({
        visible: false
    }),
    watch: {
        alertType: function(newVal) {
            if(newVal){
                this.visible = true;
            }
        },
    },
	methods: {
        closeAlert(){
            this.$router.replace({'query': null});
        },
	}
}

</script>