-- ============================================================
-- Table: audit_logs  (system-wide audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         REFERENCES users(id) ON DELETE SET NULL,
    action        VARCHAR(100) NOT NULL,  -- e.g. USER_LOGIN, PORTFOLIO_CREATED, HOLDING_DELETED
    entity_type   VARCHAR(50),            -- e.g. Portfolio, Holding, WatchlistItem
    entity_id     UUID,
    old_value     JSONB,                  -- snapshot before change
    new_value     JSONB,                  -- snapshot after change
    ip_address    VARCHAR(45),
    user_agent    VARCHAR(500),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id     ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action      ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at  ON audit_logs(created_at DESC);
