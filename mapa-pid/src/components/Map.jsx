import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Constantes atualizadas com os novos links de DATA (features.json)
const DATA_MUNICIPIOS = 'https://api.maptiler.com/data/019e0f97-410a-7425-96f0-12a3e6d892af/features.json?key=j8UzJW3QV4tjV8YFy0i7';
const DATA_ESTADOS = 'https://api.maptiler.com/data/019e0fbb-aeeb-7506-9d9d-90eabc379d25/features.json?key=2iSGf08Ld0l2ytr6rvRV';
const DATA_REGIOES = 'https://api.maptiler.com/data/019e0fbf-d956-78fe-8eff-223f45be72a3/features.json?key=LMVMEPHIf7vzxWZQP1md';
const DATA_PAIS = 'https://api.maptiler.com/data/019e0fc0-986d-74ac-8a66-ba3a3bef381f/features.json?key=OM8hPVpAd6P8jEpCnFmc';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [localSelecionado, setLocalSelecionado] = useState(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-55, -15],
      zoom: 4,
    });

    map.current.on('load', () => {
      // 1. Configuração das Fontes (Todas como GeoJSON para preservar atributos)
      map.current.addSource('pais-ibge', { type: 'geojson', data: DATA_PAIS });
      map.current.addSource('regioes-ibge', { type: 'geojson', data: DATA_REGIOES });
      map.current.addSource('estados-ibge', { type: 'geojson', data: DATA_ESTADOS });
      
      map.current.addSource('municipios-ibge', { 
        type: 'geojson', 
        data: DATA_MUNICIPIOS,
        generateId: true // Gera IDs únicos automaticamente para o efeito de hover instantâneo
      });

      // 2. Camada do País
      map.current.addLayer({
        id: 'pais-layer',
        type: 'line',
        source: 'pais-ibge',
        maxzoom: 4,
        paint: { 'line-color': '#ffffff', 'line-width': 2, 'line-opacity': 0.8 }
      });

      // 3. Camada de Macro Regiões
      map.current.addLayer({
        id: 'regioes-layer',
        type: 'line',
        source: 'regioes-ibge',
        maxzoom: 5,
        paint: { 'line-color': '#ffffff', 'line-width': 1.5, 'line-opacity': 0.4 }
      });

      // 4. Camada de Estados
      map.current.addLayer({
        id: 'estados-layer',
        type: 'line',
        source: 'estados-ibge',
        minzoom: 5,
        maxzoom: 7.5,
        paint: { 'line-color': '#39FF14', 'line-width': 1.2, 'line-opacity': 0.7 }
      });

      // 5. Camadas de Municípios (Com regras de zoom para performance)
      map.current.addLayer({
        id: 'municipios-fill',
        type: 'fill',
        source: 'municipios-ibge',
        minzoom: 7.5,
        paint: { 'fill-color': 'rgba(0,0,0,0)' } 
      });

      map.current.addLayer({
        id: 'municipios-highlight',
        type: 'fill',
        source: 'municipios-ibge',
        minzoom: 7.5,
        paint: {
          'fill-color': '#39FF14',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.3, // Brilho ao passar o mouse
            0    // Transparente por padrão
          ]
        }
      });

      map.current.addLayer({
        id: 'municipios-layer',
        type: 'line',
        source: 'municipios-ibge',
        minzoom: 7.5,
        paint: { 'line-color': '#39FF14', 'line-width': 0.6, 'line-opacity': 0.8 }
      });

      // Camada de Pontos de Curtailment
      map.current.addSource('curtailment', {
        type: 'geojson',
        data: '/mapa_curtailment.geojson'
      });

      map.current.addLayer({
        id: 'curtailment-layer',
        type: 'circle',
        source: 'curtailment',
        paint: {
          'circle-radius': 8,
          'circle-color': '#f39c12',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff'
        }
      });

      // --- Lógica de Interatividade ---
      let hoveredStateId = null;

      map.current.on('mousemove', 'municipios-fill', (e) => {
        if (e.features.length > 0) {
          map.current.getCanvas().style.cursor = 'pointer';
          
          if (hoveredStateId !== null) {
            map.current.setFeatureState(
              { source: 'municipios-ibge', id: hoveredStateId },
              { hover: false }
            );
          }
          
          hoveredStateId = e.features[0].id;
          map.current.setFeatureState(
            { source: 'municipios-ibge', id: hoveredStateId },
            { hover: true }
          );
        }
      });

      map.current.on('mouseleave', 'municipios-fill', () => {
        map.current.getCanvas().style.cursor = '';
        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: 'municipios-ibge', id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = null;
      });

      map.current.on('click', 'municipios-fill', (e) => {
        if (e.features.length > 0) {
          const propriedades = e.features[0].properties;
          console.log("DADOS DO MUNICÍPIO:", propriedades);
          setLocalSelecionado(propriedades);
        }
      });
    });
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {localSelecionado && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.8)',
          color: '#39FF14',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #39FF14',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <strong>Município:</strong> {localSelecionado.NM_MUN} ({localSelecionado.SIGLA_UF})
        </div>
      )}
    </div>
  );
}