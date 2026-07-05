-- ============================================================
-- Table: portfolios
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolios (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    currency    VARCHAR(10)  NOT NULL DEFAULT 'USD',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_portfolio_name_user UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
