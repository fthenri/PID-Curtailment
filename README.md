# Mapa PID - Hackathon E+

> *"Transforme dados em decisões para acelerar a transição energética do Brasil."*

## TESTE NOSSO PROJETO:
> https://pid-curtailment.vercel.app/

## 📌 Sobre o Projeto
O Mapa PID é uma evolução da plataforma PID para uma ferramenta de inteligência geoespacial fluida e interativa. O projeto cruza dados de curtailment com a disponibilidade de vegetação nativa e recursos naturais, traduzindo dados complexos em mensagens-síntese para governos, investidores e usuários comuns. O objetivo é acelerar a tomada de decisão para a transição energética eliminando o processo manual de cruzamento de dados.

## 🚨 O Problema
Plataformas atuais funcionam como repositórios estáticos onde a informação de curtailment fica desconectada do contexto ambiental. Isso obriga o usuário a realizar downloads isolados e cruzar os dados manualmente em ferramentas externas. Essa "caça ao dado" gera atrito e atrasa a tomada de decisão.

## 💡 A Solução e Arquitetura da Interface
A plataforma opera em uma arquitetura de Tela Única, oferecendo uma jornada ativa:
* **Painel Esquerdo (Filtros):** Menu lateral com filtros dinâmicos de múltiplas camadas baseados na lógica de cruzamento (ex: disponibilidade de vegetação -> recursos naturais).
* **Centro (Exploração Geoespacial):** Mapa do Brasil interativo e responsivo que renderiza instantaneamente o mapa de calor da região.
* **Painel Direito (Dashboard e Downloads):** Geração de gráficos instantâneos com "mensagens-síntese" adaptadas para diferentes personas. Possui extração ágil para download direto em `.csv`, `.png` e `.svg`.

## 🛠️ Tecnologias Utilizadas (Tech Stack)

**Front-end**
* **React** (com Vite).
* **MapLibre GL JS**: Para renderizar o mapa interativo.
* **React Grid Layout**: Para o estúdio de relatórios dinâmicos.
* **Tremor / Recharts**: Para a visualização dos gráficos estatísticos.

**Dados e ETL**
* **Python (Pandas e GeoPandas)**: Processamento offline e limpeza dos dados brutos.
* **Fontes de Dados**: ONS, SIGA / ANEEL e MapBiomas.
* **Armazenamento**: `mapa_curtailment.geojson` (alimenta o mapa) e `Base_Dados_Consolidada_Mapa.csv` (alimenta os gráficos e estatísticas).

## 🚀 Como Executar o Projeto

1. Clone o repositório e acesse a pasta do frontend (`mapa-pid`):
```bash
git clone <url-do-repositorio>
cd mapa-pid
```
2. Instale as dependências:
```bash
npm install
```
3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
4. Acesse a aplicação no seu navegador padrão.
