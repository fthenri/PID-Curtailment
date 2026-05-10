// src/App.jsx
import logoImg from './assets/logo.svg';
import { useState, useRef, useCallback } from 'react';
import Map from './components/Map';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import './App.css';

// Nome do estado → sigla IBGE
const STATE_SIGLA = {
  'Acre':'AC','Amazonas':'AM','Roraima':'RR','Rondônia':'RO','Pará':'PA','Amapá':'AP','Tocantins':'TO',
  'Maranhão':'MA','Piauí':'PI','Ceará':'CE','Rio Grande do Norte':'RN','Paraíba':'PB',
  'Pernambuco':'PE','Alagoas':'AL','Sergipe':'SE','Bahia':'BA',
  'Mato Grosso':'MT','Mato Grosso do Sul':'MS','Goiás':'GO','Distrito Federal':'DF',
  'Minas Gerais':'MG','Espírito Santo':'ES','Rio de Janeiro':'RJ','São Paulo':'SP',
  'Paraná':'PR','Santa Catarina':'SC','Rio Grande do Sul':'RS',
};

function App() {
  const [localSelecionado, setLocalSelecionado] = useState(null);
  const mapRef = useRef(null);

  // Só é chamado ao clicar em "Aplicar Filtros"
  const handleApplyFilters = useCallback((filters) => {
    const { region, state, municipality } = filters;

    if (municipality && municipality !== 'Todos') {
      mapRef.current?.flyToMunicipality(municipality, STATE_SIGLA[state]);
    } else if (state && state !== 'Todos') {
      mapRef.current?.flyToState(state);
    } else if (region && region !== 'Todos') {
      mapRef.current?.flyToRegion(region);
    } else {
      mapRef.current?.flyToBrazil();
    }
  }, []);

  const selectedRegion = localSelecionado
    ? `${localSelecionado.NM_MUN}${localSelecionado.SIGLA_UF ? ' — ' + localSelecionado.SIGLA_UF : ''}`
    : 'Clique no mapa para selecionar';

  return (
    <div className="app-wrapper">
      {/* ── Header ── */}
      <header className="app-header">
        <img
          src={logoImg}
          alt="Plataforma Interativa de Descarbonização"
          style={{ height: '80px', width: 'auto', display: 'block' }}
        />
      </header>

      {/* ── Corpo 3 colunas ── */}
      <div className="app-body">
        <SidebarLeft onApplyFilters={handleApplyFilters} />

        {/* Área central */}
        <div className="map-container">
          <div className="map-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="map-header-label">Visualização</span>
              <span className="map-header-title">Mapa de Curtailment</span>
            </div>
          </div>

          <div style={{ position: 'absolute', top: '45px', bottom: '58px', left: 0, right: 0 }}>
            <Map ref={mapRef} onMunicipioClick={setLocalSelecionado} />
          </div>

          {localSelecionado && (
            <div className="map-tooltip">
              <strong>{localSelecionado.NM_MUN}</strong>
              {localSelecionado.SIGLA_UF && (
                <span style={{ opacity: 0.75, marginLeft: 6, fontSize: '0.78rem' }}>
                  {localSelecionado.SIGLA_UF}
                </span>
              )}
            </div>
          )}

          <div className="map-legend">
            <span className="map-legend-title">Intensidade de Curtailment</span>
            <div className="map-legend-items">
              {[
                { color: '#F5F749', label: 'Baixo (<20%)' },
                { color: '#F89069', label: 'Médio (20-30%)' },
                { color: '#B5446E', label: 'Alto (30-40%)' },
                { color: '#550C18', label: 'Crítico (>40%)' },
              ].map(({ color, label }) => (
                <div key={label} className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: color }} />
                  <span className="map-legend-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SidebarRight selectedRegion={selectedRegion} />
      </div>
    </div>
  );
}

export default App;