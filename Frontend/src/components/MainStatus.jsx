import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";

const MainStatus = () => {
  const [statusData, setStatusData] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [notifiedLots, setNotifiedLots] = useState(new Set());
  const [toastIds, setToastIds] = useState({});

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/lastupdate");
        const data = await response.json();
        setStatusData(data);

        if (data.length > 0) {
          const latestUpdate = new Date(data[0].last_update.replace(/ /g, "T"));
          setLastUpdateTime(latestUpdate.toISOString());
        }
      } catch (error) {
        console.error("Failed to fetch status data:", error);
      }
    };

    fetchStatusData();
    const interval = setInterval(fetchStatusData, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatus = (lastUpdate) => {
    const lastUpdateTime = new Date(lastUpdate.replace(/ /g, "T"));
    const timeDifference = Date.now() - lastUpdateTime.getTime();

    return timeDifference < 900000 ? "recent" : "over15";
  };

  useEffect(() => {
    statusData.forEach((lot) => {
      const status = getStatus(lot.last_update);
      if (status === "over15" && !notifiedLots.has(lot.name)) {
        const toastId = toast(
          () => (
            <p className="bg-white flex gap-3">
              <p className="bg-white mt-auto">
                <span className="material-symbols-rounded text-red-500/80 bg-white/0 p-1 rounded-md">
                  cloud_alert
                </span>
              </p>
              <p className="bg-white font-semibold">
                Tieto on vanhentunut kohteessa <br />
                <span className="font-bold bg-red-500/10 px-2 py-0.5 rounded-md text-red-400 break-normal">
                  {lot.name},
                </span>{" "}
                <span className="font-bold bg-white">Ota yhteys tukeen!</span>
              </p>
            </p>
          ),
          { duration: Infinity }
        );

        setToastIds((prev) => ({ ...prev, [lot.name]: toastId }));

        setNotifiedLots((prevNotified) => new Set(prevNotified.add(lot.name)));
      } else if (status === "recent" && notifiedLots.has(lot.name)) {
        const toastId = toastIds[lot.name];
        if (toastId) {
          toast.dismiss(toastId);
        }

        setNotifiedLots((prevNotified) => {
          const updatedNotified = new Set(prevNotified);
          updatedNotified.delete(lot.name);
          return updatedNotified;
        });
      }
    });
  }, [statusData, notifiedLots, toastIds]);

  return (
    <div className="p-6 select-none">
      <div className="border-b flex pb-10">
        <p className="font-bold text-2xl">Tila</p>
        <p className="ml-auto text-sm font-bold my-auto opacity-30">
          Versio 3.0
        </p>
      </div>

      <Toaster />
      {statusData.map((lot, index) => {
        const lotUpdateTime = new Date(lot.last_update.replace(/ /g, "T"));
        const status = getStatus(lot.last_update);

        return (
          <div key={index} className="border-b p-2 flex w-full font-semibold ">
            <div className="flex gap-4 w-fit">
              {status === "recent" ? (
                <span
                  class="material-symbols-rounded  text-green-500/80 "
                  title="Tiedot ovat päivtetty alle 15 minuuttia sitten"
                >
                  cloud_done
                </span>
              ) : (
                <span
                  class="material-symbols-rounded text-red-500/80 animate-pulse"
                  title="Tietoja ei ole päivitetty yli 15 minuuttiin"
                >
                  cloud_alert
                </span>
              )}
              <p className="m-auto font-bold flex gap-2">
                {lot.name}
                <p className="font-semibold">
                  {status === "recent"
                    ? "- Parkkipaikan tiedot ovat ajantasalla"
                    : "- Parkkipaikan tietoja ei ole päivitetty hetkeen, ota yhteyttä tukeen!"}
                </p>
              </p>
            </div>

            <div
              className="mt-2 ml-auto text-sm text-gray-500 flex gap-1 w-fit"
              title=""
            >
              <p className="font-bold text-black/80">Viimeisin päivitys:</p>
              {lotUpdateTime.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MainStatus;
