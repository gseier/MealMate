"use client";

import React from "react";
import { PieChart, Pie, Label, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import foodsData from "@/data/foods.json";
import {
  Leaf,
  Sprout,
  Carrot,
  Fish,
  Info,
  ListOrdered,
} from "lucide-react";
import {
  Tooltip as UiTooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader as DialogHeaderUi,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/* -------------------------------------------------- */
/* types                                              */
/* -------------------------------------------------- */
export interface PostFoodItem {
  food: { id?: number | string; name: string };
  amount: number; // grams for this meal
}
interface CaloriesChartProps {
  foods: PostFoodItem[];
}

/* -------------------------------------------------- */
/* static term lists                                  */
/* -------------------------------------------------- */
const landMeatTerms = ["beef", "pork", "chicken", "turkey", "lamb"];
const fishTerms = ["fish", "salmon", "tuna", "cod", "shrimp", "prawn"];
const animalNonMeatTerms = ["milk", "cheese", "butter", "egg", "yogurt"];

/* -------------------------------------------------- */
/* helper components                                  */
/* -------------------------------------------------- */
const CustomTooltip = ({ active, payload }: any) =>
  active && payload?.length ? (
    <div className="rounded border bg-background px-2 py-1 text-xs shadow">
      {payload.map((e: any) => (
        <div key={e.name} style={{ color: e.fill }}>
          {e.name}: {Math.round(e.value)} g
        </div>
      ))}
    </div>
  ) : null;

const Pill = ({
  children,
  colorClass,
}: {
  children: React.ReactNode;
  colorClass: string;
}) => (
  <span
    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
  >
    {children}
  </span>
);

/* -------------------------------------------------- */
/* nutrition utils                                    */
/* -------------------------------------------------- */
interface NutrientTotals {
  [key: string]: number;
}

function aggregateNutrients(foods: PostFoodItem[]) {
  let totals: NutrientTotals = {};
  let totalWeight = 0;

  foods.forEach(({ food, amount }) => {
    const f = foodsData.find(
      (d: any) => d.name.toLowerCase() === food.name.toLowerCase(),
    );
    if (!f) return;
    totalWeight += amount;
    const scale = amount / 100; // foods.json nutrients are per 100 g

    // macros (already mg → convert first)
    totals["Fat"] = (totals["Fat"] ?? 0) + f.fat / 10000 * scale; // g
    totals["Proteins"] = (totals["Proteins"] ?? 0) + f.proteins / 10000 * scale; // g
    totals["Carbs"] = (totals["Carbs"] ?? 0) + f.carbohydrates / 10000 * scale; // g
    totals["Calories"] = (totals["Calories"] ?? 0) + f.calories * 100 * scale; // kcal

    // micronutrients
    Object.entries(f.nutrients ?? {}).forEach(([k, v]) => {
      totals[k] = (totals[k] ?? 0) + v * scale;
    });
  });

  const per100Factor = totalWeight ? 100 / totalWeight : 0;
  const per100g: NutrientTotals = {};
  Object.entries(totals).forEach(([k, v]) => {
    per100g[k] = v * per100Factor;
  });

  return { totals, per100g, totalWeight };
}

/* -------------------------------------------------- */
/* main component                                     */
/* -------------------------------------------------- */
export default function CaloriesChart({ foods }: CaloriesChartProps) {
  /* ------------ compute totals only once --------- */
  const {
    totalFat,
    totalProteins,
    totalCarbs,
    totalCalories,
    totalEmissions,
    dietTag,
  } = React.useMemo(() => {
    let totalFat = 0,
      totalProteins = 0,
      totalCarbs = 0,
      totalCalories = 0,
      totalEmissions = 0;

    let hasLandMeat = false,
      hasFish = false,
      hasAnimalProduct = false;

    foods.forEach(({ food, amount }) => {
      const f = foodsData.find(
        (d: any) => d.name.toLowerCase() === food.name.toLowerCase(),
      );
      if (!f) return;
      const scale = amount / 100;

      totalFat += (f.fat / 10000) * scale;
      totalProteins += (f.proteins / 10000) * scale;
      totalCarbs += (f.carbohydrates / 10000) * scale;
      totalCalories += f.calories * 100 * scale;
      totalEmissions += (f.emission ?? 0) * scale;

      const n = f.name.toLowerCase();
      if (landMeatTerms.some((t) => n.includes(t))) hasLandMeat = true;
      if (fishTerms.some((t) => n.includes(t))) hasFish = true;
      if (animalNonMeatTerms.some((t) => n.includes(t))) hasAnimalProduct = true;
    });

    let tag: "vegan" | "vegetarian" | "pescatarian" | null = null;
    if (!hasLandMeat) {
      tag = hasFish ? "pescatarian" : !hasAnimalProduct ? "vegan" : "vegetarian";
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

  const { totals: nutrientTotals, per100g: nutrientPer100g } = React.useMemo(
    () => aggregateNutrients(foods),
    [foods],
  );

  /* ------------ chart data ----------------------- */
  const chartData = [
    { nutrient: "Fat", value: totalFat, fill: "hsl(10 80% 55%)" },
    { nutrient: "Proteins", value: totalProteins, fill: "hsl(140 70% 45%)" },
    { nutrient: "Carbs", value: totalCarbs, fill: "hsl(220 70% 50%)" },
  ];

  /* ------------ diet pill ------------------------ */
  const DietPill = () => {
    if (!dietTag) return null;
    const props =
      dietTag === "vegan"
        ? { Icon: Sprout, cls: "bg-green-600/15 text-green-700", label: "Vegan" }
        : dietTag === "vegetarian"
        ? {
            Icon: Carrot,
            cls: "bg-lime-600/15 text-lime-700",
            label: "Vegetarian",
          }
        : {
            Icon: Fish,
            cls: "bg-sky-600/15 text-sky-700",
            label: "Pescatarian",
          };

    return (
      <Pill colorClass={props.cls}>
        <props.Icon className="h-3 w-3" /> {props.label}
      </Pill>
    );
  };

  /* ------------ nutrition label component -------- */
  const NutritionLabel = () => {
    const macroOrder = ["Calories", "Fat", "Proteins", "Carbs"];
    const micronutrients = Object.keys(nutrientTotals).filter(
      (k) => !macroOrder.includes(k),
    );
    micronutrients.sort();

    const renderRow = (name: string) => (
      <div key={name} className="grid grid-cols-3 border-b last:border-none">
        <span className="col-span-2 py-1 text-sm font-medium text-gray-800">
          {name}
        </span>
        <span className="py-1 text-right text-sm tabular-nums text-gray-800">
          {nutrientPer100g[name]?.toFixed(1)} / {nutrientTotals[name]?.toFixed(1)}
        </span>
      </div>
    );

    return (
      <div className="w-full rounded-md border-2 border-gray-800 bg-white p-4 shadow-lg">
        <h3 className="mb-2 text-center text-lg font-extrabold tracking-wide text-gray-900">
          Nutrition Facts
        </h3>
        <div className="mb-2 text-xs text-gray-600">per 100 g / total</div>
        <div className="border-t-4 border-gray-800" />
        {/* macro rows */}
        {macroOrder.map(renderRow)}
        <div className="my-1 border-t-4 border-gray-800" />
        {/* micronutrients */}
        {micronutrients.map(renderRow)}
      </div>
    );
  };

  /* ------------ render --------------------------- */
  return (
    <TooltipProvider delayDuration={120}>
      <Card>
        {/* header row */}
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div className="flex items-center gap-1 text-sm font-medium">
            Nutritional&nbsp;breakdown
            <UiTooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-snug">
                Grams of fat, protein and carbs for this meal. Emissions come
                from CarbonCloud and their Climatehub Public Database.
              </TooltipContent>
            </UiTooltip>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Nutrition label button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 border border-gray-300 bg-white/70 backdrop-blur hover:bg-white"
                >
                  <ListOrdered className="h-4 w-4" /> Nutrition&nbsp;label
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeaderUi>
                  <DialogTitle className="sr-only">Nutrition label</DialogTitle>
                  <DialogDescription className="sr-only">
                    Detailed nutritional information
                  </DialogDescription>
                </DialogHeaderUi>
                <NutritionLabel />
              </DialogContent>
            </Dialog>

            <Pill colorClass="bg-emerald-600/15 text-emerald-700">
              <Leaf className="h-3 w-3" /> {totalEmissions.toFixed(2)} kg&nbsp;
              CO₂e
            </Pill>
            <DietPill />
          </div>
        </CardHeader>

        {/* chart */}
        <CardContent className="pb-4">
          <ChartContainer
            config={{}}
            className="mx-auto aspect-square max-h-[240px]"
          >
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
                    const { cx, cy } = viewBox as { cx: number; cy: number };
                    if (cx == null || cy == null) return null;
                    return (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={cx}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {Math.round(totalCalories)}
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 22}
                          className="fill-muted-foreground text-xs"
                        >
                          kcal
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
