'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import Feedback, { type FeedbackMessage } from '@/components/Feedback'
import Spinner from '@/components/Spinner'
import { ImageIcon } from '@/components/icons'

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

function describeStorageError(message: string) {
  if (/bucket not found/i.test(message)) {
    return 'Photo storage isn’t set up yet (the "avatars" bucket is missing).'
  }
  if (/row-level security|unauthorized|403/i.test(message)) {
    return 'You don’t have permission to upload here. Try signing out and back in.'
  }
  return message
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
  const [savedNames, setSavedNames] = useState({
    first: initialFirstName.trim(),
    last: initialLastName.trim(),
  })
  const [savingNames, setSavingNames] = useState(false)
  const [namesMessage, setNamesMessage] = useState<FeedbackMessage | null>(null)

  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarMessage, setAvatarMessage] = useState<FeedbackMessage | null>(null)

  const namesChanged =
    firstName.trim() !== savedNames.first || lastName.trim() !== savedNames.last

  function clearSelectedFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setFile(null)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null
    // Reset so choosing the same file again still fires onChange.
    event.target.value = ''
    setAvatarMessage(null)
    clearSelectedFile()

    if (!chosen) return

    if (!IMAGE_EXTENSIONS[chosen.type]) {
      setAvatarMessage({
        type: 'error',
        text: 'That file type isn’t supported. Please choose a JPG, PNG, WebP, or GIF image.',
      })
      return
    }
    if (chosen.size > MAX_AVATAR_BYTES) {
      const sizeMb = (chosen.size / (1024 * 1024)).toFixed(1)
      setAvatarMessage({
        type: 'error',
        text: `That image is ${sizeMb} MB. Please choose one that’s 2 MB or smaller.`,
      })
      return
    }

    setFile(chosen)
    setPreviewUrl(URL.createObjectURL(chosen))
  }

  async function handleUpload() {
    if (!file || uploading) return
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
        text: `Photo upload failed. ${describeStorageError(uploadError.message)}`,
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
        text: `Your photo uploaded, but we couldn’t save it to your profile. ${
          updateError?.message ?? 'Please try again.'
        }`,
      })
    } else {
      setAvatarUrl(newAvatarUrl)
      clearSelectedFile()
      setAvatarMessage({ type: 'success', text: 'Profile photo updated.' })
      router.refresh()
    }

    setUploading(false)
  }

  async function handleSaveNames(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingNames || !namesChanged) return
    setSavingNames(true)
    setNamesMessage(null)

    const first = firstName.trim()
    const last = lastName.trim()
    const supabase = createClient()
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        first_name: first || null,
        last_name: last || null,
      })
      .eq('id', userId)
      .select('id')

    if (error) {
      setNamesMessage({ type: 'error', text: `We couldn’t save your name. ${error.message}` })
    } else if (!updated?.length) {
      setNamesMessage({
        type: 'error',
        text: 'We couldn’t save your name because your profile wasn’t found. Try signing out and back in.',
      })
    } else {
      setSavedNames({ first, last })
      setFirstName(first)
      setLastName(last)
      setNamesMessage({ type: 'success', text: 'Your name has been saved.' })
      // Re-render server components (nav banner, dashboard greeting).
      router.refresh()
    }

    setSavingNames(false)
  }

  const displayName = firstName.trim() || email

  return (
    <div className="space-y-6">
      <section aria-labelledby="photo-heading" className="card">
        <h2 id="photo-heading" className="text-lg font-semibold">
          Profile photo
        </h2>
        <p id="photo-rules" className="mt-1 text-sm text-muted">
          JPG, PNG, WebP, or GIF · up to 2 MB
        </p>

        <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            <Avatar url={previewUrl ?? avatarUrl} name={displayName} size="lg" />
            {previewUrl && (
              <span className="absolute -right-1 -bottom-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                Preview
              </span>
            )}
          </div>

          <div className="min-w-0 space-y-3">
            {file ? (
              <>
                <p className="text-sm break-all">
                  <span className="text-muted">Selected:</span> {file.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    aria-busy={uploading}
                    className="btn btn-primary"
                  >
                    {uploading && <Spinner />}
                    {uploading ? 'Uploading…' : 'Upload photo'}
                  </button>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    disabled={uploading}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <label className="btn btn-secondary cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
                <ImageIcon />
                {avatarUrl ? 'Change photo' : 'Choose a photo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  aria-describedby="photo-rules"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            )}
          </div>
        </div>

        <Feedback message={avatarMessage} className="mt-4" />
      </section>

      <form onSubmit={handleSaveNames} aria-labelledby="name-heading" className="card" noValidate>
        <h2 id="name-heading" className="text-lg font-semibold">
          Your name
        </h2>
        <p className="mt-1 text-sm text-muted">Used to greet you around the app.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="label">
              First name
            </label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              maxLength={100}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="last-name" className="label">
              Last name
            </label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              maxLength={100}
              className="input"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={savingNames || !namesChanged}
            aria-busy={savingNames}
            className="btn btn-primary"
          >
            {savingNames && <Spinner />}
            {savingNames ? 'Saving…' : 'Save name'}
          </button>
          {!namesChanged && !savingNames && (
            <span className="text-sm text-muted">
              {savedNames.first || savedNames.last
                ? 'No unsaved changes'
                : 'Type your name above to save it'}
            </span>
          )}
        </div>

        <Feedback message={namesMessage} className="mt-4" />
      </form>
    </div>
  )
}
