"use client";

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CaloriesChartProps {
  calories: number;
}

export function CaloriesChart({ calories }: CaloriesChartProps) {
  console.log("Calories received:", calories); // Debugging log

  const maxCalories = 2200; // The daily goal
  const percentage = (calories / maxCalories) * 100;
  
  const chartData = [
    { name: "Calories", value: calories, fill: "hsl(var(--chart-2))" }
  ];

  return (
    <Card className="flex flex-col items-center">
      <CardHeader className="items-center pb-0">
        <CardTitle>Calories</CardTitle>
        <CardDescription>Daily Intake</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
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
          endAngle={90 - (percentage * 3.6)} // Dynamically adjust based on percentage
        >
          <PolarGrid radialLines={false} stroke="none" />
          <RadialBar dataKey="value" maxBarSize={10} cornerRadius={10} background />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} />
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-4xl font-bold">
                      {calories.toLocaleString()}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                      / {maxCalories}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </RadialBarChart>
      </CardContent>
    </Card>
  );
}
