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
  const [loading, setLoading] = useState(true);
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("fi-FI", {
      hour: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/stats");
        const data = await response.json();
        if (data.length === 0) {
          setLoading(false);
          return;
        }

        const processedData = data.map((entry) => ({
          timestamp: formatTimestamp(entry.timestamp),
          occupied: entry.occupied_spots,
        }));

        const groupedData = processedData.reduce((acc, curr) => {
          const hour = curr.timestamp;
          if (!acc[hour]) {
            acc[hour] = { maxOccupied: 0 };
          }
          acc[hour].maxOccupied = Math.max(
            acc[hour].maxOccupied,
            curr.occupied
          );
          return acc;
        }, {});

        const totalOccupiedData = Object.keys(groupedData).map((hour) => ({
          timestamp: hour,
          occupied: groupedData[hour].maxOccupied,
        }));

        const maxHour = totalOccupiedData.reduce((prev, current) =>
          prev.occupied > current.occupied ? prev : current
        );

        setMaxOccupied(maxHour);
        const sortedData = totalOccupiedData.sort(
          (a, b) =>
            new Date(`1970-01-01T${a.timestamp}:00`) -
            new Date(`1970-01-01T${b.timestamp}:00`)
        );

        setChartData(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { timestamp, occupied } = payload[0].payload;
      return (
        <div className="rounded-2xl">
          <div className="text-md p-3 rounded-2xl">
            <p>{`${timestamp}:00`}</p>
            <p>{`Varattuja paikkoja: ${occupied}`}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <ChartContainer config={chartConfig} className="w-5/12">
      <div>
        <CardHeader>
          <CardTitle>Tilasto</CardTitle>
          <CardDescription>Viimeiset 24h</CardDescription>
          {maxOccupied && (
            <div>
              <p className="text-sm text-slate-600">
                Päivän ruuhkaisin aika: {maxOccupied.timestamp}:00
              </p>
            </div>
          )}
        </CardHeader>
      </div>

      {loading ? (
        <p className="font-semibold p-6 text-xl flex flex-col">
          Tietoja ei ole vielä saatavilla.{" "}
          <span className="text-red-500/70 text-sm">
            Odota että tiedot saapuvat!
          </span>
        </p>
      ) : chartData.length === 0 ? (
        <p className="font-semibold p-6 text-xl flex flex-col">
          Tietoja ei ole vielä saatavilla.{" "}
          <span className="text-red-500/70 text-sm">
            Odota että tiedot saapuvat!
          </span>
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
            tickFormatter={(value) => `${value}:00`}
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
