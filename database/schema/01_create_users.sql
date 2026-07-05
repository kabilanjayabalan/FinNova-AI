-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     VARCHAR(100)  NOT NULL,
    username      VARCHAR(50)   NOT NULL UNIQUE,
    email         VARCHAR(100)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,
    mobile_number VARCHAR(20),
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
