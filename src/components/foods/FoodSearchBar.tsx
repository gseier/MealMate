// src/components/foods/FoodSearchBar.tsx
import React, { useState, useEffect } from "react";
import SelectedFood, { SelectedFoodItem, Food } from "./SelectedFood";
import foodsData from "@/data/foods.json";
import { Input } from "@/components/ui/input";

interface FoodSearchBarProps {
  onChange: (selected: SelectedFoodItem[]) => void;
}

const FoodSearchBar: React.FC<FoodSearchBarProps> = ({ onChange }) => {
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Initialize available foods from the foods data
    setAvailableFoods(foodsData);
  }, []);

  const filteredFoods = availableFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (food: Food) => {
    // Remove the selected food from available list and add it to selected foods
    setAvailableFoods(prev => prev.filter(f => f.name !== food.name));
    const newItem: SelectedFoodItem = {
      food,
      amount: food.serving || 100,
    };
    const updated = [...selectedFoods, newItem];
    setSelectedFoods(updated);
    onChange(updated);
    setSearchTerm("");
  };

  const handleRemove = (item: SelectedFoodItem) => {
    // Remove food from selected foods and add it back to available foods
    const updated = selectedFoods.filter(sf => sf.food.name !== item.food.name);
    setSelectedFoods(updated);
    onChange(updated);
    setAvailableFoods(prev => [...prev, item.food]);
  };

  const handleAmountChange = (updatedItem: SelectedFoodItem) => {
    const updated = selectedFoods.map(sf =>
      sf.food.name === updatedItem.food.name ? updatedItem : sf
    );
    setSelectedFoods(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Add Food Items
        </label>
        <Input
          type="text"
          placeholder="Search for food items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      {searchTerm && (
        <ul className="bg-background border border-muted-foreground rounded-md shadow-lg p-2 mt-1 max-h-40 overflow-y-auto">
          {filteredFoods.map(food => (
            <li
              key={food.name}
              className="cursor-pointer px-2 py-1 hover:bg-muted transition-colors"
              onClick={() => handleSelect(food)}
            >
              {food.name}
            </li>
          ))}
          {filteredFoods.length === 0 && (
            <li className="text-sm text-muted-foreground px-2 py-1">
              No food found
            </li>
          )}
        </ul>
      )}
      {selectedFoods.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Selected Foods
          </h3>
          <div className="space-y-2">
            {selectedFoods.map(sf => (
              <SelectedFood
                key={sf.food.name}
                selectedFood={sf}
                onChange={handleAmountChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSearchBar;
