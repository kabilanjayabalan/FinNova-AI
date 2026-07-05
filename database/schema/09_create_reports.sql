-- ============================================================
-- Table: reports  (AI-generated research reports)
-- ============================================================
CREATE TYPE IF NOT EXISTS recommendation_type AS ENUM ('BUY', 'HOLD', 'SELL');

CREATE TABLE IF NOT EXISTS reports (
    id                      UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticker                  VARCHAR(20)         NOT NULL,
    company_name            VARCHAR(200),
    title                   VARCHAR(300)        NOT NULL,
    ai_analysis             TEXT,
    recommendation          recommendation_type,
    recommendation_confidence NUMERIC(4, 3),    -- 0.000 to 1.000
    key_highlights          JSONB,              -- array of strings
    risks                   JSONB,              -- array of strings
    financial_ratios        JSONB,              -- snapshot of ratios at time of report
    sentiment_score         NUMERIC(4, 3),
    generated_at            TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id    ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_ticker     ON reports(ticker);
CREATE INDEX IF NOT EXISTS idx_reports_generated  ON reports(generated_at DESC);
