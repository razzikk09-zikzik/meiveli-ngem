-- Migration: Add 'area' column and backfill demo data
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS area TEXT;

-- Backfill existing 4 reports with sensible demo areas
UPDATE public.reports SET area = 'Velachery' WHERE content = 'sbi-kyc-update.xyz';
UPDATE public.reports SET area = 'Velachery' WHERE content LIKE '%clck.ru%' OR content LIKE '%google-login%';
UPDATE public.reports SET area = 'Adyar' WHERE content = 'amazon-reward.in';
UPDATE public.reports SET area = 'Sholinganallur' WHERE content LIKE '%Your account will be blocked%';
