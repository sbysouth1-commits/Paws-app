-- Sample private content for testing the "For [Child]" screen.
-- Run in the Supabase SQL Editor AFTER you've created a child in the app
-- (sign up → add child). It attaches the prototype's therapist resources and
-- success stories to your most recently created child.
--
-- In real use you'd add these rows via the Table editor, choosing the child_id
-- yourself. This snippet just picks the latest child so testing is one click.

with kid as (
  select id from public.children order by created_at desc limit 1
)
insert into public.therapist_resources (child_id, therapist_name, title, category, note, shared_at)
select kid.id, v.therapist_name, v.title, v.category, v.note, v.shared_at
from kid, (values
  ('Priya (OT)', 'Morning Routine Cards', 'Behaviour',
   'Made these after our session last week — a visual routine for getting ready without the meltdowns. Try it for a few mornings and let me know how it goes.',
   timestamptz '2026-07-03'),
  ('Priya (OT)', '''S'' Sound Practice List', 'Speech',
   'A few extra words to practise the ''s'' sound at home this week, building on what we covered in the swimming lesson chat.',
   timestamptz '2026-06-28'),
  ('Priya (OT)', 'Sensory Kit for the Car', 'Sensory',
   'Some ideas for keeping the car ride calm before school drop-off, based on what we noticed on Tuesday.',
   timestamptz '2026-06-14')
) as v(therapist_name, title, category, note, shared_at);

with kid as (
  select id from public.children order by created_at desc limit 1
)
insert into public.success_stories (child_id, therapist_name, title, story, occurred_at)
select kid.id, v.therapist_name, v.title, v.story, v.occurred_at
from kid, (values
  ('Priya (OT)', 'First full day at school!',
   'Made it through a first full day without needing a pickup call. Used the feelings cards twice and asked for a break. Such a big step.',
   timestamptz '2026-07-08'),
  ('Priya (OT)', 'In the pool without tears',
   'Swimming has been tough, but this week they got in on their own and stayed the full 20 minutes. The sensory prep routine made a real difference.',
   timestamptz '2026-06-22'),
  ('Priya (OT)', 'Asked a friend to play',
   'Initiated play with another child at the park for the first time, using the ''can I join in'' phrase we practised. Small moment, huge milestone.',
   timestamptz '2026-06-05')
) as v(therapist_name, title, story, occurred_at);
