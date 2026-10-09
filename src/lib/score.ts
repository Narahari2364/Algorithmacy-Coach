export type Level = "Passive" | "Aware" | "Deliberate";

export function scoreAnswers(answers: number[]) {
  if (answers.length !== 6 || answers.some((score) => score !== 0 && score !== 1 && score !== 2)) {
    throw new Error("Answers must be six scores of 0, 1, or 2.");
  }
  const score = answers.reduce((total, value) => total + value, 0);
  const level: Level = score <= 4 ? "Passive" : score <= 8 ? "Aware" : "Deliberate";
  return { score, level };
}

export function weakestQuestions(answers: number[], count = 3) {
  return answers
    .map((score, index) => ({ score, index }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, count)
    .map((item) => item.index);
}

export function shareText(level: Level, score: number, app: string, url: string) {
  return `I scored ${level} (${score}/12) on ${app} with Algorithmacy Coach: ${url}`;
}
