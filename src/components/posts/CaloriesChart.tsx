"use client";

import React from "react";
import { PieChart, Pie, Label, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import foodsData from "@/data/foods.json";
import { Leaf } from "lucide-react";

export interface PostFoodItem {
  food: {
    id?: number | string;
    name: string;
  };
  amount: number; // grams for this meal
}

interface CaloriesChartProps {
  foods: PostFoodItem[];
}

// Tooltip that appends "g" after each nutrient value
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded shadow">
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} style={{ color: entry.fill }}>
            {entry.name}: {Math.round(entry.value)}g
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CaloriesChart({ foods }: CaloriesChartProps) {
  // Aggregate totals (fat, protein, carbs, calories, emissions)
  const totals = React.useMemo(() => {
    let totalFat = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalCalories = 0;
    let totalEmissions = 0; // kg CO₂e

    foods.forEach(({ food, amount }) => {
      const foodInfo = foodsData.find(
        (f: any) => f.name.toLowerCase() === food.name.toLowerCase()
      );
      if (!foodInfo) return;
      const scale = amount / 100; // convert to per‑100 g basis

      totalFat += (foodInfo.fat / 10000) * scale;
      totalProteins += (foodInfo.proteins / 10000) * scale;
      totalCarbs += (foodInfo.carbohydrates / 10000) * scale;
      totalCalories += foodInfo.calories * 100 * scale;
      const emission = "emission" in foodInfo ? foodInfo.emission : 0;
      totalEmissions += emission * scale; // kg CO₂e
    });

    return { totalFat, totalProteins, totalCarbs, totalCalories, totalEmissions };
  }, [foods]);

  const { totalFat, totalProteins, totalCarbs, totalCalories, totalEmissions } = totals;

  const chartData = [
    { nutrient: "Fat", value: totalFat, fill: "hsl(10, 70%, 50%)" },
    { nutrient: "Proteins", value: totalProteins, fill: "hsl(120, 70%, 50%)" },
    { nutrient: "Carbs", value: totalCarbs, fill: "hsl(220, 70%, 50%)" },
  ];

  return (
    <Card className="relative flex flex-col">
      {/* Pretty CO₂ tag (top‑right) */}
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
        <Leaf className="h-3 w-3" />
        {totalEmissions.toFixed(2)} kg&nbsp;CO₂e
      </div>

      <CardHeader className="items-center pb-0">
        <CardTitle>Nutritional Breakdown</CardTitle>
        <CardDescription>Based on added foods</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer config={{}} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="nutrient"
              innerRadius={60}
              strokeWidth={5}
              isAnimationActive={false}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {Math.round(totalCalories)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Calories
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Fat, Proteins, Carbs &amp; total meal emissions
        </div>
      </CardFooter>
    </Card>
  );
}
