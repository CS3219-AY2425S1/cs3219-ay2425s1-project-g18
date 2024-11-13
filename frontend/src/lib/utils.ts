import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { difficulties } from '@/utils/constant';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const stringToDifficulty = (difficulty: string): Difficulty => {
  let difficultyLower = difficulty.toLowerCase();
  return difficulties.includes(difficultyLower as Difficulty) ? (difficultyLower as Difficulty) : "easy";
};
