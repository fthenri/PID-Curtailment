// src/components/Map.jsx
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// --- 1. LINKS DE DADOS VETORIAIS (IBGE) ---
const DATA_MUNICIPIOS = 'https://api.maptiler.com/data/019e0f97-410a-7425-96f0-12a3e6d892af/features.json?key=j8UzJW3QV4tjV8YFy0i7';
const DATA_ESTADOS   = 'https://api.maptiler.com/data/019e0fbb-aeeb-7506-9d9d-90eabc379d25/features.json?key=2iSGf08Ld0l2ytr6rvRV';
const DATA_REGIOES   = 'https://api.maptiler.com/data/019e0fbf-d956-78fe-8eff-223f45be72a3/features.json?key=LMVMEPHIf7vzxWZQP1md';
const DATA_PAIS      = 'https://api.maptiler.com/data/019e0fc0-986d-74ac-8a66-ba3a3bef381f/features.json?key=OM8hPVpAd6P8jEpCnFmc';

// --- 2. LINK DE CONTEXTO AMBIENTAL (RASTER) ---
const SATELLITE_URL = 'https://api.maptiler.com/tiles/satellite/tiles.json?key=j8UzJW3QV4tjV8YFy0i7';

// Estilo base claro (alinhado ao Figma)
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export default function Map({ onMunicipioClick }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-55, -15],
      zoom: 4,
    });

    map.current.on('load', () => {
      // ==========================================
      // A. FONTES E CAMADAS RASTER (FUNDO DO MAPA)
      // ==========================================
      map.current.addSource('satellite-src', { type: 'raster', url: SATELLITE_URL, tileSize: 256 });
      map.current.addLayer({
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite-src',
        paint: { 'raster-opacity': 0.15 }
      });

      // ==========================================
      // B. FONTES VETORIAIS (IBGE)
      // ==========================================
      map.current.addSource('pais-ibge',       { type: 'geojson', data: DATA_PAIS });
      map.current.addSource('regioes-ibge',    { type: 'geojson', data: DATA_REGIOES,    generateId: true });
      map.current.addSource('estados-ibge',    { type: 'geojson', data: DATA_ESTADOS,    generateId: true });
      map.current.addSource('municipios-ibge', { type: 'geojson', data: DATA_MUNICIPIOS, generateId: true });

      // 1. País
      map.current.addLayer({
        id: 'pais-layer', type: 'line', source: 'pais-ibge',
        maxzoom: 4,
        paint: { 'line-color': '#9EAFB0', 'line-width': 2, 'line-opacity': 0.9 }
      });

      // 2. Macro Regiões
      map.current.addLayer({
        id: 'regioes-fill', type: 'fill', source: 'regioes-ibge',
        maxzoom: 5,
        paint: { 'fill-color': 'rgba(0,0,0,0)' }
      });
      map.current.addLayer({
        id: 'regioes-highlight', type: 'fill', source: 'regioes-ibge',
        maxzoom: 5,
        paint: {
          'fill-color': '#03254D',
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.1, 0]
        }
      });
      map.current.addLayer({
        id: 'regioes-layer', type: 'line', source: 'regioes-ibge',
        maxzoom: 5,
        paint: { 'line-color': '#BECCCC', 'line-width': 1.2, 'line-opacity': 0.7 }
      });

      // 3. Estados
      map.current.addLayer({
        id: 'estados-fill', type: 'fill', source: 'estados-ibge',
        minzoom: 5, maxzoom: 7.5,
        paint: { 'fill-color': 'rgba(0,0,0,0)' }
      });
      map.current.addLayer({
        id: 'estados-highlight', type: 'fill', source: 'estados-ibge',
        minzoom: 5, maxzoom: 7.5,
        paint: {
          'fill-color': '#03254D',
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.15, 0]
        }
      });
      map.current.addLayer({
        id: 'estados-layer', type: 'line', source: 'estados-ibge',
        minzoom: 5, maxzoom: 7.5,
        paint: { 'line-color': '#03254D', 'line-width': 1.2, 'line-opacity': 0.55 }
      });

      // 4. Municípios
      map.current.addLayer({
        id: 'municipios-fill', type: 'fill', source: 'municipios-ibge',
        minzoom: 7.5,
        paint: { 'fill-color': 'rgba(0,0,0,0)' }
      });
      map.current.addLayer({
        id: 'municipios-highlight', type: 'fill', source: 'municipios-ibge',
        minzoom: 7.5,
        paint: {
          'fill-color': '#03254D',
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.18, 0]
        }
      });
      map.current.addLayer({
        id: 'municipios-selected', type: 'fill', source: 'municipios-ibge',
        minzoom: 7.5,
        paint: {
          'fill-color': '#FA441A',
          'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.25, 0]
        }
      });
      map.current.addLayer({
        id: 'municipios-layer', type: 'line', source: 'municipios-ibge',
        minzoom: 7.5,
        paint: { 'line-color': '#9EAFB0', 'line-width': 0.5, 'line-opacity': 0.9 }
      });

      // 5. Pontos e Zonas de Curtailment
      map.current.addSource('curtailment', { type: 'geojson', data: '/mapa_curtailment.geojson' });
      map.current.addSource('calor-municipios', { type: 'geojson', data: '/mapa_calor_municipios.geojson', generateId: true }); // Alteração: Nova fonte de dados para as Supply Zones
      
      map.current.addLayer({ // Alteração: Camada de mapa de calor usando o curtailment_final
        id: 'calor-fill', // Alteração: ID da camada
        type: 'fill', // Alteração: Tipo fill para preencher o polígono municipal
        source: 'calor-municipios', // Alteração: Aponta para a nova fonte
        paint: { // Alteração: Configuração visual
          'fill-color': [ // Alteração: Interpola cores com base no volume de energia
            'interpolate', ['linear'], ['get', 'curtailment_final'], // Alteração: Lê o dado gerado no Python
            0, 'rgba(0,0,0,0)', // Alteração: Invisível se for zero
            10, '#fde0dd', // Alteração: Tom mais claro para área de influência
            50, '#fa9fb5', // Alteração: Média abundância
            150, '#FA441A', // Alteração: Alta abundância (Cor da marca)
            500, '#800026' // Alteração: Abundância extrema
          ], // Alteração
          'fill-opacity': 0.6 // Alteração: Transparência para permitir ver o mapa base
        } // Alteração
      }, 'municipios-layer'); // Alteração: Injeta abaixo das linhas de divisa municipal

      map.current.addLayer({
        id: 'curtailment-layer', type: 'circle', source: 'curtailment',
        paint: {
          'circle-radius': 7,
          'circle-color': '#FA441A',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        }
      });

      // ==========================================
      // C. LÓGICA DE INTERATIVIDADE
      // ==========================================
      const interactiveLayers = ['calor-fill', 'municipios-fill', 'estados-fill', 'regioes-fill']; // Alteração: 'calor-fill' adicionado aos layers clicáveis
      let hoveredState  = { id: null, source: null };
      let selectedState = { id: null, source: null };

      map.current.on('mousemove', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: interactiveLayers });

        if (features.length > 0) {
          map.current.getCanvas().style.cursor = 'pointer';
          const f = features[0];

          if (hoveredState.id !== null) {
            map.current.setFeatureState({ source: hoveredState.source, id: hoveredState.id }, { hover: false });
          }
          hoveredState = { id: f.id, source: f.source };
          map.current.setFeatureState({ source: f.source, id: f.id }, { hover: true });
        } else {
          map.current.getCanvas().style.cursor = '';
          if (hoveredState.id !== null) {
            map.current.setFeatureState({ source: hoveredState.source, id: hoveredState.id }, { hover: false });
          }
          hoveredState = { id: null, source: null };
        }
      });

      map.current.on('click', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: interactiveLayers });

        if (features.length > 0) {
          const f = features[0];
          const props = f.properties;

          // Remove seleção persistente anterior
          if (selectedState.id !== null) {
            map.current.setFeatureState({ source: selectedState.source, id: selectedState.id }, { selected: false });
          }
          selectedState = { id: f.id, source: f.source };
          map.current.setFeatureState({ source: f.source, id: f.id }, { selected: true });

          // Dispara callback apenas para municípios
          if (f.source === 'municipios-ibge' || f.source === 'calor-municipios') { // Alteração: Aceita eventos da nova camada
            onMunicipioClick?.(props);
          }

          // Animação de câmera
          let targetZoom = 5;
          if (f.source === 'estados-ibge')    targetZoom = 6.5;
          if (f.source === 'municipios-ibge' || f.source === 'calor-municipios') targetZoom = 9; // Alteração: Zoom ajustado se vier da nova camada

          map.current.flyTo({
            center: e.lngLat,
            zoom: targetZoom,
            essential: true,
            speed: 1.2,
          });
        }
      });
    });
  }, [onMunicipioClick]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}