-- ============================================================
-- Table: holdings
-- ============================================================
CREATE TABLE IF NOT EXISTS holdings (
    id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id  UUID           NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    ticker        VARCHAR(20)    NOT NULL,
    company_name  VARCHAR(100)   NOT NULL,
    shares        NUMERIC(15, 4) NOT NULL CHECK (shares > 0),
    average_cost  NUMERIC(15, 4) NOT NULL CHECK (average_cost > 0),
    sector        VARCHAR(50),
    created_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_holding_ticker_portfolio UNIQUE (portfolio_id, ticker)
);

CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_ticker       ON holdings(ticker);
