USE edusupport;

INSERT INTO ticket_comments
(
    ticket_id,
    user_id,
    comment,
    is_internal
)
VALUES

-- Student comment
(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1001'),
    (SELECT id FROM users WHERE email = 'amit.student@edusupport.com'),
    'I have attached my payment receipt. Please check the payment status.',
    FALSE
),

-- Staff reply
(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1001'),
    (SELECT id FROM users WHERE email = 'rahul.staff@edusupport.com'),
    'We are checking the payment transaction with the accounts department.',
    FALSE
),

-- Internal staff note
(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-1005'),
    (SELECT id FROM users WHERE email = 'priya.staff@edusupport.com'),
    'Portal access issue may be affecting multiple students. Check server logs.',
    TRUE
);






SELECT
    tc.id,
    t.ticket_number,
    u.name AS commented_by,
    tc.comment,
    tc.is_internal,
    tc.created_at
FROM ticket_comments tc
JOIN tickets t
    ON tc.ticket_id = t.id
JOIN users u
    ON tc.user_id = u.id
ORDER BY tc.id;