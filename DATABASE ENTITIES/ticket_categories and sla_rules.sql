USE edusupport;

INSERT INTO tickets
(
    ticket_number,
    student_id,
    category_id,
    subject,
    description,
    priority,
    status,
    sla_due_at
)
VALUES

(
    'TKT-1001',
    (SELECT id FROM users WHERE email = 'amit.student@edusupport.com'),
    (SELECT id FROM ticket_categories WHERE name = 'Fees'),
    'Fee payment not updated',
    'I paid my semester fee yesterday, but the payment status is still showing as pending.',
    'HIGH',
    'OPEN',
    DATE_ADD(NOW(), INTERVAL 24 HOUR)
),

(
    'TKT-1002',
    (SELECT id FROM users WHERE email = 'sneha.student@edusupport.com'),
    (SELECT id FROM ticket_categories WHERE name = 'Attendance'),
    'Attendance is incorrect',
    'My attendance for two classes is showing as absent even though I attended the classes.',
    'MEDIUM',
    'ASSIGNED',
    DATE_ADD(NOW(), INTERVAL 48 HOUR)
),

(
    'TKT-1003',
    (SELECT id FROM users WHERE email = 'rohit.student@edusupport.com'),
    (SELECT id FROM ticket_categories WHERE name = 'ID Card'),
    'ID card not received',
    'I have not received my student ID card yet. Please help me with the status.',
    'LOW',
    'OPEN',
    DATE_ADD(NOW(), INTERVAL 72 HOUR)
),

(
    'TKT-1004',
    (SELECT id FROM users WHERE email = 'amit.student@edusupport.com'),
    (SELECT id FROM ticket_categories WHERE name = 'Documents'),
    'Bonafide certificate required',
    'I need a bonafide certificate for an education-related application.',
    'MEDIUM',
    'IN_PROGRESS',
    DATE_ADD(NOW(), INTERVAL 48 HOUR)
),

(
    'TKT-1005',
    (SELECT id FROM users WHERE email = 'sneha.student@edusupport.com'),
    (SELECT id FROM ticket_categories WHERE name = 'Technical Support'),
    'Unable to access student portal',
    'The student portal is not loading after login and shows an error message.',
    'URGENT',
    'OPEN',
    DATE_ADD(NOW(), INTERVAL 8 HOUR)
);




SELECT
    t.id,
    t.ticket_number,
    u.name AS student,
    c.name AS category,
    t.subject,
    t.priority,
    t.status,
    t.sla_due_at
FROM tickets t
JOIN users u
    ON t.student_id = u.id
JOIN ticket_categories c
    ON t.category_id = c.id
ORDER BY t.id;