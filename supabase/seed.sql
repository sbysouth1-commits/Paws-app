-- Seed the public resource catalogue with the six starter resources.
-- Run in the Supabase dashboard SQL Editor after schema.sql. Re-running is safe
-- (skips titles that already exist).

insert into public.resources (title, category, age_range, price_aud, description, tag)
select v.title, v.category, v.age_range, v.price_aud, v.description, v.tag
from (values
  ('Big Feelings Toolkit', 'Behaviour', '4–8 yrs', 12.50,
   'A printable set of emotion cards and a feelings thermometer to help kids name and manage big feelings.', 'Bestseller'),
  ('Speech Sound Safari', 'Speech', '3–6 yrs', 9.00,
   'Articulation practice cards themed around Australian animals, built for early sound development.', null),
  ('Sensory Break Cards', 'Sensory', '5–10 yrs', 8.00,
   'Quick, illustrated sensory reset activities kids can pick from when they need a break.', null),
  ('Calm Corner Visual Schedule', 'Behaviour', '4–9 yrs', 7.50,
   'A step-by-step visual routine for a calm-down space at home or in the classroom.', 'New'),
  ('Fine Motor Fun Pack', 'OT', '3–7 yrs', 11.00,
   'Cutting, tracing and lacing activities that build fine motor strength through play.', null),
  ('Listening Ears Game Set', 'Speech', '4–8 yrs', 10.00,
   'Auditory processing games to strengthen listening and following-directions skills.', null)
) as v(title, category, age_range, price_aud, description, tag)
where not exists (
  select 1 from public.resources r where r.title = v.title
);
