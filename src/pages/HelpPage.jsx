// src/pages/HelpPage.jsx — helplines, FAQ accordion, about card
import { useState } from 'react';
import { PhoneCall, Globe, Landmark, ChevronRight, ChevronDown } from 'lucide-react';

const HELPLINES = [
  {
    title: 'Call 1930',
    desc: 'National cybercrime helpline',
    sub: 'Available 24×7',
    icon: PhoneCall,
    color: '#16A34A',
    bg: '#F0FDF4',
    href: 'tel:1930',
  },
  {
    title: 'cybercrime.gov.in',
    desc: 'File an online complaint',
    sub: 'Official government portal',
    icon: Globe,
    color: '#2563EB',
    bg: '#EFF6FF',
    href: 'https://cybercrime.gov.in',
    external: true,
  },
  {
    title: 'Your bank',
    desc: 'Call the number on your card',
    sub: 'Report and block transactions',
    icon: Landmark,
    color: '#1D4ED8',
    bg: '#EFF6FF',
    href: null,
  },
];

const FAQS = [
  {
    q: 'What should I do if I clicked a link?',
    a: "Don't enter any details on the page. If you already did, call your bank immediately to block your card and reset credentials, then call 1930. Change passwords for any account you logged into.",
  },
  {
    q: 'I shared my OTP. What now?',
    a: 'Call your bank right away and block all transactions, change your UPI PIN, and report the fraud at cybercrime.gov.in. The first hour (golden hour) is critical for freezing the money.',
  },
  {
    q: 'How do I report a scam?',
    a: 'Use the Report a Scam tab — it takes under a minute and is anonymous by default. If you lost money, also call 1930 or file a complaint on cybercrime.gov.in.',
  },
  {
    q: 'Is this number safe?',
    a: 'Paste the message or number into the checker on the home screen. You can also check recent reports on the Active Threats map and search the number online before responding.',
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState(null);

  return (
    <div style={{ padding: '1rem', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '32rem', margin: '0 auto', width: '100%' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Help and resources</h1>
        <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>Where to turn if you've been scammed.</p>
      </div>

      {/* Helplines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {HELPLINES.map((h) => {
          const inner = (
            <>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: h.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <h.icon size={22} color={h.color} strokeWidth={2.25} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>{h.title}</div>
                <div style={{ fontSize: '0.8125rem', color: '#475569' }}>{h.desc}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{h.sub}</div>
              </div>
              <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
            </>
          );
          const style = {
            background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.875rem', padding: '0.875rem',
            display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none',
            boxShadow: '0 1px 3px rgba(16,24,40,0.05)', cursor: h.href ? 'pointer' : 'default', width: '100%',
          };
          return h.href ? (
            <a key={h.title} href={h.href} target={h.external ? '_blank' : undefined} rel={h.external ? 'noreferrer' : undefined} style={style}>{inner}</a>
          ) : (
            <div key={h.title} style={style}>{inner}</div>
          );
        })}
      </div>

      {/* FAQ accordion */}
      <div style={{ background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.875rem', padding: '1rem', boxShadow: '0 1px 3px rgba(16,24,40,0.05)' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>Common questions</h2>
        {FAQS.map((f, i) => (
          <div key={f.q} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', width: '100%', padding: '0.75rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: '600', fontSize: '0.9375rem', color: '#1e293b' }}>{f.q}</span>
              {open === i ? <ChevronDown size={18} color="#2563EB" style={{ flexShrink: 0 }} /> : <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />}
            </button>
            {open === i && (
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, padding: '0 0 0.875rem' }}>{f.a}</p>
            )}
          </div>
        ))}
      </div>

      {/* About card */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '0.875rem', padding: '1.25rem', textAlign: 'center' }}>
        <img src="/assets/eye-mark.png" alt="MEYVIZHI logo" style={{ width: '3.5rem', height: '3.5rem', objectFit: 'contain', margin: '0 auto 0.5rem', display: 'block' }} />
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1.125rem', color: '#1e3A8A', letterSpacing: '0.02em' }}>
          MEYVIZHI <span style={{ fontWeight: '600' }}>மெய்விழி</span>
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#2563EB', fontWeight: '600', marginTop: '0.125rem' }}>See the scam. Trace the threat.</div>
        <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, marginTop: '0.625rem' }}>
          A community-powered platform to detect, report and stop scams in our neighbourhoods.
        </p>
      </div>
    </div>
  );
}
