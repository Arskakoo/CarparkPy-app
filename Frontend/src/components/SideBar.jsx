import React, { useEffect, useState } from "react";

const SideBar = ({ activeIndex, setActiveIndex }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fadeClass, setFadeClass] = useState("fade-in");

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    // mobile to right
    <div className="">
      <div className="burger-menu md:hidden mt-2" onClick={toggleMenu}>
        <span className="material-symbols-rounded">menu</span>
      </div>

      {/* Sidebar */}
      <div
        className={`sidebar select-none font-semibold md:block ${
          isMenuOpen ? fadeClass : "hidden"
        }`}
      >
        <div className="w-screen md:w-full mt-2 transition-all">
          <div className="flex flex-col md:mt-0 mt-7 gap-5 md:gap-1">
            <div
              onClick={() => handleClick(0)}
              className={`flex gap-1 transition-all cursor-pointer ${
                activeIndex === 0 ? "opacity-70" : "opacity-20"
              }`}
            >
              <div className="w-full pr-24 pl-2 py-1.5 rounded-md flex gap-3">
                <span className="material-symbols-rounded bg-white/0">
                  local_parking
                </span>
                <span className="my-auto text-sm bg-white/0 font-bold tracking-wide" onClick={toggleMenu}>
                  Parkit
                </span>
              </div>
            </div>

            <div
              onClick={() => handleClick(1)}
              className={`flex gap-1 transition-all cursor-pointer ${
                activeIndex === 1 ? "opacity-70 " : "opacity-20"
              }`}
            >
              <div className="w-full pr-24 pl-2 py-1.5 rounded-md flex gap-3">
                <span className="material-symbols-rounded bg-white/0">
                  camera_video
                </span>
                <span className="my-auto text-sm bg-white/0 font-bold tracking-wide" onClick={toggleMenu}>
                  Tarkista
                </span>
              </div>
            </div>

            <div
              onClick={() => handleClick(2)}
              className={`flex gap-1 transition-all cursor-pointer ${
                activeIndex === 2 ? "opacity-80" : "opacity-20"
              }`}
            >
              <div className="w-full pr-24 pl-2 py-1.5 rounded-md md:flex hidden gap-3">
                <span className="material-symbols-rounded bg-white/0">
                  bar_chart
                </span>
                <span className="my-auto text-sm bg-white/0 font-bold tracking-wide" onClick={toggleMenu}>
                  Tilastot
                </span>
              </div>
            </div>

            <div className="bg-gray-200 w-full hidden md:flex my-1 border-b"></div>

            <div
              onClick={() => handleClick(7)}
              className={`flex gap-1 transition-all cursor-pointer ${
                activeIndex === 7 ? "opacity-80" : "opacity-20"
              }`}
            >
              <div className="w-full pr-24 pl-2 py-1.5 rounded-md md:flex gap-3 hidden">
                <span className="material-symbols-rounded bg-white/0">
                  hard_drive
                </span>
                <span className="my-auto text-sm bg-white/0 font-bold tracking-wide" onClick={toggleMenu}>
                  Tila
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
