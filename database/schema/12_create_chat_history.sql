-- ============================================================
-- Table: chat_history  (persisted multi-turn AI conversations)
-- ============================================================
CREATE TYPE IF NOT EXISTS chat_role AS ENUM ('user', 'model');

CREATE TABLE IF NOT EXISTS chat_history (
    id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id   UUID      NOT NULL,        -- groups messages into one conversation session
    role         chat_role NOT NULL,
    content      TEXT      NOT NULL,
    ticker_ctx   VARCHAR(20),               -- ticker context for this message, if any
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_user_id    ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_created    ON chat_history(created_at);
