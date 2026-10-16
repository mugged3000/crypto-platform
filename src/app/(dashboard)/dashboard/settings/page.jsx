'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';

function SectionCard({ children }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: '28px 26px',
      marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 22 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'rgba(201,168,76,0.1)',
        border: '1px solid rgba(201,168,76,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className={icon} style={{ fontSize: 14, color: '#c9a84c' }}></i>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0fa' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: '#5a5a78', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function FormInput({ label, name, type = 'text', value, onChange, placeholder, error, disabled, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 10,
          color: disabled ? '#5a5a78' : '#f0f0fa',
          fontSize: 14,
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text',
          transition: 'all 0.2s ease',
        }}
        onFocus={(e) => { if (!disabled) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; }}
      />
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444' }}>
          <i className="fas fa-circle-exclamation" style={{ fontSize: 11 }}></i>{error}
        </div>
      )}
      {hint && !error && <div style={{ fontSize: 12, color: '#5a5a78' }}>{hint}</div>}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const pageRef = useRef(null);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null); // local preview before upload confirms
  const [removingAvatar, setRemovingAvatar] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  // Writes the updated user to localStorage AND tells the dashboard layout
  // (navbar/sidebar) to pick up the change immediately — otherwise a new
  // avatar wouldn't show up in those places until a full page reload.
  const syncUser = (updated) => {
    localStorage.setItem('vaultex_user', JSON.stringify(updated));
    window.dispatchEvent(new Event('vaultex:user-updated'));
  };

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.settings-section') || [],
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [loadingUser] });

  // Load the freshest copy of the user from the server (not just the
  // possibly-stale copy cached in localStorage at login time).
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (res.status === 401) {
          router.replace('/login');
          return;
        }
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setForm({
            firstName: data.user.firstName || '',
            lastName:  data.user.lastName  || '',
            phone:     data.user.phone     || '',
          });
          // Keep the locally-cached copy in sync too, since the sidebar/
          // navbar read from localStorage for their avatar initials.
          syncUser(data.user);
        } else {
          toast.error(data.error || 'Could not load your profile');
        }
      } catch {
        toast.error('Network error loading your profile');
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, [router]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else toast.error(data.error || 'Could not save changes');
        return;
      }
      setUser((prev) => ({ ...prev, ...data.user }));
      syncUser({ ...user, ...data.user });
      toast.success('Profile updated');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarPick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Please choose a JPG, PNG, WEBP, or GIF image.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be under 3MB.');
      return;
    }

    // Instant local preview while the real upload happens in the background.
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/user/avatar', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Upload failed');
        setAvatarPreview(null);
        return;
      }

      setUser((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
      syncUser({ ...user, avatarUrl: data.avatarUrl });
      toast.success('Profile photo updated');
    } catch {
      toast.error('Network error uploading your photo.');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      URL.revokeObjectURL(localUrl);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setRemovingAvatar(true);
    try {
      const res = await fetch('/api/user/avatar', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not remove photo');
        return;
      }
      setAvatarPreview(null);
      setUser((prev) => ({ ...prev, avatarUrl: null }));
      syncUser({ ...user, avatarUrl: null });
      toast.success('Profile photo removed');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Clear the httpOnly cookie server-side too, not just localStorage.
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      localStorage.removeItem('vaultex_token');
      localStorage.removeItem('vaultex_user');
      router.push('/login');
    }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;
  const displayAvatar = avatarPreview || user?.avatarUrl;

  if (loadingUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
      </div>
    );
  }

  return (
    <div ref={pageRef} style={{ maxWidth: 720 }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
          Manage your profile, photo, and account.
        </p>
      </div>

      {/* ── Profile photo ─────────────────────────────────── */}
      <div className="settings-section">
        <SectionCard>
          <SectionHeading
            icon="fas fa-camera"
            title="Profile Photo"
            subtitle="JPG, PNG, WEBP, or GIF — max 3MB"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
              {displayAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayAvatar}
                  alt="Profile"
                  style={{
                    width: 84, height: 84, borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(201,168,76,0.3)',
                  }}
                />
              ) : (
                <div style={{
                  width: 84, height: 84, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 700, color: '#0a0a0f',
                }}>
                  {initials || <i className="fas fa-user"></i>}
                </div>
              )}

              {uploadingAvatar && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(10,10,15,0.65)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 18 }}></i>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={handleAvatarPick}
                  disabled={uploadingAvatar}
                  style={{
                    padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                    background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
                    color: '#0a0a0f', border: 'none',
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                    opacity: uploadingAvatar ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <i className="fas fa-upload" style={{ fontSize: 12 }}></i>
                  {user?.avatarUrl ? 'Change photo' : 'Upload photo'}
                </button>

                {user?.avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={removingAvatar || uploadingAvatar}
                    style={{
                      padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#ef4444',
                      cursor: (removingAvatar || uploadingAvatar) ? 'not-allowed' : 'pointer',
                      opacity: removingAvatar ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    {removingAvatar
                      ? <i className="fas fa-spinner fa-spin" style={{ fontSize: 12 }}></i>
                      : <i className="fas fa-trash" style={{ fontSize: 12 }}></i>}
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Personal information ──────────────────────────── */}
      <div className="settings-section">
        <SectionCard>
          <SectionHeading
            icon="fas fa-id-badge"
            title="Personal Information"
          />

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormInput
                  label="First Name" name="firstName"
                  value={form.firstName} onChange={handleFormChange}
                  error={errors.firstName}
                />
                <FormInput
                  label="Last Name" name="lastName"
                  value={form.lastName} onChange={handleFormChange}
                  error={errors.lastName}
                />
              </div>

              <FormInput
                label="Phone Number" name="phone" type="tel"
                value={form.phone} onChange={handleFormChange}
                placeholder="+1 234 567 8900"
                error={errors.phone}
              />

              <FormInput
                label="Email Address" name="email"
                value={user?.email || ''}
                disabled
                hint="Your email is tied to your account and can't be changed here."
              />

              <div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  style={{
                    padding: '11px 22px', borderRadius: 9, fontSize: 13.5, fontWeight: 700,
                    background: savingProfile ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                    color: '#0a0a0f', border: 'none',
                    cursor: savingProfile ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {savingProfile
                    ? <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                    : <><i className="fas fa-check"></i> Save Changes</>}
                </button>
              </div>
            </div>
          </form>
        </SectionCard>
      </div>

      {/* ── Account ────────────────────────────────────────── */}
      <div className="settings-section">
        <SectionCard>
          <SectionHeading
            icon="fas fa-shield-halved"
            title="Account"
            subtitle={`Signed in as ${user?.email || ''}`}
          />

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', padding: '13px', borderRadius: 10,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: 14, fontWeight: 700,
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => { if (!loggingOut) e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            {loggingOut
              ? <><i className="fas fa-spinner fa-spin"></i> Signing out...</>
              : <><i className="fas fa-right-from-bracket"></i> Sign Out</>}
          </button>
        </SectionCard>
      </div>

    </div>
  );
}
