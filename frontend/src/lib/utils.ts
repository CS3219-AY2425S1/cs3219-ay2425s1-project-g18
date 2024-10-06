import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const stringToDifficulty = (difficulty: string): Difficulty => {
  let difficultyLower = difficulty.toLowerCase();
  const allowedDifficulties: Difficulty[] = ["easy", "medium", "hard"];
  return allowedDifficulties.includes(difficultyLower as Difficulty) ? (difficultyLower as Difficulty) : "easy";
};
