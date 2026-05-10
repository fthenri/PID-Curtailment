import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Novo link de DATA (GeoJSON) que preserva os atributos
const DATA_MUNICIPIOS = 'https://api.maptiler.com/data/019e0f97-410a-7425-96f0-12a3e6d892af/features.json?key=j8UzJW3QV4tjV8YFy0i7';

// Mantenha os outros como estão por enquanto ou atualize se fizer o mesmo processo para eles
const TILEJSON_ESTADOS = 'https://api.maptiler.com/tiles/019e0f1e-cf42-7533-a45b-a952a17e2027/tiles.json?key=2iSGf08Ld0l2ytr6rvRV';
const TILEJSON_REGIOES = 'https://api.maptiler.com/tiles/019e0f21-35ae-7b4c-8da4-18a34321f800/tiles.json?key=LMVMEPHIf7vzxWZQP1md';
const TILEJSON_PAIS = 'https://api.maptiler.com/tiles/019e0f22-4f2f-7e49-a0cd-2fdb061be3c8/tiles.json?key=OM8hPVpAd6P8jEpCnFmc';

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
      // 1. Fontes - Note que mudamos 'municipios-ibge' para geojson
      map.current.addSource('pais-ibge', { type: 'vector', url: TILEJSON_PAIS });
      map.current.addSource('regioes-ibge', { type: 'vector', url: TILEJSON_REGIOES });
      map.current.addSource('estados-ibge', { type: 'vector', url: TILEJSON_ESTADOS });
      
      map.current.addSource('municipios-ibge', { 
        type: 'geojson', 
        data: DATA_MUNICIPIOS // Usando o link de features.json
      });

      // 2. Camadas de Estados e superiores (continuam como vector por enquanto)
      map.current.addLayer({
        id: 'estados-layer',
        type: 'line',
        source: 'estados-ibge',
        'source-layer': 'BR_UF_2025',
        minzoom: 5,
        maxzoom: 7.5,
        paint: { 'line-color': '#39FF14', 'line-width': 1.2, 'line-opacity': 0.7 }
      });

      // 3. Camadas de Municípios - SEM 'source-layer'
      map.current.addLayer({
        id: 'municipios-fill',
        type: 'fill',
        source: 'municipios-ibge',
        paint: { 'fill-color': 'rgba(0,0,0,0)' } 
      });

      map.current.addLayer({
        id: 'municipios-highlight',
        type: 'fill',
        source: 'municipios-ibge',
        paint: {
          'fill-color': '#39FF14',
          'fill-opacity': 0.3
        },
        filter: ['==', ['get', 'CD_MUN'], ''] 
      });

      map.current.addLayer({
        id: 'municipios-layer',
        type: 'line',
        source: 'municipios-ibge',
        paint: { 'line-color': '#39FF14', 'line-width': 0.6, 'line-opacity': 0.8 }
      });

      // Camada de pontos
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

      // --- Eventos Interativos ---
      map.current.on('mousemove', 'municipios-fill', (e) => {
        if (e.features.length > 0 && map.current.getCanvas()) {
          const feature = e.features[0];
          // Agora o CD_MUN virá corretamente
          map.current.setFilter('municipios-highlight', ['==', ['get', 'CD_MUN'], feature.properties.CD_MUN]);
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'municipios-fill', () => {
        if (map.current.getCanvas()) {
          map.current.setFilter('municipios-highlight', ['==', ['get', 'CD_MUN'], '']);
          map.current.getCanvas().style.cursor = '';
        }
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