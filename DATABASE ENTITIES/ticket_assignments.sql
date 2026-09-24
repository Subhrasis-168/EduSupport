USE edusupport;

INSERT INTO ticket_assignments
(
    ticket_id,
    assigned_to,
    assigned_by,
    is_current
)
VALUES
(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1001'),
    (SELECT id FROM users WHERE email = 'rahul.staff@edusupport.com'),
    (SELECT id FROM users WHERE email = 'admin@edusupport.com'),
    TRUE
),

(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1002'),
    (SELECT id FROM users WHERE email = 'priya.staff@edusupport.com'),
    (SELECT id FROM users WHERE email = 'admin@edusupport.com'),
    TRUE
),

(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1004'),
    (SELECT id FROM users WHERE email = 'rahul.staff@edusupport.com'),
    (SELECT id FROM users WHERE email = 'admin@edusupport.com'),
    TRUE
),

(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1005'),
    (SELECT id FROM users WHERE email = 'priya.staff@edusupport.com'),
    (SELECT id FROM users WHERE email = 'admin@edusupport.com'),
    TRUE
);




SELECT
    t.ticket_number,
    t.subject,
    staff.name AS assigned_staff,
    admin.name AS assigned_by,
    ta.assigned_at
FROM ticket_assignments ta
JOIN tickets t
    ON ta.ticket_id = t.id
JOIN users staff
    ON ta.assigned_to = staff.id
JOIN users admin
    ON ta.assigned_by = admin.id
WHERE ta.is_current = TRUE
ORDER BY ta.id;




