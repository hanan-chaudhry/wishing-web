export const questions = [
  {
    id: 1,
    question: "1+1=?",
    options: ["2", "3", "4", "5"],
    correct: 1,
    reason: "yeh to basic knowledge hai shadi ka, itna to sabko pata hota"
  },
  {
    id: 2,
    question: "Whom you hate the most??",
    options: ["Hanan CH", "option 1", "both 1 and 2", "All"],
    correct: 3,
    reason: "Same hereee"
  },
  {
    id: 3,
    question: "what time is it ??",
    options: ["9", "10", "11", "12"],
    correct: 1,
    reason: "turkey ka time daikho bhai"
  },
  {
    id: 4,
    question: "what date is it ??",
    options: ["16", "17", "18", "19"],
    correct: 2,
    reason: "choti bachi ho kia ????"
  },
  {
    id: 5,
    question: "1+1=?",
    options: ["2", "3", "4", "5"],
    correct: 2,
    reason: "woh suna ni uh ne hum 2 hamare 2"
  },
  {
    id: 6,
    question: "guess kro maine konsi option correct rakhi hogi",
    options: ["1", "2", "3", "4"],
    correct: 1,
    reason: "bhai itne saal guzar gye ab tak to uh ko mera pata hona chahiye"
  },
  {
    id: 7,
    question: "1+1=?",
    options: ["2", "3", "4", "5"],
    correct: 0,
    reason: "bachpan mai school to gyi hogi wahan parhaaty thy"
  }
]

export const scoreMessages = {
  excellent: {
    title: "apka dimag bilkul ulta chaltaa",
    emoji: "🏆",
    color: "#fbbf24",
    message: ""
  },
  good: {
    title: "bachpan mai kahin gir kr ghutne pr choot lagi hogi",
    emoji: "⭐",
    color: "#10b981",
    message: ""
  },
  average: {
    title: "maine soocha ni tha k koi itna bhi nalla ho skta",
    emoji: "👍",
    color: "#3b82f6",
    message: "There's always room to learn more!"
  },
  low: {
    title: "apka to ouper waala floor khali hai mujhe rent pr de do",
    emoji: "😄",
    color: "#ef4444",
    message: "free mai"
  }
}

export function getScoreMessage(score) {
  if (score >= 6) return scoreMessages.excellent
  if (score >= 4) return scoreMessages.good
  if (score >= 2) return scoreMessages.average
  return scoreMessages.low
}
