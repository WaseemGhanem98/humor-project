-- Wry: let signed-in users read back their OWN votes (for "your take" on the feed
-- and the vote history on /profile).
-- Paste into Supabase Dashboard -> SQL Editor -> New query -> Run. Safe to re-run.
--
-- Scope: SELECT only, own rows only. Nobody can read anyone else's votes, and there
-- is still no UPDATE/DELETE policy, so votes stay append-only. No schema changes.

drop policy if exists "Users can read their own votes" on public.caption_votes;
create policy "Users can read their own votes"
  on public.caption_votes for select
  to authenticated
  using ((select auth.uid()) = user_id);
