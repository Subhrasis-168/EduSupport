SELECT
    (SELECT COUNT(*) FROM roles) AS roles,
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM ticket_categories) AS categories,
    (SELECT COUNT(*) FROM sla_rules) AS sla_rules,
    (SELECT COUNT(*) FROM tickets) AS tickets,
    (SELECT COUNT(*) FROM ticket_assignments) AS assignments,
    (SELECT COUNT(*) FROM ticket_comments) AS comments,
    (SELECT COUNT(*) FROM ticket_activity) AS activities,
    (SELECT COUNT(*) FROM ticket_escalations) AS escalations;
    
    
    
    USE edusupport;

UPDATE users
SET password_hash = '$2b$10$t.e4HVucMqBeeOVMcPWpie5nV82cv498RlUOEp27yrppJuBTLQuVe'
WHERE email IN (
    'amit.student@edusupport.com',
    'sneha.student@edusupport.com',
    'rohit.student@edusupport.com'
);



SELECT email, password_hash
FROM users
WHERE email IN (
    'amit.student@edusupport.com',
    'sneha.student@edusupport.com',
    'rohit.student@edusupport.com'
);





USE edusupport;

SELECT
    u.id,
    u.name,
    u.email,
    u.password_hash,
    r.name AS role
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = 'rahul.staff@edusupport.com';




USE edusupport;

UPDATE users
SET password_hash = '$2b$10$j5yWThTxhDbD.bL1pN25juNySl2EZoKG.Ow12CsfxYvIoUv2Hm7DW'
WHERE email = 'rahul.staff@edusupport.com';




SELECT
    u.name,
    u.email,
    r.name AS role
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = 'rahul.staff@edusupport.com';