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
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const mapRef = useRef(null);
  const chartsRef = useRef(null); // Referência para a seção de gráficos

  // Função para rolar suavemente até os gráficos no mobile
  const scrollToCharts = useCallback(() => {
    chartsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Chamado ao clicar em "Aplicar Filtros"
  const handleApplyFilters = useCallback((filters) => {
    const { region, state, municipality } = filters;

    if (municipality && municipality !== 'Todos') {
      const sigla = STATE_SIGLA[state];
      mapRef.current?.flyToMunicipality(municipality, sigla);
      mapRef.current?.focusFeature('municipality', municipality, sigla);

    } else if (state && state !== 'Todos') {
      mapRef.current?.flyToState(state);
      mapRef.current?.focusFeature('state', state);

    } else if (region && region !== 'Todos') {
      mapRef.current?.flyToRegion(region);
      mapRef.current?.focusFeature('region', region);

    } else {
      mapRef.current?.flyToBrazil();
      mapRef.current?.resetFocus();
      setLocalSelecionado(null);
    }
    
    setIsMenuOpen(false); 
  }, []);

  const handleClearFilters = useCallback(() => {
    mapRef.current?.flyToBrazil();
    mapRef.current?.resetFocus();
    setLocalSelecionado(null);
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
        
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
      </header>

      {/* ── Corpo 3 colunas ── */}
      <div className="app-body">
        {isMenuOpen && <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)} />}
        <div className={`sidebar-left-container ${isMenuOpen ? 'open' : ''}`}>
          <SidebarLeft
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

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

          {/* Botão flutuante para facilitar navegação no mobile */}
          <button className="mobile-scroll-btn" onClick={scrollToCharts}>
            Ver Análises 📊
          </button>

          <div className="map-legend">
            <span className="map-legend-title">Sobras (MWh)</span>
            <div className="map-legend-items">
              {[
                { color: '#fde0dd', label: '10+' },
                { color: '#fa9fb5', label: '50+' },
                { color: '#FA441A', label: '150+' },
                { color: '#800026', label: '500+' },
              ].map(({ color, label }) => (
                <div key={label} className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: color }} />
                  <span className="map-legend-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Container com a âncora de rolagem */}
        <div className="sidebar-right-container" ref={chartsRef}>
          <SidebarRight selectedRegion={selectedRegion} />
        </div>
      </div>
    </div>
  );
}

export default App;