-- ============================================================
-- Table: ai_queries  (log of all AI interactions)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_queries (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query       TEXT         NOT NULL,
    response    TEXT,
    query_type  VARCHAR(30),     -- STOCK_ANALYSIS | CHAT | PORTFOLIO | RESEARCH
    ticker      VARCHAR(20),
    model_used  VARCHAR(50),
    tokens_used INT,
    latency_ms  INT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_queries_user_id    ON ai_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_queries_ticker     ON ai_queries(ticker);
CREATE INDEX IF NOT EXISTS idx_ai_queries_query_type ON ai_queries(query_type);
CREATE INDEX IF NOT EXISTS idx_ai_queries_created    ON ai_queries(created_at DESC);
