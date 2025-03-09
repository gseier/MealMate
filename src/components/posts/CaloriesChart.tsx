"use client";

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CaloriesChartProps {
  calories: number;
}

export function CaloriesChart({ calories }: { calories: number }) {
  console.log("Calories received:", calories); // Debugging log

  const maxCalories = 2200;
  const chartData = [{ name: "Calories", value: calories, fill: "hsl(var(--chart-2))" }];

  return (
    <Card className="flex flex-col items-center">
      <CardHeader className="items-center pb-0">
        <CardTitle>Calories</CardTitle>
        <CardDescription>Daily Intake</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {calories > 0 ? (
          <RadialBarChart
            width={250}
            height={250}
            cx="50%"
            cy="50%"
            innerRadius="80%"
            outerRadius="100%"
            barSize={10}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarGrid radialLines={false} stroke="none" />
            <RadialBar dataKey="value" maxBarSize={10} cornerRadius={10} background />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} />
          </RadialBarChart>
        ) : (
          <p>No Data</p> // If calories is 0, display a message
        )}
      </CardContent>
    </Card>
  );
}
