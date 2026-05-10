import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const TILEJSON_MUNICIPIOS = 'https://api.maptiler.com/tiles/019e0f12-3fd5-7181-ace6-b762168fa86b/tiles.json?key=j8UzJW3QV4tjV8YFy0i7';
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
      // 1. Fontes
      map.current.addSource('pais-ibge', { type: 'vector', url: TILEJSON_PAIS });
      map.current.addSource('regioes-ibge', { type: 'vector', url: TILEJSON_REGIOES });
      map.current.addSource('estados-ibge', { type: 'vector', url: TILEJSON_ESTADOS });
      map.current.addSource('municipios-ibge', { type: 'vector', url: TILEJSON_MUNICIPIOS });

      // 2. País
      map.current.addLayer({
        id: 'pais-layer',
        type: 'line',
        source: 'pais-ibge',
        'source-layer': 'BR_Pais_2025',
        maxzoom: 4,
        paint: { 'line-color': '#ffffff', 'line-width': 2, 'line-opacity': 0.8 }
      });

      // 3. Macro Regiões
      map.current.addLayer({
        id: 'regioes-layer',
        type: 'line',
        source: 'regioes-ibge',
        'source-layer': 'BR_Regioes_2025',
        maxzoom: 5,
        paint: { 'line-color': '#ffffff', 'line-width': 1.5, 'line-opacity': 0.4 }
      });

      // 4. Estados
      map.current.addLayer({
        id: 'estados-layer',
        type: 'line',
        source: 'estados-ibge',
        'source-layer': 'BR_UF_2025',
        minzoom: 5,
        maxzoom: 7.5,
        paint: { 'line-color': '#39FF14', 'line-width': 1.2, 'line-opacity': 0.7 }
      });

      // 5. Municípios (Invisível, Hover e Bordas)
      map.current.addLayer({
        id: 'municipios-fill',
        type: 'fill',
        source: 'municipios-ibge',
        'source-layer': 'BR_Municipios_2025',
        minzoom: 7.5,
        paint: { 'fill-color': 'rgba(0,0,0,0)' } 
      });

      map.current.addLayer({
        id: 'municipios-highlight',
        type: 'fill',
        source: 'municipios-ibge',
        'source-layer': 'BR_Municipios_2025',
        minzoom: 7.5,
        paint: {
          'fill-color': '#39FF14',
          'fill-opacity': 0.3
        },
        // Inicializa com um filtro que não bate com nada para não bugar
        filter: ['==', ['get', 'fake_id_para_iniciar'], ''] 
      });

      map.current.addLayer({
        id: 'municipios-layer',
        type: 'line',
        source: 'municipios-ibge',
        'source-layer': 'BR_Municipios_2025',
        minzoom: 7.5,
        paint: { 'line-color': '#39FF14', 'line-width': 0.6, 'line-opacity': 0.8 }
      });

      // Curtailment original
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

      // --- EVENTOS BLINDADOS CONTRA CRASHES ---

      map.current.on('mousemove', 'municipios-fill', (e) => {
        if (e.features.length > 0 && map.current.getCanvas()) {
          const propriedades = e.features[0].properties;
          
          // Descobre dinamicamente qual é o nome da coluna de ID (CD_MUN, cd_mun, id, etc)
          const chaveId = 'CD_MUN' in propriedades ? 'CD_MUN' : ('cd_mun' in propriedades ? 'cd_mun' : Object.keys(propriedades)[0]);
          const valorId = propriedades[chaveId];

          // Só aplica o filtro se existir um ID válido
          if (chaveId && valorId) {
            map.current.setFilter('municipios-highlight', ['==', ['get', chaveId], valorId]);
          }

          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'municipios-fill', () => {
        if (map.current.getCanvas()) {
          // Limpa o filtro apontando para uma string impossível para apagar a luz
          map.current.setFilter('municipios-highlight', ['==', ['get', 'fake_id_reset'], 'RESET']);
          map.current.getCanvas().style.cursor = '';
        }
      });

      map.current.on('click', 'municipios-fill', (e) => {
        if (e.features.length > 0) {
          const propriedades = e.features[0].properties;
          console.log("DADOS REAIS DO POLÍGONO:", propriedades);
          setLocalSelecionado(propriedades);
        }
      });
    });
  }, []);

  // Extrai o nome do município independente de o MapTiler ter convertido pra minúsculo ou não
  const getNomeLocal = (props) => {
    if (!props) return '';
    return props.NM_MUN || props.nm_mun || props.NM_UF || props.nm_uf || 'Polígono sem nome';
  };

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
          <strong>Localidade:</strong> {getNomeLocal(localSelecionado)}
        </div>
      )}
    </div>
  );
}