<template>
    <div>
        <button class="has-text-weight-normal mt-2" onClick="this.changeZone()">Etage {{ zoneName }}</button>
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
        changeZone() {
            console.log(this.zoneName);
        }
    },
};
</script>

<style>
div {
    margin: 0
}
</style>
