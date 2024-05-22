<template>
    <div id="app">
        <TitleHeader />
        <MapMain />
    </div>
</template>

<script>
import TitleHeader from './TitleHeader.vue';
import MapMain from './MapMain.vue'

export default {
    name: 'App',
    components: {
        TitleHeader,
        MapMain,
    }
}
</script>

<style>
html,
body {
    height: 100%;
    margin: 0;
}

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    height: 100%;
    /*display: grid;
    grid-template-columns: 100vh;
    grid-auto-rows: 1fr;
    grid-gap: 1rem;*/
    padding: 0;
    box-sizing: border-box;
}
</style>