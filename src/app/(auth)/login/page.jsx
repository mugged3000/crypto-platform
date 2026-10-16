'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';

// Reusable input component — mirrors the one used on the register page so
// both auth screens stay visually and behaviorally identical.
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

      {hint && !error && (
        <div style={{ fontSize: 12, color: '#5a5a78' }}>{hint}</div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router  = useRouter();
  const pageRef = useRef(null);
  const cardRef = useRef(null);
  const formRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [remember, setRemember] = useState(false);

  const [form, setForm] = useState({
    email:    '',
    password: '',
  });

  // Entry animation — same choreography as the register card.
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

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const shakeCard = () => {
    gsap.fromTo(cardRef.current,
      { x: -8 },
      { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      shakeCard();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, remember }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          shakeCard();
        } else {
          toast.error(data.error || 'Invalid email or password');
          shakeCard();
        }
        return;
      }

     // Save token and user to localStorage
        localStorage.setItem('vaultex_token', data.token);
        localStorage.setItem('vaultex_user', JSON.stringify(data.user));

        toast.success(`Welcome back, ${data.user.firstName}!`);
        router.push('/dashboard');

    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

      <div style={{ width: '100%', maxWidth: 440 }}>

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
          {/* Top accent */}
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
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: '#5a5a78' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{
                color: '#c9a84c', textDecoration: 'none', fontWeight: 600,
              }}>
                Create one
              </Link>
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div className="form-field">
                <FormInput
                  label="Email Address" name="email" type="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com" icon="fas fa-envelope"
                  error={errors.email}
                />
              </div>

              <div className="form-field">
                <FormInput
                  label="Password" name="password" type="password" required
                  value={form.password} onChange={handleChange}
                  placeholder="Enter your password" icon="fas fa-lock"
                  error={errors.password}
                />
              </div>

              {/* Remember me + forgot password */}
              <div className="form-field" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 10,
              }}>
                <label style={{
                  display: 'flex', alignItems: 'center',
                  gap: 8, cursor: 'pointer',
                }}>
                  <div
                    onClick={() => setRemember(!remember)}
                    style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      background: remember ? 'linear-gradient(135deg, #c9a84c, #a8722a)' : 'transparent',
                      border: `1px solid ${remember ? '#c9a84c' : 'rgba(255,255,255,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {remember && (
                      <i className="fas fa-check" style={{ fontSize: 8, color: '#0a0a0f' }}></i>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: '#5a5a78' }}>Remember me</span>
                </label>

                <Link href="/forgot-password" style={{
                  fontSize: 13, color: '#c9a84c', textDecoration: 'none', fontWeight: 600,
                }}>
                  Forgot password?
                </Link>
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
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