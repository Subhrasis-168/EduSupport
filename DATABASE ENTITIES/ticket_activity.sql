USE edusupport;

INSERT INTO ticket_activity
(
    ticket_id,
    user_id,
    action,
    old_value,
    new_value,
    description
)
VALUES

-- TKT-1001 assigned to Rahul
(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1001'),
    (SELECT id FROM users WHERE email = 'admin@edusupport.com'),
    'TICKET_ASSIGNED',
    NULL,
    'Rahul Sharma',
    'Ticket assigned to Rahul Sharma'
),

-- TKT-1002 assigned to Priya
(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1002'),
    (SELECT id FROM users WHERE email = 'admin@edusupport.com'),
    'TICKET_ASSIGNED',
    NULL,
    'Priya Das',
    'Ticket assigned to Priya Das'
),

-- TKT-1004 status changed
(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1004'),
    (SELECT id FROM users WHERE email = 'rahul.staff@edusupport.com'),
    'STATUS_CHANGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'Staff started working on the ticket'
),

-- TKT-1005 priority
(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1005'),
    (SELECT id FROM users WHERE email = 'admin@edusupport.com'),
    'PRIORITY_SET',
    NULL,
    'URGENT',
    'Ticket marked as urgent because the student cannot access the portal'
);




SELECT
    ta.id,
    t.ticket_number,
    u.name AS performed_by,
    ta.action,
    ta.old_value,
    ta.new_value,
    ta.description,
    ta.created_at
FROM ticket_activity ta
JOIN tickets t
    ON ta.ticket_id = t.id
LEFT JOIN users u
    ON ta.user_id = u.id
ORDER BY ta.id;