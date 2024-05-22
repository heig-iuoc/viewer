<template>
    <div class="columns is-mobile title">
        <div class="column is-2 logo">
            <img alt="Logo HEIG-VD geoportail" src="../assets/geoportail_logo.png">
        </div>
        <div class="column is-2">
            <!-- Sélection de l'étage -->
            <!-- 
            <ZoneDropdown menu-title="Sélection de l'étage" id="zonedropdown" dark-mode="auto" class="dropdown-zone"
                ref="dropdownComponent">
                <div v-for="(data, index) in zonesData" :key="index">
                    <ButtonZone :zoneName="data.name" :zoneSlug="data.slug"></ButtonZone>
                </div>
            </ZoneDropdown>
            -->
        </div>
        <div class="column is-6"></div>
        <div class="column is-2">
            <img alt="Logo du projet IUOC" src="../assets/iuoc_logo.jpg">
        </div>
        <!-- <div class="column is-2">Account</div>
        <div class="column is-2">FR | EN</div>-->
    </div>
</template>

<script>

//import ZoneDropdown from './ZoneDropdown.vue';
//import ButtonZone from './ButtonZone.vue';

export default {
    name: 'TitleHeader',
    components: {
        //ZoneDropdown,
        //ButtonZone
    },

    data() {
        return {
            zonesData: [],
        }
    },

    created() {
    },

    methods: {
    }
}
</script>

<style>
.title {
    padding: 2vh;
    margin: 2vw;
}

.column {
    text-align: center;
    vertical-align: middle;
    display: table-cell;
}

.logo {
    text-align: left;
    vertical-align: middle;
    display: table-cell;
}


img {
    width: auto;
    height: 75px;
}
</style>