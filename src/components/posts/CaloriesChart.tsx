"use client";

import React from "react";
import { PieChart, Pie, Label, Tooltip as ReTooltip } from "recharts";
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
import clsx from "clsx";

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

/* nutrient categories & helpers -------------------- */
const vitaminSet = new Set([
  "Vitamin A",
  "Vitamin B1",
  "Vitamin B2",
  "Vitamin B3",
  "Vitamin B5",
  "Vitamin B6",
  "Vitamin B7",
  "Vitamin B9",
  "Vitamin B12",
  "Vitamin C",
  "Vitamin D",
  "Vitamin E",
  "Vitamin K",
  "Choline",
]);

const mineralSet = new Set([
  "Calcium",
  "Chloride",
  "Chromium",
  "Copper",
  "Iodine",
  "Iron",
  "Magnesium",
  "Manganese",
  "Molybdenum",
  "Phosphorus",
  "Potassium",
  "Selenium",
  "Sodium",
  "Zinc",
]);

const essentialAminoSet = new Set([
  "Histidine",
  "Isoleucine",
  "Leucine",
  "Lysine",
  "Methionine",
  "Phenylalanine",
  "Threonine",
  "Tryptophan",
  "Valine",
]);

const essentialFattySet = new Set(["α-Linolenic acid", "Linoleic acid"]);

/* -------------------------------------------------- */
/* conversion map (data fix)                          */
/* -------------------------------------------------- */
const multiplyMap: Record<string, number> = {
  "Vitamin B1": 100,
  "Vitamin B7": 100,
  "Vitamin B9": 100,
  "Vitamin B12": 100,
  "Vitamin E": 100,
  "Vitamin K": 100,
  Manganese: 100,
  Selenium: 10,
};

const divideMap: Record<string, number> = {
  /*   minerals   */
  Calcium: 10,
  Chloride: 10,
  Chromium: 10,
  Copper: 10,
  Iron: 10,
  Magnesium: 10,
  Molybdenum: 10,
  Phosphorus: 10,
  Potassium: 10,
  Sodium: 10,
  Zinc: 10,
  /*   others   */
  Choline: 10,
  Methionine: 10, // mg
  Tryptophan: 10, // mg
  Histidine: 10,  // mg
  "Vitamin A": 10, // mg
  "Vitamin B2": 10,
  "Vitamin B3": 10,
  "Vitamin B5": 10,
  "Vitamin B6": 10,
  "Vitamin C": 10,
  Isoleucine: 10000,
  Leucine: 10000,
  Lysine: 10000,
  Phenylalanine: 10000,
  Threonine: 10000,
  Valine: 10000,
  "Linoleic acid": 10,
  "α-Linolenic acid": 10,
};

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
    className={clsx(
      "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
      colorClass,
    )}
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

function convertValue(name: string, value: number): number {
  if (multiplyMap[name]) return value * multiplyMap[name];
  if (divideMap[name]) return value / divideMap[name];
  return value;
}

function aggregateNutrients(foods: PostFoodItem[]) {
  const totals: NutrientTotals = {};
  let totalWeight = 0;

  foods.forEach(({ food, amount }) => {
    const f = foodsData.find(
      (d: any) => d.name.toLowerCase() === food.name.toLowerCase(),
    );
    if (!f) return;

    totalWeight += amount;
    const scale = amount / 100; // foods.json is per 100 g

    // macros
    totals["Fat"] = (totals["Fat"] ?? 0) + (f.fat / 10000) * scale; // g
    totals["Proteins"] =
      (totals["Proteins"] ?? 0) + (f.proteins / 10000) * scale; // g
    totals["Carbs"] =
      (totals["Carbs"] ?? 0) + (f.carbohydrates / 10000) * scale; // g
    totals["Calories"] =
      (totals["Calories"] ?? 0) + f.calories * 100 * scale; // kcal

    // micro-nutrients with conversions
    Object.entries(f.nutrients ?? {}).forEach(([k, v]) => {
      const fixed = convertValue(k, v);
      totals[k] = (totals[k] ?? 0) + fixed * scale;
    });
  });

  // derive per-100 g figures for the label
  const per100Factor = totalWeight ? 100 / totalWeight : 0;
  const per100g: NutrientTotals = {};
  Object.entries(totals).forEach(([k, v]) => {
    per100g[k] = v * per100Factor;
  });

  return { totals, per100g };
}

function getUnit(nutrient: string): string {
  if (nutrient === "Calories") return "kcal";
  if (["Fat", "Proteins", "Carbs"].includes(nutrient)) return "g";

  // special cases
  if (["Methionine", "Tryptophan", "Histidine"].includes(nutrient))
    return "mg";

  if (essentialAminoSet.has(nutrient)) return "g";
  if (essentialFattySet.has(nutrient)) return "mg";

  if (vitaminSet.has(nutrient)) {
    if (
      [
        "Vitamin C",
        "Vitamin E",
        "Vitamin B3",
        "Vitamin B2",
        "Vitamin B5",
        "Vitamin B6",
        "Vitamin A",
        "Choline",
      ].includes(nutrient)
    )
      return "mg";
    return "µg";
  }

  if (["Chromium", "Iodine", "Molybdenum", "Selenium", "Manganese"].includes(nutrient))
    return "µg";

  return "mg"; // default
}

/* -------------------------------------------------- */
/* main component                                     */
/* -------------------------------------------------- */
export default function CaloriesChart({ foods }: CaloriesChartProps) {
  /* --- macro totals ------------------------------ */
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
      if (animalNonMeatTerms.some((t) => n.includes(t)))
        hasAnimalProduct = true;
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

  /* --- micro totals ------------------------------ */
  const { totals: nutrientTotals, per100g: nutrientPer100g } = React.useMemo(
    () => aggregateNutrients(foods),
    [foods],
  );

  /* --- pie-chart data ---------------------------- */
  const chartData = [
    { nutrient: "Fat", value: totalFat, fill: "hsl(10 80% 55%)" },
    { nutrient: "Proteins", value: totalProteins, fill: "hsl(140 70% 45%)" },
    { nutrient: "Carbs", value: totalCarbs, fill: "hsl(220 70% 50%)" },
  ];

  /* --- diet pill component ----------------------- */
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

  /* --- render ------------------------------------ */
  return (
    <TooltipProvider delayDuration={120}>
      <Card className="relative overflow-visible">
        {/* ---------- header ---------- */}
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div className="flex items-center gap-1 text-sm font-medium">
            Nutritional breakdown
            <UiTooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-snug">
                Grams of fat, protein and carbs for this meal.
                Micronutrients are aggregated from the selected foods.
                Emissions data via CarbonCloud.
              </TooltipContent>
            </UiTooltip>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Pill colorClass="bg-emerald-600/15 text-emerald-700">
              <Leaf className="h-3 w-3" /> {totalEmissions.toFixed(2)} kg CO₂e
            </Pill>
            <DietPill />
          </div>
        </CardHeader>

        {/* ---------- chart ---------- */}
        <CardContent className="pb-4">
          <ChartContainer
            config={{}}
            className="mx-auto aspect-square max-h-[240px]"
          >
            <PieChart>
              <ReTooltip content={<CustomTooltip />} cursor={false} />
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

        {/* ---------- floating dialog trigger ---------- */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-2 left-2 h-8 w-8"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          {/* ---------- nutrition dialog ---------- */}
          <DialogContent className="max-h-[70vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeaderUi>
              <DialogTitle>Nutrition facts</DialogTitle>
              <DialogDescription className="text-xs">
                Per 100 g and totals for this meal
              </DialogDescription>
            </DialogHeaderUi>

            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { title: "Vitamins", set: vitaminSet },
                { title: "Minerals", set: mineralSet },
                { title: "Essential Amino Acids", set: essentialAminoSet },
                { title: "Essential Fatty Acids", set: essentialFattySet },
              ].map(({ title, set }) => {
                const entries = [...set]
                  .filter((n) => nutrientTotals[n] != null)
                  .sort();

                if (!entries.length) return null;

                return (
                  <div key={title} className="space-y-2">
                    <h3 className="font-medium">{title}</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="py-1 text-left">Nutrient</th>
                          <th className="py-1 text-right">/ 100 g</th>
                          <th className="py-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((n) => {
                          const unit = getUnit(n);
                          const per100 = nutrientPer100g[n] ?? 0;
                          const total = nutrientTotals[n] ?? 0;
                          const fmt = (x: number) =>
                            x >= 100
                              ? Math.round(x)
                              : x >= 10
                              ? x.toFixed(1)
                              : x.toFixed(2);

                          return (
                            <tr key={n}>
                              <td className="pr-2 align-top">{n}</td>
                              <td className="whitespace-nowrap text-right">
                                {fmt(per100)} {unit}
                              </td>
                              <td className="whitespace-nowrap text-right">
                                {fmt(total)} {unit}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </TooltipProvider>
  );
}