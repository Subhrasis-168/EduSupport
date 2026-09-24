-- ============================================================
-- EduSupport - Student Support & Ticket Management System
-- Database: MySQL 8+
-- ============================================================


-- ============================================================
-- 1. CREATE DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS edusupport
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE edusupport;


-- ============================================================
-- 2. ROLES
-- ============================================================

CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ============================================================
-- 3. USERS
-- ============================================================

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    role_id INT UNSIGNED NOT NULL,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_users_role (role_id),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB;


-- ============================================================
-- 4. TICKET CATEGORIES
-- ============================================================

CREATE TABLE ticket_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ============================================================
-- 5. SLA RULES
-- ============================================================

CREATE TABLE sla_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL UNIQUE,

    resolution_hours INT UNSIGNED NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_sla_resolution_hours
        CHECK (resolution_hours > 0)
) ENGINE=InnoDB;


-- ============================================================
-- 6. TICKETS
-- ============================================================

CREATE TABLE tickets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    ticket_number VARCHAR(30) NOT NULL UNIQUE,

    student_id BIGINT UNSIGNED NOT NULL,

    category_id INT UNSIGNED NOT NULL,

    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')
        NOT NULL DEFAULT 'MEDIUM',

    status ENUM(
        'OPEN',
        'ASSIGNED',
        'IN_PROGRESS',
        'WAITING_FOR_STUDENT',
        'RESOLVED',
        'CLOSED',
        'REOPENED'
    ) NOT NULL DEFAULT 'OPEN',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    sla_due_at DATETIME NULL,

    resolved_at DATETIME NULL,

    closed_at DATETIME NULL,

    CONSTRAINT fk_tickets_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_tickets_category
        FOREIGN KEY (category_id)
        REFERENCES ticket_categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_tickets_student (student_id),
    INDEX idx_tickets_category (category_id),
    INDEX idx_tickets_status (status),
    INDEX idx_tickets_priority (priority),
    INDEX idx_tickets_sla_due (sla_due_at),
    INDEX idx_tickets_created_at (created_at),

    INDEX idx_tickets_dashboard (
        status,
        priority,
        sla_due_at
    )
) ENGINE=InnoDB;


-- ============================================================
-- 7. TICKET ASSIGNMENTS
-- ============================================================

CREATE TABLE ticket_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    ticket_id BIGINT UNSIGNED NOT NULL,

    assigned_to BIGINT UNSIGNED NOT NULL,

    assigned_by BIGINT UNSIGNED NOT NULL,

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    unassigned_at TIMESTAMP NULL,

    is_current BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_assignments_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_assignments_assigned_to
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignments_assigned_by
        FOREIGN KEY (assigned_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_assignments_ticket (ticket_id),
    INDEX idx_assignments_staff (assigned_to),
    INDEX idx_assignments_current (is_current),

    INDEX idx_assignments_staff_current (
        assigned_to,
        is_current
    )
) ENGINE=InnoDB;


-- ============================================================
-- 8. TICKET COMMENTS
-- ============================================================

CREATE TABLE ticket_comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    ticket_id BIGINT UNSIGNED NOT NULL,

    user_id BIGINT UNSIGNED NOT NULL,

    comment TEXT NOT NULL,

    is_internal BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_comments_ticket (ticket_id),
    INDEX idx_comments_user (user_id),
    INDEX idx_comments_created_at (created_at)
) ENGINE=InnoDB;


-- ============================================================
-- 9. TICKET ACTIVITY / AUDIT HISTORY
-- ============================================================

CREATE TABLE ticket_activity (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    ticket_id BIGINT UNSIGNED NOT NULL,

    user_id BIGINT UNSIGNED NULL,

    action VARCHAR(100) NOT NULL,

    old_value VARCHAR(255) NULL,

    new_value VARCHAR(255) NULL,

    description TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_activity_ticket (ticket_id),
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_created_at (created_at),

    INDEX idx_activity_ticket_time (
        ticket_id,
        created_at
    )
) ENGINE=InnoDB;


-- ============================================================
-- 10. TICKET ESCALATIONS
-- ============================================================

CREATE TABLE ticket_escalations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    ticket_id BIGINT UNSIGNED NOT NULL,

    escalated_by BIGINT UNSIGNED NULL,

    reason VARCHAR(255) NOT NULL,

    status ENUM(
        'OPEN',
        'RESOLVED'
    ) NOT NULL DEFAULT 'OPEN',

    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    resolved_at TIMESTAMP NULL,

    CONSTRAINT fk_escalations_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_escalations_user
        FOREIGN KEY (escalated_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_escalations_ticket (ticket_id),
    INDEX idx_escalations_status (status),
    INDEX idx_escalations_created (escalated_at)
) ENGINE=InnoDB;


-- ============================================================
-- 11. INSERT ROLES
-- ============================================================

INSERT INTO roles (name, description)
VALUES
    ('ADMIN', 'System administrator and support manager'),
    ('STAFF', 'Support staff who handle student tickets'),
    ('STUDENT', 'Student who creates and tracks support tickets');


-- ============================================================
-- 12. INSERT TICKET CATEGORIES
-- ============================================================

INSERT INTO ticket_categories (name, description)
VALUES
    ('Fees', 'Issues related to student fees and payments'),
    ('Attendance', 'Issues related to attendance'),
    ('ID Card', 'Issues related to student ID cards'),
    ('Documents', 'Requests related to academic or administrative documents'),
    ('Certificates', 'Requests related to certificates'),
    ('Technical Support', 'Technical or system-related issues'),
    ('Other', 'Other administrative requests');


-- ============================================================
-- 13. INSERT SLA RULES
-- ============================================================

INSERT INTO sla_rules (priority, resolution_hours)
VALUES
    ('LOW', 72),
    ('MEDIUM', 48),
    ('HIGH', 24),
    ('URGENT', 8);


-- ============================================================
-- 14. VERIFY DATABASE
-- ============================================================

SHOW TABLES;







USE edusupport;

INSERT INTO users
(role_id, name, email, password_hash, phone)
VALUES
-- Admin
(
    (SELECT id FROM roles WHERE name = 'ADMIN'),
    'System Admin',
    'admin@edusupport.com',
    'TEMP_HASH_ADMIN',
    '9000000001'
),

-- Staff
(
    (SELECT id FROM roles WHERE name = 'STAFF'),
    'Rahul Sharma',
    'rahul.staff@edusupport.com',
    'TEMP_HASH_STAFF',
    '9000000002'
),
(
    (SELECT id FROM roles WHERE name = 'STAFF'),
    'Priya Das',
    'priya.staff@edusupport.com',
    'TEMP_HASH_STAFF',
    '9000000003'
),

-- Students
(
    (SELECT id FROM roles WHERE name = 'STUDENT'),
    'Amit Kumar',
    'amit.student@edusupport.com',
    'TEMP_HASH_STUDENT',
    '9000000004'
),
(
    (SELECT id FROM roles WHERE name = 'STUDENT'),
    'Sneha Patel',
    'sneha.student@edusupport.com',
    'TEMP_HASH_STUDENT',
    '9000000005'
),
(
    (SELECT id FROM roles WHERE name = 'STUDENT'),
    'Rohit Das',
    'rohit.student@edusupport.com',
    'TEMP_HASH_STUDENT',
    '9000000006'
);







USE edusupport;

SELECT
    u.id,
    u.name,
    u.email,
    r.name AS role
FROM users u
JOIN roles r ON u.role_id = r.id
ORDER BY u.id;