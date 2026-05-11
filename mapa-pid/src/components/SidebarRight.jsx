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
    fontSize: 12,
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
          <button className="icon-btn" onClick={() => onExpand(cardId)}><Maximize2 size={14} /></button>
          <button className="icon-btn"><Download size={14} /></button>
          <button className="icon-btn"><Share2 size={14} /></button>
        </div>
      </div>
      <div className="insight-preview"><p>{preview}</p></div>
      {children}
    </div>
  );
}

export default function SidebarRight({ selectedRegion = 'Pernambuco' }) {
  const [expanded, setExpanded] = useState(null);
  const [rankingData, setRankingData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  
  // Valores padrão para garantir a renderização inicial do gráfico
  const [donutData, setDonutData] = useState([
    { name: 'Capacidade Útil', value: 75, color: '#03254D' },
    { name: 'Ociosidade', value: 25, color: '#FA441A' }
  ]);

  useEffect(() => {
    fetch('/mapa_calor_municipios.geojson')
      .then(res => res.json())
      .then(data => {
        const sorted = data.features
          .map(f => ({ name: f.properties.NM_MUN, value: parseFloat(f.properties.curtailment_final) || 0 }))
          .sort((a, b) => b.value - a.value).slice(0, 5);
        setRankingData(sorted);
      });

    fetch('/Base_Dados_Consolidada_Mapa.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split('\n').slice(1);
        let totalCap = 0;
        let totalSobra = 0;
        rows.forEach(row => {
          const cols = row.split(/[,;]/); // Suporte para vírgula ou ponto e vírgula
          if (cols.length > 5) {
            totalCap += parseFloat(cols[4]) || 0; 
            totalSobra += parseFloat(cols[5]) || 0; 
          }
        });
        
        // Só atualiza se houver dados válidos no CSV
        if (totalCap > 0 || totalSobra > 0) {
          setDonutData([
            { name: 'Capacidade Útil', value: Math.max(0, totalCap - totalSobra), color: '#03254D' },
            { name: 'Ociosidade', value: totalSobra, color: '#FA441A' }
          ]);
        }
      });

    fetch('/fluxo_macro_subsistemas.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split('\n').slice(1).filter(r => r.trim());
        setHourlyData(rows.map((r, i) => ({
          hora: `${i % 24}h`,
          geracao: parseFloat(r.split(',')[2]) || 0
        })).slice(0, 24));
      });
  }, []);

  return (
    <aside className="panel-right">
      <div className="panel-header">
        <div className="panel-header-row">
          <BarChart3 size={16} />
          <span className="panel-title">Análise Regional</span>
        </div>
      </div>

      <div className="panel-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="panel-content" style={{ padding: '16px' }}>
          
          <InsightCard cardId="r" title="Municípios Críticos" subtitle="Top 5 Perdas" preview="Dados via GeoJSON" onExpand={setExpanded}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={rankingData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" fill="#FA441A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </InsightCard>

          <InsightCard cardId="d" title="Eficiência da Rede" subtitle="Mix de Capacidade" preview="Ociosidade Real" onExpand={setExpanded}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={donutData} innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={5}>
                  {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </InsightCard>

          <InsightCard cardId="h" title="Perfil Horário" subtitle="Geração vs Hora" preview="Pico de Abundância" onExpand={setExpanded}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hora" tick={{ fontSize: 9 }} interval={5} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="geracao" stroke="#03254D" fill="#03254D33" />
              </AreaChart>
            </ResponsiveContainer>
          </InsightCard>

        </div>
      </div>
    </aside>
  );
}