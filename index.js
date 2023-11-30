// Agregar mapa
var map = L.map('map',
{
    zoom: 10
}).setView([3.350273, -76.535895], 14.4);

//Agregar mapa base
var mapabase = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

var mapabase2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        maxZoom: 20,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
mapabase.addTo(map);

//Creación de la leyenda
var leyenda_map = {
    "Mapa Base Open Street Map": mapabase,
    "Mapa Esri World Imagery Satélite": mapabase2 
}
var leyenda = L.control.layers(leyenda_map).addTo(map);

//Agregar boton reiniciar
L.easyButton('<img src="iconos/restart.png"  align="absmiddle" height="16px" >', function() 
    {
    alert('¿Está seguro de reiniciar la página?');
    location.reload();

    }).addTo(map);

//Agregar Escala
L.control.scale({position:'bottomleft'}).addTo(map);

//Escala grafica
L.control.betterscale({position:'bottomleft'}).addTo(map);

//Agregar servicios WMS Comunas
var comunas = L.tileLayer.wms('http://ws-idesc.cali.gov.co:8081/geoserver/wms?service=WMS&version=1.1.0',
    {
    layers: 'idesc:mc_comunas',
    format: 'image/svg',
    transparent: true
    });
    map.addLayer(comunas);

//Controlador de la capa comunas
leyenda.addOverlay(comunas, 'Comunas')

//gps
L.control.locate({setView:'true',flyto:'true',drawCircle:'false',showCompass:'true',drawMarker:'false',keepCurrentZoomLevel:'true',locateOptions: {
    enableHighAccuracy: true}}).addTo(map);

//Añadir minimapa
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data &copy; OpenStreetMap contributors';

var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 8, attribution: osmAttrib });
    var miniMap2 = new L.Control.MiniMap(osm2, { toggleDisplay: true }).addTo(map);

//Geocodificador
new L.Control.GeoSearch({provider: new L.GeoSearch.Provider.Esri()}).addTo(map);

//cargar capa geojson
// Variable para almacenar la solicitud AJAX
var centros_educativos = $.getJSON('centros_educativos.geojson');

var geojsonLayer; //Variable para almacenar la capa GeoJSON

//Procesar el resultado cuando la solicitud se complete
centros_educativos.done(function(data) {
    // Agregar la capa GeoJSON al mapa y personalizar los íconos para todos los elementos
    geojsonLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            var customIcon = L.icon({
                iconUrl: 'iconos/uni1.png', // Ruta de la imagen para el ícono personalizado
                iconSize: [32, 32], // Tamaño del ícono
                iconAnchor: [16, 32], // Punto de anclaje del ícono
                popupAnchor: [0, -32] // Punto donde se muestra el popup
            });
            var marker = L.marker(latlng, { icon: customIcon });

            // Vincular un popup al marcador con el nombre del lugar
            marker.bindPopup(feature.properties.Nombre);

            return marker;
        }
    }).addTo(map); // Agrega la capa GeoJSON al mapa

    leyenda.addOverlay(geojsonLayer, 'Centros Educativos'); // Agrega la capa GeoJSON a la leyenda
});

// Función para generar el mapa de calor
function generarMapaCalor() {
    // Obtener las coordenadas de los puntos GeoJSON y almacenarlas en un array
    var puntosCalor = [];
    geojsonLayer.eachLayer(function(layer) {
        puntosCalor.push(layer.getLatLng());
    });
    // Crear una capa de mapa de calor (heatmap) con las coordenadas
    var heat = L.heatLayer(puntosCalor, {
        radius: 20,
        blur: 15,
        maxZoom: 10
    });

    // Agregar la capa de mapa de calor al mapa
    map.addLayer(heat);
}

// Crear un botón para generar el mapa de calor
L.easyButton('<img src="iconos/heatmap.png"  align="absmiddle" height="16px" >', function() {
    generarMapaCalor();
}).addTo(map);

// Variable para mantener el estado de la lupa MagnifyingGlass
var lupaActiva = false;
var magnifyingGlass;

// Función para alternar la lupa MagnifyingGlass
function alternarLupa() {
    if (!lupaActiva) {
        magnifyingGlass = L.magnifyingGlass({
            layers: [mapabase2],
            radius: 120
        });

        map.addLayer(magnifyingGlass);
    } else {
        map.removeLayer(magnifyingGlass);
    }
    lupaActiva = !lupaActiva;
}

// Crear el botón para alternar la lupa MagnifyingGlass
L.easyButton('<img src="iconos/satel.png"  align="absmiddle" height="16px" >', function() {
    alternarLupa();
}).addTo(map);

/*
// Crear ventana
var win =  L.control.window(map,{title:'Actividad 2-2',content:'A'}).show()
*/
L.latlngGraticule({
    showLabel: true,
    opacity:0.5,
    color: 'black',
    zoomInterval: [
        {start: 12, end: 20, interval: 0.01}],
        latlngFormat: {
            decimal: 0,
            suffix: '°'
        }
}).addTo(map);