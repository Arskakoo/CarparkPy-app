import React, { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  Tooltip,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "./ui/chart";
import { CardHeader, CardTitle, CardDescription } from "./ui/card";

const chartConfig = {
  occupied: {
    label: "Varattuja Paikkoja",
  },
};

const ParkCharts = () => {
  const [chartData, setChartData] = useState([]);
  const [maxOccupied, setMaxOccupied] = useState(null);
  const [avgOccupied, setAvgOccupied] = useState(0);
  const [loading, setLoading] = useState(true);

  const formatDay = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("fi-FI", { weekday: "short" }).format(date);
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/stats");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        if (data.length === 0) {
          setLoading(false);
          return;
        }

        const processedData = data.map((entry) => ({
          timestamp: formatDay(entry.timestamp),
          occupied: entry.occupied_spots,
        }));

        const groupedData = processedData.reduce((acc, curr) => {
          const day = curr.timestamp;
          if (!acc[day]) {
            acc[day] = { totalOccupied: 0, count: 0, maxOccupied: 0 };
          }
          acc[day].totalOccupied += curr.occupied;
          acc[day].count += 1;
          acc[day].maxOccupied = Math.max(acc[day].maxOccupied, curr.occupied);
          return acc;
        }, {});

        const totalOccupiedData = Object.keys(groupedData).map((day) => {
          const { totalOccupied, count, maxOccupied } = groupedData[day];
          return {
            timestamp: day,
            occupied: maxOccupied,
            avgOccupied: totalOccupied / count,
          };
        });

        // Define the order of the days
        const dayOrder = ["ma", "ti", "ke", "to", "pe", "la", "su"];

        // Sort the data based on the defined order
        const sortedData = totalOccupiedData.sort((a, b) => {
          return dayOrder.indexOf(a.timestamp) - dayOrder.indexOf(b.timestamp);
        });

        const maxDay = sortedData.reduce((prev, current) =>
          prev.occupied > current.occupied ? prev : current
        );

        setMaxOccupied(maxDay);
        const totalOccupiedSum = sortedData.reduce(
          (sum, entry) => sum + entry.occupied,
          0
        );
        const averageOccupied = totalOccupiedSum / sortedData.length;
        setAvgOccupied(averageOccupied);

        setChartData(sortedData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { timestamp, occupied, avgOccupied } = payload[0].payload;
      return (
        <div className="p-2">
          <p className="font-bold">{`${timestamp}`}</p>
          <p>{`Varattuja paikkoja: ${occupied}`}</p>
          <p>{`Keskimäärä varattuja paikkoja: ${avgOccupied.toFixed(0)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer config={chartConfig} className="w-5/12">
      <CardHeader>
        <CardTitle>Tilasto</CardTitle>
        <CardDescription>Viikontiedot</CardDescription>
      </CardHeader>

      {loading ? (
        <p className="font-semibold p-6 text-xl flex flex-col">
          Tietoja ei ole vielä saatavilla.{" "}
          <span className="text-red-500/70 text-sm">
            Odota että tiedot saapuvat!
          </span>
        </p>
      ) : chartData.length === 0 ? (
        <p className="font-semibold p-6 text-xl flex flex-col">
          Tietoja ei ole saatavilla.{" "}
          <span className="text-red-500/70 text-sm">Tarkista myöhemmin!</span>
        </p>
      ) : (
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="occupied"
            className="fill-blue-500 hover:fill-indigo-700 transition-all"
            radius={5}
          >
            <LabelList
              position="top"
              offset={10}
              fontSize={12}
              valueAccessor={(entry) => entry.occupied}
            />
          </Bar>
        </BarChart>
      )}
    </ChartContainer>
  );
};

export default ParkCharts;
