import type { PlatformId } from "@/data/platforms";

type TipTrio = readonly [string, string, string];

/**
 * One concrete tip per platform, question, and answer.
 * Index 0 is passive, 1 is mixed, 2 is deliberate.
 * The coach picks the three lowest-scoring questions.
 */
export const fallbackTips: Record<PlatformId, readonly TipTrio[]> = {
  instagram: [
    [
      "Open search and go to a person or topic you chose, instead of refreshing the home feed.",
      "Once a day, leave the feed and open a profile you picked yourself.",
      "Keep a short list of accounts you open on purpose, and start there.",
    ],
    [
      "Tap the menu on a post and read why Instagram says you are seeing it.",
      "Name one signal out loud — a like, a watch, a follow — before you blame the feed.",
      "Write down the three signals you think the ranker is using on you this week.",
    ],
    [
      "Mute one account and hide one suggested post today. Watch what fills the gap.",
      "Use not-interested three times this week, then look at the feed tomorrow.",
      "Reset one suggestion category you no longer want, and note what comes back.",
    ],
    [
      "Watch or post at one new time today and see who actually responds.",
      "Pick one format and try it twice on purpose before you judge it.",
      "Keep a tiny log of time, format, and response so the test stays a test.",
    ],
    [
      "The next time you open Instagram without meaning to, close it and name what pulled you.",
      "When a suggestion hooks you, pause and choose whether to stay or leave.",
      "Keep that pause. The skill is the decision, not a total refusal.",
    ],
    [
      "Send one update to your audience somewhere else this week: a text, a list, or a site.",
      "Move one conversation you care about off Instagram and keep it there.",
      "Tell your audience the other place they can find you, and actually use it.",
    ],
  ],
  uber: [
    [
      "Before you go online, choose the area and the hours. Do not let the map choose both.",
      "Set your own start zone once a shift, then compare it with the app's nudge.",
      "Keep choosing the zone yourself. Glance at demand, then decide.",
    ],
    [
      "Read Uber's own note on how trip requests are offered, once, in help.",
      "Name the signals you can see: location, acceptance, and any destination filter.",
      "After a shift, list which signals seemed to change the offers you got.",
    ],
    [
      "Turn one filter on for an hour and see what you are offered.",
      "Change one setting mid-shift and watch the next offer before you judge it.",
      "Review your filters at the start of each week and drop the ones you ignore.",
    ],
    [
      "Try one different hour or neighborhood this week and write down the offers.",
      "Change only the time or only the zone, and run it for two shifts.",
      "Keep the log. One change at a time is how you learn what moved.",
    ],
    [
      "When a ping feels urgent, wait one breath and read the trip before you accept.",
      "Notice a surge or a quest, then decide if it matches the shift you wanted.",
      "Stay with that pause. Accepting fast is the app's tempo, not yours.",
    ],
    [
      "Line up one other way to get work before your next week of driving.",
      "Use one other source you already have — another app, a regular, a local group.",
      "Keep those alternatives warm. A single app is a single dispatch.",
    ],
  ],
  email: [
    [
      "Do not live in the unread pile. Search for a person or thread you meant to open.",
      "Star the threads you chose, and start there before the inbox order.",
      "Keep using search and the folders you built. Let the inbox be a queue.",
    ],
    [
      "Check whether your mail app uses a focused inbox, and read what it promotes.",
      "Name one rule it is using — unread, sender, or a tab — before you trust the order.",
      "You can already name the signals. Recheck them when the app updates.",
    ],
    [
      "Turn off one automatic sort, or unsubscribe from one list, today.",
      "Make one filter, or mute one sender you did not mean to keep seeing.",
      "Review filters monthly. Delete the rules that hide people you still need.",
    ],
    [
      "Send one important note at a time you chose, not only while clearing the pile.",
      "Try one subject line or send time on purpose and see who replies.",
      "Keep the experiments small and written down so you can repeat them.",
    ],
    [
      "When a notification pulls you in, name it, then decide if that thread can wait.",
      "Notice a badge or a preview, then choose whether to open it.",
      "Keep making that choice. Speed is optional.",
    ],
    [
      "For one person you only email, agree a second channel: a call, a chat, or a visit.",
      "Move one stalled thread to the other channel you already have.",
      "Keep those paths real. The server should not be the only way through.",
    ],
  ],
};
