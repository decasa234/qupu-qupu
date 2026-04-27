-- Migration 0003: Subjects rework
-- Wipes existing videos + subjects so the new 4-category set can be seeded clean.
-- Run db/seed.sql afterwards to populate the new subjects + sample videos.

DELETE FROM user_badge_unlocks;
DELETE FROM score_attempts;
DELETE FROM video_badge_rules;
DELETE FROM videos;
DELETE FROM subjects;
