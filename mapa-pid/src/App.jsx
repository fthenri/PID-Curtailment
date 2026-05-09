// src/App.jsx
import Map from './components/Map';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import './App.css';

function App() {
  return (
    <div className="layout">
      {/* O container do mapa agora envolve o componente para garantir o posicionamento */}
      <div className="map-container">
        <Map />
      </div>
      
      <SidebarLeft />
      <SidebarRight />
    </div>
  );
}

export default App;