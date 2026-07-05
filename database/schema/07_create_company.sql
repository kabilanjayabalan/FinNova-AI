-- ============================================================
-- Table: companies  (master reference data)
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker       VARCHAR(20)  NOT NULL UNIQUE,
    name         VARCHAR(200) NOT NULL,
    sector       VARCHAR(100),
    industry     VARCHAR(100),
    exchange     VARCHAR(20),
    country      VARCHAR(50),
    description  TEXT,
    website      VARCHAR(255),
    logo_url     VARCHAR(255),
    market_cap   NUMERIC(20, 2),
    employees    BIGINT,
    founded_year INT,
    last_synced  TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_ticker  ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector  ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_name    ON companies(name);
