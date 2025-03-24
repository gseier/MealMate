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

export interface PostFoodItem {
  food: {
    id?: number | string;
    name: string;
  };
  amount: number;
}

interface CaloriesChartProps {
  foods: PostFoodItem[];
}

// Custom tooltip that appends "g" after each nutrient value
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

export function CaloriesChart({ foods }: CaloriesChartProps) {
  // Compute totals by looking up each food's nutritional info in foodsData.
  const totals = React.useMemo(() => {
    let totalFat = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalCalories = 0;

    foods.forEach(({ food, amount }) => {
      // Look up the full nutritional info for this food by name.
      const foodInfo = foodsData.find(
        (f: any) => f.name.toLowerCase() === food.name.toLowerCase()
      );
      if (!foodInfo) return; // if not found, skip it.
      const scale = amount / 100; // convert serving (grams) relative to per 100g values
      totalFat += (foodInfo.fat / 10000) * scale;
      totalProteins += (foodInfo.proteins / 10000) * scale;
      totalCarbs += (foodInfo.carbohydrates / 10000) * scale;
      totalCalories += (foodInfo.calories * 100) * scale;
    });

    return { totalFat, totalProteins, totalCarbs, totalCalories };
  }, [foods]);

  // Destructure totals for convenience.
  const { totalFat, totalProteins, totalCarbs, totalCalories } = totals;

  // Create chart data for the three segments with distinct colors.
  const chartData = [
    { nutrient: "Fat", value: totalFat, fill: "hsl(10, 70%, 50%)" },
    { nutrient: "Proteins", value: totalProteins, fill: "hsl(120, 70%, 50%)" },
    { nutrient: "Carbs", value: totalCarbs, fill: "hsl(220, 70%, 50%)" },
  ];

  return (
    <Card className="flex flex-col">
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
          Fat, Proteins, and Carbs breakdown
        </div>
      </CardFooter>
    </Card>
  );
}
