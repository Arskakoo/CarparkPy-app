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
import React, { useEffect, useState } from "react";

const ParkSelect = () => {
  const [data, setData] = useState({ places: [] });
  const [selectedParkId, setSelectedParkId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((fetchedData) => {
        const parks = fetchedData.ParkingLot.map((item) => ({
          id: item.id,
          name: item.name,
          location: item.location,
          occupied_spots: item.occupied_spots,
          unoccupied_spots: item.unoccupied_spots,
          timestamp: item.timestamp,
        }));
        setData({ places: parks });
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleSelectChange = (id) => {
    setSelectedParkId(id);
    console.log("Selected Park ID:", id);
  };

  const selectedPark =
    data.places &&
    data.places.find((place) => place.id === parseInt(selectedParkId, 10));

  const fetchImage = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/photo?id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch the image");
      }

      const imageBlob = await response.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setImageUrl(imageObjectURL);
    } catch (error) {
      console.error("Error fetching image:", error);
      setError("Failed to load the image");
    }
  };

  useEffect(() => {
    if (selectedParkId) {
      fetchImage(selectedParkId);
    }
  }, [selectedParkId]);

  return (
    <div className="w-full mt-36 flex-grow">
      <div className="m-auto justify-auto flex text-center h-full lg:w-[20%] md-[0%] sm:w-[40%] flex-col">
        <p className="p-4 font-bold text-2xl">
          Tarkista <span className="text-blue-500">parkkipaikka</span>
        </p>

        {loading ? (
          <p>Ladataan...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Select value={selectedParkId} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tarkistettava parkkipaikka" />
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
                  {imageUrl ? (
                    <div className="w-full flex justify-center mt-4">
                      <img
                        src={imageUrl}
                        alt={`Image of ${selectedPark.name}`}
                        className="rounded-lg max-w-full h-auto"
                      />
                    </div>
                  ) : (
                    <p>Loading image...</p>
                  )}
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
