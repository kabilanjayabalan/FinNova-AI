-- ============================================================
-- Table: news_articles  (cached news from external sources)
-- ============================================================
CREATE TYPE IF NOT EXISTS sentiment_type AS ENUM ('BULLISH', 'BEARISH', 'NEUTRAL');

CREATE TABLE IF NOT EXISTS news_articles (
    id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker        VARCHAR(20),
    title         VARCHAR(500)   NOT NULL,
    summary       TEXT,
    link          VARCHAR(1000)  NOT NULL UNIQUE,
    publisher     VARCHAR(100),
    sentiment     sentiment_type,
    sentiment_score NUMERIC(4, 3),  -- -1.000 to 1.000
    published_at  TIMESTAMP,
    fetched_at    TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_ticker       ON news_articles(ticker);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment    ON news_articles(sentiment);
