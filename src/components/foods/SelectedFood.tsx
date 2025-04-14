// src/components/foods/SelectedFood.tsx
import React from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input"; // MealMate’s custom input component

export interface Food {
  name: string;
  serving?: number;
}

export interface SelectedFoodItem {
  food: Food;
  amount: number;
}

interface SelectedFoodProps {
  selectedFood: SelectedFoodItem;
  onChange: (updated: SelectedFoodItem) => void;
  onRemove: (item: SelectedFoodItem) => void;
}

const SelectedFood: React.FC<SelectedFoodProps> = ({ selectedFood, onChange, onRemove }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseInt(e.target.value, 10) || 0;
    onChange({ ...selectedFood, amount: newAmount });
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded-md my-1">
      <span className="font-medium">{selectedFood.food.name}</span>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          value={selectedFood.amount}
          onChange={handleChange}
          className="w-20"
          min={0}
        />
        <span className="text-gray-500">g</span>
        <button
          onClick={() => onRemove(selectedFood)}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Remove food"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default SelectedFood;
