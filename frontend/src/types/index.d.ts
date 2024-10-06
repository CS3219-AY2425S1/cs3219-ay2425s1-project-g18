declare type Difficulty = "easy" | "medium" | "hard";

declare interface QuestionProps {
    question: {
        questionId: number;
        title: string;
        description?: string;
        categories: string[];
        difficulty: Difficulty;
    };
}