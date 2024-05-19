<template>
    <div>
        <button class="has-text-weight-normal mt-2">Etage {{ zoneName }}</button>
    </div>
</template>

<script>
export default {
    name: 'ButtonZone',
    props: {
        zoneName: { type: String, default: 'E' },
        zoneSlug: { type: String, default: 'e' },
    },
    mounted() {
    },
    methods: {
    },
};
</script>

<style>
div {
    margin: 0
}
</style>
