import { UserStatsMap } from "../models/types"

export const getUserStatsMap = (questions: any) => {
    const userMap: UserStatsMap = {
        totalQuestions: 0,
        difficulty: {},
        categories: {},
    };

    questions.forEach((question: any) => {
        const { difficulty, categories } = question;

        userMap.totalQuestions++;

        if (!userMap.difficulty[difficulty]) {
            userMap.difficulty[difficulty] = 1;
        } else {
            userMap.difficulty[difficulty]++;
        }

        categories.forEach((category: string) => {
            if (!userMap.categories[category]) {
                userMap.categories[category] = 1;
            } else {
                userMap.categories[category]++;
            }
        })
    })

    return userMap;
}
