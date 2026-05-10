// src/components/SidebarLeft.jsx
import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

const NORTHEAST_STATES = [
  'Bahia', 'Pernambuco', 'Ceará', 'Rio Grande do Norte',
  'Paraíba', 'Alagoas', 'Sergipe', 'Maranhão', 'Piauí',
];

const getMunicipalities = (state) => {
  if (state === 'Pernambuco') return ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'];
  return [];
};

const getBiomes = (state) => {
  if (state === 'Pernambuco') return ['Caatinga', 'Mata Atlântica'];
  if (state === 'Bahia') return ['Caatinga', 'Cerrado', 'Mata Atlântica'];
  if (state === 'Maranhão') return ['Cerrado', 'Amazônia'];
  return ['Caatinga', 'Mata Atlântica', 'Cerrado'];
};

function FilterSelect({ label, value, options, onChange, disabled = false }) {
  return (
    <div className="filter-group">
      <label className="filter-label">{label}</label>
      <div className="filter-select-wrapper">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="filter-select"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="filter-select-icon" />
      </div>
    </div>
  );
}

export default function SidebarLeft({ onFilterChange }) {
  const [filters, setFilters] = useState({
    region: 'Nordeste',
    state: 'Todos',
    municipality: 'Todos',
    biome: 'Todos',
    year: '2026',
    month: 'Todos',
    energySource: 'Todas',
    curtailmentLevel: 'Todos',
    landCover: 'Todas',
  });

  const [municipalities, setMunicipalities] = useState([]);
  const [biomes, setBiomes] = useState([]);

  useEffect(() => {
    if (filters.state === 'Todos') {
      setMunicipalities([]);
      setBiomes([]);
    } else {
      setMunicipalities(getMunicipalities(filters.state));
      setBiomes(getBiomes(filters.state));
    }
  }, [filters.state]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters]);

  const update = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleStateChange = (state) =>
    setFilters((prev) => ({ ...prev, state, municipality: 'Todos', biome: 'Todos' }));

  const handleClear = () =>
    setFilters({
      region: 'Nordeste', state: 'Todos', municipality: 'Todos',
      biome: 'Todos', year: '2026', month: 'Todos',
      energySource: 'Todas', curtailmentLevel: 'Todos', landCover: 'Todas',
    });

  return (
    <aside className="panel-left">
      {/* Cabeçalho */}
      <div className="panel-header">
        <div className="panel-header-row">
          <SlidersHorizontal size={16} />
          <span className="panel-title">Filtros</span>
        </div>
        <p className="panel-subtitle">Refine sua análise territorial</p>
      </div>

      {/* Selects */}
      <div className="panel-scroll">
        <div className="panel-content">
          <FilterSelect label="Região" value={filters.region}
            options={['Nordeste']} onChange={(v) => update('region', v)} />

          <FilterSelect label="Estado" value={filters.state}
            options={['Todos', ...NORTHEAST_STATES]} onChange={handleStateChange} />

          <FilterSelect label="Município" value={filters.municipality}
            options={municipalities.length ? ['Todos', ...municipalities] : ['Todos']}
            onChange={(v) => update('municipality', v)}
            disabled={municipalities.length === 0} />

          <FilterSelect label="Bioma" value={filters.biome}
            options={biomes.length ? ['Todos', ...biomes] : ['Todos']}
            onChange={(v) => update('biome', v)}
            disabled={biomes.length === 0} />

          <FilterSelect label="Ano" value={filters.year}
            options={['2026', '2025', '2024', '2023', '2022']}
            onChange={(v) => update('year', v)} />

          <FilterSelect label="Mês" value={filters.month}
            options={['Todos','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
              'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']}
            onChange={(v) => update('month', v)} />

          <FilterSelect label="Fonte de Energia" value={filters.energySource}
            options={['Todas','Solar','Eólica','Híbrido']}
            onChange={(v) => update('energySource', v)} />

          <FilterSelect label="Nível de Curtailment" value={filters.curtailmentLevel}
            options={['Todos','Alto (>30%)','Médio (15-30%)','Baixo (<15%)']}
            onChange={(v) => update('curtailmentLevel', v)} />

          <FilterSelect label="Cobertura Vegetal" value={filters.landCover}
            options={['Todas','Floresta','Agricultura','Pastagem','Área Urbana']}
            onChange={(v) => update('landCover', v)} />
        </div>
      </div>

      {/* Botões */}
      <div className="panel-footer">
        <button className="btn-primary">Aplicar Filtros</button>
        <button className="btn-ghost" onClick={handleClear}>Limpar Filtros</button>
      </div>
    </aside>
  );
}