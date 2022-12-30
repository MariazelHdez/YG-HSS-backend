<template v-slot:items.actions="{ items }">
    <v-icon
        small
        class="mr-2"
        @click="View(items)"
    >
        mdi-pencil
    </v-icon>
</template>