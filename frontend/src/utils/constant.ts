export const difficulties: Difficulty[] = ["easy", "medium", "hard"];

export function convertSolvedStatus(solved: boolean) {
    return solved ? "accepted" : "failed"
}