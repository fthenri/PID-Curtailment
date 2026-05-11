import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { BarChart3, Maximize2, Download, Share2 } from 'lucide-react';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#fff',
    border: '1px solid #E5E4E7',
    borderRadius: 8,
    fontSize: 13,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
};

function InsightCard({ cardId, title, subtitle, preview, children, onExpand }) {
  return (
    <div className="insight-card">
      <div className="insight-card-header">
        <div className="insight-card-titles">
          <div className="insight-card-title">{title}</div>
          <div className="insight-card-subtitle">{subtitle}</div>
        </div>
        <div className="insight-card-actions">
          <button className="icon-btn" onClick={() => onExpand(cardId)} title="Expandir">
            <Maximize2 size={14} />
          </button>
          <button className="icon-btn" title="Baixar"><Download size={14} /></button>
          <button className="icon-btn" title="Compartilhar"><Share2 size={14} /></button>
        </div>
      </div>
      <div className="insight-preview">
        <p>{preview}</p>
      </div>
      {children}
    </div>
  );
}

export default function SidebarRight({ selectedRegion = 'Pernambuco' }) {
  const [expanded, setExpanded] = useState(null);
  const [rankingData, setRankingData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    // 1. Ranking Real do seu GeoJSON
    fetch('/mapa_calor_municipios.geojson')
      .then(res => res.json())
      .then(data => {
        if (!data.features) return;
        const top5 = data.features
          .map(f => ({
            name: f.properties.NM_MUN,
            value: parseFloat(f.properties.curtailment_final) || 0
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        setRankingData(top5);
      });

    // 2. Perfil Horário do seu CSV
    fetch('/fluxo_macro_subsistemas.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split('\n').slice(1);
        const hourly = rows.filter(r => r.trim()).map((r, i) => ({
          hora: `${i % 24}h`,
          geracao: parseFloat(r.split(',')[2]) || 0
        })).slice(0, 24);
        setHourlyData(hourly);
      });
  }, []);

  const donutData = [
    { name: 'Capacidade Útil', value: 75, color: '#03254D' },
    { name: 'Ociosidade', value: 25, color: '#FA441A' }
  ];

  return (
    <aside className="panel-right">
      <div className="panel-header">
        <div className="panel-header-row">
          <BarChart3 size={16} />
          <span className="panel-title">Análise Regional</span>
          <p className="panel-subtitle">{selectedRegion}</p>
        </div>
      </div>

      <div className="panel-scroll">
        <div className="panel-content">
          
          {/* Gráfico 1 - Ranking de Municípios */}
          <InsightCard 
            cardId="ranking"
            title="Municípios Críticos"
            subtitle="Maiores perdas detectadas"
            preview={rankingData.length > 0 ? `Líder: ${rankingData[0].name}` : "Carregando dados..."}
            onExpand={setExpanded}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rankingData} layout="vertical" margin={{ left: 5, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E4E7" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 10, fill: '#03254D', fontWeight: 600 }} 
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" fill="#FA441A" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </InsightCard>

          {/* Gráfico 2 - Mix de Capacidade (Donut) */}
          <InsightCard 
            cardId="donut"
            title="Eficiência da Rede"
            subtitle="Capacidade vs Ociosidade"
            preview="25% de energia não aproveitada"
            onExpand={setExpanded}
          >
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={donutData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                  {donutData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </InsightCard>

          {/* Gráfico 3 - Perfil Horário */}
          <InsightCard 
            cardId="hourly"
            title="Perfil de Abundância"
            subtitle="Excedente por hora do dia"
            preview="Pico de geração excedente"
            onExpand={setExpanded}
          >
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorGer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#03254D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#03254D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E4E7" />
                <XAxis dataKey="hora" tick={{ fontSize: 10 }} interval={5} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="geracao" stroke="#03254D" strokeWidth={2} fill="url(#colorGer)" />
              </AreaChart>
            </ResponsiveContainer>
          </InsightCard>

        </div>
      </div>
    </aside>
  );
}