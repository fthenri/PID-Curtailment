// src/components/SidebarRight.jsx
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { BarChart3, Maximize2, Download, Share2, X, Zap, Leaf, TrendingUp } from 'lucide-react';

/* ── Dados estáticos ── */
const curtailmentData = [
  { month: 'Jan', disponivel: 100, utilizado: 72 },
  { month: 'Fev', disponivel: 100, utilizado: 68 },
  { month: 'Mar', disponivel: 100, utilizado: 75 },
  { month: 'Abr', disponivel: 100, utilizado: 70 },
  { month: 'Mai', disponivel: 100, utilizado: 72 },
  { month: 'Jun', disponivel: 100, utilizado: 74 },
];

const landCoverData = [
  { name: 'Área Agrícola', curtailment: 42, color: '#F89069' },
  { name: 'Pastagem',      curtailment: 28, color: '#4D4E03' },
  { name: 'Floresta',      curtailment: 18, color: '#BECCCC' },
  { name: 'Área Urbana',   curtailment: 12, color: '#B5446E' },
];

const opportunityData = [
  { quarter: 'T1 2026', potencial: 45 },
  { quarter: 'T2 2026', potencial: 58 },
  { quarter: 'T3 2026', potencial: 72 },
  { quarter: 'T4 2026', potencial: 85 },
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#fff',
    border: '1px solid #E5E4E7',
    borderRadius: 8,
    fontSize: 13,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
};

/* ── Componente InsightCard ── */
function InsightCard({ cardId, title, subtitle, preview, children, onExpand, onDownload, onShare }) {
  return (
    <div className="insight-card">
      <div className="insight-card-header">
        <div className="insight-card-titles">
          <div className="insight-card-title">{title}</div>
          <div className="insight-card-subtitle">{subtitle}</div>
        </div>
        <div className="insight-card-actions">
          <button className="icon-btn" title="Expandir" onClick={() => onExpand(cardId)}>
            <Maximize2 size={14} />
          </button>
          <button className="icon-btn" title="Baixar" onClick={() => onDownload(cardId)}>
            <Download size={14} />
          </button>
          <button className="icon-btn" title="Compartilhar" onClick={() => onShare(cardId)}>
            <Share2 size={14} />
          </button>
        </div>
      </div>

      <div className="insight-preview">
        <p>{preview}</p>
        <button className="insight-preview-link" onClick={() => onExpand(cardId)}>
          Ver mais
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {children}
    </div>
  );
}

/* ── Modal expandido ── */
function ExpandedModal({ cardId, regionName, onClose }) {
  const contents = {
    'energy-unused': {
      title: 'Energia Não Utilizada',
      subtitle: 'Evolução mensal',
      metrics: [
        { label: 'Curtailment médio', value: '28%', color: '#DC2626' },
        { label: 'Pico de curtailment', value: '32% (Fev)', color: '#03254D' },
        { label: 'Energia desperdiçada/mês', value: '1.2 GWh', color: 'var(--title-color)' },
      ],
      summary: `Em ${regionName}, observa-se curtailment médio de 28% no semestre, com pico em fevereiro (32%). Aproximadamente 1.2 GWh mensais não são aproveitados.`,
      chart: (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={curtailmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E7" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B6375' }} axisLine={{ stroke: '#E5E4E7' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6B6375' }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(250,68,26,0.05)' }} />
            <Bar dataKey="disponivel" fill="#E5E4E7" radius={[4,4,0,0]} name="Disponível" />
            <Bar dataKey="utilizado" fill="#FA441A" radius={[4,4,0,0]} name="Utilizado" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    'territorial-context': {
      title: 'Contexto Territorial de Curtailment',
      subtitle: 'Curtailment por tipo de cobertura',
      metrics: [
        { label: 'Área predominante', value: 'Agrícola (42%)', color: '#03254D' },
        { label: 'Maior oportunidade', value: 'Integração agro-solar', color: '#03254D' },
        { label: 'Menor curtailment', value: 'Área urbana (12%)', color: '#03254D' },
      ],
      summary: `O curtailment em ${regionName} concentra-se em áreas agrícolas (42%), seguido por pastagens (28%). Floresta: 18%, Urbano: 12%.`,
      chart: (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={landCoverData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
              paddingAngle={3} dataKey="curtailment">
              {landCoverData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    'economic-opportunity': {
      title: 'Oportunidade Econômica',
      subtitle: 'Projeção de potencial',
      metrics: [
        { label: 'Retorno anual estimado', value: 'R$ 2,4M', color: '#059669' },
        { label: 'Crescimento projetado', value: '+89% (ano)', color: '#059669' },
        { label: 'Payback estimado', value: '3.2 anos', color: 'var(--title-color)' },
      ],
      summary: `Aproveitamento integral da energia perdida em ${regionName} representa R$ 2,4M anuais com crescimento de 89% ao longo de 2026. Payback de 3.2 anos.`,
      chart: (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={opportunityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradModal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#FA441A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FA441A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E7" vertical={false} />
            <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#6B6375' }} axisLine={{ stroke: '#E5E4E7' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6B6375' }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="potencial" stroke="#FA441A" strokeWidth={2.5}
              fill="url(#gradModal)" name="Potencial" />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
  };

  const c = contents[cardId];
  if (!c) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          maxWidth: 580, width: '100%', maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        {/* header modal */}
        <div style={{
          position: 'sticky', top: 0, backgroundColor: '#fff',
          borderBottom: '1px solid var(--border)', padding: '20px 24px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--title-color)' }}>{c.title}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--subtitle-color)', marginTop: 2 }}>{c.subtitle}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--brand-primary)', fontWeight: 500, marginTop: 2 }}>{regionName}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px 28px' }}>
          {c.chart}

          {/* métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, margin: '18px 0' }}>
            {c.metrics.map((m, i) => (
              <div key={i} style={{ backgroundColor: 'var(--bg-soft-dark)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: '0.73rem', color: 'var(--subtitle-color)' }}>{m.label}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 600, color: m.color, marginTop: 4 }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* resumo */}
          <div style={{ backgroundColor: 'var(--bg-soft-dark)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--title-color)', marginBottom: 6 }}>Análise</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--subtitle-color)', lineHeight: 1.6 }}>{c.summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ── */
export default function SidebarRight({ selectedRegion = 'Pernambuco' }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <aside className="panel-right">
      {/* Cabeçalho */}
      <div className="panel-header">
        <div className="panel-header-row">
          <BarChart3 size={16} />
          <span className="panel-title">Análise Regional</span>
          <p className="panel-subtitle">{selectedRegion}</p>
        </div>
      </div>

      <div className="panel-scroll">
        <div className="panel-content">

          {/* Card 1 — Energia Não Utilizada */}
          <InsightCard
            cardId="energy-unused"
            title="Energia Não Utilizada"
            subtitle="Evolução mensal"
            preview="Curtailment médio de 28% ao longo do semestre, com pico em fevereiro (32%). Aproximadamente 1.2 GWh mensais de energia não aproveitada."
            onExpand={setExpanded}
            onDownload={() => {}}
            onShare={() => {}}
          >
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={curtailmentData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B6375' }} axisLine={{ stroke: '#E5E4E7' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B6375' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(250,68,26,0.05)' }} />
                <Bar dataKey="disponivel" fill="#E5E4E7" radius={[3,3,0,0]} name="Disponível" />
                <Bar dataKey="utilizado" fill="#FA441A" radius={[3,3,0,0]} name="Utilizado" />
              </BarChart>
            </ResponsiveContainer>
            <div className="insight-metric-box">
              <div className="insight-metric-label">Curtailment médio</div>
              <div className="insight-metric-value" style={{ color: '#DC2626' }}>28%</div>
              <div className="insight-metric-desc">da energia disponível não aproveitada</div>
            </div>
          </InsightCard>

          {/* Card 2 — Contexto Territorial */}
          <InsightCard
            cardId="territorial-context"
            title="Contexto Territorial"
            subtitle="Curtailment por tipo de cobertura"
            preview="Maior incidência em áreas agrícolas (42%), seguido por pastagens (28%). Oportunidade para sistemas híbridos agro-solares."
            onExpand={setExpanded}
            onDownload={() => {}}
            onShare={() => {}}
          >
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={landCoverData} cx="50%" cy="50%" innerRadius={38} outerRadius={54}
                  paddingAngle={3} dataKey="curtailment">
                  {landCoverData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {landCoverData.map((item) => (
                <div key={item.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 6px', borderRadius: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--title-color)' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--title-color)' }}>{item.curtailment}%</span>
                </div>
              ))}
            </div>
          </InsightCard>

          {/* Card 3 — Oportunidade Econômica */}
          <InsightCard
            cardId="economic-opportunity"
            title="Oportunidade Econômica"
            subtitle="Projeção de potencial"
            preview="Retorno estimado de R$ 2,4M anuais com crescimento de 89% ao longo de 2026. Payback de 3.2 anos torna o investimento atrativo."
            onExpand={setExpanded}
            onDownload={() => {}}
            onShare={() => {}}
          >
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={opportunityData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradOpp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FA441A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FA441A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E7" vertical={false} />
                <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: '#6B6375' }} axisLine={{ stroke: '#E5E4E7' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B6375' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="potencial" stroke="#FA441A" strokeWidth={2}
                  fill="url(#gradOpp)" name="Potencial" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="insight-metric-box">
              <div className="insight-metric-label">Retorno estimado anual</div>
              <div className="insight-metric-value" style={{ color: '#059669' }}>R$ 2,4M</div>
              <div className="insight-metric-desc">com aproveitamento integral da energia</div>
            </div>
          </InsightCard>

        </div>
      </div>

      {/* Modal expandido */}
      {expanded && (
        <ExpandedModal
          cardId={expanded}
          regionName={selectedRegion}
          onClose={() => setExpanded(null)}
        />
      )}
    </aside>
  );
}