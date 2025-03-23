// src/components/foods/FoodSearchBar.tsx
import React, { useState, useEffect } from "react";
import SelectedFood, { SelectedFoodItem, Food } from "./SelectedFood";
import foodsData from "@/data/foods.json";

interface FoodSearchBarProps {
  onChange: (selected: SelectedFoodItem[]) => void;
}

const FoodSearchBar: React.FC<FoodSearchBarProps> = ({ onChange }) => {
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Assume foodsData is an array of Food objects
    setAvailableFoods(foodsData);
  }, []);

  const filteredFoods = availableFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (food: Food) => {
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
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Search food items..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full"
      />
      {searchTerm && (
        <ul className="border rounded p-2 max-h-40 overflow-y-auto">
          {filteredFoods.map(food => (
            <li
              key={food.name}
              className="cursor-pointer p-1 hover:bg-gray-200"
              onClick={() => handleSelect(food)}
            >
              {food.name}
            </li>
          ))}
          {filteredFoods.length === 0 && (
            <li className="text-gray-500">No food found</li>
          )}
        </ul>
      )}
      <div>
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
  );
};

export default FoodSearchBar;
