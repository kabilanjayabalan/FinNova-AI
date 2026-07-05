-- ============================================================
-- Table: notifications
-- ============================================================
CREATE TYPE IF NOT EXISTS notification_type AS ENUM (
    'PRICE_ALERT', 'AI_INSIGHT', 'PORTFOLIO_SUMMARY', 'NEWS_DIGEST', 'SYSTEM'
);

CREATE TABLE IF NOT EXISTS notifications (
    id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(200)      NOT NULL,
    message     TEXT              NOT NULL,
    ticker      VARCHAR(20),
    is_read     BOOLEAN           NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP         NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id  ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read  ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created  ON notifications(created_at DESC);
