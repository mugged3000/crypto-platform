'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import  countries  from 'world-countries';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';

// Build country options from world-countries
const countryOptions = countries
  .sort((a, b) => a.name.common.localeCompare(b.name.common))
  .map((c) => ({
    value: c.name.common,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>{c.flag}</span>
        <span>{c.name.common}</span>
      </div>
    ),
    searchLabel: c.name.common,
  }));

// Custom styles for react-select to match our dark theme.
// menuPortalTarget (set on the component below) renders the dropdown into
// document.body instead of inline — this is what fixes the truncated list:
// the card it used to render inside has `overflow: hidden` for its rounded
// corner accents, which was clipping the menu after ~2-3 options.
const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${state.isFocused ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 10,
    padding: '4px 4px',
    boxShadow: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: 'rgba(201,168,76,0.4)',
    },
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (base) => ({
    ...base,
    background: '#16162a',
    border: '1px solid rgba(201,168,76,0.15)',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  }),
  menuList: (base) => ({
    ...base,
    padding: 4,
    maxHeight: 280,
    // Themed scrollbar so the (now fully reachable) full country list
    // doesn't look like a bare unstyled browser scrollbar.
    scrollbarWidth: 'thin',
    scrollbarColor: '#c9a84c rgba(255,255,255,0.06)',
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? 'rgba(201,168,76,0.15)'
      : state.isFocused
      ? 'rgba(255,255,255,0.05)'
      : 'transparent',
    color: state.isSelected ? '#c9a84c' : '#f0f0fa',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    padding: '10px 12px',
    '&:active': {
      background: 'rgba(201,168,76,0.2)',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#f0f0fa',
    fontSize: 14,
  }),
  placeholder: (base) => ({
    ...base,
    color: '#5a5a78',
    fontSize: 14,
  }),
  input: (base) => ({
    ...base,
    color: '#f0f0fa',
    fontSize: 14,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#5a5a78',
    '&:hover': { color: '#c9a84c' },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#5a5a78',
    '&:hover': { color: '#ef4444' },
  }),
};

// Password strength calculator
function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak',   color: '#ef4444', width: '20%' };
  if (score <= 2) return { label: 'Fair',   color: '#f97316', width: '40%' };
  if (score <= 3) return { label: 'Good',   color: '#eab308', width: '60%' };
  if (score <= 4) return { label: 'Strong', color: '#22c55e', width: '80%' };
  return             { label: 'Very Strong', color: '#c9a84c', width: '100%' };
}

// Reusable input component
function FormInput({
  label, name, type = 'text', value, onChange,
  placeholder, error, icon, required, hint,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#9898b8',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {label}
        {required && (
          <span style={{ color: '#c9a84c', fontSize: 12 }}>*</span>
        )}
      </label>

      <div style={{ position: 'relative' }}>
        {/* Left icon */}
        {icon && (
          <div style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: error ? '#ef4444' : '#5a5a78',
            fontSize: 13,
            zIndex: 1,
            transition: 'color 0.2s',
          }}>
            <i className={icon}></i>
          </div>
        )}

        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: `13px ${isPassword ? '44px' : '14px'} 13px ${icon ? '40px' : '14px'}`,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 10,
            color: '#f0f0fa',
            fontSize: 14,
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error
              ? 'rgba(239,68,68,0.6)'
              : 'rgba(201,168,76,0.5)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? 'rgba(239,68,68,0.5)'
              : 'rgba(255,255,255,0.08)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          }}
        />

        {/* Show/hide password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#5a5a78',
              cursor: 'pointer',
              fontSize: 13,
              padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#c9a84c'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#5a5a78'; }}
          >
            <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: '#ef4444',
        }}>
          <i className="fas fa-circle-exclamation" style={{ fontSize: 11 }}></i>
          {error}
        </div>
      )}

      {/* Hint */}
      {hint && !error && (
        <div style={{ fontSize: 12, color: '#5a5a78' }}>{hint}</div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router    = useRouter();
  const pageRef   = useRef(null);
  const cardRef   = useRef(null);
  const formRef   = useRef(null);

  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [errors,    setErrors]    = useState({});
  const [agreed,    setAgreed]    = useState(false);
  const [showRef,   setShowRef]   = useState(false);

  const [form, setForm] = useState({
    firstName:       '',
    lastName:        '',
    email:           '',
    country:         '',
    password:        '',
    confirmPassword: '',
    referralCode:    '',
  });

  const strength = form.password ? getPasswordStrength(form.password) : null;

  // Entry animation
  useGSAP(() => {
    gsap.fromTo(cardRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
    gsap.fromTo(
      formRef.current?.querySelectorAll('.form-field') || [],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out', delay: 0.3 }
    );
  }, { scope: pageRef });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCountryChange = (option) => {
    setForm((prev) => ({ ...prev, country: option?.searchLabel || '' }));
    setErrors((prev) => ({ ...prev, country: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!form.country)          e.country   = 'Please select your country';
    if (!form.email.trim())     e.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Invalid email address';
    if (!form.password)         e.password  = 'Password is required';
    else if (form.password.length < 8)
      e.password = 'At least 8 characters';
    else if (!/[A-Z]/.test(form.password))
      e.password = 'Must include an uppercase letter';
    else if (!/[0-9]/.test(form.password))
      e.password = 'Must include a number';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    if (!agreed)
      e.agreed = 'You must agree to the terms';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Shake animation on error
      gsap.fromTo(cardRef.current,
        { x: -8 },
        { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          gsap.fromTo(cardRef.current,
            { x: -8 },
            { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
          );
        } else {
          toast.error(data.error || 'Registration failed');
        }
        return;
      }

      // Success
      setSubmittedEmail(form.email);
      setSubmitted(true);

    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          background: 'linear-gradient(145deg, rgba(20,20,36,0.98), rgba(12,12,22,0.99))',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '16px 16px 16px 4px',
          padding: '52px 40px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top accent */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
          }} />

          {/* Icon */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(201,168,76,0.2)',
          }}>
            <i className="fas fa-envelope-circle-check"
              style={{ fontSize: 32, color: '#c9a84c' }}
            ></i>
          </div>

          <h2 style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#f0f0fa',
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}>
            Check your inbox
          </h2>

          <p style={{
            fontSize: 15,
            color: '#5a5a78',
            lineHeight: 1.7,
            marginBottom: 8,
          }}>
            We sent a verification link to
          </p>

          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#c9a84c',
            marginBottom: 24,
            padding: '10px 20px',
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 8,
            display: 'inline-block',
          }}>
            {submittedEmail}
          </div>

          <p style={{
            fontSize: 13,
            color: '#5a5a78',
            lineHeight: 1.7,
            marginBottom: 32,
          }}>
            Click the link in the email to activate your account.
            The link expires in <strong style={{ color: '#9898b8' }}>24 hours</strong>.
          </p>

          {/* Steps */}
          {[
            { icon: 'fas fa-inbox',        text: 'Open your email inbox' },
            { icon: 'fas fa-envelope-open', text: 'Find the email from VAULTEX' },
            { icon: 'fas fa-mouse-pointer', text: 'Click "Verify Email Address"' },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              marginBottom: 8,
              textAlign: 'left',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i className={step.icon} style={{ fontSize: 12, color: '#c9a84c' }}></i>
              </div>
              <span style={{ fontSize: 13, color: '#9898b8' }}>{step.text}</span>
            </div>
          ))}

          <p style={{ fontSize: 12, color: '#5a5a78', marginTop: 24 }}>
            Didn&apos;t receive it? Check your spam folder.
          </p>

          <Link href="/login" style={{ textDecoration: 'none', display: 'block', marginTop: 20 }}>
            <button style={{
              width: '100%',
              padding: '13px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              background: 'transparent',
              color: '#9898b8',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
              e.currentTarget.style.color = '#c9a84c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#9898b8';
            }}
            >
              ← Back to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Register Form ──────────────────────────────────────────────
  return (
    <div
      ref={pageRef}
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* BG glow */}
      <div style={{
        position: 'fixed',
        top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(201,168,76,0.3)',
            }}>
              <i className="fas fa-chart-line" style={{ color: '#0a0a0f', fontSize: 14 }}></i>
            </div>
            <span style={{
              fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #f0f0fa 0%, #c9a84c 60%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              VAULTEX
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          ref={cardRef}
          style={{
            background: 'linear-gradient(145deg, rgba(20,20,36,0.98), rgba(12,12,22,0.99))',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: '4px 24px 24px 24px',
            padding: '40px 36px',
            position: 'relative',
            opacity: 0,
          }}
        >
          {/* Top accent — clipped to the card's own rounded corners via its
              own overflow, so the card no longer needs overflow:hidden
              (which was the thing clipping the react-select dropdown). */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: 2,
            borderRadius: '4px 24px 0 0',
            overflow: 'hidden',
            background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
          }} />

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: 24, fontWeight: 800,
              color: '#f0f0fa', marginBottom: 6,
              letterSpacing: '-0.02em',
            }}>
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: '#5a5a78' }}>
              Already have an account?{' '}
              <Link href="/login" style={{
                color: '#c9a84c', textDecoration: 'none', fontWeight: 600,
              }}>
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Name row */}
              <div className="form-field" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}>
                <FormInput
                  label="First Name" name="firstName" required
                  value={form.firstName} onChange={handleChange}
                  placeholder="John" icon="fas fa-user"
                  error={errors.firstName}
                />
                <FormInput
                  label="Last Name" name="lastName" required
                  value={form.lastName} onChange={handleChange}
                  placeholder="Doe" icon="fas fa-user"
                  error={errors.lastName}
                />
              </div>

              {/* Country */}
              <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Country <span style={{ color: '#c9a84c', fontSize: 12 }}>*</span>
                </label>
                <Select
                  options={countryOptions}
                  onChange={handleCountryChange}
                  styles={selectStyles}
                  placeholder="Search your country..."
                  isSearchable
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPlacement="auto"
                  filterOption={(option, input) =>
                    option.data.searchLabel.toLowerCase().includes(input.toLowerCase())
                  }
                />
                {errors.country && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444' }}>
                    <i className="fas fa-circle-exclamation" style={{ fontSize: 11 }}></i>
                    {errors.country}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="form-field">
                <FormInput
                  label="Email Address" name="email" type="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com" icon="fas fa-envelope"
                  error={errors.email}
                />
              </div>

              {/* Password */}
              <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <FormInput
                  label="Password" name="password" type="password" required
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 8 characters" icon="fas fa-lock"
                  error={errors.password}
                />

                {/* Strength bar */}
                {form.password && strength && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{
                      height: 3, background: 'rgba(255,255,255,0.06)',
                      borderRadius: 2, overflow: 'hidden', marginBottom: 4,
                    }}>
                      <div style={{
                        height: '100%',
                        width: strength.width,
                        background: strength.color,
                        borderRadius: 2,
                        transition: 'all 0.4s ease',
                        boxShadow: `0 0 8px ${strength.color}60`,
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>
                      {strength.label}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="form-field">
                <FormInput
                  label="Confirm Password" name="confirmPassword" type="password" required
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter password" icon="fas fa-lock-open"
                  error={errors.confirmPassword}
                />
              </div>

              {/* Referral code toggle */}
              <div className="form-field">
                <button
                  type="button"
                  onClick={() => setShowRef(!showRef)}
                  style={{
                    background: 'none', border: 'none',
                    color: '#c9a84c', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', padding: 0, display: 'flex',
                    alignItems: 'center', gap: 6,
                  }}
                >
                  <i className={`fas ${showRef ? 'fa-minus' : 'fa-plus'}`} style={{ fontSize: 11 }}></i>
                  {showRef ? 'Remove referral code' : 'Have a referral code?'}
                </button>

                {showRef && (
                  <div style={{ marginTop: 10 }}>
                    <FormInput
                      label="Referral Code" name="referralCode"
                      value={form.referralCode} onChange={handleChange}
                      placeholder="REF-XXXXXXXX" icon="fas fa-gift"
                      error={errors.referralCode}
                    />
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="form-field">
                <label style={{
                  display: 'flex', alignItems: 'flex-start',
                  gap: 10, cursor: 'pointer',
                }}>
                  <div
                    onClick={() => {
                      setAgreed(!agreed);
                      setErrors((prev) => ({ ...prev, agreed: '' }));
                    }}
                    style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      background: agreed ? 'linear-gradient(135deg, #c9a84c, #a8722a)' : 'transparent',
                      border: `1px solid ${agreed ? '#c9a84c' : errors.agreed ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease', marginTop: 2,
                    }}
                  >
                    {agreed && (
                      <i className="fas fa-check" style={{ fontSize: 9, color: '#0a0a0f' }}></i>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: '#5a5a78', lineHeight: 1.6 }}>
                    I agree to the{' '}
                    <Link href="/terms" style={{ color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" style={{ color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444', marginTop: 6 }}>
                    <i className="fas fa-circle-exclamation" style={{ fontSize: 11 }}></i>
                    {errors.agreed}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="form-field">
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading
                      ? 'rgba(201,168,76,0.4)'
                      : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                    color: '#0a0a0f',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    transition: 'all 0.25s ease',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.3)',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 32px rgba(201,168,76,0.45)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(201,168,76,0.3)';
                  }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <i className="fas fa-arrow-right" style={{ fontSize: 13 }}></i>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: 'center', fontSize: 12,
          color: '#5a5a78', marginTop: 20,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 6,
        }}>
          <i className="fas fa-shield-alt" style={{ color: '#c9a84c' }}></i>
          Your data is encrypted and secure
        </p>

      </div>
    </div>
  );
}