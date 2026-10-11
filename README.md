# Pawsitive Kids (Expo)

## Run it

```
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i` / `a` for a simulator.

## What's built

Design matches `app_prototype3.jsx` (tokens, category set, lucide stroke icons, paw SVG).

- **Home** — brand row, greeting, Kid Mode card, "From Priya" promo, "Picked for Miller's age" list (live from Supabase), browse-by-focus-area tiles
- **Library** — full catalogue read from Supabase, category filter chips (Speech / OT / Sensory / Behaviour), static search bar, loading/retry states
- **Resource Detail** — preview, blurb, dashed AUD price tag, working Add-to-cart; "Open resource" when owned fetches a short-lived signed URL from Supabase Storage and opens the file
- **Cart** — line items, remove, total; "Pay with card" opens a real Stripe Checkout page (AUD) and the purchase is only recorded once Stripe confirms payment, with an instant mock checkout when there are no keys
- **For [Child]** — segmented tabs reading the child's private `therapist_resources` and `success_stories` from Supabase (mock fallback with no keys), each with a working "Open resource" download. After login, a one-time onboarding step collects the parent's name and creates the child profile; those names then drive the Home greeting, tab label, Kid Mode and Profile
- **Profile** — parent account card, purchase history (tap to open, from the mock cart), settings rows, and a working link out to pawsitivekids.com.au
- **Kid Mode** — simplified big-button grid of the child's unlocked activities, lock button to hand control back, and a full-screen activity preview. No purchasing or external links, per the spec
- **Admin** (`role = 'admin'`) — a hidden "Admin" row on Profile with three tabs: catalogue resources (add/edit, with a file picker), every family (assign a therapist, add content), and Team (change anyone's role — this is how you make more admins and therapists, no more manual SQL after the first one)
- **Therapist** (`role = 'therapist'`) — a separate pure-staff app shell (no shopping, no onboarding): sign out, and a list of just their own assigned families, using the same content screens as Admin. Row-level security keeps them scoped to their own clients only
- **Medications** — a third tab on For [Child]: add any number of medications per child with dosage, instructions and one or more daily dose times; log each dose as given or skipped with full history; a status badge (overdue / next up / done today) and one-tap "Log dose" on each card. A server-side cron job pushes a reminder to every device a family has registered when a dose is due and not yet logged — see "Medications and reminders" below, since this is the one feature that needs a real build rather than Expo Go

## Structure

```
App.js                        entry point; loads fonts, registers the notification handler, gates login
src/theme/colors.js            prototype design tokens + CATEGORY_META
src/data/mockData.js           catalogue, therapist drops, success stories (from the prototype)
src/lib/supabase.js            Supabase client (null until keys are set)
src/lib/fileAccess.js          signed-URL download helper for Storage files
src/lib/fileUpload.js          staff: pick + upload a file to a Storage bucket
src/lib/useFamiliesList.js     shared families+child loader (RLS-scoped per role)
src/lib/useMedications.js      a child's medications + today's dose logs
src/lib/medicationStatus.js    "overdue / next up / done today" + time formatting
src/lib/medicationNotifications.js  notification permission helper
src/lib/pushTokens.js          registers this device for medication reminder pushes
src/state/AuthContext.js       Supabase session/login state
src/state/ChildContext.js      parent name + child profile + role/isAdmin/isTherapist (Supabase, or mock)
src/state/ResourcesContext.js  catalogue loader (Supabase, or mock fallback)
src/state/CartContext.js       cart + purchases; drives Stripe Checkout, never writes purchases itself
src/components/                PawIcon, ResourceCard, CategoryBadge, PriceTag, ScreenHeader
src/screens/                   Auth, Home, Library, ResourceDetail, Cart, ForChild, Profile, KidMode,
                                MedicationForm, MedicationDetail
src/screens/admin/             Admin, ResourceForm, FamilyDetail, TherapistResourceForm, SuccessStoryForm,
                                TeamMember, AssignTherapist
src/screens/therapist/         TherapistHomeScreen — therapist-only landing screen
src/navigation/RootNavigator.js      bottom tabs + stack for detail, Kid Mode, Admin and Medications
src/navigation/TherapistNavigator.js  separate stack for therapist accounts (no consumer tabs)
eas.json                       development/preview/production build profiles (needed for Medications — see below)
supabase/schema.sql            database tables + row-level security
supabase/seed.sql              starter catalogue rows
supabase/functions/create-checkout-session  Edge Function: starts a Stripe Checkout session
supabase/functions/stripe-webhook           Edge Function: records a purchase once Stripe confirms payment
```

## Supabase setup (auth is built — connect it to go live)

The app runs on mock data until you add Supabase keys, so it keeps working in Expo
Go with no setup. To turn on real accounts:

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard: **SQL Editor → New query**, paste in `supabase/schema.sql`, Run.
   Then do the same with `supabase/seed.sql` to fill the resource catalogue.
   (`schema.sql` is safe to re-run any time it changes — e.g. after pulling an
   update that adds a column — it only adds what's missing.)
3. For easy testing, turn off email confirmation: **Authentication → Sign In / Providers
   → Email → disable "Confirm email"** (turn it back on before real launch).
4. Copy `.env.example` to `.env` and fill in the two values from **Project Settings → API**
   (Project URL and the `anon` public key).
5. Restart with `npx expo start -c` (the `-c` clears the cache so the new `.env` loads).

Now the app opens on a **sign in / create account** screen; after login the session
persists on the device, and Profile gains a **Sign out** button. **Home and Library read
the `resources` catalogue live from Supabase** — edit a row in the Table editor and it
shows up in the app on next launch. You (the business owner) add therapist resources and
success stories directly via the Supabase **Table editor** too.

## Uploading a resource file (so "Open resource" has something to open)

`schema.sql` creates two **private** Storage buckets: `resource-files` (the paid
catalogue) and `therapist-files` (private per-child drops). Nothing in either bucket
is public — a family can only fetch a file it has actually purchased, or that was
shared with its own child; the app requests a signed URL that expires a few minutes
after it's generated.

To attach a file to a resource:

1. Dashboard → **Storage** → open **resource-files** (or **therapist-files** for a
   therapist drop) → **Upload file** → pick the PDF.
2. Click the uploaded file and copy its **path** (e.g. `big-feelings-toolkit.pdf` —
   just the file name if you uploaded to the bucket root).
3. Dashboard → **Table editor** → open the matching row in `resources` (or
   `therapist_resources`) → paste that exact path into the **file_url** column → Save.
4. In the app, reload the screen and tap **Open resource** — it opens in an in-app
   browser, where the phone's own PDF viewer/share sheet takes over.

The path in `file_url` must match the uploaded file's path exactly — that's what the
security policy checks against.

## Stripe checkout setup

"Pay with card" opens a **Stripe Checkout** page (Stripe's own hosted payment
page) in the same in-app browser used for file downloads — no card-payment SDK
in the app itself, so this still runs fine in plain Expo Go, no special build
needed. Two Supabase **Edge Functions** do the work: one creates the Checkout
session (using your Stripe secret key, which never touches the app), and the
other is a **webhook** Stripe calls once payment actually succeeds — that's the
only place a purchase ever gets recorded, so the app itself has no way to grant
a "purchase" without a real payment behind it.

Setup (all one-time):

1. Create a free [stripe.com](https://stripe.com) account. Test mode needs no
   business verification — you can build and test the whole flow before ever
   going live.
2. Dashboard → **Developers → API keys** → copy the **Secret key** (starts
   `sk_test_...`). Keep this out of the app entirely — it only ever goes into
   Supabase's secret store (next steps).
3. Install the Supabase CLI. Easiest on any OS — no install needed, just prefix
   every command below with `npx supabase@latest` instead of `supabase`. (If
   you'd rather have a permanent `supabase` command on Windows, install
   [Scoop](https://scoop.sh) first, then `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git`
   and `scoop install supabase`.)
4. In the `Paws-app` folder:
   ```
   npx supabase@latest login
   ```
   This opens a browser to authorize, same as `eas login` did earlier.
5. Link this project (find your **Reference ID** in the dashboard under
   **Project Settings → General** — it's also the subdomain in your project
   URL, e.g. `https://abcd1234.supabase.co` → ref is `abcd1234`):
   ```
   npx supabase@latest link --project-ref YOUR-PROJECT-REF
   ```
6. Set your Stripe secret key as a Supabase secret:
   ```
   npx supabase@latest secrets set STRIPE_SECRET_KEY=sk_test_...
   ```
7. Deploy both functions:
   ```
   npx supabase@latest functions deploy create-checkout-session
   npx supabase@latest functions deploy stripe-webhook --no-verify-jwt
   ```
8. Your webhook's URL is:
   `https://YOUR-PROJECT-REF.supabase.co/functions/v1/stripe-webhook`
9. Stripe dashboard → **Developers → Webhooks → Add endpoint** → paste that URL
   → under "Select events" choose **checkout.session.completed** → Add endpoint.
10. Click into the endpoint you just created → **Reveal** the **Signing secret**
    (starts `whsec_...`) → set it as a Supabase secret too:
    ```
    npx supabase@latest secrets set STRIPE_WEBHOOK_SECRET=whsec_...
    ```
    (No redeploy needed — secrets are read fresh on every call.)
11. Re-run `supabase/schema.sql` in the SQL Editor (it's idempotent) to pick up
    the new `stripe_session_id` column and the tightened purchases policy.
12. `git pull` on your PC, then `npx expo start -c` and reload the app.

**Testing:** use Stripe's test card `4242 4242 4242 4242`, any future expiry,
any 3-digit CVC, any postal code — it always "succeeds" in test mode. After
paying, closing the browser returns you to Cart, which checks with Supabase
and shows "Purchase complete" once the webhook has recorded it (usually
near-instant; the app waits and retries once if it needs to).

By default, Checkout sends the shopper back to **pawsitivekids.com.au** after
paying (a page you already control). To point somewhere else instead, set a
`CHECKOUT_RETURN_URL` secret the same way as the others above.

When you're ready to take real payments, switch your Stripe dashboard out of
test mode, grab the **live** secret key and webhook signing secret, and repeat
steps 6, 9 and 10 with those live values.

## Staff roles: admin and therapist

Every account has a `role`: **family** (the default — a normal parent), **admin**
(full access), or **therapist** (limited to their own assigned clients). You can
have as many admins and therapists as you like.

**Bootstrapping your first admin** (one-time, manual — after that, it's all in-app):

1. Sign up / log in in the app with the account you want as the first admin,
   and finish "Tell us about your family" (an admin is also a normal family
   account underneath, so this still applies to them).
2. In the Supabase dashboard, **SQL Editor → New query**, run (with your real
   login email):
   ```sql
   update public.families set role = 'admin' where email = 'you@example.com';
   ```
3. Sign out and back in so the app re-reads your account. **Profile → Admin**
   now appears, with three tabs:
   - **Resources** — tap **+** to add a catalogue resource (title, category,
     age range, price, description, tag, optional file upload), or tap an
     existing one to edit it. Admin-only — therapists can't touch pricing or
     the public catalogue.
   - **Families** — every family that's finished onboarding. Tap one to see
     what's been shared with their child, assign them to a **therapist**, and
     add a therapist resource or success story yourself if you want to.
   - **Team** — every signed-up account. Tap one to change its role — this is
     how you make your **second admin**, and every therapist, from now on. No
     more manual SQL needed after the first admin above.

**Adding a therapist:** have them sign up in the app normally first (they'll
land on "Tell us about your family" — that's fine, it doesn't matter for a
therapist; they'll skip past it forever once you promote them). Then, as an
admin, go to **Team**, tap their account, choose **Therapist**, Save. Next
time they open the app, they land straight on **"My families"** — no
onboarding, no shopping, no Kid Mode, just the families assigned to them (via
Admin → Families → that family → **Change** next to Therapist) and the same
add-resource / add-story screens the Admin section uses. A therapist can only
ever see and add content for their own assigned children — not anyone else's —
enforced by row-level security, not just hidden in the UI.

**What's admin-only vs therapist-allowed:**
| | Admin | Therapist |
|---|---|---|
| Public catalogue (`resources`) | add/edit | — |
| Assign a child to a therapist | yes | — |
| Change anyone's role | yes | — |
| See every family | yes | only their own assigned clients |
| Add therapist resources / success stories | for any child | for their assigned children |

Nothing anywhere in this system can **delete** — admins and therapists can add
and edit, but never remove a resource, purchase, or private content item. For
the rare case you need to delete something, use the Supabase table editor (as
project owner, which bypasses all of this).

## Medications and reminders

Every family can track medications for their child on the **Medications** tab
of **For [Child]**: add a medication with one or more daily dose times, log
each dose as given or skipped, and see a status badge (overdue / next up /
done today) at a glance. This is strictly private to the family — not visible
to admins or therapists, same as the child's own profile.

**Reminders are sent from the server, to every device a family has
registered** — not a per-device alarm. A Supabase cron job checks once a
minute for anything due that hasn't already been logged today, and pushes to
every phone registered for that family via Expo's push service. This is
deliberate: if two parents each have the app, both get reminded from the same
check, and once *either* of them logs the dose, the next minute's check sees
that and skips sending anything further for that slot — instead of each
phone independently firing its own alarm with no idea the other one already
handled it.

**This still needs a real build, not Expo Go** — adding medications and
logging doses works immediately in Expo Go, same as the rest of the app, but
receiving a push notification needs a real notification/push setup Expo Go
doesn't provide. You'll need a one-time **development build** instead — a
real version of the app with your own icon that you install once, after
which you keep using `npx expo start` and your usual workflow exactly as
before.

1. Re-run `supabase/schema.sql` as usual. This adds the `medications`,
   `medication_logs` and `push_tokens` tables, turns on the `pg_net`
   extension (lets the database itself call Expo's push API), and schedules
   a `send-medication-reminders` cron job that runs every minute.
2. On your PC: `git pull`, then `npm install` (new packages this time:
   `expo-notifications`, a native time picker, and `expo-device`).
3. If you already ran `eas build` for the first time before this — **check
   whether `app.json` changed on your PC and wasn't committed yet**: EAS
   writes a project id (and sometimes a package name) into it the first time
   you build. Run `git status`; if `app.json` shows as modified, commit and
   push it now (`git add app.json`, then a commit and push) so that id is
   saved for good — otherwise a future `git pull` could ask you to discard
   it, same as the `package-lock.json` prompts you've seen before, and this
   one you don't want to discard.
4. Build (or rebuild) your development client:
   ```
   npx eas-cli@latest build --profile development --platform android
   ```
   (`--platform ios` for iPhone.) Same as before — install the result on your
   phone when it finishes.
5. **Android only — one extra one-time step**, because Google requires every
   app to have its own push credentials now (Expo can no longer provide a
   shared one): you'll need a free Firebase project.
   1. Go to [console.firebase.google.com](https://console.firebase.google.com),
      create a project (any name), then **Add app → Android**, using the
      package name from your `app.json` (`expo.android.package` — EAS will
      have filled this in during step 4 above if it wasn't already set).
   2. In that Firebase project: **Project settings → Service accounts →
      Generate new private key** — downloads a `.json` file. Keep it safe;
      don't commit it to git.
   3. Back in your terminal: `npx eas-cli@latest credentials`, choose
      **Android**, then **Push Notifications: Manage FCM V1 Service Account
      Key**, and upload that downloaded file when asked.
   4. (iPhone doesn't need this step — EAS manages Apple's push credentials
      for you automatically, though a real device still needs your Apple
      Developer account to be set up for code signing, same as any iOS build.)
6. From now on: `npx expo start` as always, but open the dev client app you
   installed (not Expo Go) to scan the QR code.
7. Open the Medications tab once on each parent's phone — this silently
   registers that device for reminders (you'll see an iOS/Android permission
   prompt the first time). Then add a medication with a dose time a minute or
   two away and wait — the reminder should land on every registered phone at
   once, even with the app fully closed.

You only need to repeat the `eas build` step if a future feature needs a
*different* native module — everyday development keeps using `npx expo
start` exactly as before. The Firebase/FCM step in 5 is also one-time, not
per-build.


## Next steps (per the spec)

**V1 is feature-complete against the spec, plus an in-app Admin/Team/therapist
system and medication tracking with reminders.** Auth, one child per family,
the live catalogue, real purchases, private therapist content, file
downloads, paid checkout, staff content management, and medications are all
wired up. To test the For [Child] screen with sample data, run
`supabase/sample_child_content.sql` after adding your child.

From here, per spec §6 ("Not in V1 — revisit later"): therapist
messaging/booking, subscriptions, and multiple children per family.

## Notes

- Dependency versions target **Expo SDK 54** — the version the Play Store/App Store build of Expo Go supports as of July 2026 (Expo skipped store releases for 55/56; a 57 build is in review). If a newer SDK is out when you pull this down, `npx expo install --fix` will bump the pinned packages.
- With Supabase configured, the catalogue comes from the `resources` table; with no keys, the app falls back to the mock catalogue in `src/data/mockData.js`. Both go through `src/state/ResourcesContext.js`.
- `.env` is gitignored (never commit real keys); `.env.example` shows the shape. The Supabase `anon`/publishable key is safe in a client app — row-level security protects the data.
- Stripe's secret key and webhook signing secret live only in Supabase's Edge Function secret store — never in `.env`, never in the app bundle, never committed.
