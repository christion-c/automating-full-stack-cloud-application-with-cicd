CREATE TABLE IF NOT EXISTS sample_data (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

INSERT INTO sample_data (name)
VALUES ('alpha'), ('beta'), ('gamma')
ON CONFLICT DO NOTHING;