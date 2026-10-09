export type Question = {
  theme: string;
  prompt: string;
  answers: [string, string, string];
};

export const questions: Question[] = [
  {
    theme: "Discovery",
    prompt: "How do you find what matters on {app}?",
    answers: [
      "I just take what {app} shows me",
      "A mix of feed and my own choices",
      "I mostly search or go to things I picked",
    ],
  },
  {
    theme: "Understanding",
    prompt: "Do you know why {app} shows you what it shows?",
    answers: [
      "No idea why things show up",
      "A rough idea",
      "I can name the signals it uses",
    ],
  },
  {
    theme: "Tuning",
    prompt: "Do you adjust what {app} is allowed to do?",
    answers: [
      "I never adjust anything",
      "Sometimes",
      "I regularly mute, hide or reset",
    ],
  },
  {
    theme: "Adapting",
    prompt: "Do you change how you act because of {app}?",
    answers: [
      "I never change how I act for it",
      "Sometimes, without a plan",
      "I test times, formats or zones on purpose",
    ],
  },
  {
    theme: "Noticing",
    prompt: "Do you notice when {app} is steering you?",
    answers: [
      "I don't notice being steered",
      "Occasionally",
      "I notice and decide whether to go along",
    ],
  },
  {
    theme: "Alternatives",
    prompt: "If {app} vanished, could you still reach {counterpart}?",
    answers: [
      "{app} is my only channel to {counterpart}",
      "I use one other channel a bit",
      "I keep real alternatives to reach {counterpart}",
    ],
  },
];

export function fillTemplate(
  text: string,
  platform: { app: string; counterpart: string },
) {
  return text
    .replaceAll("{app}", platform.app)
    .replaceAll("{counterpart}", platform.counterpart);
}
