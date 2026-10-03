// src/pages/GuidePage.jsx — Safety guide: golden rules, common scams, emergency CTA
import { Building2, Truck, IndianRupee, Briefcase, Phone, Zap, ChevronRight, PhoneCall, XCircle, Link2, Landmark } from 'lucide-react';

const GOLDEN_RULES = [
  { icon: XCircle, color: '#DC2626', bg: '#FEF2F2', text: 'Never share your OTP' },
  { icon: Link2, color: '#2563EB', bg: '#EFF6FF', text: "Don't click unknown links" },
  { icon: Landmark, color: '#1D4ED8', bg: '#EFF6FF', text: 'Banks never ask for PIN or CVV' },
];

const SCAM_TYPES = [
  { title: 'Bank KYC scams', desc: 'Fake bank messages and links', icon: Building2, color: '#DC2626', bg: '#FEF2F2' },
  { title: 'Courier scams', desc: 'Fake delivery and refund links', icon: Truck, color: '#EA580C', bg: '#FFF7ED' },
  { title: 'UPI and QR scams', desc: 'Fraudulent payment requests', icon: IndianRupee, color: '#9333EA', bg: '#F5F3FF' },
  { title: 'Job offer scams', desc: 'Fake jobs and advance payment', icon: Briefcase, color: '#D97706', bg: '#FFFBEB' },
  { title: 'Phone call scams', desc: 'Impersonation and fake offers', icon: Phone, color: '#0D9488', bg: '#F0FDFA' },
  { title: 'Electricity bill scams', desc: 'Fake bill links and disconnections', icon: Zap, color: '#DC2626', bg: '#FEF2F2' },
];

import { useLanguage } from '../context/LanguageContext';

export default function GuidePage() {
  const { t } = useLanguage();
  return (
    <div style={{ padding: '1rem', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '32rem', margin: '0 auto', width: '100%' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{t('safetyGuide')}</h1>
        <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>{t('spotScam')}</p>
      </div>

      {/* Three golden rules */}
      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '0.875rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.125rem' }}>💡</span>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1rem', color: '#92400E' }}>{t('goldenRules')}</h2>
        </div>
        {GOLDEN_RULES.map((rule) => (
          <div key={rule.text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: rule.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <rule.icon size={16} color={rule.color} strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a' }}>{t(rule.text) || rule.text}</span>
          </div>
        ))}
      </div>

      {/* Learn about common scams */}
      <div style={{ background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.875rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', boxShadow: '0 1px 3px rgba(16,24,40,0.05)' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1rem', color: '#0f172a', marginBottom: '0.5rem' }}>{t('learnScams')}</h2>
        {SCAM_TYPES.map((s) => (
          <button
            key={s.title}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', background: 'none', border: 'none', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.color} strokeWidth={2.25} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a' }}>{t(s.title) || s.title}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{t(s.desc) || s.desc}</div>
            </div>
            <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {/* Already clicked or paid */}
      <a
        href="tel:1930"
        style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.875rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none' }}
      >
        <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PhoneCall size={22} color="#DC2626" strokeWidth={2.25} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1rem', color: '#DC2626' }}>{t('clickedOrPaid')}</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '1.0625rem', color: '#B91C1C', marginTop: '0.125rem' }}>{t('call1930Btn')}</div>
          <div style={{ fontSize: '0.8125rem', color: '#B91C1C' }}>{t('nationalHelpline')}</div>
        </div>
      </a>
    </div>
  );
}
