-- ============================================================
-- Table: transactions
-- ============================================================
CREATE TYPE IF NOT EXISTS transaction_type AS ENUM ('BUY', 'SELL');

CREATE TABLE IF NOT EXISTS transactions (
    id               UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id       UUID             NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
    type             transaction_type NOT NULL,
    shares           NUMERIC(15, 4)   NOT NULL CHECK (shares > 0),
    price_per_share  NUMERIC(15, 4)   NOT NULL CHECK (price_per_share > 0),
    transaction_date DATE             NOT NULL,
    notes            TEXT,
    created_at       TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_holding_id ON transactions(holding_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date       ON transactions(transaction_date DESC);
