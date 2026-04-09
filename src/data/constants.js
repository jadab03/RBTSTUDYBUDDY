export const C = {
  teal: "#97B3AE", tealDark: "#6E9490", mint: "#D2E0D3", blush: "#F0DDD6",
  rose: "#F2C3B9", roseDark: "#C9897C", roseDeep: "#A86B5E",
  sand: "#D6CBBF", sandDark: "#A89E92", sandDeep: "#6B6058",
  cream: "#F0EEEA", charcoal: "#2A2420",
  bg: "#F7F5F2", surface: "#FFFFFF", alt: "#FAF8F6", border: "#E8E2DC", sidebar: "#3D5450",
};

export const SKILL_LEVELS = [
  { id: "training",   label: "40 Hour Training",                   desc: "Learning ABA/RBT concepts for the first time", icon: "\u{1F4D6}" },
  { id: "competency", label: "Preparing for Competency Assessment", desc: "Training complete \u2014 getting ready for evaluation", icon: "\u{1F3AF}" },
  { id: "exam",       label: "Preparing for RBT Exam",              desc: "Competency passed \u2014 studying for certification", icon: "\u{1F3C6}" },
  { id: "refresher",  label: "Refresher / Recertification",         desc: "Already certified \u2014 brushing up or recertifying", icon: "\u{1F504}" },
];

export const DOMAINS = [
  { id: "measurement",        label: "Measurement",                  color: "#97B3AE", tasks: 5 },
  { id: "assessment",         label: "Assessment",                   color: "#7FA8C0", tasks: 5 },
  { id: "skill_acquisition",  label: "Skill Acquisition",            color: "#C9897C", tasks: 5 },
  { id: "behavior_reduction", label: "Behavior Reduction",           color: "#9B8AA0", tasks: 5 },
  { id: "documentation",      label: "Documentation & Reporting",    color: "#B8A882", tasks: 5 },
  { id: "professional",       label: "Professional Conduct & Scope", color: "#7A9E8A", tasks: 5 },
];

export const MILESTONES = [
  { id: "first_login",    label: "Welcome!",         icon: "\u{1F44B}", xp: 5 },
  { id: "onboard_done",   label: "Ready to Learn",   icon: "\u{1F680}", xp: 10 },
  { id: "first_chat",     label: "First Session",    icon: "\u{1F4AC}", xp: 10 },
  { id: "first_scenario", label: "Scenario Tackled", icon: "\u{1F3AF}", xp: 15 },
  { id: "reflected",      label: "Deep Thinker",     icon: "\u{1FA9E}", xp: 20 },
  { id: "streak_3",       label: "3-Day Streak",     icon: "\u{1F525}", xp: 25 },
  { id: "streak_7",       label: "Week Warrior",     icon: "\u26A1",    xp: 50 },
  { id: "streak_14",      label: "Unstoppable",      icon: "\u{1F3C6}", xp: 100 },
  { id: "scenarios_10",   label: "10 Scenarios",     icon: "\u2B50",    xp: 30 },
  { id: "scenarios_all",  label: "Scenario Master",  icon: "\u{1F396}", xp: 40 },
  { id: "scenario_perf",  label: "Perfect Answer",   icon: "\u2728",    xp: 25 },
  { id: "mastery_25",     label: "Getting Started",  icon: "\u{1F331}", xp: 20 },
  { id: "mastery_50",     label: "Halfway There",    icon: "\u{1F4C8}", xp: 30 },
  { id: "mastery_75",     label: "Strong Foundation", icon: "\u{1F4AA}", xp: 40 },
  { id: "mastery_80",     label: "Near Expert",      icon: "\u{1F31F}", xp: 50 },
  { id: "mastery_100",    label: "Domain Expert",    icon: "\u{1F451}", xp: 100 },
  { id: "flashcard_20",   label: "Card Sharp",       icon: "\u{1F0CF}", xp: 20 },
  { id: "flashcard_all",  label: "Full Deck",        icon: "\u{1F4CB}", xp: 35 },
  { id: "roadmap_done",   label: "Planner",          icon: "\u{1F5FA}\uFE0F", xp: 15 },
  { id: "all_domains",    label: "Polymath",         icon: "\u{1F9E0}", xp: 35 },
];

export const BATCH = 5;

export const NAV = [
  { id: "dashboard",  label: "Dashboard",  icon: "\u{1F3E0}" },
  { id: "chat",       label: "Chat",       icon: "\u{1F4AC}" },
  { id: "flashcards", label: "Flashcards", icon: "\u{1F0CF}" },
  { id: "scenarios",  label: "Scenarios",  icon: "\u{1F3AF}" },
  { id: "roadmap",    label: "Roadmap",    icon: "\u{1F5FA}\uFE0F" },
  { id: "progress",   label: "Progress",   icon: "\u{1F4CA}" },
];

export const QUESTIONNAIRE = [
  { id: "goal", question: "What is your primary goal right now?", type: "single", options: [
    { id: "basics",     label: "Understand concepts from my 40-hour training", icon: "\u{1F4D6}" },
    { id: "competency", label: "Prepare for my competency assessment",         icon: "\u{1F3AF}" },
    { id: "exam",       label: "Pass the RBT certification exam",              icon: "\u{1F3C6}" },
    { id: "refresh",    label: "Refresher or recertification prep",            icon: "\u{1F504}" },
  ]},
  { id: "timeline", question: "When are you hoping to take your exam or assessment?", type: "single", options: [
    { id: "asap",     label: "As soon as possible (within 2 weeks)", icon: "\u26A1" },
    { id: "month",    label: "Within the next month",                icon: "\u{1F4C5}" },
    { id: "twomonth", label: "1-2 months from now",                  icon: "\u{1F5D3}\uFE0F" },
    { id: "flexible", label: "No specific timeline yet",             icon: "\u{1F331}" },
  ]},
  { id: "struggle", question: "Which areas feel most challenging right now?", type: "multi", options: [
    { id: "measurement",        label: "Measurement and data collection" },
    { id: "assessment",         label: "Preference and reinforcer assessments" },
    { id: "skill_acquisition",  label: "Skill acquisition and teaching" },
    { id: "behavior_reduction", label: "Behavior reduction strategies" },
    { id: "documentation",      label: "Documentation and reporting" },
    { id: "professional",       label: "Professional conduct and scope of practice" },
  ]},
  { id: "time", question: "How much time can you study each day?", type: "single", options: [
    { id: "15min", label: "15 minutes or less", icon: "\u23F1\uFE0F" },
    { id: "30min", label: "About 30 minutes",   icon: "\u{1F550}" },
    { id: "60min", label: "About 1 hour",        icon: "\u{1F551}" },
    { id: "more",  label: "More than 1 hour",    icon: "\u{1F4DA}" },
  ]},
];
