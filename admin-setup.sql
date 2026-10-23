-- Christmas Mystery 2026: run once in Supabase SQL Editor.
-- Admin privileges are verified server-side, never from client input.
create or replace function public.set_participant_approval(target_id uuid, new_approved boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_game_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if target_id = auth.uid() then
    raise exception 'You cannot change your own approval here';
  end if;
  if not exists (select 1 from public.participants where id = target_id) then
    raise exception 'Participant not found';
  end if;
  update public.participants set approved = new_approved where id = target_id and is_admin = false;
  if not found then
    raise exception 'Cannot change an administrator';
  end if;
end;
$$;
revoke all on function public.set_participant_approval(uuid, boolean) from public;
revoke all on function public.set_participant_approval(uuid, boolean) from anon;
grant execute on function public.set_participant_approval(uuid, boolean) to authenticated;
