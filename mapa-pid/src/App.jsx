import Map from './components/Map';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import './App.css';

function App() {
  return (
    <div className="layout">
      <Map /> 
      
      <SidebarLeft />
      <SidebarRight />
    </div>
  );
}

export default App;