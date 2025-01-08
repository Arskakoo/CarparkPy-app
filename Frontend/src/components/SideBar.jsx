import React, { useEffect } from "react";

const SideBar = ({ activeIndex, setActiveIndex }) => {
  useEffect(() => {
    if (activeIndex !== null) {
      localStorage.setItem("activeTab", activeIndex);
    }
  }, [activeIndex]);

  useEffect(() => {
    const savedIndex = localStorage.getItem("activeTab");
    if (savedIndex !== null) {
      setActiveIndex(Number(savedIndex));
    }
  }, [setActiveIndex]);

  const handleClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="mt-5 select-none font-semibold">
      <div className="w-full pr-5">
        <div className="flex flex-col gap-1">
          {/* Yks tabi suosittelen kopioimaan ja vaihtamaan id 3 eri kohtaan: hande ja 2 activeIndexiä...*/}
          <div
            onClick={() => handleClick(0)}
            className={`flex gap-1 transition-all cursor-pointer ${
              activeIndex === 0 ? "opacity-100" : "opacity-20"
            }`}
          >
            <div className="w-full pr-24 pl-2 py-1.5 rounded-md flex gap-2">
              <span className="material-symbols-rounded text-black/80 bg-white/0">
                local_parking
              </span>
              <span className="my-auto text-sm bg-white/0">Parkit</span>
            </div>
          </div>
          {/* ----------- */}

          <div
            onClick={() => handleClick(1)}
            className={`flex gap-1 transition-all cursor-pointer ${
              activeIndex === 1 ? "opacity-100" : "opacity-20"
            }`}
          >
            <div className="w-full pr-24  pl-2 py-1.5  rounded-md flex gap-2">
              <span className="material-symbols-rounded text-black/80 bg-white/0">
                visibility
              </span>
              <span className="my-auto text-sm bg-white/0">Tarkista</span>
            </div>
          </div>
          {/*  */}

          <div
            onClick={() => handleClick(2)}
            className={`flex gap-1 transition-all cursor-pointer ${
              activeIndex === 2 ? "opacity-100" : "opacity-20"
            }`}
          >
            <div className="w-full pr-24 pl-2 py-1.5  rounded-md flex gap-2">
              <span className="material-symbols-rounded text-black/80 bg-white/0">
                equalizer
              </span>
              <span className="my-auto text-sm bg-white/0">Tilastot</span>
            </div>
          </div>
          {/* -------- */}
          {/* Jakaja */}
          <div className="bg-gray-200 w-full my-5 border-b"></div>

          {/* tärkeimille tabeille varattu 7 - 9  */}
          <div
            onClick={() => handleClick(7)}
            className={`flex gap-1 transition-all cursor-pointer ${
              activeIndex === 7 ? "opacity-100" : "opacity-20"
            }`}
          >
            <div className="w-full pr-24 pl-2 py-1.5  rounded-md flex gap-2">
              <span className="material-symbols-rounded text-black/80 bg-white/0">
                database
              </span>
              <span className="my-auto text-sm bg-white/0">Tila</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
