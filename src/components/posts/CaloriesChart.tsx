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
import { Leaf, Carrot, Sprout } from "lucide-react";

// --- constant term lists must be module‑scoped so they don't trigger the
// eslint‑plugin‑react‑hooks exhaustive‑deps rule inside hooks.
const meatTerms = [
  "beef",
  "pork",
  "chicken",
  "turkey",
  "lamb",
  "goat",
  "veal",
  "duck",
  "fish",
  "tuna",
  "salmon",
  "mackerel",
  "trout",
  "cod",
  "seabass",
  "squid",
  "shrimp",
  "prawn",
  "crab",
  "lobster",
  "liver",
];

const animalNonMeatTerms = [
  "milk",
  "cheese",
  "butter",
  "yogurt",
  "egg",
  "honey",
  "curd",
];

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
  // Aggregate nutritional totals *and* determine diet badges
  const {
    totalFat,
    totalProteins,
    totalCarbs,
    totalCalories,
    totalEmissions,
    isVegetarian,
    isVegan,
  } = React.useMemo(() => {
    let totalFat = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalCalories = 0;
    let totalEmissions = 0;

    let hasMeat = false;
    let hasAnimalProduct = false;

    foods.forEach(({ food, amount }) => {
      const foodInfo = foodsData.find(
        (f: any) => f.name.toLowerCase() === food.name.toLowerCase()
      );
      if (!foodInfo) return;

      const scale = amount / 100; // per‑100g basis

      totalFat += (foodInfo.fat / 10000) * scale;
      totalProteins += (foodInfo.proteins / 10000) * scale;
      totalCarbs += (foodInfo.carbohydrates / 10000) * scale;
      totalCalories += foodInfo.calories * 100 * scale;
      totalEmissions += (foodInfo.emission ?? 0) * scale;

      const lname = foodInfo.name.toLowerCase();
      if (meatTerms.some((term) => lname.includes(term))) {
        hasMeat = true;
      }
      if (
        animalNonMeatTerms.some((term) => lname.includes(term)) ||
        lname.includes("cheese")
      ) {
        hasAnimalProduct = true;
      }
    });

    const isVegan = !hasMeat && !hasAnimalProduct;
    const isVegetarian = !hasMeat && !isVegan; // veggie if no meat but some animal product

    return {
      totalFat,
      totalProteins,
      totalCarbs,
      totalCalories,
      totalEmissions,
      isVegetarian,
      isVegan,
    };
  }, [foods]);

  const chartData = [
    { nutrient: "Fat", value: totalFat, fill: "hsl(10, 70%, 50%)" },
    { nutrient: "Proteins", value: totalProteins, fill: "hsl(120, 70%, 50%)" },
    { nutrient: "Carbs", value: totalCarbs, fill: "hsl(220, 70%, 50%)" },
  ];

  return (
    <Card className="relative flex flex-col">
      {/* Diet & emission badges */}
      <div className="absolute right-3 top-3 flex gap-1">
        {isVegan && (
          <span className="flex items-center gap-1 rounded-full bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-700">
            <Sprout className="h-3 w-3" /> Vegan
          </span>
        )}
        {!isVegan && isVegetarian && (
          <span className="flex items-center gap-1 rounded-full bg-lime-600/10 px-2 py-0.5 text-xs font-medium text-lime-700">
            <Carrot className="h-3 w-3" /> Vegetarian
          </span>
        )}
        <span className="flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <Leaf className="h-3 w-3" /> {totalEmissions.toFixed(2)} kg CO₂e
        </span>
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