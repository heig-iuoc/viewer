<!-- SOURCE:
    - https://medium.com/dont-leave-me-out-in-the-code/calling-methods-from-other-components-in-vue-b0e35cc9ccd8
-->

<template>
    <!-- Sélection de l'étage -->
    <ZoneDropdown menu-title="" dark-mode="auto" class="dropdown-zone" ref="dropdownComponent">
        <div v-for="(data, index) in zonesData" :key="index">
            <ButtonZone :zoneName="data.name" :zoneSlug="data.slug"></ButtonZone>
        </div>
    </ZoneDropdown>

    <div id="map-root" style="width: 100%; height: 80%"></div>
</template>

<script>
import ZoneDropdown from './ZoneDropdown.vue';
import ButtonZone from './ButtonZone.vue';

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import { MultiLineString, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, Fill, Text } from 'ol/style.js';
import { buffer } from 'ol/extent';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get } from 'ol/proj';

export default {
    name: 'MapContainer',
    components: {
        ZoneDropdown,
        ButtonZone
    },

    data() {
        return {
            highlight: null,
            map: null,
            zone_source: null,
            zone_layer: null,
            space_source: null,
            space_layer: null,
            passageway_source: null,
            passageway_layer: null,

        }
    },

    mounted() {
        this.initMap();
        this.initSources();
        this.initLayers();
        this.displayGeometries('a');

        // Ajouter un écouteur d'événements de la souris pour détecter le survol du polygone
        this.map.on('pointermove', function (event) {
            event.map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
                if (layer !== null) {
                    if (layer.get('name') === 'space') {
                        // Vérifier si la feature est une instance de polygone
                        if (feature instanceof Feature && feature.getGeometry() instanceof Polygon) {

                            if (feature.getStyle() != undefined) {
                                if (feature.getStyle().getFill().getColor() === 'rgba(192, 192, 192, 1)') {

                                    // Changer la couleur du polygone lorsque la souris passe dessus
                                    feature.setStyle(new Style({
                                        stroke: new Stroke({
                                            color: 'rgba(0, 0, 0, 1)',
                                            width: 2,
                                        }),
                                        fill: new Fill({
                                            color: 'rgba(105, 105, 105, 1)',
                                        }),
                                    }))
                                }

                                else if (feature.getStyle().getFill().getColor() === 'rgba(105, 105, 105, 1)') {

                                    feature.setStyle(new Style({
                                        stroke: new Stroke({
                                            color: 'rgba(0, 0, 0, 1)',
                                            width: 2,
                                        }),
                                        fill: new Fill({
                                            color: 'rgba(192, 192, 192, 1)',
                                        }),
                                    }))
                                }
                            }
                        }
                    }
                }
            });
        });
    },

    created() {
    },

    methods: {
        initMap() {
            // define CH projection (for MN95)
            proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs");
            register(proj4);

            // Code d'initialisation de la carte avec OpenLayers
            this.map = new Map({
                target: 'map-root',
                layers: [
                    new TileLayer({
                        source: new OSM()
                    })
                ],
                view: new View({
                    projection: get('EPSG:2056'),
                    zoom: 5,
                }),
            });
        },

        initSources() {
            this.zone_source = new VectorSource({
                projection: 'EPSG:4326'
            });
            this.space_source = new VectorSource({
                projection: 'EPSG:4326'
            });
            this.passageway_source = new VectorSource({
                projection: 'EPSG:4326'
            });
        },

        initLayers() {
            this.zone_layer = new VectorLayer({
                name: 'zone',
                source: this.zone_source,
                zIndex: 1,
                map: this.map,
            });

            this.space_layer = new VectorLayer({
                name: 'space',
                source: this.space_source,
                zIndex: 2,
                map: this.map
            });

            this.passageway_layer = new VectorLayer({
                source: this.passageway_source,
                map: this.map,
                name: 'passageway',
                zIndex: 3
            });
        },

        async displayGeometries(zone_slug) {
            this.displayZone(zone_slug);
            this.displaySpace(zone_slug);
            this.displayPassageway(zone_slug);
        },

        async displayZone(zone_slug) {

            const zone_geom = await fetch(`http://127.0.0.1:8000/api/zone/${zone_slug}/?format=json`)
                .then((response) => response.json())
                .then((user) => { return user.geom.coordinates });

            zone_geom[0].forEach(polygon => {
                const feature = new Feature({
                    geometry: new Polygon([polygon]),
                });
                feature.setStyle(new Style({
                    fill: new Fill({
                        color: 'rgba(224, 224, 224, 1)',
                    }),
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 1)',
                    })
                }));
                feature.getGeometry().transform('EPSG:4326', 'EPSG:2056')
                this.zone_source.addFeature(feature);

            })
            this.setExtentMap(this.zone_source);
        },

        async displaySpace(zone_slug) {

            console.log(`http://127.0.0.1:8000/api/space/by_zone_slug/${zone_slug}/?format=json`)
            const zone_geom = await fetch(`http://127.0.0.1:8000/api/space/by_zone_slug/${zone_slug}/?format=json`)
                .then((response) => { return response.json() });

            zone_geom.forEach(polygon => {
                const feature = new Feature({
                    geometry: new Polygon(polygon.geom.coordinates),
                    label: polygon.name,
                });
                feature.setStyle(new Style({
                    text: new Text({
                        text: polygon.name,
                        font: 'bold 11px "Roboto"',
                        fill: new Fill({
                            color: 'black',
                        }),
                    }),
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 1)',
                        width: 1,
                    }),
                    fill: new Fill({
                        color: 'rgba(192, 192, 192, 1)',
                    })
                }));
                feature.getGeometry().transform('EPSG:4326', 'EPSG:2056')
                this.space_source.addFeature(feature);
            })
        },

        async displayPassageway(zone_slug) {
            const passageway_geom = await fetch(`http://127.0.0.1:8000/api/passageway/by_zone_slug/${zone_slug}/?format=json`)
                .then((response) => { return response.json() });

            passageway_geom.forEach(polygon => {
                const feature = new Feature({
                    geometry: new MultiLineString(polygon.geom.coordinates)
                });
                feature.setStyle(new Style({
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 1)',
                        width: 1,
                    }),
                }));
                feature.getGeometry().transform('EPSG:4326', 'EPSG:2056')
                this.passageway_source.addFeature(feature);
            })
        },

        setExtentMap(source) {
            const extent = source.getExtent();
            const bufferExtend = buffer(extent, 15);
            this.map.getView().fit(bufferExtend, this.map.getSize());
        },
    }
};
</script>

<style>
#map-root {
    position: relative;
    margin: 0;
    padding: 0;
}

.dropdown-zone {
    position: absolute;
    top: 2px;
    right: 2px;
}
</style>
