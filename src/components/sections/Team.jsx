'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Add your own team photos below — just drop the image into /public/team/
// and set the `photo` path on each entry (e.g. '/team/jane.jpg').
const team = [
  {
    name: 'Marcus Reyes', role: 'Founder & CEO',
    photo: '/team/marcus.jpg', // <-- INSERT IMAGE HERE (e.g. '/team/marcus.jpg')
    initials: 'MR', color: '#818cf8', tag: null,
  },
  {
    name: 'Elena Voss', role: 'Head of Operations',
    photo: '/team/elena.jpg', // <-- INSERT IMAGE HERE (e.g. '/team/elena.jpg')
    initials: 'EV', color: '#c9a84c', tag: null,
  },
  {
    name: 'Daniel Osei', role: 'Lead Security Engineer',
    photo: '/team/daniel.jpg', // <-- INSERT IMAGE HERE (e.g. '/team/daniel.jpg')
    initials: 'DO', color: '#22c55e', tag: 'At the office',
  },
];

export default function Team() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useGSAP(() => {
    gsap.fromTo(titleRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: titleRef.current, start: 'top 85%' } }
    );
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.fromTo(card,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: i * 0.1, scrollTrigger: { trigger: card, start: 'top 90%' } }
      );
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="team"
      style={{ background: '#0a0a0f', padding: '110px 0 130px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <style>{`
        .team-card {
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                      border-color 0.4s ease,
                      box-shadow 0.4s ease;
        }
        .team-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 60px rgba(0,0,0,0.4);
        }
        .team-card-photo { overflow: hidden; }
        .team-card-photo img {
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s ease;
          filter: saturate(0.92);
        }
        .team-card:hover .team-card-photo img {
          transform: scale(1.06);
          filter: saturate(1.05);
        }
        .team-card-tag {
          transition: transform 0.3s ease;
        }
        .team-card:hover .team-card-tag {
          transform: translateY(-2px);
        }
        .team-card-name {
          transition: color 0.3s ease;
        }
      `}</style>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        <div ref={titleRef} style={{ textAlign: 'center', marginBottom: 56, opacity: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 100,
            background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
            fontSize: 11, fontWeight: 700, color: '#c9a84c',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20,
          }}>
            <i className="fas fa-people-group" style={{ fontSize: 10 }}></i>
            Meet The Team
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-0.02em',
            color: '#f0f0fa', marginBottom: 14, lineHeight: 1.1,
          }}>
            The People{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Behind VAULTEX
            </span>
          </h2>
          <p style={{ fontSize: 16, color: '#5a5a78', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Real photos coming soon — initials shown for now until headshots are added.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {team.map((member, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className="team-card"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${member.color}45`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              style={{
                opacity: 0,
                background: 'linear-gradient(145deg, rgba(22,22,42,0.9) 0%, rgba(14,14,24,0.95) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 18,
                overflow: 'hidden',
              }}
            >
              <div className="team-card-photo" style={{
                position: 'relative',
                aspectRatio: '4 / 5',
                margin: 14,
                borderRadius: 12,
                overflow: 'hidden',
                background: `linear-gradient(150deg, ${member.color}33, rgba(10,10,15,0.9))`,
                border: `1px solid ${member.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {member.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 84, height: 84, borderRadius: '50%',
                    background: `${member.color}22`,
                    border: `1.5px solid ${member.color}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, fontWeight: 800, color: member.color,
                    letterSpacing: '0.02em',
                  }}>
                    {member.initials}
                  </div>
                )}
                {member.tag && (
                  <span className="team-card-tag" style={{
                    position: 'absolute', top: 12, left: 12,
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    padding: '5px 10px', borderRadius: 100,
                    background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.35)', color: '#c9a84c',
                  }}>
                    {member.tag}
                  </span>
                )}
              </div>
              <div style={{ padding: '4px 20px 22px', textAlign: 'center' }}>
                <div className="team-card-name" style={{ fontSize: 15.5, fontWeight: 700, color: '#f0f0fa', marginBottom: 3 }}>
                  {member.name}
                </div>
                <div style={{ fontSize: 13, color: '#9898b8' }}>
                  {member.role}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}