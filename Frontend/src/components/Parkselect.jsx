import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const ParkSelect = () => {
  const [data, setData] = useState({ places: [] });
  const [selectedParkId, setSelectedParkId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const REFRESH_INTERVAL = 1000; // 1 second

  const fetchData = () => {
    fetch("http://127.0.0.1:5000/api/data")
      .then((response) => {
        console.log(response); // Tarkista, että palvelin vastaa oikein
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((fetchedData) => {
        if (fetchedData.ParkingLot) {
          setData({ places: fetchedData.ParkingLot });
        } else {
          throw new Error("Invalid data format");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, REFRESH_INTERVAL); // Set interval for refreshing data
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleSelectChange = (id) => {
    setSelectedParkId(id);
    console.log("Selected Park ID:", id);
  };

  const selectedPark =
    data.places &&
    data.places.find((place) => place.id === parseInt(selectedParkId, 10));

  return (
    <div className="w-full mt-36 flex-grow">
      <div className="m-auto justify-auto flex text-center h-full lg:w-[20%] md-[0%] sm:w-[40%] flex-col">
        <p className="p-4 font-bold text-2xl">
          Valitse <span className="text-blue-500">parkkipaikka</span>
        </p>

        {loading ? (
          <p>Ladataan...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Select value={selectedParkId} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Valitse parkkipaikka" />
            </SelectTrigger>
            <SelectContent className="bg-white/0">
              {data.places.map((place) => (
                <SelectItem
                  key={place.id}
                  value={place.id.toString()}
                  className="bg-white/0 font-bold"
                >
                  {place.name} -{" "}
                  <span className="text-slate-500">{place.location}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {selectedParkId && selectedPark && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-2">Näytä tilanne</Button>
            </DialogTrigger>
            <DialogContent className="select-none">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex text-blue-500">
                  {selectedPark.name}{" "}
                  <div className="ml-auto">
                    <p className="text-slate-500 text-sm px-2 pt-4">
                      {selectedPark.location}
                    </p>
                  </div>
                </DialogTitle>
                <hr className="my-2" />
                <DialogDescription className="flex font-semibold">
                  <div className="flex gap-10 m-auto text-center">
                    <p className="p-1 flex flex-col">
                      Vapaita paikkoja:{" "}
                      <span className="text-green-700 font-bold bg-green-400/10 p-3 text-2xl rounded-md">
                        {selectedPark.unoccupied_spots}
                      </span>
                    </p>
                    <p className="p-1 flex flex-col">
                      Varattuja paikkoja:{" "}
                      <span className="text-red-700 font-bold bg-red-400/10 p-3 text-2xl rounded-md">
                        {selectedPark.occupied_spots}
                      </span>
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ParkSelect;
