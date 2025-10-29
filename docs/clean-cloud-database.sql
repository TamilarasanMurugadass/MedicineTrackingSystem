-- Clean Cloud Database Script
-- Run this in your cloud MySQL database (sql12801891) BEFORE applying the new migration

-- Drop the partial __EFMigrationsHistory table
DROP TABLE IF EXISTS `__EFMigrationsHistory`;

-- Drop any partial AspNetRoles table if it exists
DROP TABLE IF EXISTS `AspNetRoles`;

-- Clean up any other tables that might have been partially created
DROP TABLE IF EXISTS `IdentityRoles`;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `UserRoles`;
DROP TABLE IF EXISTS `UserClaims`;
DROP TABLE IF EXISTS `UserLogins`;
DROP TABLE IF EXISTS `RoleClaims`;
DROP TABLE IF EXISTS `UserTokens`;

-- Drop application tables if they exist
DROP TABLE IF EXISTS `Alerts`;
DROP TABLE IF EXISTS `AuditLogs`;
DROP TABLE IF EXISTS `InventoryTransactions`;
DROP TABLE IF EXISTS `MedicineBatches`;
DROP TABLE IF EXISTS `Medicines`;
DROP TABLE IF EXISTS `Reports`;
DROP TABLE IF EXISTS `Roles`;

-- Verify all tables are dropped
SHOW TABLES;
