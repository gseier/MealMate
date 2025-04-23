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
import { Leaf, Sprout, Carrot, Fish } from "lucide-react";

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

// ----- keyword lists (module scope so they never re‑create) -----
const landMeatTerms = [
  "beef",
  "pork",
  "chicken",
  "turkey",
  "lamb",
  "mutton",
  "veal",
  "bacon",
  "ham",
  "sausage",
];
const fishTerms = [
  "fish",
  "salmon",
  "tuna",
  "trout",
  "cod",
  "mackerel",
  "sardine",
  "herring",
  "seabass",
  "squid",
  "prawn",
  "shrimp",
  "lobster",
  "crab",
  "anchovy",
];
const animalNonMeatTerms = [
  "milk",
  "cheese",
  "butter",
  "egg",
  "yogurt",
  "curd",
  "cream",
  "whey",
];

// Custom tooltip appends "g" after each nutrient value
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

// ---------- main component ----------
export default function CaloriesChart({ foods }: CaloriesChartProps) {
  // Aggregate totals and inspect ingredients only once
  const {
    totalFat,
    totalProteins,
    totalCarbs,
    totalCalories,
    totalEmissions,
    dietTag,
  } = React.useMemo(() => {
    let totalFat = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalCalories = 0;
    let totalEmissions = 0; // kg CO₂e

    let hasLandMeat = false;
    let hasFish = false;
    let hasAnimalProduct = false;

    foods.forEach(({ food, amount }) => {
      const foodInfo = foodsData.find(
        (f: any) => f.name.toLowerCase() === food.name.toLowerCase()
      );
      if (!foodInfo) return;
      const scale = amount / 100;

      // nutrients totals
      totalFat += (foodInfo.fat / 10000) * scale;
      totalProteins += (foodInfo.proteins / 10000) * scale;
      totalCarbs += (foodInfo.carbohydrates / 10000) * scale;
      totalCalories += foodInfo.calories * 100 * scale;
      totalEmissions += (foodInfo.emission ?? 0) * scale;

      // diet tagging logic (name matching is enough for demo)
      const lname = foodInfo.name.toLowerCase();
      if (landMeatTerms.some((t) => lname.includes(t))) hasLandMeat = true;
      if (fishTerms.some((t) => lname.includes(t))) hasFish = true;
      if (animalNonMeatTerms.some((t) => lname.includes(t))) hasAnimalProduct = true;
    });

    let tag: "vegan" | "vegetarian" | "pescatarian" | null = null;
    if (!hasLandMeat) {
      if (hasFish) {
        tag = "pescatarian";
      } else if (!hasAnimalProduct) {
        tag = "vegan";
      } else {
        tag = "vegetarian";
      }
    }

    return {
      totalFat,
      totalProteins,
      totalCarbs,
      totalCalories,
      totalEmissions,
      dietTag: tag,
    };
  }, [foods]);

  const chartData = [
    { nutrient: "Fat", value: totalFat, fill: "hsl(10, 70%, 50%)" },
    { nutrient: "Proteins", value: totalProteins, fill: "hsl(120, 70%, 50%)" },
    { nutrient: "Carbs", value: totalCarbs, fill: "hsl(220, 70%, 50%)" },
  ];

  // Render diet badge if any
  const renderDietBadge = () => {
    if (!dietTag) return null;

    const commonClass =
      "flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium";

    switch (dietTag) {
      case "vegan":
        return (
          <div className={`${commonClass} text-green-700 bg-green-600/10`}>
            <Sprout className="h-3 w-3" /> Vegan
          </div>
        );
      case "vegetarian":
        return (
          <div className={`${commonClass} text-lime-700 bg-lime-600/10`}>
            <Carrot className="h-3 w-3" /> Vegetarian
          </div>
        );
      case "pescatarian":
        return (
          <div className={`${commonClass} text-sky-700 bg-sky-600/10`}>
            <Fish className="h-3 w-3" /> Pescatarian
          </div>
        );
    }
  };

  return (
    <Card className="relative flex flex-col">
      {/* badge stack */}
      <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
        {/* emission badge always shown */}
        <div className="flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <Leaf className="h-3 w-3" /> {totalEmissions.toFixed(2)} kg&nbsp;CO₂e
        </div>
        {renderDietBadge()}
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