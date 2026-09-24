INSERT INTO ticket_escalations
(
    ticket_id,
    escalated_by,
    reason,
    status
)
VALUES
(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1005'),
    (SELECT id FROM users WHERE email = 'priya.staff@edusupport.com'),
    'Student portal access issue requires immediate technical investigation.',
    'OPEN'
);




SELECT
    te.id,
    t.ticket_number,
    u.name AS escalated_by,
    te.reason,
    te.status,
    te.escalated_at,
    te.resolved_at
FROM ticket_escalations te
JOIN tickets t
    ON te.ticket_id = t.id
LEFT JOIN users u
    ON te.escalated_by = u.id
ORDER BY te.id;