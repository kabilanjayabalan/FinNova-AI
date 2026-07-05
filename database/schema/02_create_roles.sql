-- ============================================================
-- Table: roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Junction table for user ↔ role (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Seed default roles
INSERT INTO roles (name) VALUES ('USER')  ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;
