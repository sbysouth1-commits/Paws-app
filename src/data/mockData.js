// Mock catalogue mirroring the prototype. Replace with the Supabase
// `resources` table once the UI is signed off (spec §4, §7.4).

export const family = {
  parentName: 'Sarah',
  childName: 'Miller',
  therapistName: 'Priya',
};

export const resources = [
  {
    id: 'r1',
    title: 'Big Feelings Flip Cards',
    category: 'Emotions',
    ageRange: '3–7',
    priceAud: 12,
    tag: 'Popular',
    featured: true,
    description:
      'Thirty printable flip cards that help kids name what they feel and pick a calming strategy to match. Includes a parent guide with scripts for tricky moments.',
  },
  {
    id: 'r2',
    title: 'First Words Picture Board',
    category: 'Communication',
    ageRange: '2–5',
    priceAud: 9,
    tag: 'New',
    featured: true,
    description:
      'A printable communication board covering everyday requests — eat, drink, play, help, more, finished — designed for early talkers and AAC beginners.',
  },
  {
    id: 'r3',
    title: 'Calm Corner Starter Kit',
    category: 'Sensory',
    ageRange: '3–8',
    priceAud: 15,
    tag: 'Therapist pick',
    featured: true,
    description:
      'Everything you need to set up a calm-down space at home: visual steps, breathing cards, and a checklist of low-cost sensory tools that actually get used.',
  },
  {
    id: 'r4',
    title: 'Turn-Taking Game Pack',
    category: 'Social Skills',
    ageRange: '4–8',
    priceAud: 10,
    featured: false,
    description:
      'Five print-and-play games built around waiting, turn-taking and losing gracefully — with grown-up prompts for coaching in the moment.',
  },
  {
    id: 'r5',
    title: 'Morning Routine Visual Schedule',
    category: 'Routines',
    ageRange: '3–9',
    priceAud: 8,
    tag: 'Popular',
    featured: true,
    description:
      'A velcro-ready visual schedule for smoother mornings: wake up, toilet, dressed, breakfast, teeth, shoes, bag. Includes blank tiles to make your own steps.',
  },
  {
    id: 'r6',
    title: 'Scissor Skills Practice Book',
    category: 'Motor Skills',
    ageRange: '3–6',
    priceAud: 7,
    featured: false,
    description:
      'Twenty pages of graded cutting practice, from single snips to curves and shapes, sequenced the way an OT would introduce them.',
  },
  {
    id: 'r7',
    title: 'Worry Monster Story + Activities',
    category: 'Emotions',
    ageRange: '5–9',
    priceAud: 14,
    tag: 'New',
    featured: false,
    description:
      'An illustrated social story about a monster who eats worries, paired with six activities for externalising anxiety and building brave talk.',
  },
  {
    id: 'r8',
    title: 'Playdate Conversation Cues',
    category: 'Social Skills',
    ageRange: '5–10',
    priceAud: 9,
    featured: false,
    description:
      'Pocket-sized cue cards for starting, keeping and ending conversations — great for rehearsing before playdates or school.',
  },
  {
    id: 'r9',
    title: 'Heavy Work Movement Deck',
    category: 'Sensory',
    ageRange: '4–10',
    priceAud: 11,
    featured: false,
    description:
      'Forty proprioceptive "heavy work" activity cards for regulation breaks at home or school. No equipment needed for most.',
  },
  {
    id: 'r10',
    title: 'Bedtime Wind-Down Routine Cards',
    category: 'Routines',
    ageRange: '2–8',
    priceAud: 8,
    featured: false,
    description:
      'A calm, predictable bedtime sequence in ten illustrated cards, with tips for fading grown-up support over time.',
  },
];

export const featuredResources = resources.filter((r) => r.featured);

export const formatPrice = (priceAud) => `A$${priceAud}`;
