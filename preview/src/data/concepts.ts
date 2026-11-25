// The concepts from the live app (titles and one-line descriptions copied as-is).
export type Subject = "Maths" | "Physics" | "Chemistry" | "Biology"
export interface Concept {
  id: string
  title: string
  description: string
  tag: Subject
}

export const SUBJECTS = ["All", "Maths", "Physics", "Chemistry", "Biology"] as const

export const CONCEPTS: Concept[] = [
  { id: "taylor", title: "Taylor series of sin(x)", description: "Build sin(x) out of simple powers of x, one term at a time.", tag: "Maths" },
  { id: "vectors", title: "Adding vectors", description: "Put two arrows tip to tail and see where you end up.", tag: "Maths" },
  { id: "projectile", title: "Projectile motion", description: "Launch a ball and find the angle that sends it furthest.", tag: "Physics" },
  { id: "euler-e", title: "Can interest make $1 grow forever?", description: "Compound $1 more and more often and watch it hit a mysterious ceiling: e.", tag: "Maths" },
  { id: "euler-identity", title: "How can e, i and π make zero?", description: "Spin a point round a circle and land on maths' most famous equation.", tag: "Maths" },
  { id: "integration", title: "How far does a speeding-up car travel?", description: "Chop the area under a speed graph into strips and watch the error vanish.", tag: "Maths" },
  { id: "centripetal", title: "What happens if you let go of the string?", description: "Swing a ball in a circle, feel the pull to the centre, then release it.", tag: "Physics" },
  { id: "terminal-velocity", title: "Why don't skydivers keep speeding up?", description: "Gravity pulls, air pushes back harder and harder, until they balance.", tag: "Physics" },
  { id: "pendulum", title: "Does a bigger swing take longer?", description: "Race a real pendulum against the textbook formula and watch them drift apart.", tag: "Physics" },
  { id: "ph", title: "How much more acidic is lemon juice than water?", description: "Slide along the pH scale. Every step is ten times stronger.", tag: "Chemistry" },
  { id: "gas", title: "Why does a balloon shrink in the cold?", description: "Heat or squeeze a box of bouncing particles and watch the pressure change.", tag: "Chemistry" },
  { id: "atom", title: "What turns one element into another?", description: "Add protons, neutrons and electrons to build any of the first 20 elements.", tag: "Chemistry" },
  { id: "natural-selection", title: "Can a hungry bird change a whole species?", description: "Predators eat the bugs that stand out. Watch the population change colour.", tag: "Biology" },
  { id: "punnett", title: "Can two purple flowers have a white baby?", description: "Cross pea plants in a Punnett square and predict their flower colours.", tag: "Biology" },
  { id: "enzymes", title: "What happens when you cook an enzyme?", description: "Change temperature and pH to see when an enzyme works best, or breaks for good.", tag: "Biology" },
]
