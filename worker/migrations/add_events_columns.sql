-- Migration: Add missing columns to events table
-- Date: 2026-01-26

-- Add phone column if not exists
ALTER TABLE events ADD COLUMN phone TEXT;

-- Add whatsapp column if not exists
ALTER TABLE events ADD COLUMN whatsapp TEXT;

-- Add website column if not exists
ALTER TABLE events ADD COLUMN website TEXT;
