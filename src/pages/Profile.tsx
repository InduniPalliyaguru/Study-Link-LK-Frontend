import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { api } from "../services/api"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { setUser } from "../features/auth/authSlice"
import type {
  ApiResponse,
  ListingSummary,
  PublicProfile,
  ReviewsData,
  User,
} from "../types/api"
import { DISTRICTS, EDUCATION_LEVELS } from "../utils/constants"
import { getErrorMessage } from "../utils/errors"
import { formatDate } from "../utils/format"
import { inputClass } from "../utils/styles"
import PasswordInput from "../components/PasswordInput"

const label = "mt-4 mb-1.5 block text-sm font-bold"
const card = "rounded-2xl border border-line bg-card p-5 backdrop-blur md:p-6"

export default function Profile() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const [form, setForm] = useState(() => ({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    district: user?.district ?? "",
    institution: user?.institution ?? "",
    educationLevel: user?.educationLevel ?? "",
  }))
  const [saving, setSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState({ text: "", ok: true })

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  })
  const [passwordMessage, setPasswordMessage] = useState({ text: "", ok: true })
  const [changing, setChanging] = useState(false)

  const [stats, setStats] = useState<{
    listed: number
    sold: number
    average: number
    count: number
  } | null>(null)
  const [reviews, setReviews] = useState<ReviewsData["reviews"]>([])

  useEffect(() => {
    if (!user) {
      return
    }

    Promise.all([
      api.get<ApiResponse<PublicProfile>>(`/users/${user.id}/public`),
      api.get<ApiResponse<ListingSummary[]>>("/listings/mine"),
      api.get<ApiResponse<ReviewsData>>(`/users/${user.id}/reviews`),
    ])
      .then(([profile, mine, reviewData]) => {
        setStats({
          listed: mine.data.data.length,
          sold: profile.data.data.booksSold,
          average: profile.data.data.rating.average,
          count: profile.data.data.rating.count,
        })
        setReviews(reviewData.data.data.reviews)
      })
      .catch(() => setStats(null))
  }, [user?.id])

  if (!user) {
    return null
  }

  const updateForm = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    setProfileMessage({ text: "", ok: true })
    setSaving(true)

    try {
      const response = await api.put<ApiResponse<User>>("/users/me", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        district: form.district,
        institution: form.institution.trim(),
        ...(form.educationLevel && { educationLevel: form.educationLevel }),
      })

      dispatch(setUser(response.data.data))
      setProfileMessage({ text: "Your profile was updated", ok: true })
    } catch (err) {
      setProfileMessage({ text: getErrorMessage(err), ok: false })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordMessage({ text: "", ok: true })

    if (passwords.next.length < 8) {
      setPasswordMessage({
        text: "The new password must be at least 8 characters",
        ok: false,
      })
      return
    }

    if (passwords.next !== passwords.confirm) {
      setPasswordMessage({ text: "The new passwords do not match", ok: false })
      return
    }

    setChanging(true)

    try {
      await api.put("/users/me/password", {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      })
      setPasswords({ current: "", next: "", confirm: "" })
      setPasswordMessage({ text: "Password changed successfully", ok: true })
    } catch (err) {
      setPasswordMessage({ text: getErrorMessage(err), ok: false })
    } finally {
      setChanging(false)
    }
  }

  const messageClass = (ok: boolean) =>
    `mt-3 rounded-xl px-4 py-2.5 text-sm font-semibold ${ok ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad"}`

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">My profile</h1>
      <p className="mt-1 text-mute">Your details, password and reviews</p>

      <div className={`${card} mt-5 flex flex-wrap items-center gap-5`}>
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-1 to-brand-2 font-display text-3xl font-bold text-white">
          {user.name[0]}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-bold">{user.name}</h2>
          <p className="truncate text-mute">{user.email}</p>
          {user.createdAt && (
            <p className="text-xs text-mute">
              Member since {formatDate(user.createdAt)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { value: stats ? stats.listed : "-", name: "Listed" },
            { value: stats ? stats.sold : "-", name: "Sold" },
            {
              value: stats && stats.count > 0 ? `${stats.average} ★` : "New",
              name: stats ? `${stats.count} reviews` : "Rating",
            },
          ].map((item) => (
            <div key={item.name} className="rounded-xl bg-bg/60 px-4 py-3">
              <p className="font-display text-xl font-bold">{item.value}</p>
              <p className="text-xs text-mute">{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <form onSubmit={saveProfile} className={card}>
          <h2 className="font-display text-lg font-bold">Personal details</h2>

          <label htmlFor="name" className="mt-3 mb-1.5 block text-sm font-bold">
            Full name
          </label>
          <input
            id="name"
            className={inputClass}
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            minLength={2}
            required
          />

          <label htmlFor="email" className={label}>
            Email
          </label>
          <input
            id="email"
            className={`${inputClass} opacity-60`}
            value={user.email}
            disabled
          />
          <p className="mt-1 text-xs text-mute">
            Your email cannot be changed.
          </p>

          <label htmlFor="phone" className={label}>
            Phone
          </label>
          <input
            id="phone"
            className={inputClass}
            placeholder="+94 77 123 4567"
            value={form.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
          />
          <p className="mt-1 text-xs text-mute">
            Shown to a buyer or seller only after a request is accepted.
          </p>

          <div className="grid gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="district" className={label}>
                District
              </label>
              <select
                id="district"
                className={inputClass}
                value={form.district}
                onChange={(e) => updateForm("district", e.target.value)}
                required
              >
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level" className={label}>
                Education level
              </label>
              <select
                id="level"
                className={inputClass}
                value={form.educationLevel}
                onChange={(e) => updateForm("educationLevel", e.target.value)}
              >
                <option value="">Not set</option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label htmlFor="institution" className={label}>
            School or university
          </label>
          <input
            id="institution"
            className={inputClass}
            value={form.institution}
            onChange={(e) => updateForm("institution", e.target.value)}
            maxLength={100}
          />

          {profileMessage.text && (
            <p
              className={messageClass(profileMessage.ok)}
              role={profileMessage.ok ? "status" : "alert"}
            >
              {profileMessage.text}
            </p>
          )}

          <button
            disabled={saving}
            className="mt-5 rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-7 py-2.5 font-bold text-white transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>

        <div className="space-y-5">
          <form onSubmit={changePassword} className={card}>
            <h2 className="font-display text-lg font-bold">Change password</h2>

            <label
              htmlFor="current"
              className="mt-3 mb-1.5 block text-sm font-bold"
            >
              Current password
            </label>
            <PasswordInput
              id="current"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, current: e.target.value }))
              }
              required
            />

            <label htmlFor="next" className={label}>
              New password
            </label>
            <PasswordInput
              id="next"
              autoComplete="new-password"
              value={passwords.next}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, next: e.target.value }))
              }
              required
            />

            <label htmlFor="confirm" className={label}>
              Confirm new password
            </label>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, confirm: e.target.value }))
              }
              required
            />

            {passwordMessage.text && (
              <p
                className={messageClass(passwordMessage.ok)}
                role={passwordMessage.ok ? "status" : "alert"}
              >
                {passwordMessage.text}
              </p>
            )}

            <button
              disabled={changing}
              className="mt-5 rounded-xl border border-line px-7 py-2.5 font-semibold transition hover:bg-bg disabled:opacity-60"
            >
              {changing ? "Changing..." : "Change password"}
            </button>
          </form>

          <section className={card}>
            <h2 className="font-display text-lg font-bold">
              Reviews about you
            </h2>

            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-mute">
                No reviews yet. They appear after buyers complete a purchase.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {reviews.map((review) => (
                  <li key={review._id} className="rounded-xl bg-bg/60 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">
                        {review.reviewer?.name ?? "A student"}
                      </span>
                      <span
                        className="text-accent"
                        aria-label={`${review.rating} out of 5`}
                      >
                        {"★".repeat(review.rating)}
                        <span className="text-mute">
                          {"★".repeat(5 - review.rating)}
                        </span>
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm text-mute">{review.comment}</p>
                    )}
                    <p className="mt-1 text-xs text-mute">
                      {formatDate(review.createdAt)}
                      {review.verified && (
                        <span className="ml-2 font-semibold text-ok">
                          ✓ Verified purchase
                        </span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
