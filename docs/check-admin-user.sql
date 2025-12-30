-- Check if admin user was created
SELECT
    u.Id,
    u.UserName,
    u.Email,
    u.FirstName,
    u.LastName,
    u.IsActive,
    u.EmailConfirmed,
    r.Name as RoleName
FROM Users u
INNER JOIN Roles r ON u.RoleId = r.Id
WHERE u.Email = 'admin@medicinetracking.com';

-- If no results, the user was not created yet
