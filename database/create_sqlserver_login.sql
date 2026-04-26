USE master;
GO

SELECT SERVERPROPERTY('IsIntegratedSecurityOnly') AS IsWindowsAuthenticationOnly;
GO

IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = 'lms_user')
BEGIN
    CREATE LOGIN lms_user WITH PASSWORD = 'Lms@123456', CHECK_POLICY = OFF;
END
ELSE
BEGIN
    ALTER LOGIN lms_user WITH PASSWORD = 'Lms@123456', CHECK_POLICY = OFF;
    ALTER LOGIN lms_user ENABLE;
END
GO

USE LibraryManagementDemo;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'lms_user')
BEGIN
    CREATE USER lms_user FOR LOGIN lms_user;
END
GO

ALTER ROLE db_datareader ADD MEMBER lms_user;
ALTER ROLE db_datawriter ADD MEMBER lms_user;
GO

SELECT
    name,
    type_desc,
    is_disabled
FROM master.sys.sql_logins
WHERE name = 'lms_user';
GO
