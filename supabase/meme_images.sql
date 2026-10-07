-- Humor Project: attach an image to each caption so it renders as a meme.
-- Paste into Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run: columns are only added if missing and the updates are idempotent.
--
-- Images are self-hosted in /public/memes (cropped to 4:3) so nothing is hotlinked.
-- All sources are Wikimedia Commons files that are public domain or Creative Commons;
-- CC licenses require attribution, which the app shows via image_credit + image_source_url.
--
-- No RLS changes: the existing "Anyone can read captions" SELECT policy already
-- covers the new columns, and there is still no INSERT/UPDATE/DELETE policy.

alter table public.captions
  add column if not exists image_url text,
  add column if not exists image_alt text,
  add column if not exists image_credit text,
  add column if not exists image_source_url text;

-- Only allow site-relative paths or https URLs (no javascript:, data:, http:, etc.).
alter table public.captions drop constraint if exists captions_image_url_check;
alter table public.captions
  add constraint captions_image_url_check
  check (image_url is null or image_url ~ '^(/[^/]|https://)');

-- Match on id AND text so a caption that was edited or re-seeded is left alone.
update public.captions as c
set
  image_url = v.image_url,
  image_alt = v.image_alt,
  image_credit = v.image_credit,
  image_source_url = v.image_source_url
from (
  values
    (
      1,
      'When the group project becomes an individual project.',
      '/memes/group-project-atlas.jpg',
      'The marble Farnese Atlas statue straining to hold an enormous globe on his shoulders.',
      'Farnese Atlas by Carlo Raso · Public domain',
      'https://commons.wikimedia.org/wiki/File:Farnese_Atlas.jpg'
    ),
    (
      2,
      'Me pretending I understood the assignment.',
      '/memes/understood-assignment-bulldog.jpg',
      'A bulldog wearing glasses and headphones sits seriously in front of a 1920s radio set.',
      'The Wireless Age, Nov. 1922 · Public domain',
      'https://commons.wikimedia.org/wiki/File:English_bulldog_wearing_headphones_and_glasses,_listening_to_the_radio.jpg'
    ),
    (
      3,
      'When the bug disappears before the demo.',
      '/memes/first-computer-bug.jpg',
      'A 1947 logbook page with a moth taped to it, captioned "First actual case of bug being found."',
      'U.S. Naval History and Heritage Command · Public domain',
      'https://commons.wikimedia.org/wiki/File:First_Computer_Bug,_1947.jpg'
    ),
    (
      4,
      'It works on my machine.',
      '/memes/works-on-my-machine-cat.jpg',
      'A fluffy calico cat lying on a laptop keyboard, staring smugly at the camera.',
      'Breawycker · CC BY-SA 4.0 (cropped)',
      'https://commons.wikimedia.org/wiki/File:Cat_lying_on_keyboard.jpg'
    ),
    (
      5,
      'Deploying on a Friday afternoon.',
      '/memes/friday-deploy-dumpster-fire.jpg',
      'A dumpster engulfed in huge flames at night.',
      'Ben Watts · CC BY 2.0 (cropped)',
      'https://commons.wikimedia.org/wiki/File:Dumpster_Fire_(4088047046).jpg'
    )
) as v (id, text, image_url, image_alt, image_credit, image_source_url)
where c.id = v.id
  and c.text = v.text;
