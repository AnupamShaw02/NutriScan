CREATE TABLE scan_history (
  id           SERIAL PRIMARY KEY,
  session_id   VARCHAR(36)  NOT NULL,
  barcode      VARCHAR(50),
  product_name VARCHAR(255),
  brand        VARCHAR(255),
  verdict      VARCHAR(20)  NOT NULL,
  product_data JSONB,
  scanned_at   TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_session_id ON scan_history(session_id);
