// Mock data mirroring the prototype (app_prototype3.jsx). Replace with the
// Supabase tables once the UI is signed off (spec §4, §7.4).

export const family = {
  parentName: 'Sarah',
  childName: 'Miller',
  childAge: 6,
  therapistName: 'Priya',
};

export const RESOURCES = [
  {
    id: 'r1',
    title: 'Big Feelings Toolkit',
    category: 'Behaviour',
    age: '4–8 yrs',
    price: 12.5,
    blurb:
      'A printable set of emotion cards and a feelings thermometer to help kids name and manage big feelings.',
    tag: 'Bestseller',
  },
  {
    id: 'r2',
    title: 'Speech Sound Safari',
    category: 'Speech',
    age: '3–6 yrs',
    price: 9.0,
    blurb:
      'Articulation practice cards themed around Australian animals, built for early sound development.',
    tag: null,
  },
  {
    id: 'r3',
    title: 'Sensory Break Cards',
    category: 'Sensory',
    age: '5–10 yrs',
    price: 8.0,
    blurb:
      'Quick, illustrated sensory reset activities kids can pick from when they need a break.',
    tag: null,
  },
  {
    id: 'r4',
    title: 'Calm Corner Visual Schedule',
    category: 'Behaviour',
    age: '4–9 yrs',
    price: 7.5,
    blurb:
      'A step-by-step visual routine for a calm-down space at home or in the classroom.',
    tag: 'New',
  },
  {
    id: 'r5',
    title: 'Fine Motor Fun Pack',
    category: 'OT',
    age: '3–7 yrs',
    price: 11.0,
    blurb:
      'Cutting, tracing and lacing activities that build fine motor strength through play.',
    tag: null,
  },
  {
    id: 'r6',
    title: 'Listening Ears Game Set',
    category: 'Speech',
    age: '4–8 yrs',
    price: 10.0,
    blurb:
      'Auditory processing games to strengthen listening and following-directions skills.',
    tag: null,
  },
];

// Resources dropped specifically for Miller by his therapist (not for sale — already shared)
export const THERAPIST_RESOURCES = [
  {
    id: 't1',
    title: "Miller's Morning Routine Cards",
    category: 'Behaviour',
    date: '3 July 2026',
    note:
      'Made these after our session last week — a visual routine for getting ready without the meltdowns. Try it for a few mornings and let me know how it goes.',
    from: 'Priya (OT)',
  },
  {
    id: 't2',
    title: "'S' Sound Practice List",
    category: 'Speech',
    date: '28 June 2026',
    note:
      "A few extra words to practise the 's' sound at home this week, building on what we covered in the swimming lesson chat.",
    from: 'Priya (OT)',
  },
  {
    id: 't3',
    title: 'Sensory Kit for the Car',
    category: 'Sensory',
    date: '14 June 2026',
    note:
      'Some ideas for keeping the car ride calm before school drop-off, based on what we noticed on Tuesday.',
    from: 'Priya (OT)',
  },
];

export const SUCCESS_STORIES = [
  {
    id: 's1',
    title: 'First full day at school!',
    date: '8 July 2026',
    story:
      'Miller made it through his first full day without needing a pickup call. He used his feelings cards twice during the day and told his teacher when he needed a break. Such a big step — so proud of him.',
    from: 'Priya (OT)',
  },
  {
    id: 's2',
    title: 'In the pool without tears',
    date: '22 June 2026',
    story:
      'Swimming lessons have been tough, but this week Miller got in the water on his own and stayed for the full 20 minutes. We used the sensory prep routine beforehand and it made a real difference.',
    from: 'Priya (OT)',
  },
  {
    id: 's3',
    title: 'Asked a friend to play',
    date: '5 June 2026',
    story:
      "Miller initiated play with another child at the park for the first time, using the 'can I join in' phrase we practised. Small moment, huge milestone.",
    from: 'Priya (OT)',
  },
];

export function AUD(n) {
  return `$${n.toFixed(2)} AUD`;
}
