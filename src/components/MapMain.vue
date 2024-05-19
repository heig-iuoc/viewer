<!-- SOURCE:
    - https://medium.com/dont-leave-me-out-in-the-code/calling-methods-from-other-components-in-vue-b0e35cc9ccd8
-->

<template>
    <div id="map-root" style="width: 100%; height: 80%"></div>

</template>

<script>
import { connectThingsboard, get_deviceId_from_deviceName, get_telemetry_from_deviceId, get_attributes_from_deviceId } from '@/iuoc/api.js';

import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import { MultiLineString, Point, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, Fill, Text, Icon } from 'ol/style.js';
import { buffer } from 'ol/extent';
import LayerSwitcher from 'ol-layerswitcher';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get } from 'ol/proj';

export default {
    name: 'MapContainer',

    components: {
    },

    data() {
        return {
            highlight: null,
            map: null,
            zone_source: null,
            zone_layer: null,
            space_source_a: null,
            space_layer_a: null,
            space_source_b: null,
            space_layer_b: null,
            space_source_c: null,
            space_layer_c: null,
            space_source_d: null,
            space_layer_d: null,
            space_source_g: null,
            space_layer_g: null,
            oc_bus_source: null,
            oc_bus_layer: null,
        }
    },

    mounted() {
        this.initSources();
        this.initLayers();
        this.initMap();

        // GET 'zone' in DB
        this.displayGeometries('a', this.space_source_a);
        //this.displayGeometries('b', this.space_source_b);
        this.displayGeometries('c', this.space_source_c);
        this.displayGeometries('d', this.space_source_d);
        //this.displayGeometries('g', this.space_source_g);
        /*
        fetch(`http://127.0.0.1:8000/api/zone/?format=json`)
            .then((response) => response.json())
            .then(data => {
                data.forEach((zone) => {
                    console.log(zone.slug)
                    this.displayGeometries(zone.slug);
                })
            });
        //this.displayGeometries('d');
        */
        this.displayIUOC(this);

        //-----------------------------------------
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
        initSources() {
            this.zone_source = new VectorSource({
                projection: 'EPSG:4326'
            });
            this.space_source_a = new VectorSource({
                projection: 'EPSG:4326'
            });
            this.space_source_b = new VectorSource({
                projection: 'EPSG:4326'
            });
            this.space_source_c = new VectorSource({
                projection: 'EPSG:4326'
            });
            this.space_source_d = new VectorSource({
                projection: 'EPSG:4326'
            });
            this.space_source_e = new VectorSource({
                projection: 'EPSG:4326'
            });
            this.oc_bus_source = new VectorSource({
                projection: 'EPSG:4326'
            });
        },

        initLayers() {
            this.zone_layer = new VectorLayer({
                name: 'zone',
                source: this.zone_source,
            });
            this.space_layer_a = new VectorLayer({
                title: 'Etage A',
                visible: true,
                source: this.space_source_a,
                zIndex: 1,
            });
            this.space_layer_b = new VectorLayer({
                title: 'Etage B',
                visible: false,
                source: this.space_source_b,
                zIndex: 2,
            });
            this.space_layer_c = new VectorLayer({
                title: 'Etage C',
                visible: false,
                source: this.space_source_c,
                zIndex: 3,
            });
            this.space_layer_d = new VectorLayer({
                title: 'Etage D',
                visible: false,
                source: this.space_source_d,
                zIndex: 4,
            });
            this.space_layer_g = new VectorLayer({
                title: 'Etage G',
                visible: false,
                source: this.space_source_g,
                zIndex: 7,
            });
            this.oc_bus_layer = new VectorLayer({
                title: 'Capteur PM',
                visible: true,
                source: this.oc_bus_source,
                zIndex: 99,
            });
        },

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
                    }),
                    this.space_layer_a,
                    this.space_layer_b,
                    this.space_layer_c,
                    this.space_layer_d,
                    this.space_layer_g,
                    this.oc_bus_layer,
                ],
                view: new View({
                    projection: get('EPSG:2056'),
                    center: [2540477.8, 1181216.6],
                    zoom: 19,
                }),
            });

            const layerSwitcher = new LayerSwitcher({
                reverse: true,
                groupSelectStyle: 'group'
            });
            this.map.addControl(layerSwitcher);
        },

        async displayGeometries(zone_slug, layer) {
            //this.displayZone(zone_slug);
            this.displaySpace(zone_slug, layer);
            this.displayPassageway(zone_slug, layer);
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
            });
        },

        async displaySpace(zone_slug, source) {

            const zone_geom = await fetch(`http://127.0.0.1:8000/api/space/by_zone_slug/${zone_slug}/?format=json`)
                .then((response) => { return response.json() });

            if (zone_geom.length != undefined) {
                zone_geom.forEach(polygon => {
                    const feature = new Feature({
                        geometry: new Polygon(polygon.geom.coordinates),
                        label: polygon.name,
                    });
                    feature.setId(polygon.slug);
                    if (polygon.name == 'Vide') {
                        feature.setStyle(new Style({
                            stroke: new Stroke({
                                color: 'rgba(0, 0, 0, 1)',
                                width: 1,
                            }),
                            fill: new Fill({
                                color: 'rgba(60, 179, 113, 0.7)',
                            })
                        }));
                    }
                    else if (polygon.name == 'Dégagement') {
                        feature.setStyle(new Style({
                            stroke: new Stroke({
                                color: 'rgba(0, 0, 0, 1)',
                                width: 1,
                            }),
                            fill: new Fill({
                                color: 'rgba(192, 192, 192, 1)',
                            })
                        }));
                    }
                    else {
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
                    }
                    feature.getGeometry().transform('EPSG:4326', 'EPSG:2056')
                    source.addFeature(feature);
                });
            }
            //this.setExtentMap(this.space_source);
        },

        async displayPassageway(zone_slug, source) {
            const passageway_geom = await fetch(`http://127.0.0.1:8000/api/passageway/by_zone_slug/${zone_slug}/?format=json`)
                .then((response) => { return response.json() });

            if (passageway_geom.length != undefined) {
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
                    feature.getGeometry().transform('EPSG:4326', 'EPSG:2056');
                    source.addFeature(feature);
                })
            }
        },

        setExtentMap(source) {
            const extent = source.getExtent();
            const bufferExtend = buffer(extent, 15);
            this.map.getView().fit(bufferExtend, this.map.getSize());
        },

        calculateCentroid(coordinates) {
            console.log(coordinates)
            let sumE = 0;
            let sumN = 0;

            coordinates.forEach(coord => {
                sumE += coord[0];
                sumN += coord[1];
            });

            const centroidE = sumE / coordinates.length;
            const centroidN = sumN / coordinates.length;

            return [centroidE, centroidN];
        },

        async displayIUOC(that) {

            // GET token for requests on devices
            connectThingsboard()
                .then(function (data) {

                    const token = data['token'];

                    //##############################################
                    //IUOC_REDS_blind (A14)
                    //##############################################
                    const IUOC_REDS_blind = "IUOC_REDS_blind"
                    get_deviceId_from_deviceName(token, IUOC_REDS_blind)
                        .then(function (data) {
                            const deviceID = data.id.id;

                            //Recuperation data from attributes
                            get_attributes_from_deviceId(token, deviceID)
                                .then(function (data) {
                                    //Recuperation attribut label
                                    const label_thingsboard = data.label;
                                    console.log("SALLE", label_thingsboard.toLowerCase());
                                    // Get feature
                                    const features = that.space_source_a.getFeatures();
                                    features.forEach(feature => {

                                        if (feature.getId() == label_thingsboard.toLowerCase()) {
                                            console.log("SALLE TROUVEE", label_thingsboard);

                                            // Get centroid on features
                                            const coordinates = feature.getGeometry().getCoordinates()[0];
                                            const res = that.calculateCentroid(coordinates);

                                            // Create centroid
                                            const feature_oc = new Feature({
                                                geometry: new Point(res),
                                                label: IUOC_REDS_blind
                                            })
                                            feature_oc.setStyle(new Style({
                                                text: new Text({
                                                    text: IUOC_REDS_blind,
                                                    font: 'bold 11px "Roboto"',
                                                    fill: new Fill({
                                                        color: 'black',
                                                    }),
                                                    offsetY: 20,
                                                }),
                                                image: new Icon({
                                                    scale: 0.1,
                                                    src: require(`../assets/blind.png`),
                                                })
                                            }));
                                            that.space_source_a.addFeature(feature_oc)

                                        }
                                    })
                                });
                        });

                    //##############################################
                    //IUOC_REDS_camera (A14)
                    //##############################################
                    const IUOC_REDS_camera = "IUOC_REDS_camera"
                    get_deviceId_from_deviceName(token, IUOC_REDS_camera)
                        .then(function (data) {
                            const deviceID = data.id.id;

                            //Recuperation data from attributes
                            get_attributes_from_deviceId(token, deviceID)
                                .then(function (data) {
                                    //Recuperation attribut label
                                    const label_thingsboard = data.label;
                                    console.log("SALLE", label_thingsboard.toLowerCase());
                                    // Get feature
                                    const features = that.space_source_a.getFeatures();
                                    features.forEach(feature => {

                                        if (feature.getId() == label_thingsboard.toLowerCase()) {
                                            console.log("SALLE TROUVEE", label_thingsboard);

                                            // Get centroid on features
                                            const coordinates = feature.getGeometry().getCoordinates()[0];
                                            const res = that.calculateCentroid(coordinates);

                                            // Create centroid
                                            const feature_oc = new Feature({
                                                geometry: new Point(res),
                                                label: IUOC_REDS_camera
                                            })
                                            feature_oc.setStyle(new Style({
                                                text: new Text({
                                                    text: IUOC_REDS_camera,
                                                    font: 'bold 11px "Roboto"',
                                                    fill: new Fill({
                                                        color: 'black',
                                                    }),
                                                    offsetY: 20,
                                                }),
                                                image: new Icon({
                                                    scale: 0.1,
                                                    src: require(`../assets/camera.png`),
                                                })
                                            }));
                                            that.space_source_a.addFeature(feature_oc)

                                        }
                                    })
                                });
                        });

                    //##############################################
                    //IUOC_REDS_remote (A23)
                    //##############################################
                    const IUOC_REDS_remote = "IUOC_REDS_remote"
                    get_deviceId_from_deviceName(token, IUOC_REDS_remote)
                        .then(function (data) {
                            const deviceID = data.id.id;

                            //Recuperation data from attributes
                            get_attributes_from_deviceId(token, deviceID)
                                .then(function (data) {
                                    //Recuperation attribut label
                                    const label_thingsboard = data.label;
                                    console.log("SALLE", label_thingsboard.toLowerCase());
                                    // Get feature
                                    const features = that.space_source_a.getFeatures();
                                    features.forEach(feature => {

                                        if (feature.getId() == label_thingsboard.toLowerCase()) {
                                            console.log("SALLE TROUVEE", label_thingsboard);

                                            // Get centroid on features
                                            const coordinates = feature.getGeometry().getCoordinates()[0];
                                            const res = that.calculateCentroid(coordinates);

                                            // Create centroid
                                            const feature_oc = new Feature({
                                                geometry: new Point(res),
                                                label: IUOC_REDS_remote
                                            })
                                            feature_oc.setStyle(new Style({
                                                text: new Text({
                                                    text: IUOC_REDS_remote,
                                                    font: 'bold 11px "Roboto"',
                                                    fill: new Fill({
                                                        color: 'black',
                                                    }),
                                                    offsetY: 20,
                                                }),
                                                image: new Icon({
                                                    scale: 0.1,
                                                    src: require(`../assets/remote.png`),
                                                })
                                            }));
                                            that.space_source_a.addFeature(feature_oc)

                                        }
                                    })
                                });
                        });

                    //##############################################
                    //IUOC_IAI_UWFS (C09)
                    //##############################################
                    const IUOC_IAI_UWFS = "IUOC_IAI_UWFS"
                    get_deviceId_from_deviceName(token, IUOC_IAI_UWFS)
                        .then(function (data) {
                            const deviceID = data.id.id;

                            //Recuperation data from attributes
                            get_attributes_from_deviceId(token, deviceID)
                                .then(function (data) {
                                    //Recuperation attribut label
                                    const label_thingsboard = data.label;
                                    console.log("SALLE", label_thingsboard.toLowerCase());
                                    // Get feature
                                    const features = that.space_source_c.getFeatures();
                                    features.forEach(feature => {

                                        if (feature.getId() == label_thingsboard.toLowerCase()) {
                                            console.log("SALLE TROUVEE", label_thingsboard);

                                            // Get centroid on features
                                            const coordinates = feature.getGeometry().getCoordinates()[0];
                                            const res = that.calculateCentroid(coordinates);

                                            // Create centroid
                                            const feature_oc = new Feature({
                                                geometry: new Point(res),
                                                label: IUOC_IAI_UWFS
                                            })
                                            feature_oc.setStyle(new Style({
                                                text: new Text({
                                                    text: IUOC_IAI_UWFS,
                                                    font: 'bold 11px "Roboto"',
                                                    fill: new Fill({
                                                        color: 'black',
                                                    }),
                                                    offsetY: 20,
                                                }),
                                                image: new Icon({
                                                    scale: 0.1,
                                                    src: require(`../assets/temperature.png`),
                                                })
                                            }));
                                            that.space_source_c.addFeature(feature_oc)

                                        }
                                    })
                                });
                        });

                    //##############################################
                    //IUOC_IAI_UWFS (C09)
                    //##############################################
                    const MiRi = "MiRi"
                    get_deviceId_from_deviceName(token, MiRi)
                        .then(function (data) {
                            const deviceID = data.id.id;

                            //Recuperation data from attributes
                            get_attributes_from_deviceId(token, deviceID)
                                .then(function (data) {
                                    //Recuperation attribut label
                                    const label_thingsboard = data.label;
                                    console.log("SALLE", label_thingsboard.toLowerCase());
                                    // Get feature
                                    const features = that.space_source_c.getFeatures();
                                    features.forEach(feature => {

                                        if (feature.getId() == label_thingsboard.toLowerCase()) {
                                            console.log("SALLE TROUVEE", label_thingsboard);

                                            // Get centroid on features
                                            const coordinates = feature.getGeometry().getCoordinates()[0];
                                            const res = that.calculateCentroid(coordinates);

                                            // Create centroid
                                            const feature_oc = new Feature({
                                                geometry: new Point(res),
                                                label: MiRi
                                            })
                                            feature_oc.setStyle(new Style({
                                                text: new Text({
                                                    text: MiRi,
                                                    font: 'bold 11px "Roboto"',
                                                    fill: new Fill({
                                                        color: 'black',
                                                    }),
                                                    offsetY: 20,
                                                }),
                                                image: new Icon({
                                                    scale: 0.1,
                                                    src: require(`../assets/smart-home.png`),
                                                })
                                            }));
                                            that.space_source_c.addFeature(feature_oc)

                                        }
                                    })
                                });
                        });


                    //##############################################
                    //IUOC_INSIT_camera
                    //##############################################
                    const IUOC_INSIT_camera = "IUOC_INSIT_camera"
                    get_deviceId_from_deviceName(token, IUOC_INSIT_camera)
                        .then(function (data) {
                            const deviceID = data.id.id;

                            //Recuperation data from attributes
                            get_attributes_from_deviceId(token, deviceID)
                                .then(function (data) {
                                    //Recuperation attribut label
                                    const label = data.label;

                                    // Get feature
                                    const features = that.space_source_d.getFeatures();
                                    features.forEach(feature => {

                                        if (feature.getId() == label) {
                                            // Get centroid on features
                                            const coordinates = feature.getGeometry().getCoordinates()[0];
                                            const res = that.calculateCentroid(coordinates);

                                            // Create centroid
                                            const feature_oc = new Feature({
                                                geometry: new Point(res),
                                                label: IUOC_INSIT_camera
                                            })
                                            feature_oc.setStyle(new Style({
                                                text: new Text({
                                                    text: IUOC_INSIT_camera,
                                                    font: 'bold 11px "Roboto"',
                                                    fill: new Fill({
                                                        color: 'black',
                                                    }),
                                                    offsetY: 20,
                                                }),
                                                image: new Icon({
                                                    scale: 0.1,
                                                    src: require('../assets/camera.png'),
                                                })
                                            }));
                                            that.space_source_d.addFeature(feature_oc)

                                        }
                                    })
                                });
                        });

                    //##############################################
                    // IUOC_INSIT_capteur_particules'
                    //#############################################
                    const item_particules = "IUOC_INSIT_capteur_particules"
                    get_deviceId_from_deviceName(token, item_particules)
                        .then(function (capteur_particule) {

                            const deviceId = capteur_particule.id.id;

                            get_telemetry_from_deviceId(token, deviceId)
                                .then(function (position) {

                                    const latitude = parseFloat(position['lat_deg'][0]['value']);
                                    const longitude = parseFloat(position['lon_deg'][0]['value']);
                                    // display sensor on map
                                    const feature = new Feature({
                                        geometry: new Point([
                                            longitude, latitude
                                        ]),
                                    });
                                    feature.setId(item_particules);
                                    feature.setStyle(new Style({
                                        text: new Text({
                                            text: "IUOC_INSIT_capteur_particules",
                                            font: 'bold 11px "Roboto"',
                                            fill: new Fill({
                                                color: 'black',
                                            }),
                                            offsetY: 20,
                                        }),
                                        image: new Icon({
                                            scale: 0.1,
                                            src: require('../assets/bus.png'),
                                        })
                                    }));

                                    feature.getGeometry().transform('EPSG:4326', 'EPSG:2056');
                                    that.oc_bus_source.addFeature(feature);
                                })

                            setInterval(function () {
                                get_telemetry_from_deviceId(token, deviceId)
                                    .then(function (position) {

                                        // Delete features
                                        const features = that.oc_bus_source.getFeatures();
                                        features.forEach(feature => {
                                            that.oc_bus_source.removeFeature(feature);
                                        });

                                        // Add feature
                                        const latitude = parseFloat(position['lat_deg'][0]['value']);
                                        const longitude = parseFloat(position['lon_deg'][0]['value']);
                                        const feature = new Feature({
                                            geometry: new Point([
                                                longitude, latitude
                                            ]),
                                        });
                                        feature.setId(item_particules);
                                        feature.setStyle(new Style({
                                            text: new Text({
                                                text: "IUOC_INSIT_capteur_particules",
                                                font: 'bold 11px "Roboto"',
                                                fill: new Fill({
                                                    color: 'black',
                                                }),
                                                offsetY: 20,
                                            }),
                                            image: new Icon({
                                                scale: 0.1,
                                                src: require('../assets/bus.png'),
                                            })
                                        }));

                                        feature.getGeometry().transform('EPSG:4326', 'EPSG:2056');
                                        that.oc_bus_source.addFeature(feature);
                                    })


                            }, 1000);


                        })
                })
                .catch(error => console.log(error));
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
