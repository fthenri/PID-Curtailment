import { useEffect, useRef, useState } from 'react'; // Adicionado useState
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const TILEJSON_MUNICIPIOS = 'https://api.maptiler.com/tiles/019e0f12-3fd5-7181-ace6-b762168fa86b/tiles.json?key=j8UzJW3QV4tjV8YFy0i7';
const TILEJSON_ESTADOS = 'https://api.maptiler.com/tiles/019e0f1e-cf42-7533-a45b-a952a17e2027/tiles.json?key=2iSGf08Ld0l2ytr6rvRV';
const TILEJSON_REGIOES = 'https://api.maptiler.com/tiles/019e0f21-35ae-7b4c-8da4-18a34321f800/tiles.json?key=LMVMEPHIf7vzxWZQP1md';
const TILEJSON_PAIS = 'https://api.maptiler.com/tiles/019e0f22-4f2f-7e49-a0cd-2fdb061be3c8/tiles.json?key=OM8hPVpAd6P8jEpCnFmc';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [localSelecionado, setLocalSelecionado] = useState(null); // Estado para armazenar o dado clicado

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-55, -15],
      zoom: 4,
    });

    map.current.on('load', () => {
      map.current.addSource('pais-ibge', { type: 'vector', url: TILEJSON_PAIS });
      map.current.addSource('regioes-ibge', { type: 'vector', url: TILEJSON_REGIOES });
      map.current.addSource('estados-ibge', { type: 'vector', url: TILEJSON_ESTADOS });
      map.current.addSource('municipios-ibge', { type: 'vector', url: TILEJSON_MUNICIPIOS });

      map.current.addLayer({
        id: 'pais-layer',
        type: 'line',
        source: 'pais-ibge',
        'source-layer': 'BR_Pais_2025',
        maxzoom: 4,
        paint: {
          'line-color': '#01e2c0',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      map.current.addLayer({
        id: 'regioes-layer',
        type: 'line',
        source: 'regioes-ibge',
        'source-layer': 'BR_Regioes_2025',
        maxzoom: 5,
        paint: {
          'line-color': '#78d300',
          'line-width': 1.5,
          'line-opacity': 0.4
        }
      });

      map.current.addLayer({
        id: 'estados-layer',
        type: 'line',
        source: 'estados-ibge',
        'source-layer': 'BR_UF_2025',
        minzoom: 5,
        maxzoom: 7.5,
        paint: {
          'line-color': '#ffdd00',
          'line-width': 1,
          'line-opacity': 0.5
        }
      });

      map.current.addLayer({
        id: 'municipios-layer',
        type: 'line',
        source: 'municipios-ibge',
        'source-layer': 'BR_Municipios_2025',
        minzoom: 7.5,
        paint: {
          'line-color': '#ff5e14',
          'line-width': 0.8,
          'line-opacity': 1.0
        }
      });

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

      // Captura o clique no município e salva no estado
      map.current.on('click', 'municipios-layer', (e) => {
        const propriedades = e.features[0].properties;
        console.log("Local clicado:", propriedades);
        setLocalSelecionado(propriedades);
      });

      // Muda o cursor para "pointer" (mãozinha) ao passar por cima de um município
      map.current.on('mouseenter', 'municipios-layer', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      // Retorna o cursor ao normal ao sair do município
      map.current.on('mouseleave', 'municipios-layer', () => {
        map.current.getCanvas().style.cursor = '';
      });
    });
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
}