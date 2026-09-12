CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  overall TINYINT NOT NULL,
  navigation TINYINT NOT NULL,
  clarity TINYINT NOT NULL,
  design TINYINT NOT NULL,
  mobile TINYINT NOT NULL,
  speed TINYINT NOT NULL,
  trust TINYINT NOT NULL,
  nps TINYINT NULL,
  improvement TEXT NULL,
  consentToContact TINYINT(1) NOT NULL DEFAULT 0,
  email VARCHAR(255) NULL,
  source VARCHAR(2048) NULL,
  createdAt DATETIME NOT NULL,
  INDEX idx_feedback_created_at (createdAt),
  INDEX idx_feedback_overall (overall)
);

