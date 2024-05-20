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

        this.displaySpace_zoneA();
        this.displayPassageway_zoneA();

        // GET 'zone' in DB
        //this.displayGeometries('a', this.space_source_a);
        //this.displayGeometries('b', this.space_source_b);
        //this.displayGeometries('c', this.space_source_c);
        //this.displayGeometries('d', this.space_source_d);
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

        async displaySpace_zoneA() {

            const zone_geom = [
                {
                    "type": "Feature",
                    "properties": {
                        "id": 1,
                        "name": "A01",
                        "slug": "a01",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658547965778847,
                                        46.77966742793653
                                    ],
                                    [
                                        6.658625795528412,
                                        46.779710319950944
                                    ],
                                    [
                                        6.658640544309197,
                                        46.77969769001841
                                    ],
                                    [
                                        6.658639318642985,
                                        46.779697014554195
                                    ],
                                    [
                                        6.658703229946943,
                                        46.77964228482508
                                    ],
                                    [
                                        6.658704455612712,
                                        46.77964296028859
                                    ],
                                    [
                                        6.658719204356631,
                                        46.77963033034584
                                    ],
                                    [
                                        6.658641374648277,
                                        46.779587438394714
                                    ],
                                    [
                                        6.658547965778847,
                                        46.77966742793653
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 2,
                        "name": "A03",
                        "slug": "a03",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658626818050004,
                                        46.77971030685168
                                    ],
                                    [
                                        6.658666039388505,
                                        46.77973192170449
                                    ],
                                    [
                                        6.658680378477618,
                                        46.77971964259846
                                    ],
                                    [
                                        6.658679152810405,
                                        46.77971896713465
                                    ],
                                    [
                                        6.658741589225491,
                                        46.779665500378066
                                    ],
                                    [
                                        6.658704819236658,
                                        46.779645236478096
                                    ],
                                    [
                                        6.658642382808562,
                                        46.779698703214706
                                    ],
                                    [
                                        6.658641157142316,
                                        46.77969802775051
                                    ],
                                    [
                                        6.658626818050004,
                                        46.77971030685168
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 3,
                        "name": "A05a",
                        "slug": "a05a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658761860256438,
                                        46.77965245409641
                                    ],
                                    [
                                        6.658682216978439,
                                        46.77972065579411
                                    ],
                                    [
                                        6.658680991311225,
                                        46.779719980330356
                                    ],
                                    [
                                        6.658666652222161,
                                        46.779732259436486
                                    ],
                                    [
                                        6.658745707829212,
                                        46.779775826832655
                                    ],
                                    [
                                        6.658838706905916,
                                        46.77969618796225
                                    ],
                                    [
                                        6.658837481237351,
                                        46.77969551250016
                                    ],
                                    [
                                        6.658838464486038,
                                        46.779694670502884
                                    ],
                                    [
                                        6.65880169444084,
                                        46.77967440663421
                                    ],
                                    [
                                        6.658800711191949,
                                        46.77967524863119
                                    ],
                                    [
                                        6.65879764702275,
                                        46.7796735599749
                                    ],
                                    [
                                        6.658798630271658,
                                        46.77967271797798
                                    ],
                                    [
                                        6.658761860256438,
                                        46.77965245409641
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 4,
                        "name": "A05b",
                        "slug": "a05b",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.65884054540905,
                                        46.77969720115538
                                    ],
                                    [
                                        6.658839319740348,
                                        46.77969652569332
                                    ],
                                    [
                                        6.658746320663831,
                                        46.779776164564176
                                    ],
                                    [
                                        6.65882533563593,
                                        46.77981970944017
                                    ],
                                    [
                                        6.658918334670744,
                                        46.779740070505305
                                    ],
                                    [
                                        6.658917149763957,
                                        46.77973941750884
                                    ],
                                    [
                                        6.658918133012198,
                                        46.779738575510905
                                    ],
                                    [
                                        6.658881362907056,
                                        46.779718311668034
                                    ],
                                    [
                                        6.658880379658609,
                                        46.77971915366563
                                    ],
                                    [
                                        6.658877315484413,
                                        46.77971746501151
                                    ],
                                    [
                                        6.658878298732876,
                                        46.77971662301388
                                    ],
                                    [
                                        6.658841528657708,
                                        46.77969635915809
                                    ],
                                    [
                                        6.65884054540905,
                                        46.77969720115538
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 5,
                        "name": "A07",
                        "slug": "a07",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658957967323983,
                                        46.77976052799396
                                    ],
                                    [
                                        6.658921197188876,
                                        46.77974026416394
                                    ],
                                    [
                                        6.65892021394065,
                                        46.779741106161914
                                    ],
                                    [
                                        6.658918947506096,
                                        46.77974040823594
                                    ],
                                    [
                                        6.658825948471592,
                                        46.779820047171256
                                    ],
                                    [
                                        6.658944879499209,
                                        46.77988558940864
                                    ],
                                    [
                                        6.659037878471046,
                                        46.779805950377074
                                    ],
                                    [
                                        6.659036652797387,
                                        46.77980527491715
                                    ],
                                    [
                                        6.659037636044964,
                                        46.7798044329182
                                    ],
                                    [
                                        6.659000865849911,
                                        46.77978416911395
                                    ],
                                    [
                                        6.658999882602129,
                                        46.77978501111257
                                    ],
                                    [
                                        6.658996818420445,
                                        46.77978332246169
                                    ],
                                    [
                                        6.658997801668245,
                                        46.77978248046305
                                    ],
                                    [
                                        6.658961031503165,
                                        46.77976221664595
                                    ],
                                    [
                                        6.65896004825516,
                                        46.77976305864423
                                    ],
                                    [
                                        6.658956984075964,
                                        46.779761369992265
                                    ],
                                    [
                                        6.658957967323983,
                                        46.77976052799396
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 6,
                        "name": "A07b",
                        "slug": "a07b",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659039716981574,
                                        46.77980696356698
                                    ],
                                    [
                                        6.659038491307875,
                                        46.77980628810703
                                    ],
                                    [
                                        6.658974989837308,
                                        46.779860667190086
                                    ],
                                    [
                                        6.659014824262554,
                                        46.779882619653
                                    ],
                                    [
                                        6.658985326768313,
                                        46.77990787961224
                                    ],
                                    [
                                        6.659024548394529,
                                        46.77992949434134
                                    ],
                                    [
                                        6.659117547324341,
                                        46.77984985524528
                                    ],
                                    [
                                        6.659116321648693,
                                        46.7798491797862
                                    ],
                                    [
                                        6.659117304895825,
                                        46.77984833778653
                                    ],
                                    [
                                        6.659080534640833,
                                        46.77982807400809
                                    ],
                                    [
                                        6.659079551393482,
                                        46.77982891600742
                                    ],
                                    [
                                        6.659076487206798,
                                        46.779827227358645
                                    ],
                                    [
                                        6.659077470454155,
                                        46.77982638535936
                                    ],
                                    [
                                        6.659040700229133,
                                        46.779806121567994
                                    ],
                                    [
                                        6.659039716981574,
                                        46.77980696356698
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 7,
                        "name": "A07a",
                        "slug": "A07a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658945492336395,
                                        46.77988592713911
                                    ],
                                    [
                                        6.658984713930629,
                                        46.779907541882
                                    ],
                                    [
                                        6.659013719800317,
                                        46.77988270292229
                                    ],
                                    [
                                        6.65897449821252,
                                        46.77986108818935
                                    ],
                                    [
                                        6.658945492336395,
                                        46.77988592713911
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 8,
                        "name": "A09",
                        "slug": "a09",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659025161232671,
                                        46.77992983207136
                                    ],
                                    [
                                        6.659144051981006,
                                        46.779995351635606
                                    ],
                                    [
                                        6.659237050847877,
                                        46.779915712442865
                                    ],
                                    [
                                        6.659235825169162,
                                        46.779915036984995
                                    ],
                                    [
                                        6.659236808415643,
                                        46.77991419498437
                                    ],
                                    [
                                        6.659200038070727,
                                        46.779893931244565
                                    ],
                                    [
                                        6.659199054824055,
                                        46.779894773244926
                                    ],
                                    [
                                        6.659195990629884,
                                        46.77989308459937
                                    ],
                                    [
                                        6.659196973876562,
                                        46.77989224259904
                                    ],
                                    [
                                        6.659160203561641,
                                        46.77987197884635
                                    ],
                                    [
                                        6.659159220314735,
                                        46.779872820846386
                                    ],
                                    [
                                        6.659156156123056,
                                        46.77987113219978
                                    ],
                                    [
                                        6.659157139369968,
                                        46.779870290199774
                                    ],
                                    [
                                        6.65912036908499,
                                        46.77985002643422
                                    ],
                                    [
                                        6.659119385837874,
                                        46.7798508684339
                                    ],
                                    [
                                        6.659118160162179,
                                        46.77985019297481
                                    ],
                                    [
                                        6.659025161232671,
                                        46.77992983207136
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 9,
                        "name": "A09a",
                        "slug": "a09a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659239872612289,
                                        46.77991588362879
                                    ],
                                    [
                                        6.659238889365841,
                                        46.779916725629505
                                    ],
                                    [
                                        6.659237663687158,
                                        46.779916050171735
                                    ],
                                    [
                                        6.659144664820658,
                                        46.779995689365016
                                    ],
                                    [
                                        6.659183845810579,
                                        46.780017281574445
                                    ],
                                    [
                                        6.659276844656437,
                                        46.779937642349466
                                    ],
                                    [
                                        6.659275659740949,
                                        46.77993698935673
                                    ],
                                    [
                                        6.659276642987194,
                                        46.7799361473557
                                    ],
                                    [
                                        6.659239872612289,
                                        46.77991588362879
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 10,
                        "name": "A11",
                        "slug": "a11",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659279707186356,
                                        46.77993783599907
                                    ],
                                    [
                                        6.659278723940129,
                                        46.779938678000114
                                    ],
                                    [
                                        6.659277457496263,
                                        46.77993798007813
                                    ],
                                    [
                                        6.659230999076541,
                                        46.77997776461709
                                    ],
                                    [
                                        6.659270261616461,
                                        46.7799994017262
                                    ],
                                    [
                                        6.659316720025859,
                                        46.77995961717139
                                    ],
                                    [
                                        6.659315494345181,
                                        46.77995894171441
                                    ],
                                    [
                                        6.659316477591206,
                                        46.77995809971309
                                    ],
                                    [
                                        6.659279707186356,
                                        46.77993783599907
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 11,
                        "name": "A11a",
                        "slug": "a11",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659223721201005,
                                        46.780039256428665
                                    ],
                                    [
                                        6.659269769992686,
                                        46.7799998227267
                                    ],
                                    [
                                        6.659230507452686,
                                        46.77997818561741
                                    ],
                                    [
                                        6.659184458650741,
                                        46.78001761930362
                                    ],
                                    [
                                        6.659223721201005,
                                        46.780039256428665
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 12,
                        "name": "A13a",
                        "slug": "a13a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659224334041657,
                                        46.78003959415763
                                    ],
                                    [
                                        6.6592635558597,
                                        46.780061208804234
                                    ],
                                    [
                                        6.659292479746408,
                                        46.78003643994098
                                    ],
                                    [
                                        6.659253257934592,
                                        46.78001482530414
                                    ],
                                    [
                                        6.659224334041657,
                                        46.78003959415763
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 13,
                        "name": "A13b",
                        "slug": "a13b",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.65926416870085,
                                        46.780061546533
                                    ],
                                    [
                                        6.659302164867589,
                                        46.78008248570877
                                    ],
                                    [
                                        6.659331088747932,
                                        46.780057716835564
                                    ],
                                    [
                                        6.659293092587265,
                                        46.78003677766951
                                    ],
                                    [
                                        6.65926416870085,
                                        46.780061546533
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 14,
                        "name": "A13",
                        "slug": "a13",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659331580371555,
                                        46.78005729583498
                                    ],
                                    [
                                        6.659396146896642,
                                        46.78000200438599
                                    ],
                                    [
                                        6.659359376431837,
                                        46.77998174069778
                                    ],
                                    [
                                        6.659358393186066,
                                        46.77998258269944
                                    ],
                                    [
                                        6.659355328981897,
                                        46.779980894058234
                                    ],
                                    [
                                        6.659356312227698,
                                        46.77998005205654
                                    ],
                                    [
                                        6.659319541792859,
                                        46.77995978835539
                                    ],
                                    [
                                        6.659318558546852,
                                        46.779960630356754
                                    ],
                                    [
                                        6.659317332866173,
                                        46.77995995489987
                                    ],
                                    [
                                        6.659253749558615,
                                        46.78001440430374
                                    ],
                                    [
                                        6.659331580371555,
                                        46.78005729583498
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 15,
                        "name": "Dégagement",
                        "slug": "degagement",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659399358148509,
                                        46.78000169827886
                                    ],
                                    [
                                        6.65942885550016,
                                        46.779976438213005
                                    ],
                                    [
                                        6.659427119116723,
                                        46.77997548131738
                                    ],
                                    [
                                        6.659428102361302,
                                        46.77997463931505
                                    ],
                                    [
                                        6.65939133190315,
                                        46.779954375637075
                                    ],
                                    [
                                        6.659390348658365,
                                        46.77995521763904
                                    ],
                                    [
                                        6.659387284454751,
                                        46.77995352899865
                                    ],
                                    [
                                        6.659388267699579,
                                        46.77995268699669
                                    ],
                                    [
                                        6.659351497271373,
                                        46.77993242330577
                                    ],
                                    [
                                        6.659350514026367,
                                        46.779933265307456
                                    ],
                                    [
                                        6.659347449825264,
                                        46.779931576665966
                                    ],
                                    [
                                        6.659348433070275,
                                        46.779930734664326
                                    ],
                                    [
                                        6.659311662672099,
                                        46.77991047096057
                                    ],
                                    [
                                        6.659310679426852,
                                        46.77991131296186
                                    ],
                                    [
                                        6.659307615228222,
                                        46.77990962431935
                                    ],
                                    [
                                        6.659308598473479,
                                        46.77990878231803
                                    ],
                                    [
                                        6.659271828105252,
                                        46.779888518601354
                                    ],
                                    [
                                        6.6592708448598,
                                        46.77988936060235
                                    ],
                                    [
                                        6.659267780663673,
                                        46.779887671958726
                                    ],
                                    [
                                        6.659268763909303,
                                        46.77988682995761
                                    ],
                                    [
                                        6.659231993570887,
                                        46.77986656622821
                                    ],
                                    [
                                        6.659231010325213,
                                        46.77986740822882
                                    ],
                                    [
                                        6.659227946131584,
                                        46.779865719584144
                                    ],
                                    [
                                        6.659228929377275,
                                        46.779864877583556
                                    ],
                                    [
                                        6.659192159069003,
                                        46.77984461384106
                                    ],
                                    [
                                        6.659191175823096,
                                        46.77984545584139
                                    ],
                                    [
                                        6.659188111631984,
                                        46.77984376719562
                                    ],
                                    [
                                        6.659189094877896,
                                        46.77984292519535
                                    ],
                                    [
                                        6.659152324599591,
                                        46.77982266143998
                                    ],
                                    [
                                        6.659151341353463,
                                        46.779823503439935
                                    ],
                                    [
                                        6.659148277164835,
                                        46.77982181479312
                                    ],
                                    [
                                        6.659149260410969,
                                        46.77982097279319
                                    ],
                                    [
                                        6.659112490162637,
                                        46.779800709024954
                                    ],
                                    [
                                        6.659111506916284,
                                        46.77980155102457
                                    ],
                                    [
                                        6.659108442730168,
                                        46.779799862376635
                                    ],
                                    [
                                        6.659109425976524,
                                        46.77979902037705
                                    ],
                                    [
                                        6.659072655758152,
                                        46.77977875659594
                                    ],
                                    [
                                        6.659071672511581,
                                        46.7797795985952
                                    ],
                                    [
                                        6.659068608327959,
                                        46.779777909946255
                                    ],
                                    [
                                        6.65906959157455,
                                        46.779777067947
                                    ],
                                    [
                                        6.659032821386144,
                                        46.77975680415297
                                    ],
                                    [
                                        6.65903183813936,
                                        46.779757646151914
                                    ],
                                    [
                                        6.659028773958234,
                                        46.7797559575018
                                    ],
                                    [
                                        6.659029757205022,
                                        46.77975511550297
                                    ],
                                    [
                                        6.658992987046613,
                                        46.779734851696006
                                    ],
                                    [
                                        6.658992003799608,
                                        46.77973569369463
                                    ],
                                    [
                                        6.658988939620963,
                                        46.77973400504349
                                    ],
                                    [
                                        6.658989922867987,
                                        46.7797331630449
                                    ],
                                    [
                                        6.658953152739561,
                                        46.779712899225125
                                    ],
                                    [
                                        6.658952169492309,
                                        46.77971374122338
                                    ],
                                    [
                                        6.658949105316172,
                                        46.779712052571185
                                    ],
                                    [
                                        6.658950129532062,
                                        46.779711175489695
                                    ],
                                    [
                                        6.65891335943359,
                                        46.779690911657035
                                    ],
                                    [
                                        6.658912335217497,
                                        46.77969178873815
                                    ],
                                    [
                                        6.658911109548018,
                                        46.779691113276904
                                    ],
                                    [
                                        6.658881612109999,
                                        46.779716373209915
                                    ],
                                    [
                                        6.658882837779671,
                                        46.77971704867155
                                    ],
                                    [
                                        6.658881854531269,
                                        46.779717890669176
                                    ],
                                    [
                                        6.658918624636308,
                                        46.779738154511925
                                    ],
                                    [
                                        6.658919607884507,
                                        46.77973731251395
                                    ],
                                    [
                                        6.658922672061157,
                                        46.779739001166945
                                    ],
                                    [
                                        6.658921688812977,
                                        46.77973984316497
                                    ],
                                    [
                                        6.658958458947983,
                                        46.77976010699483
                                    ],
                                    [
                                        6.658959442195958,
                                        46.7797592649965
                                    ],
                                    [
                                        6.658962506375112,
                                        46.779760953648434
                                    ],
                                    [
                                        6.658961523127156,
                                        46.779761795646785
                                    ],
                                    [
                                        6.658998293292134,
                                        46.779782059463756
                                    ],
                                    [
                                        6.658999276539886,
                                        46.779781217465086
                                    ],
                                    [
                                        6.659002340721526,
                                        46.77978290611595
                                    ],
                                    [
                                        6.65900135747379,
                                        46.779783748114625
                                    ],
                                    [
                                        6.65903812766874,
                                        46.77980401191869
                                    ],
                                    [
                                        6.659039110916284,
                                        46.77980316991968
                                    ],
                                    [
                                        6.659042175100417,
                                        46.77980485856949
                                    ],
                                    [
                                        6.659041191852901,
                                        46.77980570056846
                                    ],
                                    [
                                        6.659077962077832,
                                        46.779825964359674
                                    ],
                                    [
                                        6.659078945325128,
                                        46.779825122360336
                                    ],
                                    [
                                        6.659082009511782,
                                        46.77982681100906
                                    ],
                                    [
                                        6.659081026264478,
                                        46.7798276530084
                                    ],
                                    [
                                        6.659117796519367,
                                        46.77984791678669
                                    ],
                                    [
                                        6.659118779766467,
                                        46.77984707478705
                                    ],
                                    [
                                        6.659121843955607,
                                        46.77984876343468
                                    ],
                                    [
                                        6.659120860708537,
                                        46.77984960543433
                                    ],
                                    [
                                        6.659157630993411,
                                        46.77986986919978
                                    ],
                                    [
                                        6.659158614240289,
                                        46.77986902719979
                                    ],
                                    [
                                        6.659161665466652,
                                        46.77987070870131
                                    ],
                                    [
                                        6.659160695185066,
                                        46.779871557846384
                                    ],
                                    [
                                        6.659197465499906,
                                        46.77989182159889
                                    ],
                                    [
                                        6.659198448746548,
                                        46.77989097959852
                                    ],
                                    [
                                        6.659201512940679,
                                        46.779892668243974
                                    ],
                                    [
                                        6.659200529694052,
                                        46.779893510244385
                                    ],
                                    [
                                        6.659237300038865,
                                        46.779913773984006
                                    ],
                                    [
                                        6.659238283285274,
                                        46.77991293198331
                                    ],
                                    [
                                        6.659241347481926,
                                        46.77991462062771
                                    ],
                                    [
                                        6.659240364235502,
                                        46.779915462628466
                                    ],
                                    [
                                        6.659277134610294,
                                        46.77993572635519
                                    ],
                                    [
                                        6.659278117856505,
                                        46.77993488435419
                                    ],
                                    [
                                        6.659281182055635,
                                        46.779936572997514
                                    ],
                                    [
                                        6.659280198809453,
                                        46.779937414998535
                                    ],
                                    [
                                        6.659316969214205,
                                        46.779957678712364
                                    ],
                                    [
                                        6.659317952460182,
                                        46.779956836711044
                                    ],
                                    [
                                        6.65932101666181,
                                        46.77995852535329
                                    ],
                                    [
                                        6.659320033415864,
                                        46.77995936735467
                                    ],
                                    [
                                        6.6593568038506,
                                        46.77997963105568
                                    ],
                                    [
                                        6.659357787096344,
                                        46.7799787890539
                                    ],
                                    [
                                        6.659360851300469,
                                        46.77998047769513
                                    ],
                                    [
                                        6.65935986805473,
                                        46.77998131969688
                                    ],
                                    [
                                        6.659396638519421,
                                        46.78000158338498
                                    ],
                                    [
                                        6.659397621770317,
                                        46.780000741381826
                                    ],
                                    [
                                        6.659399358148509,
                                        46.78000169827886
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 16,
                        "name": "A18",
                        "slug": "a18",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.65942859398358,
                                        46.779974218313896
                                    ],
                                    [
                                        6.659492013193165,
                                        46.779919909146166
                                    ],
                                    [
                                        6.659455242748351,
                                        46.77989964548857
                                    ],
                                    [
                                        6.659454259505565,
                                        46.779900487491155
                                    ],
                                    [
                                        6.659453033824541,
                                        46.77989981203569
                                    ],
                                    [
                                        6.659423536526365,
                                        46.77992507210812
                                    ],
                                    [
                                        6.659424762207601,
                                        46.77992574756392
                                    ],
                                    [
                                        6.659422304098193,
                                        46.77992785256964
                                    ],
                                    [
                                        6.659421027025272,
                                        46.779927148792574
                                    ],
                                    [
                                        6.659391529697134,
                                        46.77995240885665
                                    ],
                                    [
                                        6.659392806770282,
                                        46.779953112634026
                                    ],
                                    [
                                        6.659391823525531,
                                        46.77995395463606
                                    ],
                                    [
                                        6.65942859398358,
                                        46.779974218313896
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 17,
                        "name": "A18b",
                        "slug": "a18b",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.65944586957018,
                                        46.779850888665436
                                    ],
                                    [
                                        6.659416372295468,
                                        46.7798761487362
                                    ],
                                    [
                                        6.659416882995474,
                                        46.77987643017614
                                    ],
                                    [
                                        6.659415899752499,
                                        46.77987727217838
                                    ],
                                    [
                                        6.659452670167256,
                                        46.779897535848676
                                    ],
                                    [
                                        6.659453653410014,
                                        46.77989669384611
                                    ],
                                    [
                                        6.659456717612473,
                                        46.779898382484724
                                    ],
                                    [
                                        6.659455734369734,
                                        46.77989922448732
                                    ],
                                    [
                                        6.659492504814421,
                                        46.779919488144714
                                    ],
                                    [
                                        6.659522985318812,
                                        46.779893386051285
                                    ],
                                    [
                                        6.65944586957018,
                                        46.779850888665436
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 18,
                        "name": "A18a",
                        "slug": "a18a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659415408131006,
                                        46.77987769317948
                                    ],
                                    [
                                        6.659414424887996,
                                        46.7798785351817
                                    ],
                                    [
                                        6.659413147816347,
                                        46.77987783140457
                                    ],
                                    [
                                        6.659383650511509,
                                        46.77990309146674
                                    ],
                                    [
                                        6.659384927583385,
                                        46.779903795244216
                                    ],
                                    [
                                        6.659383944339424,
                                        46.779904637246176
                                    ],
                                    [
                                        6.659420714760842,
                                        46.7799249009267
                                    ],
                                    [
                                        6.659421698004598,
                                        46.77992405892442
                                    ],
                                    [
                                        6.659422923685755,
                                        46.77992473438019
                                    ],
                                    [
                                        6.659452420984026,
                                        46.779899474307925
                                    ],
                                    [
                                        6.659451195303062,
                                        46.779898798852464
                                    ],
                                    [
                                        6.659452178545865,
                                        46.77989795684989
                                    ],
                                    [
                                        6.659415408131006,
                                        46.77987769317948
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 19,
                        "name": "A16",
                        "slug": "a16",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659388759321943,
                                        46.779952265995696
                                    ],
                                    [
                                        6.659389742566699,
                                        46.7799514239937
                                    ],
                                    [
                                        6.659390916856409,
                                        46.77995207112862
                                    ],
                                    [
                                        6.659420414184666,
                                        46.77992681106467
                                    ],
                                    [
                                        6.659419239895146,
                                        46.77992616393009
                                    ],
                                    [
                                        6.659420223138938,
                                        46.779925321927834
                                    ],
                                    [
                                        6.659383452717419,
                                        46.77990505824716
                                    ],
                                    [
                                        6.659382469473422,
                                        46.77990590024906
                                    ],
                                    [
                                        6.65938119240153,
                                        46.779905196471574
                                    ],
                                    [
                                        6.659351695066731,
                                        46.77993045652543
                                    ],
                                    [
                                        6.659352972138839,
                                        46.77993116030328
                                    ],
                                    [
                                        6.659351988893879,
                                        46.779932002304946
                                    ],
                                    [
                                        6.659388759321943,
                                        46.779952265995696
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 20,
                        "name": "A14",
                        "slug": "a14",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659351082226523,
                                        46.77993011879717
                                    ],
                                    [
                                        6.659380579561436,
                                        46.77990485874347
                                    ],
                                    [
                                        6.65937940527285,
                                        46.77990421160847
                                    ],
                                    [
                                        6.65938186787199,
                                        46.77990210907758
                                    ],
                                    [
                                        6.659383037671423,
                                        46.77990275373863
                                    ],
                                    [
                                        6.659412534976363,
                                        46.77987749367661
                                    ],
                                    [
                                        6.65941136068799,
                                        46.77987684654193
                                    ],
                                    [
                                        6.659413818795498,
                                        46.77987474153644
                                    ],
                                    [
                                        6.65941432949549,
                                        46.779875022976384
                                    ],
                                    [
                                        6.659443826770543,
                                        46.77984976290618
                                    ],
                                    [
                                        6.659365996168092,
                                        46.77980687145038
                                    ],
                                    [
                                        6.659336498879845,
                                        46.77983213150053
                                    ],
                                    [
                                        6.659337213858865,
                                        46.77983252551705
                                    ],
                                    [
                                        6.659334755750272,
                                        46.779834630520895
                                    ],
                                    [
                                        6.65933404077143,
                                        46.779834236504485
                                    ],
                                    [
                                        6.659304543453525,
                                        46.77985949654646
                                    ],
                                    [
                                        6.659305258432341,
                                        46.779859890562996
                                    ],
                                    [
                                        6.659302800321274,
                                        46.77986199556614
                                    ],
                                    [
                                        6.659302085342296,
                                        46.779861601549506
                                    ],
                                    [
                                        6.659272587994547,
                                        46.7798868615832
                                    ],
                                    [
                                        6.659273302973372,
                                        46.779887255599874
                                    ],
                                    [
                                        6.659272319727966,
                                        46.779888097600875
                                    ],
                                    [
                                        6.659309090096093,
                                        46.77990836131736
                                    ],
                                    [
                                        6.659310073341291,
                                        46.77990751931607
                                    ],
                                    [
                                        6.659313137539867,
                                        46.77990920795856
                                    ],
                                    [
                                        6.659312154294685,
                                        46.779910049959895
                                    ],
                                    [
                                        6.659348924692671,
                                        46.779930313663634
                                    ],
                                    [
                                        6.659349907937767,
                                        46.77992947166189
                                    ],
                                    [
                                        6.659351082226523,
                                        46.77993011879717
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 21,
                        "name": "A12a",
                        "slug": "a12a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659365179049569,
                                        46.77980642114611
                                    ],
                                    [
                                        6.659325753096796,
                                        46.779784693957595
                                    ],
                                    [
                                        6.659296255802002,
                                        46.779809953997486
                                    ],
                                    [
                                        6.659297379339262,
                                        46.77981057316656
                                    ],
                                    [
                                        6.659294921230132,
                                        46.77981267816957
                                    ],
                                    [
                                        6.659293797692754,
                                        46.779812059000434
                                    ],
                                    [
                                        6.659264300368067,
                                        46.77983731903204
                                    ],
                                    [
                                        6.659265423905541,
                                        46.7798379382014
                                    ],
                                    [
                                        6.659262965793913,
                                        46.7798400432037
                                    ],
                                    [
                                        6.659261842256307,
                                        46.77983942403424
                                    ],
                                    [
                                        6.659232344901671,
                                        46.77986468405752
                                    ],
                                    [
                                        6.659233468439352,
                                        46.77986530322724
                                    ],
                                    [
                                        6.659232485193737,
                                        46.77986614522787
                                    ],
                                    [
                                        6.659269255531865,
                                        46.77988640895728
                                    ],
                                    [
                                        6.6592702387773,
                                        46.779885566956324
                                    ],
                                    [
                                        6.659271770875304,
                                        46.77988641127812
                                    ],
                                    [
                                        6.659301268223465,
                                        46.77986115124477
                                    ],
                                    [
                                        6.659299736125702,
                                        46.77986030692339
                                    ],
                                    [
                                        6.659302194236818,
                                        46.7798582019203
                                    ],
                                    [
                                        6.659303726334571,
                                        46.77985904624167
                                    ],
                                    [
                                        6.659333223652757,
                                        46.77983378619995
                                    ],
                                    [
                                        6.659331691555274,
                                        46.77983294187898
                                    ],
                                    [
                                        6.659334149663891,
                                        46.7798308368752
                                    ],
                                    [
                                        6.659335681761275,
                                        46.779831681196086
                                    ],
                                    [
                                        6.659365179049569,
                                        46.77980642114611
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 22,
                        "name": "A12",
                        "slug": "a12",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659324935978994,
                                        46.77978424365304
                                    ],
                                    [
                                        6.659246697007579,
                                        46.77974112696323
                                    ],
                                    [
                                        6.659217199699556,
                                        46.77976638698286
                                    ],
                                    [
                                        6.65921771039748,
                                        46.779766668423676
                                    ],
                                    [
                                        6.659215252287228,
                                        46.77976877342499
                                    ],
                                    [
                                        6.659213975220783,
                                        46.77976806964561
                                    ],
                                    [
                                        6.659184477882641,
                                        46.77979332965666
                                    ],
                                    [
                                        6.659185754949329,
                                        46.77979403343639
                                    ],
                                    [
                                        6.65918329683658,
                                        46.77979613843699
                                    ],
                                    [
                                        6.659182019769904,
                                        46.77979543465726
                                    ],
                                    [
                                        6.659152522401794,
                                        46.77982069465999
                                    ],
                                    [
                                        6.659153799468709,
                                        46.77982139844003
                                    ],
                                    [
                                        6.659152816222627,
                                        46.779822240440026
                                    ],
                                    [
                                        6.659189586500841,
                                        46.7798425041952
                                    ],
                                    [
                                        6.659190569746719,
                                        46.779841662194904
                                    ],
                                    [
                                        6.65919363393779,
                                        46.77984335084063
                                    ],
                                    [
                                        6.659192650691939,
                                        46.779844192840905
                                    ],
                                    [
                                        6.659229421000108,
                                        46.77986445658322
                                    ],
                                    [
                                        6.659230404245766,
                                        46.7798636145826
                                    ],
                                    [
                                        6.659231527783388,
                                        46.77986423375232
                                    ],
                                    [
                                        6.659261025138287,
                                        46.779838973729326
                                    ],
                                    [
                                        6.659259901600842,
                                        46.7798383545599
                                    ],
                                    [
                                        6.65926235971251,
                                        46.779836249557626
                                    ],
                                    [
                                        6.659263483249929,
                                        46.77983686872704
                                    ],
                                    [
                                        6.659292980574754,
                                        46.77981160869562
                                    ],
                                    [
                                        6.659291857037602,
                                        46.779810989526545
                                    ],
                                    [
                                        6.659294315146797,
                                        46.77980888452362
                                    ],
                                    [
                                        6.659295438684015,
                                        46.77980950369272
                                    ],
                                    [
                                        6.659324935978994,
                                        46.77978424365304
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 23,
                        "name": "A10b",
                        "slug": "a10b",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.65924465421628,
                                        46.77974000120038
                                    ],
                                    [
                                        6.659206862592463,
                                        46.7797191745809
                                    ],
                                    [
                                        6.659177365277779,
                                        46.77974443459028
                                    ],
                                    [
                                        6.659177875975299,
                                        46.779744716031296
                                    ],
                                    [
                                        6.659176892731005,
                                        46.77974555803149
                                    ],
                                    [
                                        6.659213662965903,
                                        46.779765821779094
                                    ],
                                    [
                                        6.659214646210006,
                                        46.77976497977863
                                    ],
                                    [
                                        6.659215156907902,
                                        46.77976526121947
                                    ],
                                    [
                                        6.65924465421628,
                                        46.77974000120038
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 24,
                        "name": "A10a",
                        "slug": "a10a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.65920481980283,
                                        46.77971804881731
                                    ],
                                    [
                                        6.659167028209828,
                                        46.7796972221846
                                    ],
                                    [
                                        6.659137530888485,
                                        46.77972248218379
                                    ],
                                    [
                                        6.659138028620355,
                                        46.7797227564799
                                    ],
                                    [
                                        6.659137058341061,
                                        46.77972360562483
                                    ],
                                    [
                                        6.659173828545999,
                                        46.77974386938533
                                    ],
                                    [
                                        6.659174811790322,
                                        46.77974302738514
                                    ],
                                    [
                                        6.659175322487804,
                                        46.779743308826156
                                    ],
                                    [
                                        6.65920481980283,
                                        46.77971804881731
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 25,
                        "name": "A10",
                        "slug": "a10",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659135583474216,
                                        46.779724868624555
                                    ],
                                    [
                                        6.659134306409816,
                                        46.77972416484426
                                    ],
                                    [
                                        6.65910480905841,
                                        46.7797494248349
                                    ],
                                    [
                                        6.659106086122986,
                                        46.77975012861548
                                    ],
                                    [
                                        6.659103628009138,
                                        46.77975223361438
                                    ],
                                    [
                                        6.659102350944598,
                                        46.779751529833824
                                    ],
                                    [
                                        6.659072853563127,
                                        46.77977678981607
                                    ],
                                    [
                                        6.659074130627936,
                                        46.779777493597024
                                    ],
                                    [
                                        6.659073147381423,
                                        46.77977833559627
                                    ],
                                    [
                                        6.659109917599691,
                                        46.779798599377244
                                    ],
                                    [
                                        6.659110900846,
                                        46.779797757377665
                                    ],
                                    [
                                        6.659113965032088,
                                        46.7797994460255
                                    ],
                                    [
                                        6.659112981785795,
                                        46.77980028802512
                                    ],
                                    [
                                        6.659149752034035,
                                        46.779820551793215
                                    ],
                                    [
                                        6.659150735280125,
                                        46.77981970979328
                                    ],
                                    [
                                        6.659151909564078,
                                        46.7798203569306
                                    ],
                                    [
                                        6.65918140693229,
                                        46.779795096928076
                                    ],
                                    [
                                        6.65918023264852,
                                        46.779794449791
                                    ],
                                    [
                                        6.659182690761301,
                                        46.779792344790465
                                    ],
                                    [
                                        6.659183865045052,
                                        46.77979299192751
                                    ],
                                    [
                                        6.65921336238328,
                                        46.77976773191656
                                    ],
                                    [
                                        6.659212188099723,
                                        46.779767084779834
                                    ],
                                    [
                                        6.659213171343884,
                                        46.779766242779345
                                    ],
                                    [
                                        6.659176401108835,
                                        46.77974597903159
                                    ],
                                    [
                                        6.659175417864492,
                                        46.779746821031765
                                    ],
                                    [
                                        6.659172353679473,
                                        46.779745132385564
                                    ],
                                    [
                                        6.659173336923831,
                                        46.77974429038539
                                    ],
                                    [
                                        6.659136566718778,
                                        46.77972402662472
                                    ],
                                    [
                                        6.659135583474216,
                                        46.779724868624555
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 26,
                        "name": "A08",
                        "slug": "a08",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659072240726375,
                                        46.77977645208627
                                    ],
                                    [
                                        6.659101738107922,
                                        46.77975119210415
                                    ],
                                    [
                                        6.659100563826074,
                                        46.779750544966284
                                    ],
                                    [
                                        6.659103021939951,
                                        46.77974843996743
                                    ],
                                    [
                                        6.659104196221797,
                                        46.779749087105294
                                    ],
                                    [
                                        6.659133693573312,
                                        46.77972382711479
                                    ],
                                    [
                                        6.659132519291706,
                                        46.779723179977275
                                    ],
                                    [
                                        6.659133502536286,
                                        46.77972233797749
                                    ],
                                    [
                                        6.659096732361157,
                                        46.779702074203975
                                    ],
                                    [
                                        6.659095749116408,
                                        46.779702916203384
                                    ],
                                    [
                                        6.659092684936397,
                                        46.779701227555044
                                    ],
                                    [
                                        6.659093668181211,
                                        46.77970038555558
                                    ],
                                    [
                                        6.659056898036096,
                                        46.77968012176913
                                    ],
                                    [
                                        6.659055914791089,
                                        46.779680963768264
                                    ],
                                    [
                                        6.659054637728801,
                                        46.7796802599871
                                    ],
                                    [
                                        6.659025140364038,
                                        46.77970551995726
                                    ],
                                    [
                                        6.659026417426554,
                                        46.77970622373877
                                    ],
                                    [
                                        6.659023959311584,
                                        46.77970832873597
                                    ],
                                    [
                                        6.659022682249051,
                                        46.77970762495445
                                    ],
                                    [
                                        6.658993184854317,
                                        46.77973288491628
                                    ],
                                    [
                                        6.658994461917062,
                                        46.779733588698136
                                    ],
                                    [
                                        6.658993478670103,
                                        46.77973443069672
                                    ],
                                    [
                                        6.659030248828409,
                                        46.77975469450352
                                    ],
                                    [
                                        6.659031232075176,
                                        46.77975385250453
                                    ],
                                    [
                                        6.659034296256274,
                                        46.77975554115455
                                    ],
                                    [
                                        6.659033313009525,
                                        46.77975638315349
                                    ],
                                    [
                                        6.659070083197814,
                                        46.77977664694737
                                    ],
                                    [
                                        6.65907106644436,
                                        46.77977580494808
                                    ],
                                    [
                                        6.659072240726375,
                                        46.77977645208627
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 27,
                        "name": "A08a",
                        "slug": "a08a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659087359541964,
                                        46.77965331735015
                                    ],
                                    [
                                        6.659057862207301,
                                        46.779678577328845
                                    ],
                                    [
                                        6.659058372903561,
                                        46.77967885877039
                                    ],
                                    [
                                        6.659057389658589,
                                        46.77967970076955
                                    ],
                                    [
                                        6.659094159803588,
                                        46.77969996455584
                                    ],
                                    [
                                        6.659095143048356,
                                        46.77969912255634
                                    ],
                                    [
                                        6.659098207228332,
                                        46.77970081120464
                                    ],
                                    [
                                        6.659097223983593,
                                        46.77970165320416
                                    ],
                                    [
                                        6.659133994158564,
                                        46.77972191697754
                                    ],
                                    [
                                        6.659134977403098,
                                        46.77972107497776
                                    ],
                                    [
                                        6.659135488100164,
                                        46.77972135641894
                                    ],
                                    [
                                        6.65916498542185,
                                        46.77969609642032
                                    ],
                                    [
                                        6.659087359541964,
                                        46.77965331735015
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 28,
                        "name": "A06b",
                        "slug": "a06b",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659046810282667,
                                        46.779630970893656
                                    ],
                                    [
                                        6.659017312941237,
                                        46.779656230862
                                    ],
                                    [
                                        6.659018538611248,
                                        46.77965690632218
                                    ],
                                    [
                                        6.659016080498223,
                                        46.77965901131921
                                    ],
                                    [
                                        6.65901485482817,
                                        46.779658335859
                                    ],
                                    [
                                        6.658985357456779,
                                        46.779683595818945
                                    ],
                                    [
                                        6.658986583127014,
                                        46.779684271279464
                                    ],
                                    [
                                        6.658985599880844,
                                        46.77968511327802
                                    ],
                                    [
                                        6.65902237000253,
                                        46.779705377087424
                                    ],
                                    [
                                        6.659023353248496,
                                        46.77970453508856
                                    ],
                                    [
                                        6.659024527528462,
                                        46.77970518222725
                                    ],
                                    [
                                        6.659085316757314,
                                        46.779652191584404
                                    ],
                                    [
                                        6.659046810282667,
                                        46.779630970893656
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 29,
                        "name": "A06",
                        "slug": "a06",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658984125011514,
                                        46.77968637627579
                                    ],
                                    [
                                        6.658982899341251,
                                        46.779685700815264
                                    ],
                                    [
                                        6.658953401939867,
                                        46.779710960766906
                                    ],
                                    [
                                        6.658954627610333,
                                        46.779711636227766
                                    ],
                                    [
                                        6.658953644363138,
                                        46.77971247822601
                                    ],
                                    [
                                        6.658990414491473,
                                        46.779732742045624
                                    ],
                                    [
                                        6.658991397738463,
                                        46.77973190004704
                                    ],
                                    [
                                        6.658992572018604,
                                        46.77973254718603
                                    ],
                                    [
                                        6.659022069413456,
                                        46.77970728722438
                                    ],
                                    [
                                        6.659020895133497,
                                        46.7797066400857
                                    ],
                                    [
                                        6.659021878379519,
                                        46.77970579808685
                                    ],
                                    [
                                        6.658985108257742,
                                        46.779685534277256
                                    ],
                                    [
                                        6.658984125011514,
                                        46.77968637627579
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 30,
                        "name": "A06a",
                        "slug": "a06a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658955493034264,
                                        46.77970830754122
                                    ],
                                    [
                                        6.658982286506128,
                                        46.77968536308502
                                    ],
                                    [
                                        6.658981060835887,
                                        46.779684687624425
                                    ],
                                    [
                                        6.658983518951485,
                                        46.77968258262816
                                    ],
                                    [
                                        6.658984744621667,
                                        46.779683258088696
                                    ],
                                    [
                                        6.659014241993193,
                                        46.77965799812892
                                    ],
                                    [
                                        6.659013016323206,
                                        46.77965732266868
                                    ],
                                    [
                                        6.659015474436264,
                                        46.779655217671696
                                    ],
                                    [
                                        6.659016700106132,
                                        46.77965589313186
                                    ],
                                    [
                                        6.659046197447765,
                                        46.77963063316376
                                    ],
                                    [
                                        6.659008201699316,
                                        46.77960969390158
                                    ],
                                    [
                                        6.658917497266292,
                                        46.779687368249014
                                    ],
                                    [
                                        6.658955493034264,
                                        46.77970830754122
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 31,
                        "name": "Dégagement",
                        "slug": "degagement",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658910496713277,
                                        46.77969077554621
                                    ],
                                    [
                                        6.658909271043855,
                                        46.77969010008491
                                    ],
                                    [
                                        6.658910254602922,
                                        46.77968925782016
                                    ],
                                    [
                                        6.658873484534412,
                                        46.7796689939746
                                    ],
                                    [
                                        6.65887250097514,
                                        46.779669836239
                                    ],
                                    [
                                        6.658869436803997,
                                        46.77966814758469
                                    ],
                                    [
                                        6.65888828237936,
                                        46.779652009296925
                                    ],
                                    [
                                        6.658872961528162,
                                        46.77964356602635
                                    ],
                                    [
                                        6.658871322782783,
                                        46.77964496935566
                                    ],
                                    [
                                        6.658868258613102,
                                        46.77964328070126
                                    ],
                                    [
                                        6.658849873598985,
                                        46.779633148773144
                                    ],
                                    [
                                        6.658848643721804,
                                        46.77963247099113
                                    ],
                                    [
                                        6.658833815833815,
                                        46.779645168750555
                                    ],
                                    [
                                        6.658835041501296,
                                        46.779645844212716
                                    ],
                                    [
                                        6.658832583381616,
                                        46.7796479492058
                                    ],
                                    [
                                        6.658829519212951,
                                        46.77964626055041
                                    ],
                                    [
                                        6.658830581634717,
                                        46.7796453507532
                                    ],
                                    [
                                        6.658793815835971,
                                        46.77962508920192
                                    ],
                                    [
                                        6.658792832587856,
                                        46.7796259311988
                                    ],
                                    [
                                        6.658789768421701,
                                        46.77962424254228
                                    ],
                                    [
                                        6.658790751669834,
                                        46.779623400545425
                                    ],
                                    [
                                        6.658753981691234,
                                        46.77960313666117
                                    ],
                                    [
                                        6.65875299844291,
                                        46.77960397865774
                                    ],
                                    [
                                        6.658751466361056,
                                        46.779603134328966
                                    ],
                                    [
                                        6.65872176461875,
                                        46.77962828164379
                                    ],
                                    [
                                        6.658723500978459,
                                        46.779629238550186
                                    ],
                                    [
                                        6.658721042855165,
                                        46.77963134354086
                                    ],
                                    [
                                        6.658719817189477,
                                        46.77963066807753
                                    ],
                                    [
                                        6.658705068445622,
                                        46.779643298020375
                                    ],
                                    [
                                        6.658706294111424,
                                        46.77964397348392
                                    ],
                                    [
                                        6.658705310861583,
                                        46.779644815480026
                                    ],
                                    [
                                        6.658742080850339,
                                        46.77966507937981
                                    ],
                                    [
                                        6.658760270963398,
                                        46.77964950244417
                                    ],
                                    [
                                        6.658763335130065,
                                        46.77965119110147
                                    ],
                                    [
                                        6.658762351880983,
                                        46.77965203309809
                                    ],
                                    [
                                        6.6587991218961,
                                        46.77967229697952
                                    ],
                                    [
                                        6.658800105144964,
                                        46.77967145498255
                                    ],
                                    [
                                        6.658803169314141,
                                        46.77967314363879
                                    ],
                                    [
                                        6.658802186065276,
                                        46.77967398563574
                                    ],
                                    [
                                        6.658838956110359,
                                        46.77969424950432
                                    ],
                                    [
                                        6.658839939359011,
                                        46.77969340750702
                                    ],
                                    [
                                        6.658843003530667,
                                        46.77969509616215
                                    ],
                                    [
                                        6.658842020998276,
                                        46.77969593754608
                                    ],
                                    [
                                        6.658878791073323,
                                        46.77971620140177
                                    ],
                                    [
                                        6.658879773605531,
                                        46.77971536001746
                                    ],
                                    [
                                        6.658880999275155,
                                        46.77971603547907
                                    ],
                                    [
                                        6.658910496713277,
                                        46.77969077554621
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 32,
                        "name": "Toilettes femmes",
                        "slug": "toilettes_femmes",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658892618102638,
                                        46.77967884648412
                                    ],
                                    [
                                        6.658910746226642,
                                        46.77968883682121
                                    ],
                                    [
                                        6.658930576636289,
                                        46.77967185516483
                                    ],
                                    [
                                        6.658912448514334,
                                        46.779661864830885
                                    ],
                                    [
                                        6.658892618102638,
                                        46.77967884648412
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 33,
                        "name": "Toilettes hommes",
                        "slug": "toilettes_hommes",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658892107394535,
                                        46.779678565034814
                                    ],
                                    [
                                        6.658912183617998,
                                        46.77966137288214
                                    ],
                                    [
                                        6.658930822447997,
                                        46.77967164466531
                                    ],
                                    [
                                        6.658973182065305,
                                        46.779635370204595
                                    ],
                                    [
                                        6.658936412009922,
                                        46.779615106379126
                                    ],
                                    [
                                        6.658873976158235,
                                        46.77966857297579
                                    ],
                                    [
                                        6.658892107394535,
                                        46.779678565034814
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 34,
                        "name": "Ascenseur",
                        "slug": "ascenseur",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658892751632175,
                                        46.779625468851044
                                    ],
                                    [
                                        6.658872144416237,
                                        46.77964311571855
                                    ],
                                    [
                                        6.658872961528162,
                                        46.77964356602635
                                    ],
                                    [
                                        6.65888828237936,
                                        46.779652009296925
                                    ],
                                    [
                                        6.658889508047617,
                                        46.77965268475842
                                    ],
                                    [
                                        6.658910115261574,
                                        46.77963503788782
                                    ],
                                    [
                                        6.658892751632175,
                                        46.779625468851044
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 35,
                        "name": "Escalier",
                        "slug": "escalier",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658868258613102,
                                        46.77964328070126
                                    ],
                                    [
                                        6.658885408014008,
                                        46.77962859491581
                                    ],
                                    [
                                        6.658862123220093,
                                        46.77962265888853
                                    ],
                                    [
                                        6.658849873598985,
                                        46.779633148773144
                                    ],
                                    [
                                        6.658868258613102,
                                        46.77964328070126
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 36,
                        "name": "A02a",
                        "slug": "a02a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658862123220093,
                                        46.77962265888853
                                    ],
                                    [
                                        6.658885408014008,
                                        46.77962859491581
                                    ],
                                    [
                                        6.658907588479286,
                                        46.779609600793115
                                    ],
                                    [
                                        6.658909835536534,
                                        46.77961083913891
                                    ],
                                    [
                                        6.658895086842665,
                                        46.779623469106376
                                    ],
                                    [
                                        6.658911224803703,
                                        46.77963236268145
                                    ],
                                    [
                                        6.65893334783989,
                                        46.779613417726466
                                    ],
                                    [
                                        6.658914962823734,
                                        46.77960328580881
                                    ],
                                    [
                                        6.658917420938145,
                                        46.77960118081393
                                    ],
                                    [
                                        6.658946530549862,
                                        46.7796172230149
                                    ],
                                    [
                                        6.65894423631011,
                                        46.779619187677405
                                    ],
                                    [
                                        6.658953428822895,
                                        46.77962425363416
                                    ],
                                    [
                                        6.658955723062435,
                                        46.77962228897157
                                    ],
                                    [
                                        6.658975640178919,
                                        46.77963326520845
                                    ],
                                    [
                                        6.659005137527327,
                                        46.779608005250864
                                    ],
                                    [
                                        6.65892853329036,
                                        46.779565788955736
                                    ],
                                    [
                                        6.658862123220093,
                                        46.77962265888853
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 37,
                        "name": "A02",
                        "slug": "A02",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658847639346479,
                                        46.779521208492085
                                    ],
                                    [
                                        6.658818141971752,
                                        46.77954646840924
                                    ],
                                    [
                                        6.658819367636768,
                                        46.77954714387158
                                    ],
                                    [
                                        6.658754473315404,
                                        46.77960271566294
                                    ],
                                    [
                                        6.658791243293888,
                                        46.779622979546986
                                    ],
                                    [
                                        6.658792226541974,
                                        46.779622137550106
                                    ],
                                    [
                                        6.658795290708087,
                                        46.77962382620654
                                    ],
                                    [
                                        6.658794307460017,
                                        46.77962466820346
                                    ],
                                    [
                                        6.658831073258648,
                                        46.779644929754596
                                    ],
                                    [
                                        6.658831977332694,
                                        46.77964415555737
                                    ],
                                    [
                                        6.658833203000111,
                                        46.77964483101951
                                    ],
                                    [
                                        6.658848030888122,
                                        46.77963213326012
                                    ],
                                    [
                                        6.658846809430552,
                                        46.77963146011809
                                    ],
                                    [
                                        6.658925469123377,
                                        46.77956410030286
                                    ],
                                    [
                                        6.658847639346479,
                                        46.779521208492085
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 38,
                        "name": "A02b",
                        "slug": "a02b",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658807805256644,
                                        46.77949925596989
                                    ],
                                    [
                                        6.658778307875258,
                                        46.7795245158768
                                    ],
                                    [
                                        6.658779533539275,
                                        46.77952519133955
                                    ],
                                    [
                                        6.65877855029276,
                                        46.77952603333631
                                    ],
                                    [
                                        6.658815320227954,
                                        46.779546297212825
                                    ],
                                    [
                                        6.658816303474263,
                                        46.77954545521576
                                    ],
                                    [
                                        6.658817529139246,
                                        46.779546130678085
                                    ],
                                    [
                                        6.658847026514075,
                                        46.77952087076108
                                    ],
                                    [
                                        6.658807805256644,
                                        46.77949925596989
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 39,
                        "name": "A53",
                        "slug": "a53",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658807192424754,
                                        46.77949891823864
                                    ],
                                    [
                                        6.658769196862105,
                                        46.779477978896566
                                    ],
                                    [
                                        6.658689512882738,
                                        46.77954621568403
                                    ],
                                    [
                                        6.658727508462587,
                                        46.779567155052504
                                    ],
                                    [
                                        6.658775236926882,
                                        46.779526283137315
                                    ],
                                    [
                                        6.658774011262888,
                                        46.779525607674515
                                    ],
                                    [
                                        6.658776469379269,
                                        46.77952350268267
                                    ],
                                    [
                                        6.658777695043251,
                                        46.77952417814544
                                    ],
                                    [
                                        6.658807192424754,
                                        46.77949891823864
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 40,
                        "name": "A51",
                        "slug": "a51",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658728121294713,
                                        46.779567492784125
                                    ],
                                    [
                                        6.658766116904525,
                                        46.77958843213965
                                    ],
                                    [
                                        6.658814828604806,
                                        46.77954671821138
                                    ],
                                    [
                                        6.65877805866949,
                                        46.779526454334714
                                    ],
                                    [
                                        6.658777075422932,
                                        46.77952729633149
                                    ],
                                    [
                                        6.658775849758884,
                                        46.77952662086872
                                    ],
                                    [
                                        6.658728121294713,
                                        46.779567492784125
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 41,
                        "name": "Vide",
                        "slug": "vide",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.658880820469155,
                                        46.77949451903476
                                    ],
                                    [
                                        6.658851323124593,
                                        46.779519778960584
                                    ],
                                    [
                                        6.658927927235602,
                                        46.77956199530777
                                    ],
                                    [
                                        6.658957424567359,
                                        46.77953673536228
                                    ],
                                    [
                                        6.658880820469155,
                                        46.77949451903476
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 42,
                        "name": "Escalier",
                        "slug": "escalier",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659482727724187,
                                        46.779936773657724
                                    ],
                                    [
                                        6.659458031927311,
                                        46.77995792195857
                                    ],
                                    [
                                        6.659473352959616,
                                        46.779966365150244
                                    ],
                                    [
                                        6.659495803682931,
                                        46.77994713941943
                                    ],
                                    [
                                        6.659482727724187,
                                        46.779936773657724
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 43,
                        "name": "Dégagement",
                        "slug": "degagement",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659495803682931,
                                        46.77994713941943
                                    ],
                                    [
                                        6.659517598895349,
                                        46.77992847501956
                                    ],
                                    [
                                        6.659520663101613,
                                        46.77993016365646
                                    ],
                                    [
                                        6.659476417166645,
                                        46.77996805378834
                                    ],
                                    [
                                        6.659473352959616,
                                        46.779966365150244
                                    ],
                                    [
                                        6.659458031927287,
                                        46.77995792195856
                                    ],
                                    [
                                        6.659455573817699,
                                        46.779960026965014
                                    ],
                                    [
                                        6.659452305328878,
                                        46.779958225749034
                                    ],
                                    [
                                        6.65943018332282,
                                        46.779977169956716
                                    ],
                                    [
                                        6.659429468341388,
                                        46.77997677594086
                                    ],
                                    [
                                        6.659399970990031,
                                        46.78000203600699
                                    ],
                                    [
                                        6.659400685971506,
                                        46.780002430022954
                                    ],
                                    [
                                        6.659314815747159,
                                        46.780075964838815
                                    ],
                                    [
                                        6.659351892680583,
                                        46.78009639740534
                                    ],
                                    [
                                        6.659437762886973,
                                        46.780022862561786
                                    ],
                                    [
                                        6.659438682149687,
                                        46.78002336915351
                                    ],
                                    [
                                        6.659468179494571,
                                        46.77999810907746
                                    ],
                                    [
                                        6.659467260231902,
                                        46.779997602485935
                                    ],
                                    [
                                        6.659536906631319,
                                        46.779937960609665
                                    ],
                                    [
                                        6.659555752101104,
                                        46.77992182221231
                                    ],
                                    [
                                        6.659563945780106,
                                        46.77991480551678
                                    ],
                                    [
                                        6.659539125713412,
                                        46.77990112756628
                                    ],
                                    [
                                        6.659526014482836,
                                        46.77991235542461
                                    ],
                                    [
                                        6.65951375765982,
                                        46.77990560087569
                                    ],
                                    [
                                        6.659499009378883,
                                        46.779918230619174
                                    ],
                                    [
                                        6.659502277866853,
                                        46.7799200318338
                                    ],
                                    [
                                        6.659482727724187,
                                        46.779936773657724
                                    ],
                                    [
                                        6.659495803682931,
                                        46.77994713941943
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 44,
                        "name": "Ascenseur",
                        "slug": "ascenseur",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659555752101104,
                                        46.77992182221231
                                    ],
                                    [
                                        6.659536906631319,
                                        46.779937960609665
                                    ],
                                    [
                                        6.659563973803521,
                                        46.779952876894924
                                    ],
                                    [
                                        6.659582819270405,
                                        46.779936738493085
                                    ],
                                    [
                                        6.659555752101104,
                                        46.77992182221231
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 45,
                        "name": "A22",
                        "slug": "a22",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659530344942576,
                                        46.779947029881946
                                    ],
                                    [
                                        6.6595035106056,
                                        46.7799700095495
                                    ],
                                    [
                                        6.659541353590273,
                                        46.77999086421405
                                    ],
                                    [
                                        6.659568187921547,
                                        46.779967884537605
                                    ],
                                    [
                                        6.659530344942576,
                                        46.779947029881946
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 46,
                        "name": "Toilettes",
                        "slug": "toilettes",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659502281551479,
                                        46.779971062053164
                                    ],
                                    [
                                        6.659471186465394,
                                        46.77999769039255
                                    ],
                                    [
                                        6.659484975406334,
                                        46.78000528926347
                                    ],
                                    [
                                        6.659486491241136,
                                        46.780003991175825
                                    ],
                                    [
                                        6.659490832204815,
                                        46.78000638341258
                                    ],
                                    [
                                        6.659520411452835,
                                        46.77998105315607
                                    ],
                                    [
                                        6.659502281551479,
                                        46.779971062053164
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 47,
                        "name": "Toilettes",
                        "slug": "toilettes",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659492364309722,
                                        46.78000722773138
                                    ],
                                    [
                                        6.65949670527387,
                                        46.78000961996793
                                    ],
                                    [
                                        6.659495189439128,
                                        46.78001091805574
                                    ],
                                    [
                                        6.659508263404247,
                                        46.78001812290845
                                    ],
                                    [
                                        6.659509246648348,
                                        46.78001728090542
                                    ],
                                    [
                                        6.659510012701062,
                                        46.78001770306467
                                    ],
                                    [
                                        6.659540124536378,
                                        46.77999191671816
                                    ],
                                    [
                                        6.659521943557505,
                                        46.779981897474464
                                    ],
                                    [
                                        6.659492364309722,
                                        46.78000722773138
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 48,
                        "name": "Armoire technique",
                        "slug": "armoire_technique",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.65891335943359,
                                        46.779690911657035
                                    ],
                                    [
                                        6.658950129532062,
                                        46.779711175489695
                                    ],
                                    [
                                        6.658951563434218,
                                        46.7797099475756
                                    ],
                                    [
                                        6.65895278910464,
                                        46.77971062303645
                                    ],
                                    [
                                        6.658955001410714,
                                        46.779708728540385
                                    ],
                                    [
                                        6.658917005642611,
                                        46.77968778924802
                                    ],
                                    [
                                        6.65891335943359,
                                        46.779690911657035
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 49,
                        "name": "Armoire technique",
                        "slug": "armoire_technique",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659439231008067,
                                        46.78002505547619
                                    ],
                                    [
                                        6.659431037296966,
                                        46.780032072161895
                                    ],
                                    [
                                        6.659455653118328,
                                        46.78004563756118
                                    ],
                                    [
                                        6.659463846829198,
                                        46.78003862087298
                                    ],
                                    [
                                        6.659439231008067,
                                        46.78002505547619
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 50,
                        "name": "Dégagement",
                        "slug": "degagement",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659439231008067,
                                        46.78002505547619
                                    ],
                                    [
                                        6.659463846829198,
                                        46.78003862087298
                                    ],
                                    [
                                        6.659476307954525,
                                        46.78004548800164
                                    ],
                                    [
                                        6.659477291199615,
                                        46.7800446459989
                                    ],
                                    [
                                        6.659480355411251,
                                        46.78004633463687
                                    ],
                                    [
                                        6.659479372166179,
                                        46.780047176639634
                                    ],
                                    [
                                        6.659516142720798,
                                        46.780067440289045
                                    ],
                                    [
                                        6.659517125965667,
                                        46.78006659828598
                                    ],
                                    [
                                        6.659520190179791,
                                        46.78006828692285
                                    ],
                                    [
                                        6.659519206934908,
                                        46.780069128925966
                                    ],
                                    [
                                        6.659555977519521,
                                        46.780089392562445
                                    ],
                                    [
                                        6.659556960764166,
                                        46.780088550559064
                                    ],
                                    [
                                        6.65956002498078,
                                        46.78009023919488
                                    ],
                                    [
                                        6.659559041736152,
                                        46.78009108119829
                                    ],
                                    [
                                        6.659595812350712,
                                        46.78011134482194
                                    ],
                                    [
                                        6.659596795595148,
                                        46.78011050281822
                                    ],
                                    [
                                        6.659599859814247,
                                        46.78011219145291
                                    ],
                                    [
                                        6.659598876569854,
                                        46.780113033456715
                                    ],
                                    [
                                        6.659633093696516,
                                        46.780131889872635
                                    ],
                                    [
                                        6.659634076940733,
                                        46.78013104786857
                                    ],
                                    [
                                        6.659636528317876,
                                        46.78013239877557
                                    ],
                                    [
                                        6.659666025629681,
                                        46.780107138648724
                                    ],
                                    [
                                        6.659663574252935,
                                        46.78010578774236
                                    ],
                                    [
                                        6.659664557496355,
                                        46.78010494573787
                                    ],
                                    [
                                        6.659630340375649,
                                        46.78008608933144
                                    ],
                                    [
                                        6.659629357132196,
                                        46.78008693133549
                                    ],
                                    [
                                        6.659626292913596,
                                        46.78008524270156
                                    ],
                                    [
                                        6.659627276157054,
                                        46.78008440069754
                                    ],
                                    [
                                        6.659590505549051,
                                        46.78006413708397
                                    ],
                                    [
                                        6.659589522305376,
                                        46.78006497908767
                                    ],
                                    [
                                        6.659586458089273,
                                        46.78006329045266
                                    ],
                                    [
                                        6.659587441333003,
                                        46.78006244844893
                                    ],
                                    [
                                        6.659550670754944,
                                        46.7800421848225
                                    ],
                                    [
                                        6.659549687511046,
                                        46.78004302682587
                                    ],
                                    [
                                        6.659546623297435,
                                        46.78004133818977
                                    ],
                                    [
                                        6.659547606541336,
                                        46.780040496186416
                                    ],
                                    [
                                        6.659510835993286,
                                        46.780020232547066
                                    ],
                                    [
                                        6.659509852749168,
                                        46.780021074550085
                                    ],
                                    [
                                        6.659506788538054,
                                        46.78001938591292
                                    ],
                                    [
                                        6.659507771782191,
                                        46.78001854390995
                                    ],
                                    [
                                        6.659494442466193,
                                        46.780011198337355
                                    ],
                                    [
                                        6.659484739134979,
                                        46.78000585098473
                                    ],
                                    [
                                        6.659470694843248,
                                        46.779998111393894
                                    ],
                                    [
                                        6.659469711598892,
                                        46.77999895339656
                                    ],
                                    [
                                        6.659468792336545,
                                        46.77999844680522
                                    ],
                                    [
                                        6.659439294991516,
                                        46.78002370688131
                                    ],
                                    [
                                        6.659440214254266,
                                        46.78002421347302
                                    ],
                                    [
                                        6.659439231008067,
                                        46.78002505547619
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 51,
                        "name": "Entrée",
                        "slug": "entree",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659302361270155,
                                        46.78008663018976
                                    ],
                                    [
                                        6.659339131782629,
                                        46.78010689389472
                                    ],
                                    [
                                        6.659341589903442,
                                        46.78010478889085
                                    ],
                                    [
                                        6.659341896324508,
                                        46.780104957755
                                    ],
                                    [
                                        6.659351237181888,
                                        46.78009695873979
                                    ],
                                    [
                                        6.659314160250862,
                                        46.78007652617444
                                    ],
                                    [
                                        6.659302361270155,
                                        46.78008663018976
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 52,
                        "name": "Entrée",
                        "slug": "entree",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659639694685781,
                                        46.78013414370006
                                    ],
                                    [
                                        6.659669191991486,
                                        46.78010888356935
                                    ],
                                    [
                                        6.659666842755294,
                                        46.78010758895081
                                    ],
                                    [
                                        6.659637345443625,
                                        46.78013284907789
                                    ],
                                    [
                                        6.659639694685781,
                                        46.78013414370006
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 53,
                        "name": "A21",
                        "slug": "a21",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659429808239935,
                                        46.78003312466485
                                    ],
                                    [
                                        6.659345003191999,
                                        46.78010574733387
                                    ],
                                    [
                                        6.65938284621067,
                                        46.78012660205064
                                    ],
                                    [
                                        6.659475599139744,
                                        46.78004717316523
                                    ],
                                    [
                                        6.659474833086844,
                                        46.78004675100573
                                    ],
                                    [
                                        6.659475816331969,
                                        46.780045909003
                                    ],
                                    [
                                        6.659464887312001,
                                        46.78003988619346
                                    ],
                                    [
                                        6.659455956166993,
                                        46.78004753438364
                                    ],
                                    [
                                        6.659429808239935,
                                        46.78003312466485
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 54,
                        "name": "A23",
                        "slug": "a23",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659384378317322,
                                        46.780127446370884
                                    ],
                                    [
                                        6.659462515819479,
                                        46.78017050667621
                                    ],
                                    [
                                        6.659555268706644,
                                        46.78009107772656
                                    ],
                                    [
                                        6.659554502652507,
                                        46.78009065556756
                                    ],
                                    [
                                        6.659555485897187,
                                        46.780089813564196
                                    ],
                                    [
                                        6.65951871531246,
                                        46.780069549927504
                                    ],
                                    [
                                        6.659517732067589,
                                        46.780070391930586
                                    ],
                                    [
                                        6.659514667853429,
                                        46.780068703293615
                                    ],
                                    [
                                        6.659515651098342,
                                        46.78006786129056
                                    ],
                                    [
                                        6.659478880543632,
                                        46.78004759764098
                                    ],
                                    [
                                        6.659477897298514,
                                        46.78004843964373
                                    ],
                                    [
                                        6.659477131245579,
                                        46.780048017484255
                                    ],
                                    [
                                        6.659384378317322,
                                        46.780127446370884
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 55,
                        "name": "A27a",
                        "slug": "a27a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659464047928584,
                                        46.78017135099544
                                    ],
                                    [
                                        6.65950235067254,
                                        46.78019245896809
                                    ],
                                    [
                                        6.659532175828994,
                                        46.78016691820842
                                    ],
                                    [
                                        6.659493873091473,
                                        46.780145810245635
                                    ],
                                    [
                                        6.659464047928584,
                                        46.78017135099544
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 56,
                        "name": "A27b",
                        "slug": "a27b",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659538865983037,
                                        46.780212581890034
                                    ],
                                    [
                                        6.659568691133348,
                                        46.7801870411209
                                    ],
                                    [
                                        6.659533707939127,
                                        46.78016776252665
                                    ],
                                    [
                                        6.659503882782936,
                                        46.780193303286744
                                    ],
                                    [
                                        6.659538865983037,
                                        46.780212581890034
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 57,
                        "name": "A27",
                        "slug": "a27",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659569182756469,
                                        46.78018662011911
                                    ],
                                    [
                                        6.659632602074401,
                                        46.780132310874656
                                    ],
                                    [
                                        6.65959838494764,
                                        46.780113454458586
                                    ],
                                    [
                                        6.659597401703176,
                                        46.78011429646236
                                    ],
                                    [
                                        6.65959433748402,
                                        46.78011260782756
                                    ],
                                    [
                                        6.659595320728513,
                                        46.7801117658238
                                    ],
                                    [
                                        6.659558550113803,
                                        46.78009150220002
                                    ],
                                    [
                                        6.659557566869153,
                                        46.78009234420343
                                    ],
                                    [
                                        6.659556800814957,
                                        46.78009192204451
                                    ],
                                    [
                                        6.659494364714824,
                                        46.780145389244225
                                    ],
                                    [
                                        6.659569182756469,
                                        46.78018662011911
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 58,
                        "name": "A26",
                        "slug": "a26",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659593055753875,
                                        46.77993084755225
                                    ],
                                    [
                                        6.659558232609173,
                                        46.779960668512906
                                    ],
                                    [
                                        6.659570949079364,
                                        46.779967676350935
                                    ],
                                    [
                                        6.65951154480662,
                                        46.780018547383264
                                    ],
                                    [
                                        6.659512310859408,
                                        46.78001896954254
                                    ],
                                    [
                                        6.659511327615451,
                                        46.78001981154547
                                    ],
                                    [
                                        6.659548098163295,
                                        46.780040075184765
                                    ],
                                    [
                                        6.659549081407163,
                                        46.78003923318141
                                    ],
                                    [
                                        6.659552145620725,
                                        46.780040921817445
                                    ],
                                    [
                                        6.659551162377076,
                                        46.78004176382064
                                    ],
                                    [
                                        6.659587932954813,
                                        46.78006202744711
                                    ],
                                    [
                                        6.65958891619846,
                                        46.78006118544343
                                    ],
                                    [
                                        6.659589682252446,
                                        46.78006160760214
                                    ],
                                    [
                                        6.659683909625647,
                                        46.77998091554128
                                    ],
                                    [
                                        6.659593055753875,
                                        46.77993084755225
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 59,
                        "name": "A28",
                        "slug": "a28",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.65968544173283,
                                        46.77998175985751
                                    ],
                                    [
                                        6.659591214360472,
                                        46.78006245191963
                                    ],
                                    [
                                        6.659591980414506,
                                        46.780062874078375
                                    ],
                                    [
                                        6.659590997170878,
                                        46.78006371608211
                                    ],
                                    [
                                        6.659627767778945,
                                        46.780083979695384
                                    ],
                                    [
                                        6.659628751022214,
                                        46.78008313769149
                                    ],
                                    [
                                        6.659631815240783,
                                        46.780084826325336
                                    ],
                                    [
                                        6.659630831997352,
                                        46.780085668329434
                                    ],
                                    [
                                        6.659665049117817,
                                        46.78010452473583
                                    ],
                                    [
                                        6.659666687856508,
                                        46.78010312139524
                                    ],
                                    [
                                        6.659826027597425,
                                        46.78019093019476
                                    ],
                                    [
                                        6.659887439212417,
                                        46.78013833990379
                                    ],
                                    [
                                        6.659850923821772,
                                        46.78011821709301
                                    ],
                                    [
                                        6.659883083965885,
                                        46.78009067647726
                                    ],
                                    [
                                        6.65968544173283,
                                        46.77998175985751
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 60,
                        "name": "A28a",
                        "slug": "a28a",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659884616079343,
                                        46.780091520790776
                                    ],
                                    [
                                        6.659853684986183,
                                        46.780118008899535
                                    ],
                                    [
                                        6.659888668262827,
                                        46.78013728739594
                                    ],
                                    [
                                        6.65991959934986,
                                        46.78011079927775
                                    ],
                                    [
                                        6.659884616079343,
                                        46.780091520790776
                                    ]
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": 61,
                        "name": "A20",
                        "slug": "a20",
                        "zone_id": 1,
                        "space_data": null,
                        "space_type": null
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        6.659921238082099,
                                        46.780109395933486
                                    ],
                                    [
                                        6.659935986659132,
                                        46.780096765842146
                                    ],
                                    [
                                        6.659660717531114,
                                        46.77994507062995
                                    ],
                                    [
                                        6.659676285509368,
                                        46.779931738885765
                                    ],
                                    [
                                        6.659560764890672,
                                        46.77986807738162
                                    ],
                                    [
                                        6.659530448292521,
                                        46.77989403915133
                                    ],
                                    [
                                        6.659568035881163,
                                        46.77991475308613
                                    ],
                                    [
                                        6.659559842202721,
                                        46.779921769781936
                                    ],
                                    [
                                        6.659584458006112,
                                        46.77993533515364
                                    ],
                                    [
                                        6.659592651683434,
                                        46.779928318456065
                                    ],
                                    [
                                        6.659921238082099,
                                        46.780109395933486
                                    ]
                                ]
                            ]
                        ]
                    }
                }
            ]

            zone_geom.forEach(polygon => {
                const feature = new Feature({
                    geometry: new Polygon(polygon.geometry.coordinates[0]),
                    label: polygon.properties.name,
                });
                feature.setId(polygon.properties.slug);
                if (polygon.properties.name == 'Vide') {
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
                else if (polygon.properties.name == 'Dégagement') {
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
                            text: polygon.properties.name,
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
                this.space_source_a.addFeature(feature);
            });
        },

        async displayPassageway_zoneA() {

            const passageway_geom = [
                { "type": "Feature", "properties": { "id": 1, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658794421221208, 46.779525092751314], [6.658784207353754, 46.77951946389603], [6.658784043479361, 46.779519604228838], [6.658794257346827, 46.779525233084158], [6.658794421221208, 46.779525092751314], [6.658794938462799, 46.779524594098113], [6.658795402897201, 46.779524078718595], [6.658795815753256, 46.779523543022286], [6.658796175156373, 46.779522989441574], [6.658796479474652, 46.779522420490089], [6.658796727326317, 46.779521838751108], [6.658796917585972, 46.779521246866118], [6.658797049389743, 46.77952064752261], [6.658797122139156, 46.779520043441948], [6.658797135503889, 46.779519437367007], [6.658797089423255, 46.779518832049753], [6.65879698410651, 46.779518230238601], [6.658796820031833, 46.779517634666156], [6.658796597944227, 46.779517048036695], [6.658796318852104, 46.779516473013786], [6.658795984022699, 46.779515912208467], [6.658795594976334, 46.77951536816704], [6.658795153479509, 46.77951484335977], [6.658794661536874, 46.779514340169605], [6.658794121382133, 46.779513860881288], [6.6587935354679, 46.779513407671061], [6.658792906454569, 46.77951298259687], [6.658792237198219, 46.779512587588691]]] } },
                { "type": "Feature", "properties": { "id": 2, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658777218932387, 46.779537523750932], [6.658785412654343, 46.779530507110984], [6.658785208376969, 46.779530394533879], [6.658777014655001, 46.779537411173841], [6.658777218932387, 46.779537523750932], [6.658777944803206, 46.779537879081275], [6.658778695022415, 46.779538198134773], [6.658779474816027, 46.779538481755424], [6.65878028064333, 46.77953872865541], [6.658781108845397, 46.779538937713681], [6.658781955661714, 46.779539107980952], [6.65878281724724, 46.779539238684201], [6.658783689689891, 46.77953932922977], [6.658784569028259, 46.779539379206724], [6.658785451269635, 46.779539388388081], [6.658786332408139, 46.77953935673213], [6.658787208442897, 46.779539284382615], [6.658788075396184, 46.779539171668063], [6.658788929331552, 46.77953901910022], [6.658789766371625, 46.779538827371887], [6.658790582715762, 46.779538597353522], [6.65879137465728, 46.779538330089672], [6.658792138600317, 46.779538026793809], [6.658792871076129, 46.779537688843064], [6.658793568758837, 46.779537317771933], [6.658794228480575, 46.779536915265282], [6.658794847245811, 46.779536483150814], [6.658795422245009, 46.779536023390442]]] } },
                { "type": "Feature", "properties": { "id": 3, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658807277124454, 46.779539096942493], [6.658818512385519, 46.779545288680978], [6.658818348511137, 46.779545429013837], [6.658807113250063, 46.779539237275344], [6.658807277124454, 46.779539096942493], [6.658807902079959, 46.779538616589562], [6.658808595936717, 46.779538147301984], [6.658809334361471, 46.779537711290949], [6.658810113979711, 46.779537310548854], [6.65881093122868, 46.77953694690715], [6.658811782373658, 46.779536622027571], [6.658812663525029, 46.779536337394738], [6.658813570656043, 46.779536094309464], [6.658814499621225, 46.77953589388256], [6.658815446175329, 46.779535737029974], [6.658816405992729, 46.779535624468494], [6.658817374687181, 46.779535556712553], [6.658818347831882, 46.779535534071734], [6.658819320979685, 46.779535556649499], [6.658820289683434, 46.779535624342699], [6.658821249516286, 46.779535736841957], [6.65882219609192, 46.779535893633224], [6.658823125084617, 46.779536093999916], [6.658824032248996, 46.779536337026421], [6.658824913439438, 46.779536621602126], [6.658825764629021, 46.779536946426596], [6.658826581927914, 46.779537310015392], [6.658827361601171, 46.779537710706947], [6.658826692951853, 46.779537286315644], [6.658826116434344, 46.77953680232438], [6.658825866282302, 46.779536540861407], [6.658825643189743, 46.779536268086197], [6.658825448235786, 46.779535985318212], [6.658825282363432, 46.779535693925162], [6.658825146375017, 46.779535395316593], [6.658825040928328, 46.779535090936868], [6.658824966533402, 46.779534782258288], [6.658824923550104, 46.779534470773946], [6.658824912186344, 46.779534157990504], [6.658824932497094, 46.779533845420971], [6.658824984384091, 46.779533534577162], [6.658825067596375, 46.779533226962762], [6.658825181731435, 46.779532924065663], [6.658825326237182, 46.779532627350939], [6.658825500414647, 46.779532338253887], [6.658825703421313, 46.779532058172947], [6.658825934275233, 46.779531788462755], [6.658826187647482, 46.779531528291898], [6.658826351521787, 46.779531387959025], [6.658831458458585, 46.779534202384902], [6.658831294584283, 46.779534342717788], [6.658826187647482, 46.779531528291898]]] } },
                { "type": "Feature", "properties": { "id": 4, "height": 2.0, "width": 1.2, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658893350902147, 46.779574354046936], [6.658905607569543, 46.779581108661397], [6.658905804218644, 46.779580940261852], [6.658893547551267, 46.779574185647377], [6.658893350902147, 46.779574354046936], [6.658892730212871, 46.779574952431211], [6.658892172892156, 46.77957557088714], [6.65889167746553, 46.779576213723132], [6.658891246182515, 46.779576878020308], [6.658890881001393, 46.779577560762462], [6.658890583580294, 46.779578258849455], [6.658890355269689, 46.779578969111682], [6.658890197106245, 46.779579688324013], [6.658890109808105, 46.779580413220884], [6.658890093771669, 46.779581140510892], [6.658890149069754, 46.77958186689159], [6.65889027545127, 46.77958258906488], [6.658890472342382, 46.779583303751622], [6.658890738849084, 46.779584007706774], [6.658891073761298, 46.779584697733959], [6.658891475558312, 46.779585370700076], [6.658891942415759, 46.779586023549442], [6.65889247221382, 46.779586653317729], [6.658893062546919, 46.779587257145394], [6.658893710734593, 46.779587832290822], [6.658894413833702, 46.779588376142428], [6.658895168651773, 46.779588886230819], [6.658895971761489, 46.779589360239946]]] } },
                { "type": "Feature", "properties": { "id": 5, "height": null, "width": 1.8, "passage_ty": 5 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658873764837653, 46.779625626704195], [6.658882957959682, 46.779630693005586], [6.658880508232953, 46.779632790814674], [6.658862123220112, 46.779622658888528], [6.658859673165161, 46.779624756977817], [6.658878058178257, 46.77963488890434], [6.658875608451114, 46.779636986713356], [6.658857223437775, 46.779626854786386], [6.658854773382461, 46.779628952875598], [6.65887308300065, 46.779639043252708], [6.658870708340809, 46.779641182892433], [6.658852323326948, 46.779631050964724]]] } },
                { "type": "Feature", "properties": { "id": 6, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658804413395875, 46.779643614907442], [6.658813426503748, 46.779635896601434], [6.658813222225928, 46.779635784024357], [6.658804209118021, 46.779643502330366], [6.658804413395875, 46.779643614907442], [6.658805175125292, 46.77964399071449], [6.658806000624252, 46.779644345454699], [6.65880685912502, 46.779644661070229], [6.658807746704352, 46.779644936118864], [6.658808659306112, 46.77964516934356], [6.658809592759843, 46.779645359678547], [6.658810542799772, 46.779645506254077], [6.658811505084338, 46.77964560840023], [6.658812475216026, 46.779645665650243], [6.658813448761451, 46.779645677742494], [6.658814421271637, 46.779645644621716], [6.658815388302342, 46.779645566439342], [6.658816345434347, 46.779645443552539], [6.658817288293687, 46.779645276522942], [6.658818212571614, 46.779645066113837], [6.658819114044295, 46.779644813286779], [6.658819988592113, 46.779644519197177], [6.658820832218503, 46.779644185188921], [6.658821641068191, 46.779643812788443], [6.65882241144484, 46.779643403697555], [6.658823139827937, 46.779642959785768], [6.65882382288885, 46.779642483081652], [6.65882445750609, 46.779641975763688], [6.658824185023855, 46.779642226495589], [6.658823938576917, 46.779642489635187], [6.658823719358013, 46.779642763908996], [6.658823528428128, 46.779643047989516], [6.658823366711315, 46.779643340501949], [6.658823234990251, 46.779643640030557], [6.658823133902439, 46.779643945125635], [6.658823063937117, 46.779644254310689], [6.65882302543291, 46.779644566089267], [6.658823018576171, 46.779644878952425], [6.658823043400079, 46.779645191385988], [6.658823099784501, 46.779645501877823], [6.658823187456535, 46.779645808925224], [6.658823305991887, 46.779646111042183], [6.658823454816853, 46.779646406766496], [6.658823633211161, 46.779646694666909], [6.658823840311425, 46.779646973350033], [6.658824075115321, 46.779647241467131], [6.658824336486444, 46.779647497720575], [6.658824623159817, 46.779647740870132], [6.658824933748007, 46.779647969738996], [6.658825263310588, 46.779648185932608], [6.658825467588498, 46.779648298509677], [6.65882956445502, 46.779644790188094], [6.658829360177133, 46.779644677611053], [6.658825263310588, 46.779648185932608]]] } },
                { "type": "Feature", "properties": { "id": 7, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658717286966401, 46.779648647772596], [6.658706051695413, 46.779642456024263], [6.658705887820456, 46.779642596356901], [6.658717123091454, 46.779648788105312], [6.658717286966401, 46.779648647772596], [6.658717834016084, 46.779648124488517], [6.65871835040076, 46.779647557395485], [6.658718809833023, 46.779646967631159], [6.658719210213325, 46.77964635789067], [6.658719549711975, 46.779645730960468], [6.658719826777515, 46.779645089705511], [6.658720040143796, 46.779644437056277], [6.658720188835758, 46.779643775995297], [6.658720272173903, 46.779643109543514], [6.658720289777385, 46.779642440746557], [6.658720241565768, 46.779641772660675], [6.658720127759367, 46.779641108339028], [6.658719948878273, 46.779640450817396], [6.658719705739943, 46.779639803100672], [6.658719399455497, 46.779639168148705], [6.658719031424615, 46.77963854886324], [6.658718603329155, 46.77963794807436], [6.65871811712546, 46.779637368527496], [6.658717575035416, 46.779636812871097], [6.658716979536316, 46.779636283644578], [6.658716333349504, 46.779635783266279], [6.658715639427975, 46.779635314022961], [6.658714900942845, 46.779634878059021], [6.658715648967614, 46.779635234548891], [6.658716461744772, 46.779635516309924], [6.658716887545111, 46.779635627405106], [6.658717323558704, 46.779635717894088], [6.658717767675337, 46.779635787338925], [6.658718217745589, 46.779635835403482], [6.658718671591212, 46.77963586185524], [6.65871912701569, 46.779635866566132], [6.658719581814864, 46.779635849513319], [6.658720033787603, 46.779635810779361], [6.658720480746448, 46.779635750551755], [6.658720920528229, 46.779635669121902], [6.658721351004479, 46.779635566884025], [6.658721770091788, 46.779635444332818], [6.658722175761875, 46.779635302061486], [6.658722566051367, 46.779635140758572], [6.65872293907135, 46.779634961204707], [6.658723293016499, 46.779634764268906], [6.658723626173776, 46.779634550904369], [6.65872394088077, 46.779634324504407], [6.658724104755649, 46.779634184171698], [6.658718997814994, 46.77963136974104], [6.658718833940092, 46.77963151007377], [6.65872394088077, 46.779634324504407]]] } },
                { "type": "Feature", "properties": { "id": 8, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658807508602971, 46.779671152777453], [6.658803411733006, 46.779674661098227], [6.658803207455047, 46.779674548521136], [6.658807304325018, 46.779671040200363], [6.658807508602971, 46.779671152777453], [6.658807835848598, 46.779671367379386], [6.658808144451998, 46.779671594443698], [6.658808429503748, 46.779671835600261], [6.658808689644024, 46.77967208969865], [6.658808923631843, 46.779672355526735], [6.658809130350976, 46.779672631816339], [6.658809308815298, 46.779672917249478], [6.658809458173433, 46.779673210464495], [6.658809577712888, 46.779673510062658], [6.6588096668634, 46.779673814614675], [6.658809725199692, 46.779674122667828], [6.658809752443468, 46.779674432752444], [6.65880974846476, 46.779674743389329], [6.658809713282546, 46.779675053096618], [6.658809647064666, 46.77967536039683], [6.658809550127009, 46.779675663824058], [6.658809422932006, 46.779675961930842], [6.658809266086429, 46.779676253294966], [6.658809080338507, 46.779676536526637], [6.65880886657434, 46.779676810274616], [6.658808625813672, 46.779677073233003], [6.658808314405961, 46.779677362946501], [6.658808949023761, 46.77967685562863], [6.658809632085228, 46.779676378924613], [6.658810360468875, 46.779675935012875], [6.658811130846068, 46.779675525922045], [6.658811939696295, 46.779675153521673], [6.658812783323216, 46.779674819513488], [6.658813657871555, 46.779674525423893], [6.658814559344751, 46.779674272596907], [6.658815483623187, 46.779674062187816], [6.65881642648303, 46.77967389515824], [6.658817383615537, 46.779673772271437], [6.658818350646741, 46.779673694088949], [6.65881932315743, 46.7796736609682], [6.658820296703362, 46.779673673060408], [6.658821266835565, 46.779673730310328], [6.658822229120657, 46.779673832456417], [6.658823179161124, 46.77967397903182], [6.658824112615402, 46.779674169366679], [6.65882502521773, 46.779674402591269], [6.658825912797645, 46.779674677639726], [6.658826771299012, 46.779674993255114], [6.658827596798589, 46.779675347995159], [6.658828358528618, 46.779675723802029], [6.658828562806631, 46.779675836379084], [6.658819549694234, 46.779683554686272], [6.658819345416207, 46.779683442109224], [6.658828358528618, 46.779675723802029]]] } },
                { "type": "Feature", "properties": { "id": 9, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658847342819801, 46.779693105299273], [6.65884324595076, 46.779696613621496], [6.658843041672649, 46.779696501044505], [6.658847138541692, 46.779692992722296], [6.658847342819801, 46.779693105299273], [6.658847670065733, 46.779693319901121], [6.658847978669423, 46.779693546965291], [6.658848263721469, 46.779693788121762], [6.658848523862042, 46.779694042220079], [6.65884875785015, 46.779694308048057], [6.658848964569574, 46.779694584337612], [6.658849143034177, 46.779694869770715], [6.658849292392591, 46.779695162985654], [6.658849411932318, 46.779695462583767], [6.65884950108309, 46.779695767135784], [6.658849559419633, 46.779696075188873], [6.658849586663651, 46.779696385273482], [6.658849582685169, 46.779696695910367], [6.658849547503171, 46.779697005617685], [6.658849481285491, 46.779697312917968], [6.658849384348021, 46.779697616345196], [6.658849257153185, 46.779697914452015], [6.658849100307759, 46.779698205816217], [6.658848914559972, 46.779698489047902], [6.65884870079592, 46.779698762795974], [6.658848460035348, 46.779699025754461], [6.658848148627725, 46.779699315468029], [6.658848783245406, 46.779698808149966], [6.6588494663068, 46.779698331445694], [6.658850194690416, 46.7796978875337], [6.658850965067622, 46.779697478442657], [6.658851773917902, 46.779697106041922], [6.65885261754492, 46.779696772033482], [6.658853492093398, 46.779696477943581], [6.658854393566774, 46.779696225116282], [6.658855317845431, 46.779696014706879], [6.658856260705535, 46.779695847676976], [6.658857217838341, 46.779695724789825], [6.658858184869881, 46.779695646607024], [6.658859157380941, 46.779695613485892], [6.65886013092728, 46.779695625577787], [6.65886110105992, 46.779695682827359], [6.65886206334548, 46.779695784973086], [6.658863013386441, 46.779695931548147], [6.658863946841242, 46.779696121882751], [6.658864859444114, 46.779696355106978], [6.658865747024593, 46.779696630155144], [6.658866605526546, 46.779696945770255], [6.658867431026721, 46.779697300509987], [6.658868192757338, 46.779697676316566], [6.658868397035508, 46.779697788893564], [6.658859383925155, 46.779705507203857], [6.658859179646962, 46.779705394626873], [6.658868192757338, 46.779697676316566]]] } },
                { "type": "Feature", "properties": { "id": 10, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658885495942745, 46.779696371785199], [6.658896731245608, 46.779702563515862], [6.658896567370951, 46.779702703848805], [6.658885332068079, 46.779696512118157], [6.658885495942745, 46.779696371785199], [6.658886120899377, 46.779695891431835], [6.65888681475748, 46.77969542214386], [6.658887553183757, 46.77969498613222], [6.658888332803691, 46.779694585389684], [6.658889150054519, 46.779694221747356], [6.65889000120151, 46.779693896867194], [6.65889088235504, 46.779693612233785], [6.658891789488349, 46.779693369147914], [6.658892718455953, 46.779693168720357], [6.658893665012594, 46.779693011867153], [6.658894624832633, 46.779692899305047], [6.658895593529814, 46.779692831548402], [6.658896566677323, 46.779692808906901], [6.658897539828001, 46.77969283148402], [6.658898508534678, 46.779692899176538], [6.658899468370496, 46.779693011675178], [6.65890041494912, 46.779693168465762], [6.658901343944821, 46.779693368831815], [6.658902251112202, 46.779693611857731], [6.658903132305632, 46.779693896432804], [6.658903983498171, 46.779694221256662], [6.658904800799978, 46.779694584844883], [6.658905580476094, 46.779694985535869], [6.658905185013392, 46.779694749113361], [6.658904866965636, 46.779694528284836], [6.658904571865489, 46.779694292901347], [6.658904301120726, 46.779694044085787], [6.658904056022904, 46.779693783025095], [6.658903837741255, 46.779693510964634], [6.658903647317076, 46.779693229202259], [6.658903485658775, 46.779692939082139], [6.658903353537533, 46.779692641988255], [6.658903251583629, 46.779692339337856], [6.658903180283419, 46.779692032574729], [6.658903139977048, 46.779691723162266], [6.658903130856789, 46.779691412576504], [6.658903152966149, 46.779691102299111], [6.658903206199647, 46.779690793810211], [6.658903290303352, 46.779690488581416], [6.658903404876045, 46.779690188068805], [6.658903549371158, 46.779689893705957], [6.658903723099391, 46.779689606897222], [6.658903925231977, 46.779689329010637], [6.658904154804666, 46.77968906137194], [6.658904406509999, 46.779688803121793], [6.658904570384579, 46.779688662788807], [6.658909677340374, 46.779691477211131], [6.658909513465786, 46.779691617544103], [6.658904406509999, 46.779688803121793]]] } },
                { "type": "Feature", "properties": { "id": 11, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.65890178168778, 46.779672364320341], [6.658893587959403, 46.779679380968503], [6.658893383681238, 46.77967926839159], [6.658901577409625, 46.779672251743428], [6.658901786820635, 46.779672369613841], [6.658902444049231, 46.779672774042005], [6.658903060138527, 46.779673207958311], [6.658903632291131, 46.77967366939248], [6.658904157909132, 46.779674156249357], [6.658904634605923, 46.779674666318272], [6.658905060217023, 46.779675197283296], [6.658905432809911, 46.779675746733517], [6.658905750692802, 46.779676312174054], [6.658906012422313, 46.779676891037546], [6.658906216810048, 46.779677480695639], [6.658906362927964, 46.779678078470901], [6.658906450112603, 46.779678681649081], [6.658906477968082, 46.779679287491383], [6.658906446367935, 46.779679893247021], [6.658906355455634, 46.77968049616544], [6.658906205643967, 46.779681093509041], [6.658905997613176, 46.779681682565588], [6.658905732307827, 46.779682260660337], [6.658905410932568, 46.779682825168507], [6.658905034946622, 46.779683373526851], [6.658904606057178, 46.779683903245491], [6.658904126211655, 46.779684411919213], [6.658903597588812, 46.779684897238383]]] } },
                { "type": "Feature", "properties": { "id": 12, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658899330349992, 46.77967101339749], [6.658891136621515, 46.779678030045503], [6.65889134089967, 46.779678142622416], [6.658899534628138, 46.779671125974382], [6.658899330349992, 46.77967101339749], [6.658898604476589, 46.779670658067914], [6.658897854254826, 46.779670339015233], [6.658897074458682, 46.7796700553954], [6.658896268628878, 46.779669808496209], [6.658895440424354, 46.779669599438812], [6.658894593605623, 46.779669429172344], [6.658893732017745, 46.779669298470012], [6.658892859572805, 46.779669207925203], [6.658891980232217, 46.779669157949066], [6.658891097988696, 46.779669148768548], [6.658890216848131, 46.779669180425344], [6.658889340811402, 46.779669252775662], [6.65888847385623, 46.779669365490996], [6.658887619919078, 46.779669518059563], [6.65888678287732, 46.779669709788649], [6.65888596653161, 46.77966993980764], [6.658885174588625, 46.779670207072172], [6.658884410644237, 46.779670510368632], [6.658883678167194, 46.779670848319988], [6.658882980483376, 46.779671219391673], [6.658882320760657, 46.779671621898771], [6.658881701994569, 46.779672054013744], [6.658881126994657, 46.779672513774557]]] } },
                { "type": "Feature", "properties": { "id": 13, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658961299029512, 46.779730073994166], [6.658970312129383, 46.779722355675851], [6.658970516407861, 46.779722468252636], [6.658961503307998, 46.77973018657098], [6.658961299029512, 46.779730073994166], [6.658960599795058, 46.779729644669494], [6.658959916666091, 46.77972916801037], [6.658959281976615, 46.77972866073425], [6.658958698627079, 46.779728125159259], [6.658958169283324, 46.779727563732891], [6.658957696364375, 46.779726979020857], [6.65895728203142, 46.77972637369519], [6.658956928177892, 46.779725750522111], [6.658956636420871, 46.779725112349496], [6.65895640809364, 46.779724462093704], [6.658956244239617, 46.779723802726309], [6.658956145607603, 46.779723137260568], [6.658956112648324, 46.779722468737518], [6.658956145512401, 46.779721800212286], [6.658956244049651, 46.779721134739901], [6.658956407809756, 46.779720475361493], [6.658956636044359, 46.779719825090339], [6.658956927710457, 46.779719186898127], [6.658957281475171, 46.779718563701316], [6.658957695721833, 46.779717958347753], [6.658958168557385, 46.779717373603916], [6.658958697821036, 46.779716812141984], [6.658959281094117, 46.779716276527701], [6.658958982855845, 46.77971649549616], [6.658958679440118, 46.779716710034158], [6.658958355830459, 46.779716910161461], [6.658958013474032, 46.779717094983184], [6.658957653901822, 46.77971726367285], [6.658957278721823, 46.779717415475965], [6.658956889611809, 46.779717549713801], [6.658956488311864, 46.779717665786002], [6.658956076616558, 46.77971776317348], [6.658955656366986, 46.779717841440792], [6.658955229442464, 46.779717900237884], [6.658954797752174, 46.779717939301804], [6.658954363226606, 46.779717958457859], [6.658953927808929, 46.779717957620463], [6.658953493446306, 46.779717936793297], [6.658953062081171, 46.779717896069478], [6.658952635642577, 46.779717835631168], [6.658952216037514, 46.779717755748614], [6.658951805142436, 46.779717656779042], [6.658951404794835, 46.779717539165098], [6.658951016785038, 46.779717403432649], [6.658950642848208, 46.77971725018876], [6.658950281546423, 46.779717083012009], [6.65895007726799, 46.779716970435189], [6.658954174131619, 46.779713462109171], [6.658954378410041, 46.779713574686006], [6.658950281546423, 46.779717083012009]]] } },
                { "type": "Feature", "properties": { "id": 14, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658995838639912, 46.779678070418093], [6.658986825551109, 46.779685788738504], [6.658986621272737, 46.779685676161797], [6.658995634361538, 46.779677957841372], [6.658995838639912, 46.779678070418093], [6.658996537873977, 46.779678499742609], [6.658997221002626, 46.779678976401492], [6.658997855691873, 46.779679483677405], [6.658998439041271, 46.779680019252247], [6.65899896838498, 46.779680580678409], [6.658999441303969, 46.779681165390265], [6.658999855637048, 46.779681770715818], [6.659000209490786, 46.779682393888713], [6.659000501248091, 46.779683032061222], [6.659000729575679, 46.779683682316957], [6.659000893430123, 46.779684341684252], [6.65900099206262, 46.779685007149965], [6.659001025022434, 46.779685675673022], [6.659000992158934, 46.779686344198275], [6.659000893622304, 46.779687009670724], [6.659000729862844, 46.779687669049181], [6.659000501628906, 46.7796883193204], [6.659000209963493, 46.779688957512711], [6.658999856199471, 46.779689580709736], [6.658999441953501, 46.779690186063384], [6.658998969118637, 46.779690770807441], [6.658998439855663, 46.779691332269536], [6.658997856583238, 46.779691867883962], [6.658998153783503, 46.779691630771353], [6.658998474260229, 46.779691408429009], [6.658998816464143, 46.779691201931527], [6.658999178739051, 46.779691012278278], [6.658999559331615, 46.77969084038714], [6.658999956399855, 46.77969068709006], [6.659000368022042, 46.779690553128965], [6.659000792206012, 46.779690439152141], [6.659001226898797, 46.779690345711316], [6.659001669996594, 46.779690273258623], [6.659002119354886, 46.779690222144751], [6.659002572798888, 46.779690192617117], [6.659003028134022, 46.779690184818605], [6.659003483156562, 46.77969019878693], [6.659003935664302, 46.779690234454478], [6.659004383467193, 46.779690291648706], [6.659004824397966, 46.779690370092723], [6.659005256322616, 46.77969046940693], [6.659005677150714, 46.779690589110594], [6.65900608484554, 46.779690728624495], [6.659006477433944, 46.779690887273318], [6.659006856126015, 46.779691061395916], [6.659007060404461, 46.779691173972672], [6.65900296354596, 46.779694682300615], [6.659002759267521, 46.779694569723901], [6.659006856126015, 46.779691061395916]]] } },
                { "type": "Feature", "properties": { "id": 15, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658963741845042, 46.779694055977501], [6.65896884880443, 46.779696870397146], [6.658968684929992, 46.779697010730281], [6.65896357797059, 46.779694196310587], [6.658963741845042, 46.779694055977501], [6.658964056551362, 46.7796938295769], [6.658964389708052, 46.779693616211638], [6.658964743652705, 46.779693419275119], [6.658965116672285, 46.779693239720494], [6.658965506961475, 46.779693078416699], [6.658965912631345, 46.779692936144478], [6.658966331718545, 46.779692813592426], [6.658966762194792, 46.779692711353604], [6.658967201976659, 46.779692629922828], [6.658967648935704, 46.779692569694205], [6.658968100908735, 46.779692530959245], [6.658968555708308, 46.779692513905481], [6.658969011133285, 46.779692518615363], [6.658969464979509, 46.779692545066098], [6.658969915050461, 46.779692593129688], [6.658970359167895, 46.779692662573567], [6.658970795182374, 46.779692753061589], [6.658971220983691, 46.77969286415577], [6.658971634511044, 46.779692995318527], [6.658972033763057, 46.77969314591499], [6.65897241680744, 46.779693315216335], [6.658972781790316, 46.779693502403205], [6.658972043302327, 46.779693066440899], [6.658971349377832, 46.779692597199137], [6.658970703187981, 46.779692096822295], [6.658970107685785, 46.779691567597062], [6.658969565592593, 46.779691011941921], [6.658969079385722, 46.779690432396109], [6.658968651287061, 46.779689831608167], [6.658968283252966, 46.779689212323511], [6.658967976965309, 46.779688577372248], [6.658967733823776, 46.779687929655992], [6.658967554939506, 46.779687272134801], [6.658967441129959, 46.779686607813382], [6.658967392915237, 46.779685939727635], [6.658967410515663, 46.779685270930649], [6.658967493850813, 46.779684604478689], [6.658967642539849, 46.779683943417389], [6.658967855903283, 46.779683290767657], [6.65896813296606, 46.779682649512118], [6.65896847246204, 46.779682022581177], [6.658968872839775, 46.779681412839778], [6.658969332269582, 46.779680823074465], [6.658969848651927, 46.779680255980317], [6.658970395699464, 46.779679732695058], [6.658970559573858, 46.779679592361958], [6.658981794882997, 46.779685784084265], [6.658981631008614, 46.779685924417336], [6.658970395699464, 46.779679732695058]]] } },
                { "type": "Feature", "properties": { "id": 16, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659023403144973, 46.779658203280405], [6.659018296186384, 46.779655388863162], [6.659018132312202, 46.779655529196312], [6.659023239270795, 46.779658343613519], [6.659023403144973, 46.779658203280405], [6.659023656516858, 46.779657943109129], [6.659023887370319, 46.779657673398518], [6.659024090376427, 46.779657393317216], [6.659024264553227, 46.779657104219879], [6.659024409058219, 46.779656807504935], [6.659024523192411, 46.779656504607622], [6.659024606403745, 46.779656196993038], [6.659024658289709, 46.779655886149172], [6.659024678599343, 46.779655573579603], [6.6590246672344, 46.779655260796211], [6.659024624249851, 46.779654949311968], [6.659024549853621, 46.779654640633503], [6.659024444405568, 46.779654336253941], [6.659024308415748, 46.779654037645614], [6.659024142541955, 46.779653746252862], [6.659023947586537, 46.779653463485225], [6.659023724492489, 46.779653190710434], [6.659023474338953, 46.779652929247888], [6.659023198335914, 46.779652680362311], [6.659022897818433, 46.779652445257639], [6.659022574240122, 46.779652225071004], [6.659022229166156, 46.779652020867509], [6.659023008842523, 46.779652421557685], [6.659023826144499, 46.779652785145068], [6.659024677337118, 46.779653109968002], [6.659025558530531, 46.77965339454218], [6.659026465697799, 46.779653637567094], [6.659027394693286, 46.779653837932095], [6.659028341271596, 46.779653994721677], [6.659029301106991, 46.77965410721918], [6.659030269813137, 46.779654174910583], [6.659031242963172, 46.779654197486565], [6.659032216109928, 46.779654174843927], [6.659033184806239, 46.779654107086117], [6.659034144625293, 46.77965399452281], [6.659035091180835, 46.779653837668434], [6.659036020147222, 46.779653637239754], [6.659036927279202, 46.77965339415266], [6.659037808431292, 46.779653109518115], [6.659038659576736, 46.779652784636852], [6.659039476825916, 46.779652420993493], [6.659040256444105, 46.77965202024987], [6.659040994868544, 46.779651584237286], [6.659041688724727, 46.779651114948351], [6.659042313679442, 46.779650634594077], [6.659042477553558, 46.779650494260927], [6.659031242244804, 46.779644302544618], [6.659031078370695, 46.779644442877739], [6.659042313679442, 46.779650634594077]]] } },
                { "type": "Feature", "properties": { "id": 17, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659029950196869, 46.77976098794182], [6.659034047058644, 46.77975747961294], [6.65903384277989, 46.779757367036289], [6.659029745918112, 46.77976087536517], [6.659029950196869, 46.77976098794182], [6.659030326125033, 46.779761160855713], [6.659030715719064, 46.779761318564773], [6.659031120230559, 46.779761457423234], [6.659031537729827, 46.779761576768813], [6.659031966225202, 46.779761676032066], [6.659032403672573, 46.779761754739503], [6.659032847985121, 46.779761812515666], [6.659033297043289, 46.779761849084906], [6.659033748704858, 46.779761864272807], [6.659034200815202, 46.779761858006907], [6.659034651217564, 46.779761830317092], [6.659035097763319, 46.779761781335417], [6.659035538322248, 46.779761711295627], [6.659035970792689, 46.779761620531787], [6.659036393111562, 46.779761509476835], [6.659036803264227, 46.779761378660702], [6.659037199294069, 46.779761228707265], [6.659037579311848, 46.779761060332007], [6.659037941504717, 46.779760874338074], [6.659038284144855, 46.779760671612749], [6.659038605597713, 46.779760453123131], [6.659038949750708, 46.779760181451302], [6.659038366477946, 46.779760717065905], [6.659037837214692, 46.779761278528227], [6.65903736437962, 46.779761863272391], [6.659036950133517, 46.77976246862621], [6.659036596369436, 46.779763091823284], [6.659036304704044, 46.779763730015716], [6.659036076470215, 46.779764380286991], [6.659035912710951, 46.779765039665499], [6.659035814174609, 46.779765705137969], [6.65903578131149, 46.779766373663222], [6.659035814271786, 46.779767042186258], [6.659035912904865, 46.779767707651942], [6.659036076759997, 46.779768367019201], [6.659036305088376, 46.779769017274823], [6.659036596846581, 46.779769655447254], [6.659036950701317, 46.779770278620049], [6.659037365035505, 46.77977088394546], [6.659037837955704, 46.77977146865716], [6.659038367300721, 46.779772030083095], [6.659038950651524, 46.779772565657701], [6.659039585342267, 46.779773072933381], [6.659040268472499, 46.779773549592022], [6.659040967708156, 46.779773978916211], [6.659049980803945, 46.779766260591657], [6.659050185082767, 46.77976637316825], [6.659041171986987, 46.779774091492897], [6.659040967708156, 46.779773978916211]]] } },
                { "type": "Feature", "properties": { "id": 18, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659106643360815, 46.779695312000612], [6.659098449655647, 46.779702328663468], [6.659098245376967, 46.779702216086918], [6.659106439082156, 46.77969519942404], [6.659106643360815, 46.779695312000612], [6.659107305724117, 46.779695721721083], [6.659107921815327, 46.779696155636259], [6.659108493969931, 46.779696617069398], [6.659109019590009, 46.779697103925294], [6.659109496288941, 46.779697613993399], [6.659109921902241, 46.779698144957628], [6.659110294497379, 46.779698694407195], [6.659110612382557, 46.77969925984717], [6.65911087411438, 46.779699838710194], [6.659111078504445, 46.779700428367931], [6.659111224624696, 46.779701026142902], [6.659111311811667, 46.779701629320925], [6.659111339669462, 46.779702235163185], [6.659111308071604, 46.779702840918901], [6.659111217161558, 46.779703443837441], [6.6591110673521, 46.779704041181319], [6.65911085932346, 46.779704630238236], [6.659110594020197, 46.77970520833351], [6.65911027264695, 46.779705772842213], [6.659109896662929, 46.779706321201232], [6.659109467775318, 46.779706850920682], [6.659108987931524, 46.779707359595243], [6.659108459310301, 46.779707844915315]]] } },
                { "type": "Feature", "properties": { "id": 19, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659069784570809, 46.779782940385807], [6.659073881431658, 46.779779432055498], [6.659073677152738, 46.779779319478905], [6.659069580291883, 46.779782827809214], [6.659069784570809, 46.779782940385807], [6.659070163263841, 46.779783114508241], [6.659070555853222, 46.779783273156859], [6.659070963549047, 46.779783412670547], [6.659071384378151, 46.779783532374047], [6.659071816303798, 46.779783631688012], [6.659072257235574, 46.77978371013176], [6.659072705039454, 46.779783767325675], [6.659073157548155, 46.779783802992931], [6.659073612571633, 46.779783816960943], [6.659074067907677, 46.779783809162041], [6.659074521352546, 46.77978377963403], [6.65907497071166, 46.779783728519824], [6.659075413810224, 46.779783656066741], [6.65907584850372, 46.779783562625504], [6.659076272688337, 46.779783448648303], [6.659076684311097, 46.779783314686775], [6.65907708137984, 46.779783161389311], [6.659077461972828, 46.779782989497811], [6.659077824248076, 46.77978279984417], [6.659078166452253, 46.779782593346297], [6.659078486929145, 46.779782371003577], [6.659078784127718, 46.779782133892105], [6.659078200855113, 46.779782669506943], [6.65907767159206, 46.779783230969407], [6.659077198757226, 46.779783815713778], [6.659076784511402, 46.779784421067717], [6.65907643074764, 46.779785044264933], [6.659076139082599, 46.77978568245743], [6.659075910849159, 46.779786332728854], [6.659075747090316, 46.779786992107375], [6.659075648554423, 46.779787657579881], [6.659075615691789, 46.779788326105148], [6.659075648652591, 46.77978899462817], [6.659075747286205, 46.77978966009379], [6.65907591114189, 46.779790319461], [6.659076139470843, 46.779790969716601], [6.659076431229636, 46.779791607888889], [6.659076785084979, 46.779792231061521], [6.659077199419784, 46.779792836386783], [6.659077672340608, 46.779793421098347], [6.659078201686256, 46.779793982524161], [6.659078785037694, 46.779794518098477], [6.65907941972907, 46.779795025373986], [6.659080102859931, 46.779795502032357], [6.659080802096192, 46.77979593135634], [6.65908100637518, 46.779796043932883], [6.659090019468935, 46.779788325605168], [6.659089815189946, 46.779788213028581], [6.659080802096192, 46.77979593135634]]] } },
                { "type": "Feature", "properties": { "id": 20, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659180796573786, 46.779736177258691], [6.659172602872061, 46.779743193926855], [6.659172807151039, 46.779743306503214], [6.659181000852767, 46.779736289835043], [6.659180796573786, 46.779736177258691], [6.659180070697634, 46.779735821930934], [6.659179320473296, 46.779735502880058], [6.659178540674727, 46.779735219262122], [6.659177734842658, 46.77973497236497], [6.659176906636038, 46.779734763309598], [6.659176059815395, 46.779734593045269], [6.65917519822579, 46.779734462345019], [6.659174325779321, 46.779734371802363], [6.65917344643741, 46.779734321828457], [6.659172564192771, 46.779734312650064], [6.659171683051306, 46.779734344309006], [6.659170807013894, 46.779734416661469], [6.659169940058264, 46.779734529378949], [6.659169086120878, 46.779734681949684], [6.65916824907911, 46.779734873680781], [6.659167432733613, 46.779735103701817], [6.659166640791065, 46.779735370968254], [6.659165876847338, 46.779735674266639], [6.659165144371176, 46.779736012219765], [6.659164446688453, 46.779736383293177], [6.659163786967039, 46.779736785801873], [6.659163168202461, 46.779737217918417], [6.659162593204254, 46.779737677680629]]] } },
                { "type": "Feature", "properties": { "id": 21, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659220630990852, 46.779758129650055], [6.659212437290979, 46.779765146321047], [6.659212641570135, 46.779765258897406], [6.659220835270001, 46.779758242226386], [6.659220630990852, 46.779758129650055], [6.659219905114155, 46.779757774322576], [6.659219154889276, 46.779757455271948], [6.659218375090178, 46.779757171654289], [6.659217569257599, 46.779756924757407], [6.659216741050488, 46.779756715702355], [6.659215894229373, 46.779756545438296], [6.659215032639321, 46.779756414738372], [6.659214160192429, 46.779756324196008], [6.659213280850122, 46.779756274222393], [6.659212398605118, 46.779756265044327], [6.659211517463317, 46.779756296703596], [6.659210641425601, 46.779756369056365], [6.659209774469701, 46.77975648177415], [6.659208920532078, 46.779756634345127], [6.659208083490111, 46.779756826076536], [6.659207267144453, 46.779757056097864], [6.659206475201779, 46.779757323364571], [6.659205711257966, 46.77975762666324], [6.659204978781754, 46.779757964616607], [6.659204281099022, 46.779758335690225], [6.659203621377634, 46.779758738199241], [6.659203002613126, 46.779759170315941], [6.659202427615026, 46.779759630078345]]] } },
                { "type": "Feature", "properties": { "id": 22, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.6590250651059, 46.779791047149722], [6.659020968240987, 46.779794555478283], [6.659020763962121, 46.779794442901583], [6.659024860827038, 46.779790934573022], [6.6590250651059, 46.779791047149722], [6.659025394670255, 46.779791263342808], [6.659025705260204, 46.779791492211238], [6.659025991935319, 46.779791735360334], [6.659026253308152, 46.779791991613401], [6.659026488113717, 46.779792259730172], [6.659026695215607, 46.77979253841302], [6.659026873611483, 46.779792826313212], [6.659027022437955, 46.779793122037361], [6.65902714097473, 46.779793424154185], [6.659027228648116, 46.779793731201522], [6.659027285033793, 46.77979404169335], [6.659027309858855, 46.779794354126956], [6.659027303003171, 46.779794666990206], [6.659027264499908, 46.779794978768933], [6.65902719453542, 46.779795287954137], [6.659027093448313, 46.779795593049492], [6.659026961727833, 46.779795892578377], [6.659026800011471, 46.779796185091129], [6.659026609081913, 46.779796469172069], [6.6590263898632, 46.779796743446248], [6.659026143416323, 46.779797006586328], [6.659025870935777, 46.779797257317149], [6.659026505552938, 46.779796749998084], [6.659027188613999, 46.779796273292767], [6.659027916997476, 46.779795829379644], [6.659028687374733, 46.779795420287371], [6.659029496225255, 46.779795047885393], [6.659030339852703, 46.779794713875624], [6.659031214401803, 46.779794419784409], [6.659032115875982, 46.779794166955661], [6.659033040155625, 46.77979395654485], [6.659033983016894, 46.779793789513462], [6.659034940151034, 46.779793666624869], [6.659035907184076, 46.779793588440569], [6.659036879696795, 46.779793555317902], [6.659037853244944, 46.779793567408234], [6.659038823379537, 46.779793624656349], [6.659039785667183, 46.779793726800591], [6.659040735710356, 46.77979387337416], [6.659041669167482, 46.779794063707257], [6.659042581772783, 46.77979429693012], [6.659043469355783, 46.779794571976836], [6.659044327860337, 46.779794887590633], [6.659045153363183, 46.779795242329094], [6.65904591509642, 46.779795618134514], [6.659046119375351, 46.779795730711143], [6.659037106274065, 46.779803449035363], [6.659036901995124, 46.779803336458755], [6.65904591509642, 46.779795618134514]]] } },
                { "type": "Feature", "properties": { "id": 23, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658983974727479, 46.779867348526253], [6.658973760775319, 46.779861719688149], [6.658973924650243, 46.779861579355092], [6.658984138602407, 46.779867208193139], [6.658983974727479, 46.779867348526253], [6.65898337831035, 46.779867803547035], [6.658982746670928, 46.779868226782547], [6.658982074974399, 46.779868619834879], [6.658981366270663, 46.779868980919332], [6.65898062377765, 46.779869308396393], [6.658979850866702, 46.779869600779151], [6.658979051047286, 46.779869856739985], [6.658978227951048, 46.779870075116676], [6.658977385315322, 46.779870254917697], [6.658976526966164, 46.779870395326633], [6.658975656800982, 46.779870495705907], [6.658974778770818, 46.779870555599835], [6.65897389686246, 46.779870574736385], [6.658973015080272, 46.779870553028694], [6.658972137428059, 46.779870490575313], [6.658971267890879, 46.779870387659784], [6.658970410416925, 46.779870244749482], [6.658969568899633, 46.779870062493274], [6.658968747159986, 46.779869841718671], [6.658967948929152, 46.779869583428173], [6.658967177831568, 46.779869288794529], [6.658966437368463, 46.77986895915555], [6.658965730901969, 46.779868596007965]]] } },
                { "type": "Feature", "properties": { "id": 24, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659086348802691, 46.779824820137144], [6.659082251939203, 46.779828328467843], [6.659082047660078, 46.779828215891285], [6.659086144523573, 46.7798247075606], [6.659086348802691, 46.779824820137144], [6.659086678367408, 46.779825036330031], [6.659086988957735, 46.779825265198184], [6.659087275633239, 46.779825508347052], [6.659087537006486, 46.779825764599934], [6.65908777181247, 46.779826032716478], [6.659087978914789, 46.779826311399134], [6.659088157311112, 46.779826599299099], [6.659088306138033, 46.779826895023078], [6.659088424675269, 46.779827197139731], [6.659088512349111, 46.779827504186933], [6.659088568735255, 46.779827814678647], [6.659088593560789, 46.779828127112133], [6.659088586705566, 46.779828439975283], [6.659088548202766, 46.779828751753932], [6.659088478238726, 46.779829060939136], [6.659088377152069, 46.779829366034463], [6.659088245432024, 46.779829665563341], [6.659088083716089, 46.779829958076142], [6.659087892786935, 46.779830242157125], [6.659087673568613, 46.779830516431424], [6.659087427122097, 46.779830779571611], [6.659087154640131, 46.779831030304138], [6.659087789257114, 46.77983052298471], [6.659088472318063, 46.779830046279002], [6.65908920070149, 46.779829602365517], [6.659089971078766, 46.779829193272796], [6.65909077992937, 46.779828820870449], [6.659091623556968, 46.779828486860247], [6.65909249810628, 46.779828192768505], [6.65909339958074, 46.779827939939324], [6.659094323860722, 46.779827729527966], [6.659095266722391, 46.779827562496074], [6.659096223856991, 46.77982743960694], [6.65909719089055, 46.77982736142215], [6.65909816340384, 46.779827328299], [6.659099136952614, 46.779827340388806], [6.659100107087881, 46.779827397636375], [6.659101069376247, 46.779827499780097], [6.659102019420183, 46.779827646353176], [6.65910295287811, 46.779827836685776], [6.65910386548425, 46.779828069908099], [6.65910475306812, 46.779828344954382], [6.659105611573571, 46.779828660567674], [6.659106437077338, 46.779829015305694], [6.659107198811485, 46.779829391110709], [6.659107403090667, 46.779829503687282], [6.659098389992511, 46.779837222016276], [6.65909818571332, 46.779837109439768], [6.659107198811485, 46.779829391110709]]] } },
                { "type": "Feature", "properties": { "id": 25, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659126183246824, 46.77984677256125], [6.65912208638426, 46.779850280893399], [6.65912188210497, 46.779850168316869], [6.659125978967539, 46.779846659984784], [6.659126183246824, 46.77984677256125], [6.659126512811931, 46.779846988754066], [6.659126823402633, 46.779847217622219], [6.659127110078499, 46.779847460771073], [6.659127371452084, 46.779847717023891], [6.659127606258396, 46.779847985140478], [6.659127813361023, 46.779848263823126], [6.659127991757624, 46.779848551723141], [6.659128140584804, 46.779848847447134], [6.659128259122269, 46.779849149563852], [6.659128346796318, 46.779849456611124], [6.659128403182633, 46.779849767102917], [6.659128428008315, 46.779850079536516], [6.659128421153206, 46.77985039239973], [6.65912838265049, 46.779850704178465], [6.65912831268651, 46.779851013363768], [6.659128211599871, 46.779851318459208], [6.659128079879816, 46.779851617988179], [6.659127918163842, 46.779851910501101], [6.659127727234614, 46.779852194582169], [6.659127508016195, 46.779852468856575], [6.659127261569549, 46.779852731996826], [6.659126989087432, 46.779852982729416], [6.659127623706052, 46.779852475408305], [6.659128306766926, 46.779851998702355], [6.659129035150321, 46.779851554788607], [6.659129805527607, 46.779851145695623], [6.659130614378268, 46.77985077329302], [6.659131458005962, 46.779850439282477], [6.659132332555413, 46.779850145190473], [6.659133234030052, 46.779849892360929], [6.659134158310257, 46.779849681949301], [6.659135101172185, 46.779849514917082], [6.659136058307086, 46.779849392027607], [6.659137025340981, 46.779849313842469], [6.659137997854643, 46.779849280718921], [6.659138971403823, 46.779849292808422], [6.659139941539528, 46.77984935005567], [6.659140903828359, 46.779849452199052], [6.659141853872792, 46.779849598771804], [6.659142787331242, 46.779849789104077], [6.659143699937924, 46.779850022326052], [6.65914458752236, 46.779850297372086], [6.659145446028393, 46.779850612985065], [6.659146271532761, 46.779850967722794], [6.659147033267496, 46.77985134352754], [6.659147237546843, 46.779851456103977], [6.659138224450723, 46.77985917443619], [6.659138020171366, 46.779859061859675], [6.659147033267496, 46.77985134352754]]] } },
                { "type": "Feature", "properties": { "id": 26, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659181251780151, 46.779978015061147], [6.659171548486006, 46.779972667681868], [6.659171704167033, 46.779972534365164], [6.65918140746115, 46.779977881744472], [6.659181251780151, 46.779978015061147], [6.659180685184082, 46.77997844733202], [6.659180085126896, 46.77997884940676], [6.659179447015292, 46.779979222807533], [6.659178773746667, 46.7799795658389], [6.659178068378039, 46.779979876943337], [6.659177334112202, 46.779980154708177], [6.659176574283144, 46.779980397872286], [6.659175792340935, 46.779980605331474], [6.65917499183604, 46.779980776143816], [6.659174176403226, 46.77998090953372], [6.659173349745013, 46.77998100489549], [6.659172515614928, 46.77998106179615], [6.659171677800397, 46.779981079977333], [6.659170840105586, 46.779981059356494], [6.659170006334111, 46.779981000027227], [6.659169180271788, 46.77998090225897], [6.659168365669412, 46.779980766495655], [6.659167566225753, 46.779980593353677], [6.659166785570758, 46.779980383619211], [6.65916602724904, 46.779980138244596], [6.659165294703826, 46.779979858343957], [6.659164591261294, 46.779979545188247], [6.659163920115482, 46.779979200199293]]] } },
                { "type": "Feature", "properties": { "id": 27, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659245499444694, 46.779922997096932], [6.659235787540089, 46.779917657108058], [6.65923594300579, 46.779917523672935], [6.659245654910385, 46.779922863661795], [6.659245499444694, 46.779922997096932], [6.6592449335447, 46.779923429800547], [6.659244334137067, 46.779923832331647], [6.659243696628842, 46.779924206217835], [6.659243023914684, 46.779924549761411], [6.659242319049093, 46.779924861402435], [6.659241585232581, 46.779925139725989], [6.659240825797085, 46.779925383468282], [6.659240044190891, 46.779925591522506], [6.659239243962936, 46.779925762944046], [6.659238428746732, 46.779925896954552], [6.659237602243819, 46.779925992945465], [6.659236768207008, 46.779926050481059], [6.659235930423302, 46.779926069299989], [6.659235092696728, 46.779926049316792], [6.659234258831054, 46.779925990622289], [6.659233432612504, 46.779925893482947], [6.659232617792591, 46.779925758339857], [6.659231818071082, 46.779925585806531], [6.659231037079158, 46.779925376666547], [6.659230278362983, 46.779925131869362], [6.659229545367569, 46.779924852526612], [6.659228841421135, 46.779924539906624], [6.659228169720012, 46.779924195428876]]] } },
                { "type": "Feature", "properties": { "id": 28, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659246198599901, 46.77991233520428], [6.659241692054123, 46.779916194374344], [6.659241487774334, 46.779916081798056], [6.659245994320085, 46.779912222628013], [6.659246198599901, 46.77991233520428], [6.659246565925864, 46.779912570305157], [6.659246908592062, 46.779912822366576], [6.659247224943059, 46.779913090170879], [6.659247513450566, 46.779913372424282], [6.659247772720803, 46.779913667763225], [6.659248001501227, 46.779913974760952], [6.659248198686609, 46.779914291934254], [6.659248363324326, 46.77991461775094], [6.659248494619031, 46.779914950637014], [6.659248591936428, 46.779915288984228], [6.659248654806376, 46.779915631158126], [6.659248682925145, 46.779915975505574], [6.659248676156899, 46.779916320363], [6.659248634534333, 46.779916664064508], [6.659248558258528, 46.779917004949588], [6.659248447697967, 46.779917341371451], [6.659248303386766, 46.779917671704823], [6.659248126022102, 46.779917994353866], [6.659247916460815, 46.779918307759907], [6.659247675715309, 46.779918610408792], [6.65924740494862, 46.77991890083851], [6.659247105468821, 46.77991917764593], [6.659247733292293, 46.779918675803984], [6.659248408945163, 46.77991820418606], [6.659249129351949, 46.77991776493883], [6.659249891233435, 46.779917360061752], [6.659250691121628, 46.779916991397755], [6.659251525375537, 46.779916660624977], [6.659252390197727, 46.779916369249008], [6.659253281651639, 46.779916118596198], [6.659254195679471, 46.779915909807492], [6.659255128120683, 46.779915743833264], [6.659256074730919, 46.77991562142897], [6.659257031201309, 46.77991554315183], [6.659257993178121, 46.779915509358148], [6.659258956282555, 46.779915520201712], [6.659259916130672, 46.779915575633197], [6.659260868353346, 46.77991567540024], [6.659261808616192, 46.779915819048803], [6.659262732639238, 46.779916005924925], [6.659263636216433, 46.779916235178042], [6.659264515234807, 46.779916505764511], [6.659265365693179, 46.779916816452754], [6.659266183720355, 46.779917165828572], [6.659266965592773, 46.779917552301569], [6.659267169872609, 46.7799176648778], [6.659258238719791, 46.779925313052665], [6.659258034439945, 46.779925200476406], [6.659266965592759, 46.779917552301569]]] } },
                { "type": "Feature", "properties": { "id": 29, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659188980341274, 46.779849204755585], [6.65919348688526, 46.779845345587503], [6.659193282605786, 46.779845233011173], [6.659188776061873, 46.779849092179141], [6.659188980341268, 46.779849204755543], [6.659189394093735, 46.779849400098783], [6.659189826599117, 46.779849575226258], [6.659190275767987, 46.77984972929189], [6.659190739430394, 46.779849861551476], [6.659191215346391, 46.779849971365948], [6.659191701216818, 46.77985005820485], [6.659192194694429, 46.779850121648629], [6.659192693395241, 46.779850161390883], [6.659193194910013, 46.779850177239545], [6.659193696815923, 46.779850169118042], [6.659194196688264, 46.779850137065608], [6.659194692112151, 46.779850081237136], [6.659195180694175, 46.779850001902282], [6.659195660074002, 46.779849899444343], [6.659196127935743, 46.779849774358269], [6.659196582019149, 46.779849627248367], [6.659197020130536, 46.779849458825346], [6.659197440153392, 46.779849269902854], [6.65919784005858, 46.779849061393534], [6.659198217914152, 46.779848834304751], [6.65919857189469, 46.779848589733533], [6.659198900290106, 46.779848328861405], [6.659198323329985, 46.779848858733168], [6.659197799692462, 46.779849414124755], [6.6591973317611, 46.779849992508041], [6.659196921665866, 46.779850591250366], [6.659196571273468, 46.779851207626315], [6.659196282178849, 46.779851838830197], [6.659196055697941, 46.77985248198889], [6.659195892861655, 46.779853134174701], [6.659195794411212, 46.779853792419047], [6.659195760794741, 46.779854453725676], [6.659195792165269, 46.779855115084416], [6.659195888380004, 46.779855773484805], [6.659196049000987, 46.779856425929829], [6.659196273297088, 46.779857069449712], [6.659196560247348, 46.779857701115205], [6.659196908545602, 46.779858318051041], [6.659197316606438, 46.779858917448962], [6.659197782572412, 46.779859496580642], [6.659198304322506, 46.779860052809916], [6.659198879481768, 46.779860583604894], [6.659199505432147, 46.779861086549388], [6.659200179324389, 46.779861559354167], [6.659200898091013, 46.779861999866995], [6.659201102370514, 46.77986211244334], [6.659210033520966, 46.77985446427293], [6.659209829241488, 46.779854351696613], [6.659200898091013, 46.779861999866995]]] } },
                { "type": "Feature", "properties": { "id": 30, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659228814845276, 46.779871157143766], [6.659233321388159, 46.779867297974207], [6.659233117108596, 46.779867185397926], [6.659228610565689, 46.779871044567436], [6.659228814845276, 46.779871157143766], [6.659229228598055, 46.779871352486872], [6.659229661103742, 46.779871527614148], [6.659230110272909, 46.779871681679687], [6.659230573935603, 46.779871813939053], [6.659231049851871, 46.779871923753376], [6.659231535722565, 46.779872010592122], [6.659232029200424, 46.779872074035758], [6.659232527901463, 46.779872113777785], [6.65923302941645, 46.779872129626291], [6.65923353132256, 46.779872121504624], [6.659234031195082, 46.779872089451978], [6.659234526619128, 46.77987203362332], [6.659235015201292, 46.779871954288325], [6.659235494581232, 46.779871851830194], [6.659235962443071, 46.779871726743963], [6.659236416526547, 46.77987157963392], [6.659236854637989, 46.77987141121077], [6.659237274660878, 46.779871222288087], [6.659237674566073, 46.779871013778639], [6.659238052421632, 46.779870786689763], [6.659238406402128, 46.77987054211841], [6.659238734797484, 46.779870281246183], [6.659238157837509, 46.779870811118123], [6.659237634200194, 46.779871366509887], [6.659237166269067, 46.779871944893323], [6.659236756174112, 46.77987254363584], [6.659236405782026, 46.779873160011874], [6.659236116687755, 46.779873791215856], [6.65923589020723, 46.779874434374577], [6.659235727371362, 46.779875086560516], [6.659235628921366, 46.779875744804905], [6.659235595305371, 46.779876406111519], [6.659235626676398, 46.779877067470224], [6.65923572289166, 46.779877725870556], [6.65923588351319, 46.779878378315573], [6.65923610780986, 46.779879021835349], [6.659236394760703, 46.779879653500743], [6.659236743059556, 46.77988027043645], [6.659237151121001, 46.77988086983428], [6.659237617087594, 46.779881448965767], [6.659238138838312, 46.779882005194828], [6.659238713998202, 46.779882535989586], [6.659239339949207, 46.77988303893391], [6.659240013842074, 46.779883511738433], [6.659240732609316, 46.779883952251041], [6.659240936888982, 46.779884064827314], [6.659249868037417, 46.779876416653799], [6.659249663757854, 46.779876304077447], [6.659240732609316, 46.779883952251041]]] } },
                { "type": "Feature", "properties": { "id": 31, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.65930848395067, 46.779915061878313], [6.659312990491498, 46.779911202705584], [6.659312786211615, 46.779911090129453], [6.659308279670744, 46.779914949302167], [6.65930848395067, 46.779915061878313], [6.65930889770407, 46.779915257221127], [6.659309330210368, 46.77991543234814], [6.659309779380129, 46.779915586413303], [6.659310243043395, 46.779915718672385], [6.659310718960219, 46.779915828486345], [6.659311204831432, 46.779915915324764], [6.659311698309788, 46.779915978768031], [6.659312197011299, 46.779916018509759], [6.659312698526717, 46.779916034357889], [6.659313200433224, 46.779916026235824], [6.659313700306104, 46.7799159941829], [6.659314195730467, 46.779915938353916], [6.659314684312915, 46.779915859018544], [6.659315163693099, 46.779915756560101], [6.659315631555129, 46.779915631473536], [6.659316085638763, 46.779915484363151], [6.659316523750313, 46.779915315939704], [6.659316943773264, 46.77991512701675], [6.659317343678476, 46.779914918507018], [6.659317721534006, 46.779914691417815], [6.65931807551443, 46.779914446846256], [6.659318403909668, 46.779914185973801], [6.659317826950003, 46.779914715846139], [6.659317303313073, 46.779915271238245], [6.659316835382428, 46.779915849622022], [6.659316425288022, 46.779916448364787], [6.659316074896564, 46.779917064741078], [6.659315785802991, 46.779917695945286], [6.659315559323232, 46.779918339104157], [6.659315396488196, 46.779918991290195], [6.659315298039088, 46.779919649534655], [6.659315264424042, 46.779920310841277], [6.659315295796075, 46.779920972199967], [6.659315392012389, 46.779921630600256], [6.659315552635011, 46.779922283045131], [6.659315776932817, 46.77992292656473], [6.659316063884825, 46.77992355822996], [6.659316412184868, 46.77992417516537], [6.659316820247532, 46.779924774562893], [6.659317286215355, 46.77992535369409], [6.659317807967315, 46.779925909922817], [6.659318383128458, 46.779926440717162], [6.65931900908071, 46.779926943661017], [6.659319682974822, 46.779927416465078], [6.659320401743303, 46.779927856977139], [6.659320606023338, 46.779927969553334], [6.659329537167739, 46.779920321373574], [6.659329332887749, 46.779920208797456], [6.659320401743303, 46.779927856977139]]] } },
                { "type": "Feature", "properties": { "id": 32, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659285521348037, 46.779934582118074], [6.65928142448916, 46.77993809045585], [6.659281220209215, 46.779937977879648], [6.659285317068087, 46.779934469541821], [6.659285521348037, 46.779934582118074], [6.659285850914218, 46.7799347983103], [6.659286161506024, 46.779935027177935], [6.659286448183013, 46.779935270326362], [6.659286709557734, 46.779935526578711], [6.659286944365193, 46.779935794694872], [6.659287151468964, 46.779936073377137], [6.659287316126099, 46.779936299349956], [6.659287478695028, 46.779936657000505], [6.659287597233623, 46.779936959116952], [6.659287684908779, 46.779937266164026], [6.659287741296186, 46.779937576655641], [6.659287766122923, 46.779937889089076], [6.659287759268847, 46.779938201952255], [6.659287720767119, 46.779938513730947], [6.659287650804082, 46.779938822916257], [6.659287549718346, 46.779939128011755], [6.659287417999141, 46.779939427540874], [6.659287256283958, 46.779939720053925], [6.659287065355464, 46.779940004135241], [6.659286846137709, 46.779940278409924], [6.659286599691667, 46.77994054155053], [6.659286327210085, 46.77994079228354], [6.659286961826484, 46.77994028496299], [6.659287537043086, 46.77993989855343], [6.659288373270331, 46.779939364341338], [6.659289143647663, 46.779938955247339], [6.65928995249854, 46.779938582843563], [6.65929079612662, 46.779938248831868], [6.659291670676628, 46.779937954738656], [6.65929257215199, 46.779937701907883], [6.659293496433078, 46.779937491494906], [6.659294439296051, 46.779937324461393], [6.659295396432145, 46.779937201570561], [6.659296363467386, 46.779937123384094], [6.659297335982537, 46.779937090259224], [6.65929830953334, 46.779937102347333], [6.659299279670794, 46.779937159593224], [6.659300241961497, 46.77993726173527], [6.659301192007911, 46.779937408306665], [6.659302125468447, 46.779937598637666], [6.659303038077308, 46.779937831858398], [6.659303925664004, 46.77993810690311], [6.65930478417237, 46.779938422514903], [6.659305609679133, 46.779938777251488], [6.659306371416212, 46.779939153055167], [6.659306575696224, 46.779939265631334], [6.659297562608254, 46.779946983976004], [6.659297358328232, 46.779946871399851], [6.659306371416212, 46.779939153055167]]] } },
                { "type": "Feature", "properties": { "id": 33, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659224765080796, 46.779986553204758], [6.659232958812745, 46.779979536533098], [6.659232754532732, 46.779979423956789], [6.659224560800774, 46.779986440628456], [6.659224765080796, 46.779986553204758], [6.659225490960608, 46.779986908532237], [6.659226241188721, 46.779987227582772], [6.659227020991192, 46.779987511200368], [6.659227826827265, 46.779987758097178], [6.659228655037972, 46.779987967152195], [6.659229501862764, 46.779988137416119], [6.65923036345656, 46.779988268115964], [6.659231235907234, 46.77998835865813], [6.659232115253348, 46.779988408631645], [6.659232997502157, 46.779988417809555], [6.659233878647742, 46.779988386150123], [6.659234754689201, 46.77998831379719], [6.659235621648781, 46.779988201079213], [6.659236475589998, 46.779988048508024], [6.659237312635458, 46.779987856776401], [6.659238128984488, 46.779987626754902], [6.659238920930388, 46.779987359487947], [6.659239684877273, 46.7799870561891], [6.659240417356381, 46.779986718235499], [6.659241115041824, 46.779986347161675], [6.659241774765718, 46.779985944652459], [6.659242393532522, 46.779985512535539], [6.659242968532692, 46.779985052772979]]] } },
                { "type": "Feature", "properties": { "id": 34, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659413692920633, 46.779918263579297], [6.659423906929487, 46.77992389237793], [6.659423743055545, 46.779924032711662], [6.659413529046679, 46.77991840391298], [6.659413692920633, 46.779918263579297], [6.659414289334683, 46.779917808556199], [6.659414920971296, 46.779917385318335], [6.659415592665273, 46.779916992263473], [6.659416301366729, 46.779916631176313], [6.659417043857746, 46.779916303696382], [6.65941781676699, 46.779916011310675], [6.659418616585008, 46.779915755346792], [6.659419439680157, 46.779915536966939], [6.659420282315116, 46.779915357162643], [6.659421140663835, 46.779915216750368], [6.659422010828909, 46.779915116367647], [6.6594228888593, 46.779915056470323], [6.659423770768228, 46.779915037330298], [6.659424652551326, 46.779915059034501], [6.65942553020479, 46.779915121484422], [6.659426399743562, 46.779915224396461], [6.65942725721944, 46.779915367303339], [6.659428098738988, 46.779915549556179], [6.659428920481215, 46.779915770327499], [6.659429718714944, 46.779916028614743], [6.659430489815728, 46.779916323245303], [6.659431230282323, 46.779916652881262], [6.659431936752588, 46.779917016025912]]] } },
                { "type": "Feature", "properties": { "id": 35, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.6593486260975, 46.779936607102599], [6.659352722951874, 46.779933098762335], [6.659352518671788, 46.779932986186274], [6.659348421817407, 46.779936494526503], [6.6593486260975, 46.779936607102599], [6.65934900202791, 46.779936780015404], [6.659349391624144, 46.779936937723363], [6.659349796137781, 46.779937076580744], [6.659350213639115, 46.779937195925079], [6.659350642136475, 46.779937295187182], [6.65935107958574, 46.779937373893397], [6.659351523900076, 46.779937431668309], [6.659351972959925, 46.779937468236284], [6.659352424623055, 46.779937483422927], [6.659352876734839, 46.779937477155762], [6.659353327138504, 46.779937449464654], [6.659353773685424, 46.779937400481764], [6.659354214245377, 46.779937330440738], [6.659354646716689, 46.779937239675682], [6.659355069036282, 46.779937128619615], [6.659355479189512, 46.779936997802302], [6.659355875219757, 46.779936847847779], [6.659356255237777, 46.779936679471433], [6.659356617430729, 46.779936493476512], [6.659356960070784, 46.779936290750243], [6.659357281523398, 46.77993607225973], [6.659357625675908, 46.779935800586912], [6.65935704240441, 46.779936336203164], [6.659356513142755, 46.77993689766695], [6.659356040309601, 46.779937482412393], [6.659355626065729, 46.779938087767391], [6.659355272304182, 46.779938710965453], [6.659354980641615, 46.779939349158617], [6.659354752410888, 46.779939999430567], [6.659354588654992, 46.779940658809515], [6.659354490122265, 46.779941324282248], [6.659354457262997, 46.779941992807593], [6.659354490227354, 46.779942661330509], [6.659354588864693, 46.779943326795902], [6.65935475272426, 46.779943986162671], [6.659354981057231, 46.779944636417696], [6.65935527282016, 46.779945274589231], [6.65935562667974, 46.779945897761024], [6.659356041018859, 46.77994650308527], [6.65935651394406, 46.779947087795627], [6.659357043294124, 46.779947649220148], [6.659357626649999, 46.779948184793085], [6.659358261345814, 46.779948692066981], [6.659358944481091, 46.779949168723725], [6.65935964372157, 46.779949598045931], [6.659359848001721, 46.779949710622013], [6.659368861081234, 46.779941992272391], [6.65936865680108, 46.779941879696359], [6.65935964372157, 46.779949598045931]]] } },
                { "type": "Feature", "properties": { "id": 36, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659499472819444, 46.779911795998778], [6.659491279132521, 46.779918812689665], [6.659491483412832, 46.779918925265513], [6.659499677099759, 46.779911908574569], [6.659499472819444, 46.779911795998778], [6.659498746938824, 46.779911440673061], [6.659497996710154, 46.779911121624295], [6.659497216907362, 46.779910838008561], [6.659496411071205, 46.779910591113648], [6.659495582860649, 46.779910382060564], [6.659494736036239, 46.779910211798608], [6.659493874443049, 46.77991008110078], [6.659493001993201, 46.779909990560597], [6.659492122648126, 46.779909940589114], [6.659491240400559, 46.779909931413208], [6.659490359256407, 46.779909963074616], [6.659489483216566, 46.779910035429516], [6.659488616258777, 46.779910148149391], [6.659487762319508, 46.779910300722484], [6.659486925276145, 46.779910492455961], [6.659486108929349, 46.779910722479258], [6.6594853169858, 46.779910989747904], [6.659484553041378, 46.779911293048407], [6.659483820564827, 46.779911631003593], [6.659483122882025, 46.779912002078909], [6.659482463160839, 46.779912404589474], [6.659481844396802, 46.779912836707702], [6.659481269399441, 46.779913296471499]]] } },
                { "type": "Feature", "properties": { "id": 37, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659388460731235, 46.779958559434867], [6.65939255758466, 46.779955051093197], [6.659392353304407, 46.779954938517143], [6.659388256450966, 46.779958446858785], [6.659388460731223, 46.779958559434839], [6.659388614516128, 46.779958630741582], [6.659388990013239, 46.779958797409478], [6.659389381191573, 46.779958946085401], [6.65938978622727, 46.779959076076224], [6.659390203231869, 46.77995918677582], [6.659390630261101, 46.779959277668056], [6.659391065323961, 46.779959348329207], [6.659391506391982, 46.779959398429739], [6.659391951408696, 46.779959427736124], [6.659392398299232, 46.779959436111689], [6.659392844979986, 46.779959423517376], [6.659393289368318, 46.779959390011932], [6.659393729392294, 46.779959335751563], [6.6593941630003, 46.779959260989287], [6.659394588170676, 46.779959166073589], [6.659395002921063, 46.779959051447108], [6.659395405317722, 46.779958917644258], [6.659395793484475, 46.779958765288832], [6.659396165611519, 46.77995859509128], [6.659396519963822, 46.779958407845051], [6.659396854889237, 46.779958204423238], [6.659397168826183, 46.779957985774267], [6.65939746031092, 46.779957752917554], [6.659396877039829, 46.779958288533997], [6.659396347778613, 46.779958849997932], [6.659395874945917, 46.779959434743517], [6.659395460702528, 46.779960040098551], [6.659395106941493, 46.77996066329667], [6.659394815279451, 46.779961301489891], [6.659394587049268, 46.779961951761798], [6.659394423293922, 46.779962611140718], [6.659394324761757, 46.779963276613337], [6.659394291903056, 46.779963945138597], [6.659394324867986, 46.779964613661342], [6.6593944235059, 46.779965279126564], [6.659394587366036, 46.779965938493248], [6.659394815699582, 46.779966588748003], [6.659395107463081, 46.779967226919354], [6.659395461323211, 46.779967850090884], [6.659395875662883, 46.779968455414888], [6.659396348588619, 46.779969040125017], [6.659396877939204, 46.779969601549233], [6.659397461295587, 46.779970137121879], [6.659398095991895, 46.779970644395512], [6.65939877912765, 46.779971121051915], [6.659399478369354, 46.77997155037432], [6.659408491446841, 46.7799638320216], [6.659408695727162, 46.779963944597604], [6.659399682649684, 46.779971662950302], [6.659399478369354, 46.77997155037432]]] } },
                { "type": "Feature", "properties": { "id": 38, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659325355954508, 46.77995653447234], [6.659321259096555, 46.779960042811588], [6.659321054816445, 46.779959930235414], [6.659325151674391, 46.779956421896166], [6.659325355954508, 46.77995653447234], [6.659325683203934, 46.779956749072767], [6.65932599181115, 46.779956976135686], [6.659326276866731, 46.779957217290928], [6.659326537010829, 46.779957471388137], [6.659326771002441, 46.779957737215106], [6.659326977725327, 46.779958013503787], [6.659327156193337, 46.779958298936101], [6.659327305555084, 46.779958592150464], [6.659327425098053, 46.779958891748059], [6.659327514251966, 46.779959196299707], [6.659327572591529, 46.779959504352533], [6.659327599838431, 46.779959814437028], [6.659327595862688, 46.77996012507392], [6.659327560683264, 46.779960434781366], [6.659327494467988, 46.779960742081883], [6.659327397532734, 46.779961045509516], [6.659327270339925, 46.779961343616883], [6.659327113496317, 46.779961634981738], [6.659326927750135, 46.779961918214198], [6.659326713987465, 46.779962191963151], [6.659326473228051, 46.779962454922597], [6.659326161821478, 46.779962744637515], [6.659326796437759, 46.779962237316767], [6.659327479498263, 46.779961760609666], [6.659328207881502, 46.779961316694667], [6.659328978258844, 46.779960907600341], [6.659329787109774, 46.779960535196302], [6.659330630737955, 46.779960201184338], [6.6593315052881, 46.779959907090806], [6.659332406763642, 46.779959654259663], [6.659333331044953, 46.779959443846423], [6.659334273908184, 46.779959276812519], [6.659335231044579, 46.779959153921403], [6.659336198080156, 46.779959075734574], [6.65933717059568, 46.779959042609399], [6.659338144146886, 46.779959054697166], [6.659339114284779, 46.779959111942709], [6.659340076575949, 46.779959214084393], [6.659341026622861, 46.779959360655475], [6.659341960083915, 46.779959550986149], [6.659342872693321, 46.779959784206554], [6.659343760280582, 46.779960059250968], [6.659344618789532, 46.779960374862497], [6.659345444296894, 46.779960729598749], [6.659346206034572, 46.779961105402144], [6.659346410314752, 46.779961217978247], [6.659337397228806, 46.779968936326071], [6.659337192948615, 46.779968823749954], [6.659346206034572, 46.779961105402144]]] } },
                { "type": "Feature", "properties": { "id": 39, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659290774080006, 46.779967460382466], [6.659300988085358, 46.779973089192104], [6.65930115195977, 46.779972948858529], [6.65929093795444, 46.779967320048954], [6.659290774080006, 46.779967460382466], [6.659290256838746, 46.77996795903789], [6.659289792405256, 46.779968474419391], [6.6592893795507, 46.779969010117462], [6.659289020149677, 46.77996956369968], [6.659288715834075, 46.779970132652466], [6.65928846798566, 46.779970714392491], [6.659288277729819, 46.779971306278235], [6.659288145930413, 46.77997190562229], [6.659288073185897, 46.7799725097032], [6.659288059826575, 46.779973115778155], [6.659288105913115, 46.779973721095203], [6.659288211236238, 46.779974322905879], [6.65928837531774, 46.779974918477578], [6.65928859741259, 46.779975505106052], [6.659288876512349, 46.77997608012771], [6.659289211349744, 46.779976640931579], [6.659289600404429, 46.779977184971322], [6.659290041909859, 46.77997770977661], [6.659290533861355, 46.779978212964664], [6.659291074025168, 46.77997869225058], [6.659291659948649, 46.77997914545815], [6.65929228897136, 46.779979570529605], [6.659292958237182, 46.779979965534849]]] } },
                { "type": "Feature", "properties": { "id": 40, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659283366751748, 46.780042950023862], [6.659291560484655, 46.780035933347968], [6.659291764765003, 46.780036045924177], [6.659283571032107, 46.780043062600079], [6.659283366751748, 46.780042950023862], [6.659282704382846, 46.780042540304407], [6.65928208828627, 46.780042106390219], [6.659281516126507, 46.780041644957926], [6.659280990501507, 46.780041158102826], [6.65928051379791, 46.780040648035488], [6.659280088180222, 46.780040117071898], [6.65927971558099, 46.780039567622907], [6.65927939769203, 46.780039002183429], [6.659279135956748, 46.780038423320818], [6.659278931563557, 46.780037833663457], [6.659278785440533, 46.780037235888663], [6.659278698251144, 46.780036632710811], [6.659278670391292, 46.780036026868586], [6.659278701987463, 46.780035421112913], [6.659278792896194, 46.78003481819421], [6.659278942704714, 46.780034220850155], [6.659279150732787, 46.780033631792953], [6.65927941603586, 46.780033053697331], [6.659279737409286, 46.780032489188152], [6.659280113393857, 46.780031940828614], [6.659280542282377, 46.780031411108567], [6.659281022127437, 46.780030902433289], [6.659281550750275, 46.780030417112407]]] } },
                { "type": "Feature", "properties": { "id": 41, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659285818116094, 46.7800443009384], [6.659294011848886, 46.780037284262384], [6.659293807568526, 46.780037171686182], [6.659285613835725, 46.780044188362197], [6.659285818116094, 46.7800443009384], [6.659286543997099, 46.780044656265446], [6.659287294226377, 46.780044975315612], [6.659288074030007, 46.780045258932773], [6.659288879867221, 46.78004550582915], [6.659289708079054, 46.780045714883691], [6.659290554904948, 46.780045885147203], [6.659291416499815, 46.780046015846565], [6.659292288951527, 46.780046106388305], [6.65929316829864, 46.780046156361323], [6.659294050548406, 46.780046165538728], [6.659294931694901, 46.780046133878855], [6.659295807737216, 46.780046061525418], [6.659296674697598, 46.780045948807043], [6.659297528639558, 46.780045796235349], [6.659298365685697, 46.780045604503307], [6.65929918203534, 46.780045374481368], [6.659299973981787, 46.780045107213986], [6.659300737929148, 46.780044803914727], [6.65930147040866, 46.780044465960763], [6.659302168094428, 46.780044094886534], [6.659302827818573, 46.780043692376992], [6.65930344658555, 46.780043260259767], [6.659304021585817, 46.780042800496872]]] } },
                { "type": "Feature", "properties": { "id": 42, "height": 2.0, "width": 1.8, "passage_ty": 2 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659323536894448, 46.780092072427593], [6.659330911256169, 46.780085757416813], [6.659330298414323, 46.780085419688412], [6.659322924303042, 46.780091734837228], [6.659323536894448, 46.780092072427593], [6.659324244718703, 46.780092365794523], [6.659324948838383, 46.780092633395228], [6.659325677899395, 46.7800928673635], [6.659326428502647, 46.78009306660843], [6.659327197148593, 46.780093230201118], [6.65932798025358, 46.78009335737886], [6.659328774166527, 46.780093447548673], [6.659329575185979, 46.780093500290256], [6.65933037957734, 46.780093515357628], [6.659331183590299, 46.780093492680543], [6.659331983476296, 46.78009343236473], [6.659332775506026, 46.780093334691415], [6.659333555986807, 46.780093200115978], [6.659334321279798, 46.780093029265849], [6.65933506781698, 46.780092822937576], [6.659335792117763, 46.780092582093154], [6.659336490805245, 46.780092307855455], [6.65933716062193, 46.780092001503], [6.659337798444939, 46.780091664464194], [6.659338401300539, 46.780091298310346], [6.659338966378041, 46.780090904748619], [6.659339491042879, 46.780090485613869], [6.65933900922886, 46.780090928375309], [6.659338572521553, 46.780091392692107], [6.659338182957094, 46.780091876399396], [6.659337842351806, 46.780092377241871], [6.659337552293762, 46.780092892884355], [6.659337314135332, 46.780093420922697], [6.659337128986932, 46.780093958895002], [6.659336997711812, 46.780094504292911], [6.659336920922034, 46.780095054573586], [6.659336898975628, 46.780095607171312], [6.659336931974924, 46.780096159509718], [6.65933701976606, 46.780096709013392], [6.659337161939719, 46.780097253120474], [6.659337357833028, 46.780097789293954], [6.659337606532637, 46.780098315034024], [6.659337906878992, 46.780098827889383], [6.659338257471748, 46.780099325468861], [6.659338656676283, 46.780099805452579], [6.659339102631307, 46.780100265602556], [6.659339593257591, 46.780100703773378], [6.659340126267599, 46.780101117922136], [6.659340696470118, 46.780101528822179], [6.659341309312211, 46.780101866550538], [6.659348683673189, 46.780095551538558], [6.65934807083111, 46.780095213810284], [6.659340696470118, 46.780101528822179]]] } },
                { "type": "Feature", "properties": { "id": 43, "height": null, "width": 1.5, "passage_ty": 5 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659460277000525, 46.779955999386004], [6.659475598032647, 46.779964442577352], [6.659477843105549, 46.779962520004453], [6.659462522073607, 46.779954076813382], [6.659464767146544, 46.779952154240696], [6.659480088178282, 46.779960597431455], [6.659482333250863, 46.779958674858449], [6.659467012219313, 46.779950231667996], [6.659469257291917, 46.779948309095232], [6.659484578323271, 46.779956752285379], [6.659486823395513, 46.779954829712288], [6.659471502364365, 46.779946386522433], [6.65947374743666, 46.779944463949583], [6.659489068467623, 46.779952907139176], [6.659491313539533, 46.779950984565943], [6.659475992508795, 46.779942541376684], [6.659478237580738, 46.779940618803764], [6.659493558611325, 46.779949061992724], [6.659495803682943, 46.779947139419434], [6.659480482652552, 46.779938696230765]]] } },
                { "type": "Feature", "properties": { "id": 44, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659426721007538, 46.779995435923411], [6.65941513447566, 46.779989050755219], [6.659414965480435, 46.779989195474336], [6.659426552012307, 46.779995580642563], [6.659426721007538, 46.779995435923411], [6.659427285148895, 46.779994896283391], [6.6594278176663, 46.779994311465451], [6.659428291450855, 46.779993703268147], [6.659428704337416, 46.779993074470717], [6.659429054439146, 46.779992427946873], [6.659429340156136, 46.779991766650987], [6.659429560182688, 46.779991093605169], [6.659429713513312, 46.779990411885137], [6.65942979944731, 46.779989724606267], [6.659429817591985, 46.779989034909363], [6.659429767864413, 46.779988345946222], [6.659429650491849, 46.779987660865274], [6.65942946601067, 46.779986982797354], [6.659429215263931, 46.77998631484104], [6.659428899397521, 46.779985660048865], [6.659428519854912, 46.779985021413147], [6.659428078370565, 46.77998440185236], [6.659427576962002, 46.779983804197812], [6.659427017920608, 46.779983231180687], [6.659426403801119, 46.779982685419618], [6.659425737409996, 46.779982169408676], [6.659425021792551, 46.779981685505959], [6.659424260219072, 46.77998123592284], [6.659424695130189, 46.779981456533775], [6.659425089876313, 46.77998162709563], [6.659425500819137, 46.779981778531962], [6.659425925998291, 46.779981910120519], [6.659426363385473, 46.779982021233465], [6.659426810894152, 46.779982111340757], [6.65942726638952, 46.779982180012624], [6.659427727698666, 46.779982226921355], [6.659428192620928, 46.779982251843265], [6.659428658938437, 46.77998225465938], [6.659429124426635, 46.779982235356357], [6.659429586864957, 46.779982194026182], [6.659430044047348, 46.779982130866102], [6.659430493792866, 46.779982046177409], [6.659430933956003, 46.779981940364053], [6.65943136243701, 46.779981813930853], [6.659431777191825, 46.779981667480953], [6.659432176241899, 46.779981501712932], [6.659432557683576, 46.779981317417636], [6.659432919697214, 46.779981115474243], [6.659433260555846, 46.779980896846048], [6.659433582706273, 46.779980665011081], [6.659433751701437, 46.779980520291936], [6.65942848509679, 46.779977617943217], [6.659428316101608, 46.779977762662355], [6.659433582706273, 46.779980665011081]]] } },
                { "type": "Feature", "properties": { "id": 45, "height": 2.0, "width": 1.8, "passage_ty": 2 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659537266968934, 46.779910482134966], [6.659544641280735, 46.779904167110224], [6.65954443700037, 46.779904054534455], [6.659537062688559, 46.779910369559218], [6.659537266968934, 46.779910482134966], [6.659537707206177, 46.779910700547291], [6.65953838310121, 46.77991100054863], [6.659539087222333, 46.779911268164383], [6.659539816286594, 46.779911502146895], [6.659540566894771, 46.77991170140519], [6.659541335547169, 46.779911865010234], [6.659542118659981, 46.779911992199239], [6.659542912581972, 46.779912082379177], [6.659543713611505, 46.779912135129571], [6.659544518013814, 46.779912150204567], [6.659545322038406, 46.779912127533755], [6.659546121936535, 46.779912067222838], [6.659546913978708, 46.779911969553119], [6.659547694472067, 46.779911834979956], [6.659548459777574, 46.779911664130694], [6.659549206327038, 46.779911457802015], [6.659549930639685, 46.779911216955895], [6.659550629338438, 46.779910942715183], [6.659551299165645, 46.779910636358665], [6.659551936998254, 46.779910299314622], [6.6595525398624, 46.779909933154528], [6.659553104947254, 46.779909539585553], [6.659553629618123, 46.779909120442795], [6.659553147807475, 46.77990956320518], [6.659552711103483, 46.779910027522781], [6.659552321542259, 46.779910511230817], [6.65955198094011, 46.779911012073875], [6.659551690885086, 46.779911527716962], [6.659551452729558, 46.779912055755744], [6.659551267583921, 46.77991259372844], [6.65955113631141, 46.779913139126585], [6.659551059524073, 46.779913689407394], [6.659551037579937, 46.779914242005212], [6.659551070581316, 46.779914794343505], [6.659551158374343, 46.779915343847108], [6.659551300549685, 46.779915887953898], [6.659551496444466, 46.779916424127066], [6.659551745145325, 46.779916949866667], [6.659552045492711, 46.779917462721421], [6.659552396086264, 46.779917960300288], [6.659552795291356, 46.779918440283247], [6.659553241246717, 46.779918900432399], [6.659553731873087, 46.779919338602355], [6.659554264882948, 46.779919752750104], [6.659554837791157, 46.779920140944704], [6.659555243646115, 46.779920388800548], [6.659555447926565, 46.779920501376282], [6.659562822237594, 46.779914186350368], [6.659562617957152, 46.779914073774655], [6.659555243646115, 46.779920388800548]]] } },
                { "type": "Feature", "properties": { "id": 46, "height": 2.0, "width": 1.8, "passage_ty": 2 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659512473751708, 46.779945945748388], [6.659521666373696, 46.779951011659314], [6.659521830247389, 46.779950871325397], [6.659512637625498, 46.779945805414535], [6.659512473751708, 46.779945945748388], [6.659512155814197, 46.779946248176756], [6.659511719109557, 46.779946712494208], [6.659511329547698, 46.779947196202095], [6.659510988944937, 46.77994769704506], [6.659510698889322, 46.779948212687991], [6.65951046073323, 46.779948740726738], [6.659510275587057, 46.779949278699299], [6.659510144314043, 46.779949824097429], [6.659510067526232, 46.779950374378238], [6.659510045581663, 46.779950926976007], [6.659510078582643, 46.779951479314363], [6.65951016637531, 46.779952028817945], [6.659510308550337, 46.779952572924785], [6.659510504444842, 46.779953109098031], [6.659510753145474, 46.779953634837661], [6.65951105349267, 46.779954147692578], [6.659511404086086, 46.779954645271566], [6.659511803291084, 46.779955125254652], [6.659512249246395, 46.779955585404004], [6.659512739872769, 46.779956023574101], [6.659513272882679, 46.779956437722035], [6.659513845790983, 46.779956825916862], [6.659514455926518, 46.779957186348632], [6.659513811408488, 46.779956855360396], [6.659513135513016, 46.779956555358972], [6.659512431391432, 46.779956287743012], [6.659511702326681, 46.779956053760365], [6.659510951717994, 46.779955854501821], [6.65951018306506, 46.779955690896607], [6.659509399951687, 46.779955563707382], [6.659508606029112, 46.779955473527203], [6.659507804998969, 46.779955420776538], [6.659507000596025, 46.779955405701351], [6.65950619657077, 46.779955428371892], [6.659505396671953, 46.779955488682461], [6.659504604629063, 46.77995558635191], [6.659503824134963, 46.779955720924804], [6.659503058828688, 46.779955891773731], [6.659502312278434, 46.779956098102119], [6.659501587964969, 46.779956338947976], [6.659500889265377, 46.779956613188347], [6.659500219437314, 46.779956919544581], [6.659499581603828, 46.779957256588332], [6.659498978738791, 46.77995762274815], [6.659498413653037, 46.779958016316833], [6.659498052855105, 46.779958295125532], [6.65949788898125, 46.779958435459363], [6.659507081603921, 46.779963501371377], [6.659507245477748, 46.779963361037531], [6.659498052855105, 46.779958295125532]]] } },
                { "type": "Feature", "properties": { "id": 47, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659479480059455, 46.779991881963539], [6.659472105728005, 46.779998196983968], [6.659471901447422, 46.779998084408113], [6.65947927577888, 46.779991769387664], [6.659479480059455, 46.779991881963539], [6.659479885914583, 46.779992129819583], [6.659480458823024, 46.779992518014623], [6.659480991833047, 46.779992932162706], [6.659481482459505, 46.77999337033296], [6.659481928414876, 46.779993830482383], [6.659482327619902, 46.779994310465568], [6.659482678213311, 46.77999480804462], [6.659482978560471, 46.779995320899609], [6.659483227261028, 46.779995846639373], [6.659483423155423, 46.779996382812591], [6.659483565330295, 46.779996926919445], [6.659483653122766, 46.779997476423063], [6.659483686123506, 46.779998028761412], [6.659483664178643, 46.779998581359195], [6.659483587390496, 46.779999131640011], [6.65948345611709, 46.779999677038063], [6.659483270970472, 46.78000021501061], [6.659483032813882, 46.780000743049264], [6.659482742757713, 46.78000125869216], [6.659482402154343, 46.780001759535047], [6.659482012591823, 46.780002243242791], [6.659481575886467, 46.780002707560129], [6.659481094074402, 46.780003150322202]]] } },
                { "type": "Feature", "properties": { "id": 48, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659514718470958, 46.780011301294564], [6.65950734414097, 46.780017616317281], [6.659507548421701, 46.7800177288931], [6.659514922751669, 46.780011413870341], [6.659514718470958, 46.780011301294564], [6.659514278232987, 46.780011082882133], [6.659513602336832, 46.780010782880687], [6.659512898214534, 46.780010515264756], [6.659512169149049, 46.780010281282067], [6.659511418539605, 46.780010082023608], [6.659510649885894, 46.780009918418337], [6.659509866771733, 46.780009791229133], [6.659509072848358, 46.78000970104894], [6.659508271817407, 46.780009648298275], [6.659507467413653, 46.780009633223102], [6.659506663387589, 46.780009655893679], [6.659505863487966, 46.780009716204212], [6.659505071444281, 46.780009813873669], [6.659504290949395, 46.780009948446569], [6.659503525642353, 46.780010119295532], [6.659502779091348, 46.780010325623905], [6.659502054777157, 46.780010566469748], [6.659501356076865, 46.780010840710098], [6.659500686248127, 46.780011147066368], [6.659500048414003, 46.780011484110105], [6.659499445548362, 46.78001185026995], [6.659498880462042, 46.780012243838605], [6.659498355789744, 46.780012662981115]]] } },
                { "type": "Feature", "properties": { "id": 49, "height": 2.0, "width": 1.8, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659458003625226, 46.77999388516487], [6.659467196250175, 46.77999895108011], [6.659467360124245, 46.779998810746356], [6.659458167499304, 46.779993744831103], [6.659458003625226, 46.77999388516487], [6.659457685687125, 46.779994187593104], [6.659457248981628, 46.779994651910378], [6.65945685941893, 46.779995135617988], [6.65945651881536, 46.779995636460818], [6.659456228758971, 46.779996152103607], [6.659455990602135, 46.779996680142254], [6.659455805455252, 46.779997218114723], [6.659455674181563, 46.77999776351281], [6.65945559739313, 46.77999831379357], [6.65945557544798, 46.779998866391317], [6.659455608448433, 46.779999418729666], [6.659455696240624, 46.779999968233298], [6.659455838415233, 46.780000512340251], [6.659456034309363, 46.780001048513533], [6.659456283009684, 46.780001574253319], [6.659456583356629, 46.780002087108379], [6.659456933949852, 46.780002584687502], [6.659457333154727, 46.780003064670787], [6.659457779109966, 46.78000352482033], [6.659458269736332, 46.780003962990641], [6.659458802746296, 46.780004377138845], [6.659459375654715, 46.780004765333956], [6.659459985850416, 46.780005125714659], [6.659459342869952, 46.780004793972687], [6.659458668268481, 46.780004493321812], [6.659457965226114, 46.780004225179425], [6.659457237057039, 46.780003990809448], [6.659456487193899, 46.78000379131683], [6.659455719171602, 46.780003627641925], [6.659454936610645, 46.780003500556319], [6.659454143200077, 46.780003410659113], [6.659453342680096, 46.780003358374067], [6.659452538824392, 46.780003343947691], [6.659451735422405, 46.780003367447932], [6.659450936261428, 46.78000342876409], [6.659450145108744, 46.780003527607107], [6.659449365693912, 46.780003663510946], [6.659448601691141, 46.780003835834968], [6.659447856701989, 46.780004043766901], [6.659447134238393, 46.780004286326495], [6.659446437706083, 46.78000456237028], [6.659445770388568, 46.780004870597047], [6.65944513543162, 46.780005209553678], [6.659444535828476, 46.78000557764247], [6.659443974405705, 46.780005973128034], [6.659443582703322, 46.780006234535101], [6.659443418829181, 46.780006374868812], [6.65945261145489, 46.780011440785202], [6.659452775329036, 46.780011300451456], [6.659443582703322, 46.780006234535101]]] } },
                { "type": "Feature", "properties": { "id": 50, "height": 1.8, "width": 2.13, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659453579063998, 46.780028978611412], [6.659440372569374, 46.780025901304846], [6.659440456688835, 46.78002573093017], [6.659453663187272, 46.780028808237596], [6.659453579063998, 46.780028978611412], [6.659453380380481, 46.780029330544764], [6.659453053844016, 46.780029840672015], [6.659452684682764, 46.780030336893148], [6.659452274145852, 46.78003081752923], [6.659451823622411, 46.780031280953835], [6.659451334636867, 46.780031725598953], [6.65945186042994, 46.780031301237898], [6.659452421251404, 46.78003089859682], [6.659453015203632, 46.780030519038128], [6.659453640276861, 46.780030163846064], [6.659454294356054, 46.780029834222567], [6.659454751368535, 46.780029624650275], [6.659454975228013, 46.780029531282935], [6.659462212583491, 46.780037720265838], [6.659461988723996, 46.780037813633193], [6.659454751368535, 46.780029624650275]]] } },
                { "type": "Feature", "properties": { "id": 51, "height": 2.0, "width": 1.5, "passage_ty": 4 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658892751632175, 46.779625468851044], [6.658889508047617, 46.779652684758418], [6.658872144416237, 46.779643115718549], [6.658910115261574, 46.779635037887822], [6.658892751632175, 46.779625468851044]]] } },
                { "type": "Feature", "properties": { "id": 52, "height": 1.9, "width": 1.2, "passage_ty": 4 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659563973803521, 46.779952876894924], [6.659555752101104, 46.779921822212309], [6.659536906631319, 46.779937960609665], [6.659582819270405, 46.779936738493085], [6.659563973803521, 46.779952876894924]]] } },
                { "type": "Feature", "properties": { "id": 53, "height": 2.0, "width": 0.9, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659482865168923, 46.780038722677517], [6.659475490831469, 46.780045037698159], [6.659475695112238, 46.780045150274027], [6.659483069449696, 46.780038835253336], [6.659482865168923, 46.780038722677517], [6.659482424930881, 46.780038504264965], [6.659481749034559, 46.78003820426332], [6.659481044912063, 46.78003793664719], [6.659480315846345, 46.780037702664323], [6.659479565236636, 46.780037503405623], [6.659478796582631, 46.780037339800138], [6.659478013468145, 46.780037212610715], [6.659477219544421, 46.780037122430322], [6.659476418513091, 46.780037069679459], [6.659475614108939, 46.78003705460403], [6.659474810082451, 46.780037077274336], [6.659474010182386, 46.780037137584728], [6.659473218138239, 46.780037235253928], [6.659472437642878, 46.780037369826601], [6.659471672335344, 46.780037540675337], [6.659470925783836, 46.780037747003533], [6.659470201469134, 46.780037987849141], [6.659469502768324, 46.780038262089342], [6.659468832939063, 46.780038568445377], [6.659468195104416, 46.780038905488965], [6.659467592238252, 46.780039271648626], [6.659467027151413, 46.780039665217139], [6.659466502478598, 46.780040084359499]]] } },
                { "type": "Feature", "properties": { "id": 54, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659503488540742, 46.780054700726829], [6.65949939168694, 46.780058209072443], [6.659499187406071, 46.780058096496624], [6.659503284259881, 46.78005458815101], [6.659503488540742, 46.780054700726829], [6.659503815791475, 46.78005491532678], [6.659504124400004, 46.780055142389202], [6.659504409456903, 46.780055383543981], [6.659504669602314, 46.780055637640807], [6.659504903595233, 46.780055903467414], [6.659505110319411, 46.780056179755761], [6.659505288788688, 46.780056465187812], [6.659505438151677, 46.780056758401905], [6.659505557695856, 46.780057057999329], [6.659505646850937, 46.780057362550835], [6.659505705191625, 46.78005767060354], [6.659505732439603, 46.780057980687992], [6.65950572846488, 46.780058291324877], [6.659505693286417, 46.78005860103238], [6.659505627072035, 46.78005890833299], [6.65950553013761, 46.780059211760808], [6.659505402945553, 46.78005950986833], [6.659505246102624, 46.780059801233421], [6.65950506035704, 46.780060084466164], [6.659504846594886, 46.780060358215444], [6.659504605835904, 46.780060621175295], [6.659504294429721, 46.780060910890676], [6.659504929045482, 46.780060403568982], [6.659505612105653, 46.780059926860808], [6.65950634048875, 46.780059482944658], [6.659507110866143, 46.780059073849145], [6.659507919717318, 46.78005870144387], [6.659508763345929, 46.780058367430534], [6.659509637896694, 46.780058073335645], [6.659510539373045, 46.780057820503146], [6.659511463655343, 46.780057610088448], [6.659512406519742, 46.780057443053117], [6.659513363657474, 46.780057320160509], [6.659514330694555, 46.780057241972138], [6.659515303211742, 46.780057208845392], [6.659516276764763, 46.780057220931674], [6.659517246904613, 46.780057278175704], [6.659518209197876, 46.780057380315917], [6.659519159247001, 46.780057526885507], [6.659520092710387, 46.78005771721471], [6.659521005322228, 46.780057950433694], [6.659521892912016, 46.780058225476715], [6.659522751423576, 46.780058541086881], [6.659523576933614, 46.780058895821888], [6.659524338673924, 46.780059271624062], [6.659524542954848, 46.780059384199859], [6.659515529878002, 46.780067102561659], [6.659515325597066, 46.780066989985841], [6.659524338673924, 46.780059271624062]]] } },
                { "type": "Feature", "properties": { "id": 55, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659542474811716, 46.78005035348653], [6.659551487881896, 46.780042635122584], [6.659551283600975, 46.780042522546864], [6.659542270530783, 46.780050240910761], [6.659542474811716, 46.78005035348653], [6.65954323655203, 46.780050729288618], [6.659544062062085, 46.780051084023462], [6.659544920573659, 46.780051399633443], [6.659545808163462, 46.780051674676308], [6.659546720775309, 46.780051907895064], [6.659547654238697, 46.780052098224047], [6.659548604287809, 46.780052244793382], [6.659549566581043, 46.780052346933331], [6.659550536720841, 46.780052404177063], [6.659551510273782, 46.780052416263054], [6.659552482790858, 46.780052383135988], [6.659553449827794, 46.780052304947333], [6.659554406965341, 46.780052182054348], [6.659555349829513, 46.780052015018661], [6.659556274111537, 46.780051804603559], [6.659557175587561, 46.780051551770732], [6.659558050137953, 46.78005125767546], [6.659558893766136, 46.78005092366179], [6.65955970261683, 46.78005055125606], [6.659560472993691, 46.780050142160249], [6.659561201376204, 46.780049698243758], [6.659561884435743, 46.780049221535236], [6.659562519050817, 46.780048714213216], [6.659562246569966, 46.780048964946822], [6.659562000124772, 46.780049228088068], [6.659561780907971, 46.780049502363262], [6.659561589980537, 46.780049786445034], [6.659561428266511, 46.780050078958482], [6.659561296548559, 46.780050378487907], [6.659561195464163, 46.78005068358366], [6.65956112550255, 46.780050992769098], [6.659561087002324, 46.780051304547911], [6.659561080149818, 46.780051617411097], [6.659561104978196, 46.780051929844497], [6.6595611613673, 46.780052240335927], [6.659561249044203, 46.780052547382766], [6.659561367584589, 46.780052849498936], [6.659561516414733, 46.780053145222269], [6.659561694814333, 46.780053433121502], [6.659561901919979, 46.780053711803276], [6.659562136729321, 46.780053979918861], [6.659562398105932, 46.780054236170621], [6.659562684784802, 46.780054479318309], [6.659562995378472, 46.78005470818519], [6.659563324946522, 46.780054924376628], [6.659563529227511, 46.780055036952341], [6.659567626076895, 46.780051528604467], [6.65956742179591, 46.780051416028734], [6.659563324946522, 46.780054924376628]]] } },
                { "type": "Feature", "properties": { "id": 56, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659606428250522, 46.78007867784671], [6.659610525098911, 46.780075169497252], [6.659610320817715, 46.780075056921632], [6.659606223969353, 46.780078565271062], [6.659606428250522, 46.78007867784671], [6.659606582036039, 46.780078749153084], [6.659606957534664, 46.780078915820283], [6.65960734871447, 46.780079064495489], [6.659607753751597, 46.780079194485509], [6.659608170757574, 46.780079305184302], [6.659608597788127, 46.780079396075742], [6.659609032852241, 46.780079466736055], [6.659609473921449, 46.780079516835741], [6.659609918939275, 46.780079546141266], [6.659610365830844, 46.780079554515979], [6.659610812512542, 46.78007954192082], [6.659611256901729, 46.780079508414573], [6.659611696926464, 46.780079454153331], [6.659612130535137, 46.780079379390223], [6.659612555706077, 46.780079284473729], [6.659612970456926, 46.780079169846431], [6.65961337285394, 46.780079036042814], [6.65961376102094, 46.780078883686677], [6.659614133148126, 46.780078713488365], [6.659614487500461, 46.780078526241496], [6.659614822425802, 46.780078322819072], [6.65961513636256, 46.780078104169469], [6.659615427847018, 46.780077871312223], [6.659614844576803, 46.780078406929753], [6.659614315316676, 46.780078968394683], [6.659613842485294, 46.780079553141192], [6.659613428243429, 46.780080158497036], [6.659613074484128, 46.780080781695766], [6.659612782824017, 46.780081419889576], [6.659612554595956, 46.780082070161868], [6.659612390842914, 46.780082729541114], [6.659612292313223, 46.780083395013911], [6.659612259457155, 46.780084063539221], [6.659612292424861, 46.780084732061901], [6.65961239106569, 46.780085397526932], [6.65961255492886, 46.780086056893268], [6.659612783265548, 46.780086707147596], [6.659613075032278, 46.780087345318385], [6.659613428895719, 46.780087968489262], [6.659613843238765, 46.780088573812421], [6.659614316167921, 46.780089158521648], [6.659614845521959, 46.780089719944804], [6.659615428881809, 46.780090255516349], [6.659616063581586, 46.780090762788774], [6.659616746720797, 46.780091239443884], [6.65961744596579, 46.780091668764946], [6.659617650247031, 46.780091781340538], [6.65962666331338, 46.780084062970708], [6.659626459032141, 46.78008395039511], [6.65961744596579, 46.780091668764946]]] } },
                { "type": "Feature", "properties": { "id": 57, "height": 2.0, "width": 1.8, "passage_ty": 2 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659846307321454, 46.780126051902698], [6.659853681626534, 46.780119736858161], [6.659853477344694, 46.780119624282939], [6.659846103039604, 46.780125939327498], [6.659846307321454, 46.780126051902698], [6.6598467475617, 46.780126270313836], [6.65984742346116, 46.780126570313286], [6.659848127586635, 46.780126837927178], [6.659848856655159, 46.780127071907685], [6.65984960726748, 46.780127271163984], [6.659850375923894, 46.780127434766904], [6.659851159040572, 46.780127561953798], [6.659851952966257, 46.780127652131569], [6.659852753999298, 46.780127704879853], [6.659853558404912, 46.780127719952588], [6.659854362432593, 46.780127697279603], [6.659855162333577, 46.780127636966569], [6.659855954378362, 46.780127539294696], [6.659856734874071, 46.780127404719408], [6.65985750018166, 46.780127233868114], [6.659858246732926, 46.780127027537382], [6.659858971047091, 46.780126786689316], [6.659859669747068, 46.780126512446728], [6.659860339575197, 46.780126206088411], [6.659860977408425, 46.780125869042628], [6.659861580272882, 46.780125502880885], [6.65986214535774, 46.780125109310418], [6.659862670028303, 46.78012469016624], [6.65986218821828, 46.780125132929918], [6.659861751515207, 46.780125597248748], [6.659861361955197, 46.780126080957757], [6.659861021354559, 46.780126581801746], [6.65986073130133, 46.780127097445586], [6.659860493147881, 46.780127625485036], [6.659860308004587, 46.780128163458173], [6.659860176734682, 46.780128708856701], [6.659860099950193, 46.780129259137695], [6.659860078009142, 46.780129811735577], [6.659860111013824, 46.780130364073806], [6.659860198810353, 46.780130913577082], [6.659860340989387, 46.780131457683481], [6.659860536888029, 46.780131993856088], [6.659860785592901, 46.780132519595007], [6.659861085944428, 46.780133032448958], [6.659861436542243, 46.780133530026845], [6.659861835751684, 46.780134010008737], [6.659862281711469, 46.780134470156668], [6.659862772342317, 46.780134908325238], [6.659863305356689, 46.780135322471573], [6.659863878269417, 46.780135710664631], [6.659864284127398, 46.780135958519338], [6.659864488409324, 46.780136071094503], [6.659871862713644, 46.780129756048808], [6.659871658431727, 46.780129643473636], [6.659864284127398, 46.780135958519338]]] } },
                { "type": "Feature", "properties": { "id": 58, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659583158141491, 46.780098605268634], [6.659579061289539, 46.78010211361709], [6.65957885700835, 46.780102001041413], [6.659582953860296, 46.780098492692979], [6.659583158141491, 46.780098605268634], [6.659583485392818, 46.78009881986835], [6.659583794001936, 46.780099046930573], [6.659584079059422, 46.780099288085161], [6.659584339205424, 46.780099542181787], [6.659584573198925, 46.78009980800821], [6.659584779923681, 46.780100084296421], [6.659584958393526, 46.780100369728338], [6.659585107757071, 46.780100662942338], [6.659585227301789, 46.780100962539656], [6.659585316457394, 46.780101267091112], [6.659585374798585, 46.780101575143817], [6.659585402047044, 46.780101885228241], [6.659585398072776, 46.780102195865105], [6.659585362894744, 46.780102505572607], [6.659585296680763, 46.780102812873267], [6.659585199746709, 46.78010311630117], [6.659585072554987, 46.780103414408792], [6.659584915712363, 46.780103705773996], [6.659584729967046, 46.780103989006847], [6.659584516205122, 46.780104262756275], [6.659584275446332, 46.780104525716304], [6.65958396404033, 46.780104815431891], [6.659584598655856, 46.780104308109742], [6.65958528171588, 46.7801038314011], [6.659586010098916, 46.780103387484438], [6.659586780476332, 46.780102978388392], [6.659587589327614, 46.78010260598252], [6.659588432956419, 46.780102271968666], [6.659589307507464, 46.780101977873159], [6.659590208984175, 46.780101725040005], [6.659591133266915, 46.780101514624675], [6.659592076131832, 46.780101347588698], [6.659593033270165, 46.780101224695372], [6.659594000307919, 46.780101146506375], [6.659594972825849, 46.780101113378954], [6.659595946379682, 46.78010112546454], [6.659596916520406, 46.780101182707881], [6.659597878814607, 46.780101284847412], [6.659598828864723, 46.780101431416348], [6.65959976232915, 46.780101621744897], [6.659600674942079, 46.780101854963263], [6.659601562532998, 46.780102130005659], [6.659602421045724, 46.780102445615213], [6.659603246556961, 46.780102800349624], [6.659604008298428, 46.7801031761513], [6.659604212579685, 46.78010328872697], [6.659595199506927, 46.780111007094945], [6.659594995225653, 46.780110894519296], [6.659604008298428, 46.7801031761513]]] } },
                { "type": "Feature", "properties": { "id": 59, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659505876779243, 46.780141354445618], [6.659498502430425, 46.780147669467667], [6.65949829814922, 46.780147556891862], [6.659505672498048, 46.780141241869792], [6.659505876779243, 46.780141354445618], [6.659506282635619, 46.780141602301633], [6.659506855545843, 46.780141990496467], [6.659507388557546, 46.780142404644451], [6.65950787918558, 46.780142842814563], [6.659508325142414, 46.78014330296385], [6.659508724348783, 46.780143782946972], [6.65950907494341, 46.780144280525953], [6.659509375291656, 46.78014479338087], [6.659509623993161, 46.780145319120493], [6.65950981988836, 46.780145855293718], [6.659509962063895, 46.780146399400543], [6.659510049856878, 46.780146948904118], [6.65951008285798, 46.780147501242432], [6.659510060913328, 46.780148053840229], [6.659509984125236, 46.780148604121003], [6.659509852851734, 46.780149149519104], [6.659509667704866, 46.780149687491708], [6.659509429547875, 46.780150215530398], [6.659509139491151, 46.780150731173315], [6.659508798887083, 46.780151232016294], [6.659508409323717, 46.780151715724124], [6.65950797261738, 46.780152180041554], [6.659507490804195, 46.78015262280374]]] } },
                { "type": "Feature", "properties": { "id": 60, "height": 2.0, "width": 1.0, "passage_ty": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659575739976381, 46.780179854789772], [6.659568365630472, 46.780186169816304], [6.659568569911981, 46.780186282392002], [6.659575944257872, 46.780179967365449], [6.659575739976381, 46.780179854789772], [6.659575299736797, 46.780179636377596], [6.659574623838186, 46.780179336376548], [6.659573919713384, 46.78017906876098], [6.659573190645352, 46.780178834778688], [6.659572440033332, 46.780178635520592], [6.659571671377031, 46.780178471915761], [6.659570888260276, 46.780178344726977], [6.659570094334314, 46.780178254547245], [6.659569293300796, 46.780178201796993], [6.659568488894507, 46.780178186722253], [6.659567684865953, 46.78017820939322], [6.659566884963897, 46.780178269704237], [6.659566092917843, 46.780178367374084], [6.659565312420666, 46.780178501947411], [6.659564547111424, 46.780178672796737], [6.659563800558316, 46.780178879125536], [6.659563076242131, 46.780179119971777], [6.659562377539964, 46.780179394212496], [6.659561707709477, 46.780179700569114], [6.659561069873738, 46.780180037613178], [6.659560467006626, 46.780180403773336], [6.659559901918985, 46.780180797342268], [6.659559377245517, 46.780181216485104]]] } },
                { "type": "Feature", "properties": { "id": 61, "height": 2.0, "width": 1.6, "passage_ty": 3 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.658719825896096, 46.779647048601859], [6.658715729022255, 46.77965055691952], [6.65871552474457, 46.779650444342266], [6.658719621618418, 46.779646936024655], [6.658719825896096, 46.779647048601859], [6.658720155375141, 46.779647264830714], [6.658720465882976, 46.779647493726564], [6.658720752480414, 46.779647736895356], [6.658721013781167, 46.779647993160765], [6.658721248521315, 46.779648261283292], [6.6587214555654, 46.779648539966026], [6.658721633911944, 46.779648827860953], [6.658721782698267, 46.779649123575481], [6.658721901204686, 46.779649425679239], [6.658721988857975, 46.779649732710922], [6.658722045234152, 46.779650043185427], [6.658722070060519, 46.77965035560095], [6.658722063216992, 46.779650668446301], [6.658722024736668, 46.779650980208288], [6.658721954805688, 46.779651289378862], [6.658721853762301, 46.779651594462557], [6.658721722095268, 46.779651893983676], [6.658721560441458, 46.779652186493365], [6.658721369582809, 46.779652470576792], [6.658721150442513, 46.779652744859803], [6.658720904080562, 46.779653008015678], [6.658720631688625, 46.779653258771546], [6.658721266306965, 46.779652751454172], [6.658721949368902, 46.77965227475066], [6.658722677752946, 46.779651830839491], [6.658723448130462, 46.779651421749271], [6.658724256980932, 46.779651049349489], [6.658725100608018, 46.779650715341973], [6.658725975156445, 46.779650421253081], [6.658726876629649, 46.779650168426748], [6.658727800908014, 46.779649958018368], [6.658728743767707, 46.779649790989517], [6.658729700899984, 46.779649668103431], [6.658730667930882, 46.779649589921732], [6.658731640441192, 46.779649556801708], [6.658732613986669, 46.779649568894655], [6.658733584118345, 46.779649626145336], [6.658734546402839, 46.779649728292135], [6.658735496442642, 46.779649874868284], [6.658736429896194, 46.779650065203874], [6.658737342497733, 46.779650298429139], [6.658738230076803, 46.779650573478328], [6.658739088577272, 46.779650889094363], [6.658739914075904, 46.779651243835033], [6.658740675804978, 46.7796516196425], [6.658740880082719, 46.779651732219669], [6.658731866961788, 46.779659450519993], [6.658731662684037, 46.779659337942753], [6.658740675804978, 46.7796516196425]]] } },
                { "type": "Feature", "properties": { "id": 62, "height": 2.0, "width": 1.8, "passage_ty": 2 }, "geometry": { "type": "MultiLineString", "coordinates": [[[6.659660959019773, 46.780125565582935], [6.659651766355003, 46.780120499683406], [6.659651274733133, 46.780120920685498], [6.659660467397917, 46.780125986585091], [6.659660959019773, 46.780125565582935], [6.65966138606505, 46.780125079331434], [6.659661775602995, 46.780124595624976], [6.65966211618273, 46.780124094784881], [6.659662644351669, 46.780123051112817], [6.659662829478403, 46.780122513146871], [6.659662960733447, 46.780121967756344], [6.659663037504843, 46.780121417484146], [6.659663059434673, 46.780120864895643], [6.659663026420687, 46.780120312567298], [6.659662938616816, 46.780119763074133], [6.65966279643242, 46.780119218978172], [6.659662600530412, 46.780118682816074], [6.659662351824142, 46.780118157087557], [6.659662051473166, 46.780117644243774], [6.659661700877805, 46.780117146675749], [6.659661301672636, 46.780116666703321], [6.659660855718882, 46.78011620656418], [6.65966036509571, 46.780115768403704], [6.659659832090553, 46.780115354264709], [6.659659259188442, 46.780114966078109], [6.659658649060413, 46.780114605653552], [6.659659293581196, 46.780114936640963], [6.65965996947947, 46.780115236641571], [6.659660673603861, 46.780115504256592], [6.659661402671417, 46.780115738238322], [6.659662153282888, 46.7801159374958], [6.659662921938571, 46.780116101100027], [6.65966370505464, 46.780116228288207], [6.659664498979843, 46.780116318467286], [6.659665300012533, 46.780116371216849], [6.659666104417926, 46.780116386290928], [6.65966690844551, 46.780116363619271], [6.659667708346536, 46.780116303307551], [6.6596685003915, 46.780116205636965], [6.659669280887506, 46.78011607106297], [6.659670046195536, 46.78011590021292], [6.659670792747358, 46.780115693883424], [6.659671517062208, 46.780115453036508], [6.659672215762996, 46.780115178795114], [6.659672885592051, 46.780114872437856], [6.65967352342632, 46.780114535393139], [6.659674126291926, 46.780114169232419], [6.659674724428323, 46.780113777521784], [6.659675216049944, 46.780113356519564], [6.659666023385917, 46.780108290621158], [6.65966553176427, 46.780108711623321], [6.659674724428323, 46.780113777521784]]] } }
            ]

            passageway_geom.forEach(polygon => {
                const feature = new Feature({
                    geometry: new MultiLineString(polygon.geometry.coordinates[0])
                });
                feature.setId("PASSAGEWAY");
                feature.setStyle(new Style({
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 1)',
                        width: 1,
                    }),
                }));
                feature.getGeometry().transform('EPSG:4326', 'EPSG:2056');
                this.space_source_a.addFeature(feature);
            })
        },

        async displayPassageway_zoneB() {

            const room_geom = [
                { "type": "Feature", "properties": { "id": 1, "name": "Extérieur", "slug": "exterieur" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.657828766105078, 46.778911151613116], [6.657832266680818, 46.778913559454146], [6.657835268922541, 46.778916026928627], [6.657838389108386, 46.778919385762002], [6.657843035677299, 46.778927648793101], [6.657844856535467, 46.778935721547128], [6.657843915919421, 46.778945493592694], [6.657852705203524, 46.778998539352649], [6.657855129280498, 46.779006553267372], [6.657858576272274, 46.779012658072787], [6.657867550313433, 46.779022300122136], [6.657878646235981, 46.779033710895355], [6.658158247764954, 46.779187970405829], [6.658109333834158, 46.779229808018158], [6.658552040485263, 46.779473918341587], [6.658601008755147, 46.779431936979876], [6.65862556211978, 46.779445454839141], [6.658628290098964, 46.779448774982889], [6.658631750249154, 46.77945398026899], [6.658634395465798, 46.779459395878895], [6.658636226400812, 46.779464976837822], [6.658636958674271, 46.779468661150602], [6.658637377325169, 46.779474106503578], [6.658636709177826, 46.779481352585229], [6.658635858427807, 46.779484936107153], [6.658613038931994, 46.779504462870079], [6.658645979355485, 46.779522496505599], [6.658648437551198, 46.779520391451072], [6.658728107640625, 46.779564297646864], [6.658744085786167, 46.779550614878239], [6.658786985088286, 46.779574256632145], [6.658691116067404, 46.779656353287876], [6.658727886956505, 46.779676617670958], [6.658764759675548, 46.779645042039007], [6.659405190287335, 46.779997977925454], [6.659641140539418, 46.780128006035476], [6.65966572676076, 46.780106951519514], [6.658869011804762, 46.779667897679296], [6.658888677225553, 46.779651057308641], [6.658848842050325, 46.779629104282442], [6.658895547350115, 46.779589108435339], [6.658896670905591, 46.779589727622991], [6.65892616897236, 46.779564467061796], [6.658367356614062, 46.779256504411592], [6.658330586147415, 46.779236239911263], [6.658327521943106, 46.779234551202379], [6.658290751506421, 46.779214286689154], [6.657925451935515, 46.779011721777152], [6.657921430415152, 46.779009112424269], [6.657917076779699, 46.779005025477169], [6.657914040327593, 46.779000407800652], [6.657912692715468, 46.77899671926798], [6.657912216023622, 46.778991669331354], [6.657912987430623, 46.778987239661092], [6.657914797884103, 46.778981593671922], [6.657917339614786, 46.778976087629189], [6.65792059900676, 46.778970757422904], [6.657924549089632, 46.778965656843461], [6.657828766105078, 46.778911151613116]]]] } },
                { "type": "Feature", "properties": { "id": 2, "name": "Jardin", "slug": "jardin" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658715193696257, 46.779579669120103], [6.658751964542067, 46.779599933495646], [6.658781462674017, 46.779574672978974], [6.658744691834374, 46.779554408612874], [6.658715193696257, 46.779579669120103]]]] } },
                { "type": "Feature", "properties": { "id": 3, "name": "Vide", "slug": "vide" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658749506363145, 46.779602038538386], [6.658709671291103, 46.779580085469114], [6.658725649446, 46.77956640270309], [6.658688878622783, 46.779546138313357], [6.658643402289801, 46.779585081562928], [6.658720008201209, 46.779627299046716], [6.658749506363145, 46.779602038538386]]]] } },
                { "type": "Feature", "properties": { "id": 4, "name": "Toit", "slug": "toit" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658640338066065, 46.779583392868119], [6.658542010623572, 46.77966759443175], [6.659301946933251, 46.780086390245714], [6.659405190287322, 46.779997977925454], [6.658764759675548, 46.779645042039007], [6.658727886956505, 46.779676617670958], [6.658691116067404, 46.779656353287876], [6.658723072440164, 46.779628987744971], [6.658640338066065, 46.779583392868119]]]] } },
                { "type": "Feature", "properties": { "id": 5, "name": "Toit", "slug": "toit" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.65954096162154, 46.78021810724389], [6.659644204835744, 46.780129694708876], [6.659405190287335, 46.779997977925454], [6.659301946933251, 46.780086390245714], [6.65954096162154, 46.78021810724389]]]] } },
                { "type": "Feature", "properties": { "id": 6, "name": "Dégagement", "slug": "degagement" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.659466546804661, 46.779997188583401], [6.659468924169897, 46.779995152721767], [6.659467494171052, 46.779994364671957], [6.659476833859142, 46.779986366608952], [6.65944292247213, 46.779967678568276], [6.659433582782338, 46.779975676628439], [6.659432152771996, 46.779974888571275], [6.659429776554083, 46.77997692346689], [6.659466546804661, 46.779997188583401]]]] } },
                { "type": "Feature", "properties": { "id": 7, "name": "Saut de loup", "slug": "saut de loup" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658122033782703, 46.779060758636682], [6.658132349862567, 46.779066443963714], [6.658144640745395, 46.779055918822429], [6.658134324666249, 46.779050233496463], [6.658122033782703, 46.779060758636682]]]] } },
                { "type": "Feature", "properties": { "id": 8, "name": "Saut de loup", "slug": "saut de loup" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658217286344073, 46.77898005271242], [6.658199259764852, 46.778995489593726], [6.658208963013133, 46.779000837177058], [6.658226989591363, 46.778985400294189], [6.658217286344073, 46.77898005271242]]]] } },
                { "type": "Feature", "properties": { "id": 9, "name": "Saut de loup", "slug": "saut de loup" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658270453638454, 46.778929779375289], [6.658283527496554, 46.778936984539499], [6.658313005067465, 46.778911712889347], [6.658299951629234, 46.778904518980966], [6.658270453638454, 46.778929779375289]]]] } },
                { "type": "Feature", "properties": { "id": 10, "name": "B68a", "slug": "b68a" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658315272574914, 46.778912962539906], [6.658255211347778, 46.778964395523388], [6.658369812049799, 46.779027553249016], [6.658429873237919, 46.77897612020562], [6.658315272574914, 46.778912962539906]]]] } },
                { "type": "Feature", "properties": { "id": 11, "name": "B68", "slug": "b68" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658251687971698, 46.778967412736179], [6.658220878892774, 46.778993795763341], [6.658257649162859, 46.779014060305251], [6.658258632423216, 46.77901321829934], [6.658261696622979, 46.779014907015778], [6.658260713362651, 46.779015749021688], [6.658297483632059, 46.779036013533862], [6.658298466892195, 46.779035171527589], [6.658301531104676, 46.779036860248581], [6.658300547836359, 46.77903770226181], [6.658337318156195, 46.779057966772342], [6.658338301434498, 46.779057124764392], [6.658339527077504, 46.779057800263281], [6.658369025114199, 46.779032539844465], [6.658367799446812, 46.779031864366971], [6.658368127202531, 46.779031583695705], [6.65833135687891, 46.779011319189387], [6.658331029123136, 46.779011599860574], [6.658327964911165, 46.779009911140385], [6.658328292666957, 46.779009630469211], [6.658291522403956, 46.778989365966957], [6.65829119464811, 46.778989646638024], [6.658288145169515, 46.778987945316437], [6.658288458204713, 46.778987677251344], [6.658251687971698, 46.778967412736179]]]] } },
                { "type": "Feature", "properties": { "id": 12, "name": "Dégagement", "slug": "degagement" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658220387258396, 46.778994216769618], [6.658189905917517, 46.779020319193364], [6.658307570856929, 46.779085165693658], [6.658337068915405, 46.779059905290211], [6.658335843247796, 46.779059229812376], [6.658336826532327, 46.779058387784779], [6.658300056202204, 46.779038123268457], [6.658299072917474, 46.779038965295761], [6.658296023433839, 46.779037263961762], [6.658296991997895, 46.779036434540458], [6.65826022169774, 46.779016170011268], [6.65825923843522, 46.779017012062099], [6.658256174235403, 46.779015323345604], [6.658257157528586, 46.779014481311705], [6.658220387258396, 46.778994216769618]]]] } },
                { "type": "Feature", "properties": { "id": 13, "name": "B63", "slug": "b63" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658187693560543, 46.779022213721049], [6.658094036972484, 46.779102415353158], [6.658130807238368, 46.779122679918771], [6.6582242179895, 46.779042688759837], [6.658187693560543, 46.779022213721049]]]] } },
                { "type": "Feature", "properties": { "id": 14, "name": "B61", "slug": "b61" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658227181197362, 46.779043745192254], [6.658133360751918, 46.779124087191853], [6.658290145475609, 46.779210492953311], [6.65838396583769, 46.779130150825722], [6.658227181197362, 46.779043745192254]]]] } },
                { "type": "Feature", "properties": { "id": 15, "name": "B66b", "slug": "b66b" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658434367387457, 46.778978596974689], [6.658404869419147, 46.779003857403502], [6.658405277978278, 46.779004082564477], [6.658402819796625, 46.779006187613881], [6.65840241123747, 46.779005962452949], [6.658372913255593, 46.779031222859416], [6.658373321814797, 46.77903144802044], [6.658370863630633, 46.779033553069162], [6.658369637952997, 46.779032877586033], [6.658340139940989, 46.779058137983952], [6.658341365618833, 46.779058813467401], [6.658340382334363, 46.779059655495011], [6.658377152717068, 46.779079919978848], [6.658378135978629, 46.779079077970316], [6.658381200165475, 46.779080766672294], [6.658380216905799, 46.779081608679185], [6.658416987285575, 46.779101873163931], [6.658417970545035, 46.779101031156692], [6.658419196190035, 46.779101706654707], [6.658448694213399, 46.779076446215456], [6.658447468544032, 46.779075770738785], [6.658449926727115, 46.779073665688401], [6.658451152396477, 46.779074341165057], [6.658480650365296, 46.779049080738496], [6.658479424696135, 46.779048405262195], [6.658481882876721, 46.779046300211114], [6.658483108545863, 46.779046975687386], [6.658512606501081, 46.779021715238478], [6.658434367387457, 46.778978596974689]]]] } },
                { "type": "Feature", "properties": { "id": 16, "name": "Dégagement", "slug": "degagement" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658307958764603, 46.779199551450475], [6.658290751506421, 46.779214286689154], [6.658327521943106, 46.779234551202379], [6.65832998011355, 46.779232446175676], [6.658333044317808, 46.779234134884504], [6.658330586147415, 46.779236239911263], [6.658367356614062, 46.779256504411592], [6.658369814783951, 46.779254399384044], [6.658371040466639, 46.779255074867152], [6.658385789547341, 46.779242444644417], [6.658307958764603, 46.779199551450475]]]] } },
                { "type": "Feature", "properties": { "id": 17, "name": "B59a", "slug": "b59a" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.6583720630043, 46.779255061769597], [6.658411284856526, 46.779276677216266], [6.658504285763051, 46.779197036668819], [6.658503060090344, 46.779196361192795], [6.658504043350193, 46.779195519184839], [6.658467272873741, 46.779175254728393], [6.658387628071268, 46.779243457868851], [6.658386402372267, 46.779242782399912], [6.6583720630043, 46.779255061769597]]]] } },
                { "type": "Feature", "properties": { "id": 18, "name": "B59", "slug": "b59" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.65850612428776, 46.779198049891356], [6.658504898604761, 46.779197374409748], [6.658411897698383, 46.779277014957593], [6.658490954361514, 46.779320583562026], [6.658583955226168, 46.779240942950182], [6.658582729541138, 46.779240267469326], [6.658583712808722, 46.779239425453639], [6.658546942272332, 46.779219161023001], [6.658545959004529, 46.779220003038382], [6.6585428947944, 46.779218314335225], [6.658543878062218, 46.779217472319885], [6.65850710755579, 46.779197207876358], [6.65850612428776, 46.779198049891356]]]] } },
                { "type": "Feature", "properties": { "id": 19, "name": "B57", "slug": "b57" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658491567204366, 46.779320921302954], [6.658729963645557, 46.779452302258591], [6.658822964384282, 46.77937266145328], [6.658821738693203, 46.779371985975011], [6.658822721959455, 46.779371143957292], [6.658785951263696, 46.779350879615251], [6.658784967997208, 46.779351721632629], [6.658781903761862, 46.77935003293036], [6.658782928005968, 46.779349155821869], [6.658746157340113, 46.779328891466974], [6.658745133095816, 46.779329768575053], [6.658742068852781, 46.779328079866069], [6.658743093097119, 46.779327202757983], [6.658706322430626, 46.779306938373239], [6.658705298186063, 46.77930781548104], [6.658702233976158, 46.779306126787823], [6.658703258220741, 46.779305249680093], [6.658666487584211, 46.779284985282494], [6.658665463339413, 46.779285862389877], [6.658662399132014, 46.779284173695622], [6.65866342337682, 46.77928329658824], [6.6586266527805, 46.779263032183358], [6.658625628535471, 46.779263909290442], [6.658622564320321, 46.779262220589459], [6.658623588565367, 46.77926134348241], [6.658586817999011, 46.779241079064668], [6.658585793753765, 46.779241956171354], [6.658584568068683, 46.77924128069057], [6.658491567204366, 46.779320921302954]]]] } },
                { "type": "Feature", "properties": { "id": 20, "name": "B66a", "slug": "b66a" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.65851321932428, 46.779022052993305], [6.65848372136097, 46.779047313449439], [6.658484947075159, 46.779047988915899], [6.658484045740122, 46.779048760769882], [6.658520816146753, 46.779069025226832], [6.658521717471377, 46.779068253366972], [6.6585247816723, 46.77906994207067], [6.658523880337481, 46.779070713924945], [6.658560650774072, 46.779090978369062], [6.658561543893576, 46.779090213535099], [6.658564616291714, 46.779091895205895], [6.658563714957102, 46.779092667060461], [6.658600485423648, 46.779112931491667], [6.65860138675809, 46.779112159636796], [6.658604450953814, 46.779113848332742], [6.658603549619389, 46.779114620187606], [6.658640320115907, 46.779134884605938], [6.658641221450145, 46.779134112750732], [6.658641630011251, 46.779134337910811], [6.65867112794, 46.77910907742119], [6.65851321932428, 46.779022052993305]]]] } },
                { "type": "Feature", "properties": { "id": 21, "name": "B66", "slug": "b66" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658482488894605, 46.779050093967044], [6.658481263204989, 46.779049418479453], [6.658451765236263, 46.77907467890617], [6.658452990926107, 46.779075354394031], [6.658450532743054, 46.779077459444508], [6.658449307053205, 46.779076783956604], [6.658419809029951, 46.779102044395984], [6.658421034744572, 46.779102719863161], [6.658420051460552, 46.779103561891496], [6.658456821870288, 46.779123826363303], [6.658457805154108, 46.77912298433467], [6.658460869356155, 46.77912467304013], [6.658459886088743, 46.779125515054758], [6.658496656528439, 46.779145779513698], [6.658497639795663, 46.779144937498721], [6.658500703989982, 46.779146626197473], [6.658499699666602, 46.779147456596668], [6.658536449953493, 46.77916776798763], [6.658537474469678, 46.779166890648803], [6.658540538666495, 46.779168579346454], [6.658539555383141, 46.77916942137584], [6.658576337194626, 46.779189676136518], [6.658609265329395, 46.779161478272364], [6.658609673890576, 46.779161703432578], [6.658639171849284, 46.779136442951277], [6.65863876327178, 46.779136217805231], [6.658639664606063, 46.779135445950075], [6.658602894109376, 46.779115181531537], [6.658601992774907, 46.779115953386416], [6.658598928579168, 46.779114264690399], [6.658599829913642, 46.779113492835521], [6.658563059446942, 46.779093228404122], [6.658562158112287, 46.779094000258716], [6.658559093919017, 46.779092311561641], [6.658559995253706, 46.779091539707075], [6.658523224827178, 46.7790712752684], [6.658522323492313, 46.779072047122668], [6.658519259291348, 46.779070358418863], [6.65852016062624, 46.779069586564638], [6.658483390229685, 46.779049322113082], [6.658482488894605, 46.779050093967044]]]] } },
                { "type": "Feature", "properties": { "id": 22, "name": "B64c", "slug": "b64c" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658673375015581, 46.779110315795336], [6.658643877087222, 46.779135576285555], [6.658644285648367, 46.779135801445598], [6.658641827470033, 46.779137906500168], [6.658641418925285, 46.779137681326056], [6.658611920966952, 46.779162941807918], [6.658612329528161, 46.77916316696809], [6.65860987134734, 46.779165272021935], [6.658607624270914, 46.779164033646552], [6.65859305502853, 46.779176509957217], [6.658595286244618, 46.779177761929354], [6.658583077345542, 46.779188216954125], [6.658621073556136, 46.779209156851991], [6.658647867555204, 46.779186211912595], [6.658646641870617, 46.77918553643245], [6.658649100050926, 46.779183431377845], [6.658650325725282, 46.77918410685232], [6.658679823660808, 46.779158846374649], [6.65867859798665, 46.779158170900438], [6.65868105616446, 46.779156065845143], [6.658681464725919, 46.779156291005059], [6.658710962647989, 46.779131030505205], [6.658673375015581, 46.779110315795336]]]] } },
                { "type": "Feature", "properties": { "id": 23, "name": "Armoire technique", "slug": "armoire technique" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658614993850732, 46.779212206818301], [6.658618435275419, 46.779209259769409], [6.658582277588474, 46.779189333090308], [6.658578836163083, 46.779192280138084], [6.658614993850732, 46.779212206818301]]]] } },
                { "type": "Feature", "properties": { "id": 24, "name": "B64", "slug": "b64" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658682645462196, 46.779159017583432], [6.658681662197624, 46.779159859599943], [6.658680436503004, 46.779159184114526], [6.658650938567568, 46.779184444592374], [6.658652164262413, 46.779185120078111], [6.658649706082147, 46.779187225132802], [6.658648480397515, 46.779186549652664], [6.658618982432123, 46.779211810122163], [6.658620208116962, 46.779212485602613], [6.658619224834046, 46.77921332763264], [6.658655995393642, 46.779233592040057], [6.658656978676347, 46.779232750009669], [6.658657387238285, 46.779232975169698], [6.658686885197255, 46.779207714690372], [6.658686476635395, 46.779207489530442], [6.658688934815149, 46.779205384474942], [6.658689343377001, 46.779205609634836], [6.658718841322386, 46.779180349133107], [6.658718432744216, 46.779180123987359], [6.6587194160086, 46.779179281970507], [6.658682645462196, 46.779159017583432]]]] } },
                { "type": "Feature", "properties": { "id": 25, "name": "B64b", "slug": "b64b" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658719907640764, 46.779178860962062], [6.658720890921471, 46.779178018931184], [6.65872129948325, 46.779178244090964], [6.658750797398659, 46.779152983580886], [6.658713209725414, 46.77913226887857], [6.658683711803701, 46.779157529379013], [6.658684120375392, 46.779157754544556], [6.658683137094474, 46.779158596575151], [6.658719907640764, 46.779178860962062]]]] } },
                { "type": "Feature", "properties": { "id": 26, "name": "Dégagement", "slug": "degagement" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658308183695963, 46.779085503435567], [6.658386014314083, 46.779128396629922], [6.658386301100781, 46.779128151042514], [6.658469392051183, 46.779173943121691], [6.658468121988252, 46.779175030731039], [6.658504534984189, 46.77919509817734], [6.65850554497487, 46.779194233278552], [6.658508582457769, 46.779195944853804], [6.65850759918979, 46.779196786868859], [6.658544369706316, 46.779217051317858], [6.658545352974097, 46.779216209302518], [6.658548417173965, 46.779217897999935], [6.65854743390621, 46.779218740015331], [6.658584204442516, 46.779239004445813], [6.658585187710056, 46.779238162430119], [6.658588251922634, 46.779239851132125], [6.658587227693821, 46.779240728224806], [6.658623998260097, 46.779260992642421], [6.658625022488695, 46.779260115549377], [6.658628086703791, 46.779261804250318], [6.658627062475211, 46.779262681343326], [6.658663833071453, 46.779282945748086], [6.658664857299821, 46.779282068654716], [6.65866792150719, 46.779283757348921], [6.65866689727884, 46.779284634442348], [6.658703667915268, 46.779304898839783], [6.658704692143404, 46.77930402174605], [6.658707756353283, 46.77930571043921], [6.658706732125153, 46.779306587532936], [6.658743502791554, 46.779326851917567], [6.658744527019472, 46.77932597482345], [6.658747591262482, 46.779327663532406], [6.658746567034595, 46.779328540626501], [6.65878333770033, 46.779348804981304], [6.658784361927999, 46.779347927886867], [6.658787426163295, 46.779349616589116], [6.658786442876448, 46.779350458595289], [6.658823213592577, 46.779370722948443], [6.658824196858783, 46.779369880930702], [6.658827261106789, 46.779371569637497], [6.658826277848793, 46.779372411648239], [6.658863048605106, 46.77939267599416], [6.658864031862917, 46.779391833983063], [6.658867096082769, 46.77939352267191], [6.658866112827011, 46.779394364695634], [6.658902883603088, 46.77941462902303], [6.658903866868857, 46.779413787004614], [6.658906931091207, 46.779415475692367], [6.658905947833652, 46.779416317703799], [6.658942718639708, 46.779436582018313], [6.658943701897055, 46.779435740006562], [6.658946766132127, 46.779437428698891], [6.658945782866604, 46.779438270717669], [6.65898255370263, 46.779458535019252], [6.658983536967949, 46.779457693000168], [6.658986601205524, 46.77945938169141], [6.658985617940205, 46.779460223710522], [6.659022388806205, 46.779480487999244], [6.659023372071315, 46.779479645979826], [6.659026436301153, 46.779481334664339], [6.659025453036066, 46.779482176683814], [6.659062223942265, 46.779502440965281], [6.659063207207139, 46.779501598945473], [6.659064432893919, 46.77950227441552], [6.659093930825861, 46.779477013817782], [6.659052870010104, 46.779454385392611], [6.659053853274265, 46.779453543372902], [6.659017082414822, 46.779433279094256], [6.659016099150472, 46.779434121113624], [6.659013034913412, 46.779432432423199], [6.659014018177782, 46.779431590403831], [6.658977247348313, 46.779411326112289], [6.658976264083742, 46.77941216813133], [6.658973199849188, 46.779410479439839], [6.658974183138365, 46.779409637399759], [6.658937412328642, 46.779389373089693], [6.65893642904948, 46.779390215135052], [6.658933364827636, 46.779388526448081], [6.658934348092446, 46.779387684429409], [6.658897598229415, 46.779367431633652], [6.658896594047696, 46.779368262124855], [6.658893529828357, 46.77936657343681], [6.65889451309339, 46.779365731418409], [6.658857742353856, 46.779345467088255], [6.658856759078378, 46.779346309100639], [6.658853694830901, 46.779344620394617], [6.658854678120742, 46.779343778355582], [6.658817907431588, 46.779323514023751], [6.658816924141542, 46.77932435606251], [6.658813859906763, 46.779322667361022], [6.65881484317224, 46.779321825343381], [6.65877807251307, 46.779301560998633], [6.65877708924739, 46.779302403016011], [6.658774025004899, 46.779300714307837], [6.658775008270594, 46.779299872290501], [6.658738237610753, 46.77927960791601], [6.65873725434485, 46.779280449933005], [6.658734190135484, 46.779278761240647], [6.658735173401421, 46.779277919223702], [6.658698402781753, 46.779257654841942], [6.658697419505415, 46.779258496852968], [6.65869435529856, 46.779256808159566], [6.658695344530515, 46.7792559694307], [6.658658567975023, 46.779235701748256], [6.658657584708678, 46.779236543764576], [6.658654520494095, 46.779234855064473], [6.658655503760458, 46.779234013048182], [6.658618733200767, 46.779213748640622], [6.658617749934185, 46.779214590656629], [6.658614685722114, 46.779212901955418], [6.65861530027193, 46.779212375688431], [6.658614993850732, 46.779212206818301], [6.658578836163083, 46.779192280138084], [6.658578529742115, 46.779192111267854], [6.658577915192177, 46.77919263753467], [6.658574850992801, 46.779190948838036], [6.658575834259621, 46.779190106822412], [6.658539063749653, 46.779169842383475], [6.658538080482622, 46.77917068439875], [6.658535016285761, 46.779168995701056], [6.658535999577377, 46.779168153664756], [6.658499229097376, 46.779147889212901], [6.658498245805555, 46.779148731248938], [6.65849518161118, 46.779147042550122], [6.658496164894819, 46.779146200521147], [6.658459394455009, 46.779125936062051], [6.658458411171159, 46.779126778090699], [6.658455346969083, 46.779125089385225], [6.658456330236556, 46.779124247370625], [6.658419559826725, 46.779103982898654], [6.658418576559033, 46.779104824912913], [6.658415512359443, 46.779103136206331], [6.658416495661943, 46.779102294176688], [6.658379725271868, 46.779082029686158], [6.658378741979368, 46.779082871721187], [6.658375677792493, 46.779081183019159], [6.65837666097245, 46.779080341080572], [6.658339890700318, 46.779060076501843], [6.658338907432185, 46.779060918515427], [6.658337681754323, 46.779060243031964], [6.658308183695963, 46.779085503435567]]]] } },
                { "type": "Feature", "properties": { "id": 27, "name": "B56", "slug": "b56" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658895004725887, 46.779365310409283], [6.658895988007279, 46.779364468376883], [6.658897213688853, 46.779365143848736], [6.658926711607728, 46.779339883307777], [6.658925485926358, 46.779339207836301], [6.658927944102794, 46.779337102775699], [6.658929169759553, 46.779337778268236], [6.658958667673036, 46.779312517697925], [6.658957441991877, 46.779311842226733], [6.658958425254935, 46.779311000207848], [6.65892165452871, 46.77929073589808], [6.658920671265453, 46.779291577916645], [6.658919445534189, 46.779290902416946], [6.658889947638706, 46.779316162956121], [6.65889117336, 46.779316838450548], [6.658888715183051, 46.779318943510326], [6.65888748946179, 46.779318268015913], [6.658857991536346, 46.779343528546775], [6.658859217257824, 46.779344204041529], [6.658858233976246, 46.779345046073608], [6.658895004725887, 46.779365310409283]]]] } },
                { "type": "Feature", "properties": { "id": 28, "name": "B56a", "slug": "b56a" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658922720835586, 46.779289247674548], [6.658923129429679, 46.779289472850515], [6.658922146160312, 46.779290314888748], [6.658958916886446, 46.779310579198373], [6.658959900165827, 46.779309737165441], [6.65896296438402, 46.779311425851695], [6.658961981129225, 46.779312267863624], [6.65899875189555, 46.779332532165967], [6.658999735150122, 46.779331690153739], [6.659000143714226, 46.779331915312532], [6.659029641583023, 46.779306654730846], [6.658952218717309, 46.779263987112792], [6.658922720835586, 46.779289247674548]]]] } },
                { "type": "Feature", "properties": { "id": 29, "name": "B54", "slug": "b54" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658998502658897, 46.779334470686599], [6.65899727697675, 46.779333795215841], [6.658998260264149, 46.779332953175597], [6.658961489497734, 46.779312688873084], [6.658960506210118, 46.779313530913065], [6.658959280518714, 46.779312855436288], [6.658929782629902, 46.779338115985709], [6.658931008321525, 46.779338791462791], [6.658928550145143, 46.779340896523465], [6.658927324453528, 46.779340221046368], [6.658897826510175, 46.779365481608508], [6.658899052226576, 46.779366157064871], [6.658898068945219, 46.779366999097284], [6.658934839724846, 46.779387263420091], [6.658935823006003, 46.779386421387358], [6.658937048688577, 46.779387096858748], [6.658966546600803, 46.779361836307572], [6.658965320918423, 46.779361160836515], [6.658967779094306, 46.779359055775032], [6.658969004752074, 46.779359731267171], [6.658998502658897, 46.779334470686599]]]] } },
                { "type": "Feature", "properties": { "id": 30, "name": "B58", "slug": "b58" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658872548930264, 46.779220081094294], [6.658843051035221, 46.779245341635658], [6.65884345962866, 46.779245566811909], [6.658841001453101, 46.779247671870678], [6.658839775734059, 46.779246996375733], [6.65881027782528, 46.779272256894487], [6.658811503544527, 46.779272932389752], [6.65880904536648, 46.779275037447867], [6.658807819647218, 46.779274361952567], [6.658778321683885, 46.779299622484039], [6.658779547427936, 46.779300297958557], [6.658778564125478, 46.779301139978692], [6.658815334804972, 46.779321404334539], [6.658816318086795, 46.779320562302829], [6.658819382321544, 46.779322251004224], [6.658818399033665, 46.779323092998006], [6.658855169753351, 46.779343357346562], [6.658856153010378, 46.779342515335586], [6.658857378666362, 46.779343190828868], [6.658886876616488, 46.779317930277152], [6.658885650936117, 46.779317254805193], [6.658888109113096, 46.77931514974545], [6.658889334793448, 46.779315825217374], [6.658918832689011, 46.779290564678298], [6.658917607008864, 46.77928988920673], [6.658920065183345, 46.779287784146298], [6.658920473746782, 46.779288009305368], [6.6589499716289, 46.779262748744138], [6.658872548930264, 46.779220081094294]]]] } },
                { "type": "Feature", "properties": { "id": 31, "name": "B60a", "slug": "b60a" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658832714080349, 46.779198128061331], [6.658803216178632, 46.779223388592435], [6.658803624741093, 46.779223613751924], [6.658802641471071, 46.779224455789183], [6.658839412107262, 46.77924472013742], [6.658840395387321, 46.779243878105511], [6.658840803950093, 46.779244103264865], [6.658870301845523, 46.779218842724099], [6.658832714080349, 46.779198128061331]]]] } },
                { "type": "Feature", "properties": { "id": 32, "name": "B62a", "slug": "b62a" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658830466997439, 46.779196889690326], [6.658792879262891, 46.779176175014392], [6.658763381354529, 46.779201435535263], [6.658800963690285, 46.779222147242123], [6.658830466997439, 46.779196889690326]]]] } },
                { "type": "Feature", "properties": { "id": 33, "name": "B60", "slug": "b60" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658762314995932, 46.779202923741792], [6.658761331756374, 46.779203765737932], [6.658760923194239, 46.779203540578301], [6.65873142525589, 46.779228801090802], [6.658731833818104, 46.779229026250604], [6.658729375638937, 46.779231131306993], [6.658728967076729, 46.779230906147227], [6.658699469124794, 46.779256166637381], [6.658699877687071, 46.779256391797261], [6.658698894404599, 46.779257233827941], [6.658735665034365, 46.77927749821518], [6.658736648316643, 46.779276656184173], [6.658739712525949, 46.779278344876438], [6.658738729253918, 46.779279186913122], [6.658775499903438, 46.77929945128183], [6.658776483160898, 46.779298609271549], [6.658777708839473, 46.779299284744646], [6.658807206802915, 46.779274024213358], [6.658805981124543, 46.779273348740574], [6.658808439278046, 46.779271243703548], [6.658809664956399, 46.779271919176338], [6.658839162889866, 46.779246658636723], [6.658837937211718, 46.779245983164252], [6.658838920475431, 46.779245141146355], [6.658802149839119, 46.77922487679794], [6.658801166564992, 46.779225718809876], [6.658798102356733, 46.779224030119238], [6.65879908561248, 46.779223188108737], [6.658762314995932, 46.779202923741792]]]] } },
                { "type": "Feature", "properties": { "id": 34, "name": "B62", "slug": "b62" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[6.658753044477915, 46.779154221953455], [6.658723546562877, 46.779179482464109], [6.65872395513489, 46.779179707629496], [6.658721496957675, 46.779181812685778], [6.658721088385665, 46.779181587520341], [6.658691590457037, 46.779206848008627], [6.658691999029123, 46.779207073174149], [6.658689540849412, 46.779209178229721], [6.658689132293701, 46.77920895305013], [6.658659634318714, 46.779234213544072], [6.658660042890887, 46.779234438709715], [6.658659059608193, 46.779235280740096], [6.65869583019776, 46.779255545134575], [6.658696813480256, 46.779254703103909], [6.658697222042517, 46.779254928263775], [6.658726719994825, 46.779229667774189], [6.658726311432635, 46.77922944261443], [6.658728769611851, 46.779227337558098], [6.65872917817402, 46.779227562717864], [6.658758676112743, 46.779202302205903], [6.658758267534238, 46.779202077060269], [6.658760725710952, 46.779199972003255], [6.658761134273051, 46.779200197162865], [6.658790632181802, 46.779174936642569], [6.658753044477915, 46.779154221953455]]]] } }
            ];
            zone_geom.forEach(polygon => {
                const feature = new Feature({
                    geometry: new Polygon(polygon.geometry.coordinates[0]),
                    label: polygon.properties.name,
                });
                feature.setId(polygon.properties.slug);
                if (polygon.properties.name == 'Vide') {
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
                else if (polygon.properties.name == 'Dégagement') {
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
                            text: polygon.properties.name,
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
                this.space_source_b.addFeature(feature);
            });
        },

        setExtentMap(source) {
            const extent = source.getExtent();
            const bufferExtend = buffer(extent, 15);
            this.map.getView().fit(bufferExtend, this.map.getSize());
        },

        calculateCentroid(coordinates) {
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
