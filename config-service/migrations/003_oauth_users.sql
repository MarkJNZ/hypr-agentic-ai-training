-- Migrate users table from password-based auth to GitHub OAuth
-- Drop the seeded admin user and password_hash column
-- Add GitHub OAuth columns

-- Remove existing password-based users
DELETE FROM users;

-- Drop password_hash column
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Add GitHub OAuth columns
ALTER TABLE users ADD COLUMN github_id BIGINT UNIQUE NOT NULL;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Update username column to allow longer GitHub usernames
ALTER TABLE users ALTER COLUMN username TYPE VARCHAR(255);
