"use client";

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CaloriesChartProps {
  calories: number;
}

export function CaloriesChart({ calories }: CaloriesChartProps) {
  const maxCalories = 2200; // The daily goal
  const chartData = [{ name: "Calories", value: calories, fill: "hsl(var(--chart-2))" }];

  return (
    <Card className="flex flex-col items-center">
      <CardHeader className="items-center pb-0">
        <CardTitle>Calories</CardTitle>
        <CardDescription>Daily Intake</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={-270}
          innerRadius={80}
          outerRadius={110}
          barSize={10}
        >
          <PolarGrid gridType="circle" radialLines={false} stroke="none" polarRadius={[86, 74]} />
          <RadialBar dataKey="value" maxBarSize={10} cornerRadius={10} background />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
          </PolarRadiusAxis>
        </RadialBarChart>
      </CardContent>
    </Card>
  );
}
