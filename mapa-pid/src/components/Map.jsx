// src/components/Map.jsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const DATA_MUNICIPIOS = 'https://api.maptiler.com/data/019e0f97-410a-7425-96f0-12a3e6d892af/features.json?key=j8UzJW3QV4tjV8YFy0i7';
const DATA_ESTADOS    = 'https://api.maptiler.com/data/019e0fbb-aeeb-7506-9d9d-90eabc379d25/features.json?key=2iSGf08Ld0l2ytr6rvRV';
const DATA_REGIOES    = 'https://api.maptiler.com/data/019e0fbf-d956-78fe-8eff-223f45be72a3/features.json?key=LMVMEPHIf7vzxWZQP1md';
const DATA_PAIS       = 'https://api.maptiler.com/data/019e0fc0-986d-74ac-8a66-ba3a3bef381f/features.json?key=OM8hPVpAd6P8jEpCnFmc';
const SATELLITE_URL   = 'https://api.maptiler.com/tiles/satellite/tiles.json?key=j8UzJW3QV4tjV8YFy0i7';
const MAP_STYLE       = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// Bounding boxes [SW, NE] de todos os estados brasileiros
const STATE_BOUNDS = {
  // Norte
  'Acre':                [[-73.9, -11.1], [-66.6,  -7.1]],
  'Amazonas':            [[-73.8,  -9.8], [-56.1,   2.2]],
  'Roraima':             [[-64.8,   1.2], [-58.9,   5.3]],
  'Rondônia':            [[-66.8, -13.7], [-59.8,  -7.9]],
  'Pará':                [[-58.5, -10.0], [-46.0,   2.6]],
  'Amapá':               [[-52.0,  -1.2], [-49.9,   4.4]],
  'Tocantins':           [[-50.7, -13.5], [-45.7,  -5.2]],
  // Nordeste
  'Maranhão':            [[-48.8, -10.3], [-41.8,  -1.0]],
  'Piauí':               [[-45.9, -11.1], [-40.4,  -2.7]],
  'Ceará':               [[-41.5,  -7.9], [-37.2,  -2.8]],
  'Rio Grande do Norte': [[-38.6,  -6.9], [-35.0,  -4.8]],
  'Paraíba':             [[-38.8,  -8.3], [-34.8,  -6.0]],
  'Pernambuco':          [[-41.4,  -9.5], [-34.8,  -7.1]],
  'Alagoas':             [[-38.3, -10.5], [-35.1,  -8.8]],
  'Sergipe':             [[-38.3, -11.6], [-36.4,  -9.5]],
  'Bahia':               [[-46.6, -18.4], [-37.3,  -8.5]],
  // Centro-Oeste
  'Mato Grosso':         [[-61.6, -18.0], [-50.2,  -7.3]],
  'Mato Grosso do Sul':  [[-58.2, -24.1], [-50.9, -17.2]],
  'Goiás':               [[-53.3, -19.5], [-45.9, -12.4]],
  'Distrito Federal':    [[-48.3, -16.1], [-47.3, -15.5]],
  // Sudeste
  'Minas Gerais':        [[-51.0, -22.9], [-39.9, -14.2]],
  'Espírito Santo':      [[-41.9, -21.3], [-39.6, -17.9]],
  'Rio de Janeiro':      [[-44.9, -23.4], [-40.9, -20.8]],
  'São Paulo':           [[-53.1, -25.3], [-44.2, -19.8]],
  // Sul
  'Paraná':              [[-54.6, -26.7], [-48.0, -22.5]],
  'Santa Catarina':      [[-53.8, -29.4], [-48.4, -25.9]],
  'Rio Grande do Sul':   [[-57.6, -33.7], [-49.7, -27.1]],
};

// Bounding boxes por macrorregião
const REGION_BOUNDS = {
  'Norte':        [[-73.9, -13.7], [-46.0,  5.3]],
  'Nordeste':     [[-48.8, -18.4], [-34.8, -1.0]],
  'Centro-Oeste': [[-61.6, -24.1], [-45.9, -7.3]],
  'Sudeste':      [[-53.1, -25.3], [-39.6, -14.2]],
  'Sul':          [[-57.6, -33.7], [-48.0, -22.5]],
};

const Map = forwardRef(function Map({ onMunicipioClick }, ref) {
  const mapContainer = useRef(null);
  const mapInstance  = useRef(null);
  const geojsonCache = useRef(null);

  // ── Métodos de navegação expostos para o pai ──────────────────────────────
  useImperativeHandle(ref, () => ({
    flyToBrazil() {
      mapInstance.current?.flyTo({ center: [-55, -15], zoom: 4, essential: true, duration: 1200 });
    },
    flyToRegion(regionName) {
      const bounds = REGION_BOUNDS[regionName];
      if (bounds) mapInstance.current?.fitBounds(bounds, { padding: 40, duration: 1000 });
    },
    flyToState(stateName) {
      const bounds = STATE_BOUNDS[stateName];
      if (bounds) mapInstance.current?.fitBounds(bounds, { padding: 60, duration: 1000 });
    },
    flyToMunicipality(municipalityName, stateSigla) {
      if (!geojsonCache.current) return;
      const feature = geojsonCache.current.features.find(f =>
        f.properties.NM_MUN === municipalityName &&
        (!stateSigla || f.properties.SIGLA_UF === stateSigla)
      );
      if (!feature) return;
      const rings = feature.geometry.type === 'Polygon'
        ? feature.geometry.coordinates
        : feature.geometry.coordinates.flat(1);
      const allCoords = rings.flat(1);
      const lngs = allCoords.map(c => c[0]);
      const lats  = allCoords.map(c => c[1]);
      mapInstance.current?.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 80, duration: 1000, maxZoom: 11 }
      );
    },
  }));

  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-55, -15],
      zoom: 4,
    });

    mapInstance.current.on('load', () => {
      // ── Máscara cinza sobre o mundo inteiro ──────────────────────────────
      mapInstance.current.addSource('world-mask', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-180, 90], [-180, -90], [180, -90], [180, 90], [-180, 90]]],
          },
        },
      });
      mapInstance.current.addLayer({
        id: 'world-gray-layer', type: 'fill', source: 'world-mask',
        paint: { 'fill-color': '#D1D1D1', 'fill-opacity': 1 },
      });

      // ── Satélite ─────────────────────────────────────────────────────────
      mapInstance.current.addSource('satellite-src', { type: 'raster', url: SATELLITE_URL, tileSize: 256 });
      mapInstance.current.addLayer({
        id: 'satellite-layer', type: 'raster', source: 'satellite-src',
        paint: { 'raster-opacity': 0.15 },
      });

      // ── Fontes vetoriais ──────────────────────────────────────────────────
      mapInstance.current.addSource('pais-ibge',        { type: 'geojson', data: DATA_PAIS,        generateId: true });
      mapInstance.current.addSource('regioes-ibge',     { type: 'geojson', data: DATA_REGIOES,     generateId: true });
      mapInstance.current.addSource('estados-ibge',     { type: 'geojson', data: DATA_ESTADOS,     generateId: true });
      mapInstance.current.addSource('municipios-ibge',  { type: 'geojson', data: DATA_MUNICIPIOS,  generateId: true });
      mapInstance.current.addSource('curtailment',      { type: 'geojson', data: '/mapa_curtailment.geojson',      generateId: true });
      mapInstance.current.addSource('calor-municipios', { type: 'geojson', data: '/mapa_calor_municipios.geojson', generateId: true });

      // Cache do GeoJSON de municípios para busca por nome (flyToMunicipality)
      fetch(DATA_MUNICIPIOS).then(r => r.json()).then(data => { geojsonCache.current = data; });

      // ── "Limpa" o cinza sobre o Brasil deixando-o claro ──────────────────
      mapInstance.current.addLayer({
        id: 'pais-highlight', type: 'fill', source: 'pais-ibge',
        paint: { 'fill-color': '#FFFFFF', 'fill-opacity': 0.5 },
      });

      // ── Borda do país (zoom baixo) ────────────────────────────────────────
      mapInstance.current.addLayer({
        id: 'pais-layer', type: 'line', source: 'pais-ibge', maxzoom: 4,
        paint: { 'line-color': '#9EAFB0', 'line-width': 2, 'line-opacity': 0.9 },
      });

      // ── Camadas de escurecimento ao selecionar ────────────────────────────
      const addDimLayer = (id, source) => {
        mapInstance.current.addLayer({
          id: `${id}-dim`, type: 'fill', source,
          paint: { 'fill-color': '#808080', 'fill-opacity': 0 },
          filter: ['!=', ['id'], -1],
        });
      };
      addDimLayer('regioes',    'regioes-ibge');
      addDimLayer('estados',    'estados-ibge');
      addDimLayer('municipios', 'municipios-ibge');

      // ── Regiões ───────────────────────────────────────────────────────────
      mapInstance.current.addLayer({ id: 'regioes-fill', type: 'fill', source: 'regioes-ibge', maxzoom: 5, paint: { 'fill-color': 'rgba(0,0,0,0)' } });
      mapInstance.current.addLayer({
        id: 'regioes-highlight', type: 'fill', source: 'regioes-ibge', maxzoom: 5,
        paint: { 'fill-color': '#03254D', 'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.1, 0] },
      });
      mapInstance.current.addLayer({
        id: 'regioes-layer', type: 'line', source: 'regioes-ibge', maxzoom: 5,
        paint: { 'line-color': '#BECCCC', 'line-width': 1.2, 'line-opacity': 0.7 },
      });

      // ── Estados ───────────────────────────────────────────────────────────
      mapInstance.current.addLayer({ id: 'estados-fill', type: 'fill', source: 'estados-ibge', minzoom: 5, maxzoom: 7.5, paint: { 'fill-color': 'rgba(0,0,0,0)' } });
      mapInstance.current.addLayer({
        id: 'estados-highlight', type: 'fill', source: 'estados-ibge', minzoom: 5, maxzoom: 7.5,
        paint: { 'fill-color': '#03254D', 'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.15, 0] },
      });
      mapInstance.current.addLayer({
        id: 'estados-layer', type: 'line', source: 'estados-ibge', minzoom: 5, maxzoom: 7.5,
        paint: { 'line-color': '#03254D', 'line-width': 1.2, 'line-opacity': 0.55 },
      });

      // ── Municípios ────────────────────────────────────────────────────────
      mapInstance.current.addLayer({ id: 'municipios-fill', type: 'fill', source: 'municipios-ibge', minzoom: 7.5, paint: { 'fill-color': 'rgba(0,0,0,0)' } });
      mapInstance.current.addLayer({
        id: 'municipios-highlight', type: 'fill', source: 'municipios-ibge', minzoom: 7.5,
        paint: { 'fill-color': '#03254D', 'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.18, 0] },
      });
      mapInstance.current.addLayer({
        id: 'municipios-selected', type: 'fill', source: 'municipios-ibge', minzoom: 7.5,
        paint: { 'fill-color': '#FA441A', 'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.25, 0] },
      });
      mapInstance.current.addLayer({
        id: 'municipios-layer', type: 'line', source: 'municipios-ibge', minzoom: 7.5,
        paint: { 'line-color': '#9EAFB0', 'line-width': 0.5, 'line-opacity': 0.9 },
      });

      // ── Camada de calor (curtailment por município) ───────────────────────
      mapInstance.current.addLayer({
        id: 'calor-fill', type: 'fill', source: 'calor-municipios',
        paint: {
          'fill-color': [
            'interpolate', ['linear'], ['get', 'curtailment_final'],
            0,   'rgba(0,0,0,0)',
            10,  '#fde0dd',
            50,  '#fa9fb5',
            150, '#FA441A',
            500, '#800026',
          ],
          'fill-opacity': 0.6,
        },
      }, 'municipios-layer'); // inserida abaixo das linhas de município

      // ── Pontos de curtailment ─────────────────────────────────────────────
      mapInstance.current.addLayer({
        id: 'curtailment-layer', type: 'circle', source: 'curtailment',
        paint: {
          'circle-radius': 7,
          'circle-color': '#FA441A',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // ── Interatividade ────────────────────────────────────────────────────
      let hoveredState  = { id: null, source: null };
      let selectedState = { id: null, source: null };

      // Hover: usa camada ativa conforme zoom (mais preciso que doc1)
      mapInstance.current.on('mousemove', (e) => {
        const zoom = mapInstance.current.getZoom();
        const activeLayers =
          zoom < 5   ? ['regioes-fill'] :
          zoom < 7.5 ? ['estados-fill'] :
                       ['municipios-fill'];

        const features = mapInstance.current.queryRenderedFeatures(e.point, { layers: activeLayers });

        if (features.length > 0) {
          mapInstance.current.getCanvas().style.cursor = 'pointer';
          const f = features[0];
          if (hoveredState.id !== null)
            mapInstance.current.setFeatureState({ source: hoveredState.source, id: hoveredState.id }, { hover: false });
          hoveredState = { id: f.id, source: f.source };
          mapInstance.current.setFeatureState({ source: f.source, id: f.id }, { hover: true });
        } else {
          mapInstance.current.getCanvas().style.cursor = '';
          if (hoveredState.id !== null)
            mapInstance.current.setFeatureState({ source: hoveredState.source, id: hoveredState.id }, { hover: false });
          hoveredState = { id: null, source: null };
        }
      });

      // Click: seleciona feature, escurece as demais, voa para ela
      mapInstance.current.on('click', (e) => {
        const zoom = mapInstance.current.getZoom();
        const activeLayers =
          zoom < 5   ? ['regioes-fill'] :
          zoom < 7.5 ? ['estados-fill'] :
                       ['municipios-fill', 'calor-fill'];

        const features = mapInstance.current.queryRenderedFeatures(e.point, { layers: activeLayers });

        // Reseta escurecimento em todas as camadas dim
        ['regioes-dim', 'estados-dim', 'municipios-dim'].forEach(layer => {
          mapInstance.current.setPaintProperty(layer, 'fill-opacity', 0);
        });

        if (features.length > 0) {
          const f = features[0];

          // Desmarca seleção anterior
          if (selectedState.id !== null)
            mapInstance.current.setFeatureState({ source: selectedState.source, id: selectedState.id }, { selected: false });

          // Marca nova seleção
          selectedState = { id: f.id, source: f.source };
          mapInstance.current.setFeatureState({ source: f.source, id: f.id }, { selected: true });

          // Escurece as outras features da mesma camada
          const dimLayer =
            f.source.includes('regioes')    ? 'regioes-dim' :
            f.source.includes('estados')    ? 'estados-dim' :
                                              'municipios-dim';
          mapInstance.current.setFilter(dimLayer, ['!=', ['id'], f.id]);
          mapInstance.current.setPaintProperty(dimLayer, 'fill-opacity', 0.5);

          // Callback para município (inclui clique no calor)
          if (f.source.includes('municipios') || f.source === 'calor-municipios')
            onMunicipioClick?.(f.properties);

          // Zoom alvo por nível
          const targetZoom =
            f.source.includes('regioes') ? 5.2 :
            f.source.includes('estados') ? 6.8 :
                                           9.5;
          mapInstance.current.flyTo({ center: e.lngLat, zoom: targetZoom, essential: true, speed: 1.2 });
        } else {
          selectedState = { id: null, source: null };
        }
      });
    });
  }, [onMunicipioClick]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#D1D1D1' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
});

export default Map;