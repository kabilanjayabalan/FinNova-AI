-- ============================================================
-- Table: watchlist_items
-- ============================================================
CREATE TABLE IF NOT EXISTS watchlist_items (
    id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticker       VARCHAR(20)  NOT NULL,
    company_name VARCHAR(100),
    notes        TEXT,
    added_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_watchlist_user_ticker UNIQUE (user_id, ticker)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_ticker  ON watchlist_items(ticker);
