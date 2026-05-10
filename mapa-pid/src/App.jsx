// src/App.jsx
// linha 1 — adicione o import no topo do arquivo
import logoImg from './assets/logo.svg';
import { useState } from 'react';
import Map from './components/Map';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import './App.css';

function App() {
  const [selectedRegion, setSelectedRegion] = useState('Pernambuco');
  const [localSelecionado, setLocalSelecionado] = useState(null);

  return (
    <div className="app-wrapper">
      {/* ── Header ── */}
      <header className="app-header">
      

<img
  src={logoImg}
  alt="Plataforma Interativa de Descarbonização"
  style={{ height: '48px', width: 'auto', display: 'block' }}
/>
      </header>

      {/* ── Corpo 3 colunas ── */}
      <div className="app-body">
        <SidebarLeft onFilterChange={() => {}} />

        {/* Área central: mapa + header + legenda */}
        <div className="map-container">
          {/* Cabeçalho interno do mapa */}
          <div className="map-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="map-header-label">Visualização</span>
              <span className="map-header-title">Mapa de Curtailment</span>
            </div>
          </div>

          {/* Mapa ocupa o espaço restante (abaixo do header e acima da legenda) */}
          <div style={{
            position: 'absolute',
            top: '45px',    /* altura do map-header */
            bottom: '58px', /* altura da legenda */
            left: 0,
            right: 0,
          }}>
            <Map onMunicipioClick={setLocalSelecionado} />
          </div>

          {/* Tooltip do município selecionado */}
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

          {/* Legenda fixa na base */}
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