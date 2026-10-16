'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHero from '../shared/PageHero';
import { legalDocs, legalOrder } from '@/lib/legalContent';
import { siteConfig } from '@/lib/siteConfig';

export default function LegalDocument({ slug }) {
  const doc = legalDocs[slug];
  const [activeId, setActiveId] = useState(doc.sections[0].id);

  // Scroll-spy: highlight the table-of-contents entry for the section in view.
  useEffect(() => {
    const els = doc.sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-110px 0px -65% 0px', threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [doc]);

  const goTo = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  const others = legalOrder.filter((s) => s !== slug).map((s) => legalDocs[s]);

  return (
    <>
      <PageHero
        eyebrow="Legal"
        icon={doc.icon}
        title={doc.title}
        subtitle={doc.summary}
        meta={`Last updated ${siteConfig.lastUpdated}`}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Legal' },
          { label: doc.title },
        ]}
      />

      <section style={{ padding: '64px 24px 40px' }}>
        <style>{`
          .legal-grid { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 56px; }
          .legal-toc { position: sticky; top: 110px; align-self: start; }
          .legal-toc-link { transition: color .2s ease, border-color .2s ease, background .2s ease; }
          .legal-toc-link:hover { color: #f0f0fa !important; }
          .legal-section { scroll-margin-top: 110px; }
          .legal-related { transition: transform .25s ease, border-color .25s ease, background .25s ease; }
          .legal-related:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.35) !important; background: rgba(201,168,76,0.05) !important; }
          @media (max-width: 900px) {
            .legal-grid { grid-template-columns: minmax(0, 1fr); gap: 0; }
            .legal-toc { display: none; }
          }
        `}</style>

        <div className="legal-grid" style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Table of contents */}
          <aside className="legal-toc" aria-label="On this page">
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#5a5a78', marginBottom: 14,
            }}>
              On this page
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              {doc.sections.map((s) => {
                const active = s.id === activeId;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={(e) => goTo(e, s.id)}
                    className="legal-toc-link"
                    style={{
                      padding: '8px 14px',
                      marginLeft: -1,
                      fontSize: 13,
                      lineHeight: 1.45,
                      textDecoration: 'none',
                      color: active ? '#c9a84c' : '#8888a8',
                      fontWeight: active ? 600 : 400,
                      borderLeft: `2px solid ${active ? '#c9a84c' : 'transparent'}`,
                    }}
                  >
                    {s.heading}
                  </a>
                );
              })}
            </div>
          </aside>

          {/* Document body */}
          <article style={{ minWidth: 0 }}>
            {doc.sections.map((s) => (
              <div
                key={s.id}
                id={s.id}
                className="legal-section"
                style={{ marginBottom: 44, paddingBottom: 44, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <h2 style={{
                  fontSize: 22, fontWeight: 700, color: '#f0f0fa',
                  letterSpacing: '-0.01em', marginBottom: 16,
                }}>
                  {s.heading}
                </h2>

                {s.content.map((block, i) =>
                  typeof block === 'string' ? (
                    <p key={i} style={{ fontSize: 15.5, lineHeight: 1.85, color: '#9898b8', marginBottom: 14 }}>
                      {block}
                    </p>
                  ) : (
                    <ul key={i} style={{ listStyle: 'none', margin: '4px 0 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {block.list.map((item, j) => (
                        <li key={j} style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.75, color: '#9898b8' }}>
                          <i className="fas fa-circle" style={{ fontSize: 5, color: '#c9a84c', marginTop: 11, flexShrink: 0 }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            ))}

            {/* Contact strip */}
            <div style={{
              padding: '24px 26px', borderRadius: 16, marginBottom: 56,
              background: 'linear-gradient(135deg, rgba(201,168,76,0.07), rgba(201,168,76,0.015))',
              border: '1px solid rgba(201,168,76,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: '#f0f0fa', marginBottom: 4 }}>
                  Questions about this document?
                </div>
                <div style={{ fontSize: 13.5, color: '#8888a8' }}>
                  Our team is happy to explain anything that isn’t clear.
                </div>
              </div>
              <Link href="/contact" style={{
                padding: '11px 22px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                textDecoration: 'none', color: '#0a0a0f',
                background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
              }}>
                Contact us
              </Link>
            </div>

            {/* Related documents */}
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#5a5a78', marginBottom: 16,
            }}>
              Related documents
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/legal/${o.slug}`}
                  className="legal-related"
                  style={{
                    padding: '18px', borderRadius: 14, textDecoration: 'none',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={o.icon} style={{ color: '#c9a84c', fontSize: 14 }}></i>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#e4e4f0' }}>{o.title}</span>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}