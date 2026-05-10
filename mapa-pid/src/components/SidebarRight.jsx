// src/components/SidebarRight.jsx
import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';
import { BarChart3, Landmark, TrendingUp, X, Maximize2, ChevronRight } from 'lucide-react';

// ── Paleta compartilhada ────────────────────────────────────────────────────
const C = {
  brand:   '#FA441A',
  navy:    '#03254D',
  teal:    '#9EAFB0',
  soft:    '#BECCCC',
  green:   '#059669',
  yellow:  '#F5F749',
  warn:    '#F89069',
  purple:  '#B5446E',
  dark:    '#550C18',
  border:  '#E5E4E7',
  text:    '#1a1a2e',
  sub:     '#6B6375',
  bg:      '#F7F8FA',
};

const TT = {
  contentStyle: {
    backgroundColor: '#fff', border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  cursor: { fill: 'rgba(250,68,26,0.04)' },
};

// ── Mock data — Governo ─────────────────────────────────────────────────────
const hourlyData = Array.from({ length: 24 }, (_, h) => ({
  hora: `${String(h).padStart(2, '0')}h`,
  solar: h >= 6 && h <= 18
    ? Math.round(Math.max(0, 80 * Math.sin(((h - 6) / 12) * Math.PI)) + Math.random() * 15)
    : 0,
  eolica: Math.round(20 + (h < 6 || h > 20 ? 35 : 10) + Math.random() * 10),
}));

const municipiosCriticos = [
  { mun: 'Petrolina',        curtailment: 312 },
  { mun: 'Mossoró',          curtailment: 278 },
  { mun: 'Juazeiro',         curtailment: 241 },
  { mun: 'Sobral',           curtailment: 198 },
  { mun: 'Caruaru',          curtailment: 172 },
  { mun: 'Campina Grande',   curtailment: 154 },
  { mun: 'Parnaíba',         curtailment: 131 },
  { mun: 'Pau dos Ferros',   curtailment: 118 },
  { mun: 'Salgueiro',        curtailment: 102 },
  { mun: 'Patos',            curtailment:  88 },
];

const fluxoData = [
  { rota: 'NE → SE',  valor: 1842, cor: C.brand },
  { rota: 'NE → N',   valor:  634, cor: C.navy },
  { rota: 'N → SE',   valor:  411, cor: C.teal },
  { rota: 'CO → SE',  valor:  295, cor: C.purple },
  { rota: 'S → SE',   valor:  183, cor: C.warn },
];

// ── Mock data — Investidor ──────────────────────────────────────────────────
const abundanciaData = [
  { mes: 'Jan', hidrica: 45, eolica: 120, solar: 210 },
  { mes: 'Fev', hidrica: 38, eolica: 145, solar: 195 },
  { mes: 'Mar', hidrica: 52, eolica: 132, solar: 230 },
  { mes: 'Abr', hidrica: 41, eolica: 118, solar: 248 },
  { mes: 'Mai', hidrica: 60, eolica: 155, solar: 265 },
  { mes: 'Jun', hidrica: 55, eolica: 168, solar: 220 },
];

const capacidadeData = [
  { name: 'Utilizada',  value: 62, color: C.navy },
  { name: 'Ociosa',     value: 38, color: C.brand },
];

// ── Sub-componentes ─────────────────────────────────────────────────────────

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '9px 6px', border: 'none', cursor: 'pointer',
        borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.18s',
        backgroundColor: active ? C.navy : 'transparent',
        color: active ? '#fff' : C.sub,
      }}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function SectionTitle({ children, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.text, letterSpacing: '0.01em' }}>
        {children}
      </span>
      {badge && (
        <span style={{
          fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px',
          borderRadius: 20, backgroundColor: `${C.brand}15`, color: C.brand,
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

function Insight({ text }) {
  return (
    <div style={{
      backgroundColor: `${C.navy}08`, borderLeft: `3px solid ${C.navy}`,
      borderRadius: '0 8px 8px 0', padding: '8px 12px', marginTop: 10,
    }}>
      <p style={{ fontSize: '0.73rem', color: C.navy, lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
        {text}
      </p>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 12,
      border: `1px solid ${C.border}`, padding: '14px 14px 12px',
      marginBottom: 12, ...style,
    }}>
      {children}
    </div>
  );
}

// ── Painel Governo ──────────────────────────────────────────────────────────
function PainelGoverno({ selectedRegion }) {
  const peakHour = hourlyData.reduce((max, d) =>
    (d.solar + d.eolica) > (max.solar + max.eolica) ? d : max, hourlyData[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* 1. Perfil Horário */}
      <Card>
        <SectionTitle badge="24h">Perfil Horário de Curtailment</SectionTitle>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={hourlyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="gSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.brand} stopOpacity={0.35} />
                <stop offset="95%" stopColor={C.brand} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gEolica" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.navy} stopOpacity={0.25} />
                <stop offset="95%" stopColor={C.navy} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="hora" tick={{ fontSize: 9, fill: C.sub }} tickLine={false}
              axisLine={{ stroke: C.border }} interval={3} />
            <YAxis tick={{ fontSize: 9, fill: C.sub }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Area type="monotone" dataKey="solar"  stroke={C.brand} strokeWidth={2}
              fill="url(#gSolar)"  name="Solar" />
            <Area type="monotone" dataKey="eolica" stroke={C.navy}  strokeWidth={2}
              fill="url(#gEolica)" name="Eólica" />
          </AreaChart>
        </ResponsiveContainer>
        {/* Legenda manual */}
        <div style={{ display: 'flex', gap: 14, marginTop: 6, justifyContent: 'flex-end' }}>
          {[['Solar', C.brand], ['Eólica', C.navy]].map(([l, c]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 20, height: 3, borderRadius: 2, backgroundColor: c }} />
              <span style={{ fontSize: '0.7rem', color: C.sub }}>{l}</span>
            </div>
          ))}
        </div>
        <Insight>
          {`Gargalo atinge pico às ${peakHour.hora}, puxado pela fonte Solar. Prioridade para sistemas BESS neste intervalo.`}
        </Insight>
      </Card>

      {/* 2. Ranking Municípios Críticos */}
      <Card>
        <SectionTitle badge="Top 10">Municípios Críticos</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {municipiosCriticos.map((d, i) => {
            const pct = Math.round((d.curtailment / municipiosCriticos[0].curtailment) * 100);
            return (
              <div key={d.mun} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, color: i < 3 ? C.brand : C.sub,
                  width: 16, textAlign: 'right', flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '0.72rem', color: C.text, width: 104, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.mun}
                </span>
                <div style={{ flex: 1, height: 6, backgroundColor: C.bg, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: 4,
                    backgroundColor: i < 3 ? C.brand : C.teal,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: C.text, width: 32, textAlign: 'right', flexShrink: 0 }}>
                  {d.curtailment}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 6, fontSize: '0.65rem', color: C.sub, textAlign: 'right' }}>
          curtailment_final (MWh)
        </div>
        <Insight>
          Estes 10 municípios exigem prioridade nos próximos leilões de linhas de transmissão.
        </Insight>
      </Card>

      {/* 3. Fluxo Inter-regional */}
      <Card>
        <SectionTitle badge="MWmed">Fluxo Inter-regional</SectionTitle>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={fluxoData} layout="vertical" margin={{ top: 0, right: 30, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 9, fill: C.sub }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="rota" tick={{ fontSize: 11, fill: C.text }} axisLine={false} tickLine={false} width={52} />
            <Tooltip {...TT} />
            <Bar dataKey="valor" radius={[0, 5, 5, 0]} name="MWmed">
              {fluxoData.map((d, i) => <Cell key={i} fill={d.cor} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <Insight>
          O subsistema Nordeste exportou 1.842 MWmed para o Sudeste — maior fluxo inter-regional do período.
        </Insight>
      </Card>
    </div>
  );
}

// ── Painel Investidor ───────────────────────────────────────────────────────
function PainelInvestidor({ selectedRegion }) {
  const totalMwh = abundanciaData.reduce((s, d) => s + d.hidrica + d.eolica + d.solar, 0);
  const capacidadeTotal = 480; // MW mock
  const ociosidadePico  = 182; // MW mock

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* KPI topo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Energia ociosa total', value: `${totalMwh} MWh`, color: C.brand },
          { label: 'Capacidade instalada', value: `${capacidadeTotal} MW`, color: C.navy },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            backgroundColor: '#fff', border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '10px 12px',
          }}>
            <div style={{ fontSize: '0.65rem', color: C.sub, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* 1. Mapa de calor — já existe no mapa central, aqui mostramos o resumo */}
      <Card>
        <SectionTitle badge="Zona de Oportunidade">Energia Ociosa por Fonte</SectionTitle>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={abundanciaData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: C.sub }} tickLine={false} axisLine={{ stroke: C.border }} />
            <YAxis tick={{ fontSize: 10, fill: C.sub }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Bar dataKey="solar"   stackId="a" fill={C.brand}  radius={[0,0,0,0]} name="Solar" />
            <Bar dataKey="eolica"  stackId="a" fill={C.navy}   radius={[0,0,0,0]} name="Eólica" />
            <Bar dataKey="hidrica" stackId="a" fill={C.teal}   radius={[4,4,0,0]} name="Hídrica" />
          </BarChart>
        </ResponsiveContainer>
        {/* Legenda */}
        <div style={{ display: 'flex', gap: 12, marginTop: 6, justifyContent: 'flex-end' }}>
          {[['Solar', C.brand], ['Eólica', C.navy], ['Hídrica', C.teal]].map(([l, c]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c }} />
              <span style={{ fontSize: '0.68rem', color: C.sub }}>{l}</span>
            </div>
          ))}
        </div>
        <Insight>
          {`${selectedRegion} teve ${totalMwh} MWh de energia limpa não despachada no período, com maior participação Solar.`}
        </Insight>
      </Card>

      {/* 2. Capacidade vs Ociosidade */}
      <Card>
        <SectionTitle>Capacidade vs. Ociosidade</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ResponsiveContainer width={110} height={110}>
            <PieChart>
              <Pie data={capacidadeData} cx="50%" cy="50%"
                innerRadius={32} outerRadius={50} paddingAngle={3} dataKey="value"
                startAngle={90} endAngle={-270}>
                {capacidadeData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {capacidadeData.map((d) => (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: '0.72rem', color: C.sub }}>{d.name}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: d.color }}>{d.value}%</span>
                </div>
                <div style={{ height: 5, backgroundColor: C.bg, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${d.value}%`, height: '100%', backgroundColor: d.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 4, padding: '6px 8px', backgroundColor: `${C.brand}10`, borderRadius: 7 }}>
              <span style={{ fontSize: '0.68rem', color: C.brand, fontWeight: 600 }}>
                Pico ocioso: {ociosidadePico} MW
              </span>
            </div>
          </div>
        </div>
        <Insight>
          {`A região possui ${capacidadeTotal} MW instalados. A ociosidade por curtailment atinge picos de ${ociosidadePico} MW — energia disponível para PPAs.`}
        </Insight>
      </Card>

      {/* 3. CTA Investidor */}
      <Card style={{ backgroundColor: C.navy, border: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
            Zona de Alta Oportunidade
          </span>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, margin: 0 }}>
            As áreas em destaque no mapa representam municípios com energia ociosa recorrente — 
            ideal para fábricas eletrointensivas, data centers ou produção de hidrogênio verde.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {['Data Centers', 'H₂ Verde', 'Indústria'].map((tag) => (
              <span key={tag} style={{
                fontSize: '0.65rem', fontWeight: 600, padding: '3px 9px',
                borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────────────
export default function SidebarRight({ selectedRegion = 'Brasil' }) {
  const [tab, setTab] = useState('governo');

  return (
    <aside className="panel-right">
      {/* Cabeçalho */}
      <div className="panel-header">
        <div className="panel-header-row">
          <BarChart3 size={16} />
          <span className="panel-title">Análise Regional</span>
          <p className="panel-subtitle" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedRegion}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 12px',
        borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg,
      }}>
        <TabBtn
          active={tab === 'governo'}
          onClick={() => setTab('governo')}
          icon={Landmark}
          label="Governo"
        />
        <TabBtn
          active={tab === 'investidor'}
          onClick={() => setTab('investidor')}
          icon={TrendingUp}
          label="Investidor"
        />
      </div>

      <div className="panel-scroll">
        <div className="panel-content">
          {tab === 'governo'
            ? <PainelGoverno selectedRegion={selectedRegion} />
            : <PainelInvestidor selectedRegion={selectedRegion} />
          }
        </div>
      </div>
    </aside>
  );
}