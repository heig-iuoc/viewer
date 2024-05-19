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
        <div class="column is-4"></div>
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
        this.zoneDropdownAdd();
    },

    methods: {

        async zoneDropdownAdd() {
            //TODO: query on Zones with specific structure
            fetch(`http://127.0.0.1:8000/api/zone/?format=json`)
                .then((response) => response.json())
                .then(data => {
                    data.forEach((zone) => {

                        const temp = {}
                        temp.name = zone.name;
                        temp.slug = zone.slug;
                        this.zonesData.push(temp);

                    })
                });
        },
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
    width: 25vh;
    height: auto;
    /*margin-top: 1em;
    margin-left: 1em;*/
}
</style>