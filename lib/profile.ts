export type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  created_at: string
}

export function isProfileComplete(
  profile: Pick<Profile, 'first_name' | 'last_name'> | null
) {
  return Boolean(profile?.first_name?.trim() && profile?.last_name?.trim())
}
