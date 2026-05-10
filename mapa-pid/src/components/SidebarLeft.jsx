// src/components/SidebarLeft.jsx
import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

const REGIOES = {
  'Todos': [],
  'Norte':        ['Acre','Amazonas','Roraima','Rondônia','Pará','Amapá','Tocantins'],
  'Nordeste':     ['Bahia','Pernambuco','Ceará','Rio Grande do Norte','Paraíba','Alagoas','Sergipe','Maranhão','Piauí'],
  'Centro-Oeste': ['Goiás','Mato Grosso','Mato Grosso do Sul','Distrito Federal'],
  'Sudeste':      ['São Paulo','Rio de Janeiro','Minas Gerais','Espírito Santo'],
  'Sul':          ['Paraná','Santa Catarina','Rio Grande do Sul'],
};

// Municípios por estado (expanda conforme necessário)
const MUNICIPIOS_POR_ESTADO = {
  'Pernambuco':          ['Recife','Jaboatão dos Guararapes','Olinda','Caruaru','Petrolina','Camaçari'],
  'Bahia':               ['Salvador','Feira de Santana','Vitória da Conquista','Camaçari','Juazeiro'],
  'Ceará':               ['Fortaleza','Caucaia','Juazeiro do Norte','Maracanaú','Sobral'],
  'Rio Grande do Norte': ['Natal','Mossoró','Parnamirim','São Gonçalo do Amarante','Macaíba'],
  'Paraíba':             ['João Pessoa','Campina Grande','Santa Rita','Patos','Bayeux'],
  'Alagoas':             ['Maceió','Arapiraca','Rio Largo','Palmeira dos Índios','União dos Palmares'],
  'Sergipe':             ['Aracaju','Nossa Senhora do Socorro','Lagarto','Itabaiana','São Cristóvão'],
  'Maranhão':            ['São Luís','Imperatriz','São José de Ribamar','Timon','Caxias'],
  'Piauí':               ['Teresina','Timon','Parnaíba','Picos','Campo Maior'],
  'São Paulo':           ['São Paulo','Guarulhos','Campinas','São Bernardo do Campo','Santo André'],
  'Rio de Janeiro':      ['Rio de Janeiro','São Gonçalo','Duque de Caxias','Nova Iguaçu','Niterói'],
  'Minas Gerais':        ['Belo Horizonte','Uberlândia','Contagem','Juiz de Fora','Betim'],
  'Espírito Santo':      ['Vitória','Serra','Vila Velha','Cariacica','Cachoeiro de Itapemirim'],
  'Paraná':              ['Curitiba','Londrina','Maringá','Ponta Grossa','Cascavel'],
  'Santa Catarina':      ['Florianópolis','Joinville','Blumenau','São José','Criciúma'],
  'Rio Grande do Sul':   ['Porto Alegre','Caxias do Sul','Pelotas','Canoas','Santa Maria'],
  'Goiás':               ['Goiânia','Aparecida de Goiânia','Anápolis','Rio Verde','Luziânia'],
  'Mato Grosso':         ['Cuiabá','Várzea Grande','Rondonópolis','Sinop','Tangará da Serra'],
  'Mato Grosso do Sul':  ['Campo Grande','Dourados','Três Lagoas','Corumbá','Ponta Porã'],
  'Distrito Federal':    ['Brasília','Ceilândia','Taguatinga','Samambaia','Planaltina'],
  'Acre':                ['Rio Branco','Cruzeiro do Sul','Sena Madureira','Tarauacá','Feijó'],
  'Amazonas':            ['Manaus','Parintins','Itacoatiara','Manacapuru','Coari'],
  'Roraima':             ['Boa Vista','Caracaraí','Rorainópolis','Mucajaí','Alto Alegre'],
  'Rondônia':            ['Porto Velho','Ji-Paraná','Ariquemes','Cacoal','Vilhena'],
  'Pará':                ['Belém','Ananindeua','Santarém','Marabá','Castanhal'],
  'Amapá':               ['Macapá','Santana','Laranjal do Jari','Oiapoque','Mazagão'],
  'Tocantins':           ['Palmas','Araguaína','Gurupi','Porto Nacional','Paraíso do Tocantins'],
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

export default function SidebarLeft({ onApplyFilters }) {
  const [filters, setFilters] = useState({
    region: 'Todos',
    state: 'Todos',
    municipality: 'Todos',
    biome: 'Todos',
    year: '2026',
    month: 'Todos',
    energySource: 'Todas',
    curtailmentLevel: 'Todos',
    landCover: 'Todas',
  });

  const [availableStates, setAvailableStates]         = useState(Object.values(REGIOES).flat().sort());
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);

  useEffect(() => {
    if (filters.region === 'Todos') {
      setAvailableStates(Object.values(REGIOES).flat().sort());
    } else {
      setAvailableStates(REGIOES[filters.region] || []);
    }
    setFilters(prev => ({ ...prev, state: 'Todos', municipality: 'Todos' }));
  }, [filters.region]);

  useEffect(() => {
    if (filters.state === 'Todos') {
      setAvailableMunicipalities([]);
    } else {
      setAvailableMunicipalities(MUNICIPIOS_POR_ESTADO[filters.state] || []);
    }
    setFilters(prev => ({ ...prev, municipality: 'Todos' }));
  }, [filters.state]);

  const update = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleApply = () => {
    onApplyFilters?.(filters);
  };

  const handleClear = () => {
    setFilters({
      region: 'Todos', state: 'Todos', municipality: 'Todos',
      biome: 'Todos', year: '2026', month: 'Todos',
      energySource: 'Todas', curtailmentLevel: 'Todos', landCover: 'Todas',
    });
    // Aplica imediatamente o clear
    onApplyFilters?.({
      region: 'Todos', state: 'Todos', municipality: 'Todos',
    });
  };

  return (
    <aside className="panel-left">
      <div className="panel-header">
        <div className="panel-header-row">
          <SlidersHorizontal size={16} />
          <span className="panel-title">Filtros</span>
          <p className="panel-subtitle">Refine sua análise territorial</p>
        </div>
      </div>

      <div className="panel-scroll">
        <div className="panel-content">
          <FilterSelect label="Região" value={filters.region}
            options={['Todos', ...Object.keys(REGIOES).filter(r => r !== 'Todos')]}
            onChange={(v) => update('region', v)} />

          <FilterSelect label="Estado" value={filters.state}
            options={['Todos', ...availableStates]}
            onChange={(v) => update('state', v)}
            disabled={availableStates.length === 0} />

          <FilterSelect label="Município" value={filters.municipality}
            options={availableMunicipalities.length ? ['Todos', ...availableMunicipalities] : ['Todos']}
            onChange={(v) => update('municipality', v)}
            disabled={availableMunicipalities.length === 0} />

          <FilterSelect label="Bioma" value={filters.biome}
            options={['Todos','Amazônia','Caatinga','Cerrado','Mata Atlântica','Pampa','Pantanal']}
            onChange={(v) => update('biome', v)} />

          <FilterSelect label="Ano" value={filters.year}
            options={['2026','2025','2024','2023','2022']}
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

      <div className="panel-footer">
        <button className="btn-primary" onClick={handleApply}>Aplicar Filtros</button>
        <button className="btn-ghost" onClick={handleClear}>Limpar Filtros</button>
      </div>
    </aside>
  );
}