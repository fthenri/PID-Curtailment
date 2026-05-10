import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Constantes com os links TileJSON
const TILEJSON_MUNICIPIOS = 'https://api.maptiler.com/tiles/019e0f12-3fd5-7181-ace6-b762168fa86b/tiles.json?key=j8UzJW3QV4tjV8YFy0i7';
const TILEJSON_ESTADOS = 'https://api.maptiler.com/tiles/019e0f1e-cf42-7533-a45b-a952a17e2027/tiles.json?key=2iSGf08Ld0l2ytr6rvRV';
const TILEJSON_REGIOES = 'https://api.maptiler.com/tiles/019e0f21-35ae-7b4c-8da4-18a34321f800/tiles.json?key=LMVMEPHIf7vzxWZQP1md';
const TILEJSON_PAIS = 'https://api.maptiler.com/tiles/019e0f22-4f2f-7e49-a0cd-2fdb061be3c8/tiles.json?key=OM8hPVpAd6P8jEpCnFmc';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-55, -15],
      zoom: 4,
    });

    map.current.on('load', () => {
      // 1. Adicionando as Fontes
      map.current.addSource('pais-ibge', { type: 'vector', url: TILEJSON_PAIS });
      map.current.addSource('regioes-ibge', { type: 'vector', url: TILEJSON_REGIOES });
      map.current.addSource('estados-ibge', { type: 'vector', url: TILEJSON_ESTADOS });
      map.current.addSource('municipios-ibge', { type: 'vector', url: TILEJSON_MUNICIPIOS });

      // 2. Camada do País
      map.current.addLayer({
        id: 'pais-layer',
        type: 'line',
        source: 'pais-ibge',
        'source-layer': 'BR_Pais_2025',
        maxzoom: 4,
        paint: {
          'line-color': '#00e93a',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // 3. Camada de Macro Regiões
      map.current.addLayer({
        id: 'regioes-layer',
        type: 'line',
        source: 'regioes-ibge',
        'source-layer': 'BR_Regioes_2025',
        maxzoom: 5,
        paint: {
          'line-color': '#dddd00',
          'line-width': 1.5,
          'line-opacity': 0.4
        }
      });

      // 4. Camada de Estados
      map.current.addLayer({
        id: 'estados-layer',
        type: 'line',
        source: 'estados-ibge',
        'source-layer': 'BR_UF_2025',
        minzoom: 5,
        maxzoom: 7.5,
        paint: {
          'line-color': '#c47600',
          'line-width': 1,
          'line-opacity': 0.5
        }
      });

      // 5. Camada de Municípios
      map.current.addLayer({
        id: 'municipios-layer',
        type: 'line',
        source: 'municipios-ibge',
        'source-layer': 'BR_Municipios_2025',
        minzoom: 7.5,
        paint: {
          'line-color': '#db0000',
          'line-width': 0.5,
          'line-opacity': 0.6
        }
      });

      // Camada de pontos de Curtailment
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
    });
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
}