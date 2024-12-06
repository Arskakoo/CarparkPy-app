import "./App.css";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import SideBar from "./components/SideBar";
import ParkSelect from "./components/ParkSelect";
import ParkCharts from "./components/ParkChart";
import ParkPeak from "./components/ParkPeak";
import Notification from "./components/Notification";
import MainStatus from "./components/MainStatus";

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
      <header className="flex text-md border-b -mt-3 ">
        <div>
          <p className="text-2xl font-bold">
            Carpark<span className="text-blue-500">Py</span>
          </p>
          <p className="-mt-1 text-sm text-gray-500/70 font-bold">Portal</p>
        </div>
        <p className="text-slate-500 font-bold ml-auto my-auto text-sm">
          Version: 1.0{" "}
        </p>
      </header>
      <main className="w-full h-screen flex">
        <div className="h-full w-1/7 flex hidden md:flex">
          <SideBar activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
          <div className="border-l w-0.5 py-10 h-full"></div>
        </div>

        <div className="h-screen w-full">
          {activeIndex === 0 && <ParkSelect />}
          {activeIndex === 1 && <ParkPeak />}
          {activeIndex === 2 && <ParkCharts />}
          {/* 7 - 9 */}
          {activeIndex === 7 && <MainStatus />}
          {activeIndex === 8 && <Notification />}
        </div>
      </main>

      <footer></footer>
    </div>
  );
}

export default App;
