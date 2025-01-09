import "./App.css";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import SideBar from "./components/SideBar";
import ParkSelect from "./components/ParkSelect";
import ParkCharts from "./components/ParkChart";
import ParkPeak from "./components/ParkPeak";
import MainStatus from "./components/MainStatus";
import 'leaflet/dist/leaflet.css';
function App() {
  const [activeIndex, setActiveIndex] = useState(() => {
    const savedIndex = localStorage.getItem("activeTab");
    return savedIndex ? Number(savedIndex) : 0;
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeIndex);
  }, [activeIndex]);

  return (
    <div>
      <header className="flex text-md mx-3">
        <div>
          <p className="text-3xl font-bold text-black/80">
            Carpark<span className="text-blue-500">Py</span>
          </p>
        </div>
      </header>
      <main className="w-full h-screen flex ">
        <div className="h-full w-1/7 flex   md:flex ">
          <SideBar activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
        </div>

        <div className="h-screen w-full max-w-[76%]">
          {activeIndex === 0 && <ParkSelect />}
          {activeIndex === 1 && <ParkPeak />}
          {activeIndex === 2 && <ParkCharts />}
          {/* 7 - 9 */}
          {activeIndex === 7 && <MainStatus />}
        </div>
      </main>

      <footer></footer>
    </div>
  );
}

export default App;
