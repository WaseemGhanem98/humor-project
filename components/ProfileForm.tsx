'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'

const AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // 2 MB, matches the bucket limit
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

type Props = {
  userId: string
  email: string
  initialFirstName: string
  initialLastName: string
  initialAvatarUrl: string | null
}

type Message = { type: 'success' | 'error'; text: string }

function describeStorageError(message: string) {
  if (/bucket not found/i.test(message)) {
    return 'The "avatars" storage bucket does not exist. Create it in Supabase (Storage → New bucket → "avatars", Public).'
  }
  if (/row-level security|unauthorized|403/i.test(message)) {
    return 'Upload was blocked by Storage policies. Apply the storage policies in supabase/policies.sql.'
  }
  return message
}

function StatusMessage({ message }: { message: Message | null }) {
  if (!message) return null
  return (
    <p
      role={message.type === 'error' ? 'alert' : 'status'}
      className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
    >
      {message.text}
    </p>
  )
}

export default function ProfileForm({
  userId,
  email,
  initialFirstName,
  initialLastName,
  initialAvatarUrl,
}: Props) {
  const router = useRouter()

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [savingNames, setSavingNames] = useState(false)
  const [namesMessage, setNamesMessage] = useState<Message | null>(null)

  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarMessage, setAvatarMessage] = useState<Message | null>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null
    setAvatarMessage(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setFile(null)

    if (!chosen) return

    if (!IMAGE_EXTENSIONS[chosen.type]) {
      setAvatarMessage({
        type: 'error',
        text: 'Please choose a JPG, PNG, WebP, or GIF image.',
      })
      event.target.value = ''
      return
    }
    if (chosen.size > MAX_AVATAR_BYTES) {
      setAvatarMessage({ type: 'error', text: 'Image must be 2 MB or smaller.' })
      event.target.value = ''
      return
    }

    setFile(chosen)
    setPreviewUrl(URL.createObjectURL(chosen))
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setAvatarMessage(null)

    const supabase = createClient()
    const fileName = `avatar.${IMAGE_EXTENSIONS[file.type]}`
    const path = `${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' })

    if (uploadError) {
      setAvatarMessage({
        type: 'error',
        text: `Photo upload failed: ${describeStorageError(uploadError.message)}`,
      })
      setUploading(false)
      return
    }

    // Remove an older avatar saved with a different extension (e.g. avatar.png → avatar.jpg).
    const { data: existing } = await supabase.storage.from(AVATAR_BUCKET).list(userId)
    const stale = (existing ?? [])
      .filter((f) => f.name.startsWith('avatar.') && f.name !== fileName)
      .map((f) => `${userId}/${f.name}`)
    if (stale.length) {
      await supabase.storage.from(AVATAR_BUCKET).remove(stale)
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
    // Version param so browsers/CDN show the new photo even though the path is reused.
    const newAvatarUrl = `${data.publicUrl}?v=${Date.now()}`

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', userId)
      .select('id')

    if (updateError || !updated?.length) {
      setAvatarMessage({
        type: 'error',
        text: `Photo uploaded, but saving it to your profile failed: ${
          updateError?.message ?? 'no profile row was updated (check profiles RLS policies).'
        }`,
      })
    } else {
      setAvatarUrl(newAvatarUrl)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setFile(null)
      setAvatarMessage({ type: 'success', text: 'Profile photo updated!' })
      router.refresh()
    }

    setUploading(false)
  }

  async function handleSaveNames(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingNames(true)
    setNamesMessage(null)

    const supabase = createClient()
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
      })
      .eq('id', userId)
      .select('id')

    if (error) {
      setNamesMessage({ type: 'error', text: `Save failed: ${error.message}` })
    } else if (!updated?.length) {
      setNamesMessage({
        type: 'error',
        text: 'Save failed: no profile row was updated. Check that the profiles RLS policies are applied.',
      })
    } else {
      setNamesMessage({ type: 'success', text: 'Your name has been saved.' })
      // Re-render server components (nav banner, dashboard greeting).
      router.refresh()
    }

    setSavingNames(false)
  }

  const displayName = firstName.trim() || email

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Profile photo</h2>
          <p className="text-sm text-muted">JPG, PNG, WebP, or GIF up to 2 MB.</p>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar url={previewUrl ?? avatarUrl} name={displayName} size="lg" />
          <div className="flex flex-wrap items-center gap-2">
            <label className="btn btn-secondary cursor-pointer">
              {avatarUrl ? 'Choose new photo' : 'Choose photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            {file && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="btn btn-primary"
              >
                {uploading ? 'Uploading…' : 'Upload photo'}
              </button>
            )}
          </div>
        </div>
        {file && !uploading && (
          <p className="text-sm text-muted">
            Selected: {file.name}. Click “Upload photo” to save it.
          </p>
        )}
        <StatusMessage message={avatarMessage} />
      </section>

      <form onSubmit={handleSaveNames} className="card space-y-4">
        <h2 className="text-lg font-semibold">Your name</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">First name</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              placeholder="Ada"
              className="input"
            />
          </label>
          <label className="block">
            <span className="label">Last name</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              placeholder="Lovelace"
              className="input"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={savingNames} className="btn btn-primary">
            {savingNames ? 'Saving…' : 'Save name'}
          </button>
        </div>
        <StatusMessage message={namesMessage} />
      </form>
    </div>
  )
}
