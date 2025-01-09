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
    <div>
      {/* Burger Menu Button for mobile */}
      <div className="burger-menu md:hidden" onClick={toggleMenu}>
        <span className="material-symbols-rounded">menu</span>
      </div>

      {/* Sidebar */}
      <div
        className={`sidebar select-none font-semibold md:block ${
          isMenuOpen ? fadeClass : "hidden"
        }`}
      >
        <div className="w-full mt-2">
          <div className="flex flex-col gap-1">
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
                <span className="my-auto text-sm bg-white/0 font-bold tracking-wide ">
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
                <span className="my-auto text-sm bg-white/0 font-bold tracking-wide ">
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
              <div className="w-full pr-24 pl-2 py-1.5 rounded-md flex gap-3">
                <span className="material-symbols-rounded bg-white/0">
                  bar_chart
                </span>
                <span className="my-auto text-sm bg-white/0 font-bold tracking-wide ">
                  Tilastot
                </span>
              </div>
            </div>

            <div className="bg-gray-200 w-full my-1 border-b"></div>

            <div
              onClick={() => handleClick(7)}
              className={`flex gap-1 transition-all cursor-pointer ${
                activeIndex === 7 ? "opacity-80" : "opacity-20"
              }`}
            >
              <div className="w-full pr-24 pl-2 py-1.5 rounded-md flex gap-3">
                <span className="material-symbols-rounded bg-white/0">
                  hard_drive
                </span>
                <span className="my-auto text-sm bg-white/0 font-bold tracking-wide ">
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
