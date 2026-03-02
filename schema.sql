CREATE TABLE IF NOT EXISTS Contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phoneNumber VARCHAR(20) NULL,
  email VARCHAR(255) NULL,
  linkedId INT NULL,
  linkPrecedence ENUM('primary','secondary') NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME NULL,
  INDEX idx_email (email),
  INDEX idx_phone (phoneNumber),
  INDEX idx_linkedId (linkedId)
);
