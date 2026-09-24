const db = require("../config/db");

/* --------------------------------------------------
   CREATE TICKET
-------------------------------------------------- */

const createTicket = async (req, res) => {
    try {
        const {
            category_id,
            subject,
            description,
            priority
        } = req.body;

        if (
            !category_id ||
            !subject ||
            !description
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Category, subject and description are required"
            });
        }

        const ticketPriority =
            priority || "MEDIUM";

        const ticketNumber = `TKT-${Date.now()}`;

        const [slaRows] = await db.query(
            `
            SELECT resolution_hours
            FROM sla_rules
            WHERE priority = ?
              AND is_active = TRUE
            LIMIT 1
            `,
            [ticketPriority]
        );

        let slaDueAt = null;

        if (slaRows.length > 0) {
            const hours =
                slaRows[0].resolution_hours;

            slaDueAt = new Date(
                Date.now() +
                hours * 60 * 60 * 1000
            );
        }

        const [result] = await db.query(
            `
            INSERT INTO tickets (
                ticket_number,
                student_id,
                category_id,
                subject,
                description,
                priority,
                status,
                sla_due_at
            )
            VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?)
            `,
            [
                ticketNumber,
                req.user.id,
                category_id,
                subject,
                description,
                ticketPriority,
                slaDueAt
            ]
        );

        await db.query(
            `
            INSERT INTO ticket_activity (
                ticket_id,
                user_id,
                action,
                new_value,
                description
            )
            VALUES (?, ?, 'TICKET_CREATED', 'OPEN', ?)
            `,
            [
                result.insertId,
                req.user.id,
                "Ticket created by student"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            ticket_id: result.insertId,
            ticket_number: ticketNumber
        });
    } catch (error) {
        console.error(
            "Create ticket error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to create ticket"
        });
    }
};


/* --------------------------------------------------
   GET MY TICKETS
-------------------------------------------------- */

const getMyTickets = async (req, res) => {
    try {
        const [tickets] = await db.query(
            `
            SELECT
                t.id,
                t.ticket_number,
                t.subject,
                t.description,
                t.priority,
                t.status,
                t.created_at,
                t.updated_at,
                t.sla_due_at,
                tc.name AS category
            FROM tickets t
            INNER JOIN ticket_categories tc
                ON t.category_id = tc.id
            WHERE t.student_id = ?
            ORDER BY t.created_at DESC
            `,
            [req.user.id]
        );

        res.json({
            success: true,
            tickets
        });
    } catch (error) {
        console.error(
            "Get my tickets error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch tickets"
        });
    }
};


/* --------------------------------------------------
   GET ALL TICKETS
-------------------------------------------------- */

const getAllTickets = async (req, res) => {
    try {
        const [tickets] = await db.query(
            `
            SELECT
                t.id,
                t.ticket_number,
                t.student_id,
                u.name AS student_name,
                tc.name AS category,
                t.subject,
                t.description,
                t.priority,
                t.status,
                t.created_at,
                t.updated_at,
                t.sla_due_at,
                t.resolved_at,
                t.closed_at,

                (
                    SELECT au.name
                    FROM ticket_assignments ta
                    INNER JOIN users au
                        ON ta.assigned_to = au.id
                    WHERE ta.ticket_id = t.id
                      AND ta.is_current = TRUE
                    LIMIT 1
                ) AS assigned_to_name

            FROM tickets t

            INNER JOIN users u
                ON t.student_id = u.id

            INNER JOIN ticket_categories tc
                ON t.category_id = tc.id

            ORDER BY t.created_at DESC
            `
        );

        res.json({
            success: true,
            tickets
        });
    } catch (error) {
        console.error(
            "Get all tickets error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch tickets"
        });
    }
};


/* --------------------------------------------------
   GET MY ASSIGNED TICKETS
-------------------------------------------------- */

const getMyAssignedTickets = async (
    req,
    res
) => {
    try {
        const [tickets] = await db.query(
            `
            SELECT
                t.id,
                t.ticket_number,
                t.student_id,
                u.name AS student_name,
                tc.name AS category,
                t.subject,
                t.description,
                t.priority,
                t.status,
                t.created_at,
                t.updated_at,
                t.sla_due_at
            FROM tickets t

            INNER JOIN ticket_assignments ta
                ON t.id = ta.ticket_id

            INNER JOIN users u
                ON t.student_id = u.id

            INNER JOIN ticket_categories tc
                ON t.category_id = tc.id

            WHERE ta.assigned_to = ?
              AND ta.is_current = TRUE

            ORDER BY t.created_at DESC
            `,
            [req.user.id]
        );

        res.json({
            success: true,
            tickets
        });
    } catch (error) {
        console.error(
            "Get assigned tickets error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch assigned tickets"
        });
    }
};


/* --------------------------------------------------
   GET STAFF USERS
-------------------------------------------------- */

const getStaffUsers = async (
    req,
    res
) => {
    try {
        const [staff] = await db.query(
            `
            SELECT
                u.id,
                u.name,
                u.email
            FROM users u

            INNER JOIN roles r
                ON u.role_id = r.id

            WHERE r.name = 'STAFF'
              AND u.is_active = TRUE

            ORDER BY u.name ASC
            `
        );

        res.json({
            success: true,
            staff
        });
    } catch (error) {
        console.error(
            "Get staff users error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch staff users"
        });
    }
};


/* --------------------------------------------------
   ASSIGN TICKET
-------------------------------------------------- */

const assignTicket = async (
    req,
    res
) => {
    try {
        const ticketId = req.params.id;
        const {
            assigned_to
        } = req.body;

        if (!assigned_to) {
            return res.status(400).json({
                success: false,
                message:
                    "assigned_to is required"
            });
        }

        const [ticketRows] =
            await db.query(
                `
                SELECT
                    id,
                    status
                FROM tickets
                WHERE id = ?
                LIMIT 1
                `,
                [ticketId]
            );

        if (ticketRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const [staffRows] =
            await db.query(
                `
                SELECT
                    u.id,
                    u.name
                FROM users u

                INNER JOIN roles r
                    ON u.role_id = r.id

                WHERE u.id = ?
                  AND r.name = 'STAFF'
                  AND u.is_active = TRUE

                LIMIT 1
                `,
                [assigned_to]
            );

        if (staffRows.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Selected staff member is invalid"
            });
        }

        await db.query(
            `
            UPDATE ticket_assignments
            SET
                is_current = FALSE,
                unassigned_at = CURRENT_TIMESTAMP
            WHERE ticket_id = ?
              AND is_current = TRUE
            `,
            [ticketId]
        );

        await db.query(
            `
            INSERT INTO ticket_assignments (
                ticket_id,
                assigned_to,
                assigned_by,
                is_current
            )
            VALUES (?, ?, ?, TRUE)
            `,
            [
                ticketId,
                assigned_to,
                req.user.id
            ]
        );

        const currentStatus =
            ticketRows[0].status;

        let newStatus = currentStatus;

        if (
            currentStatus === "OPEN" ||
            currentStatus === "REOPENED"
        ) {
            newStatus = "ASSIGNED";

            await db.query(
                `
                UPDATE tickets
                SET status = ?
                WHERE id = ?
                `,
                [
                    newStatus,
                    ticketId
                ]
            );
        }

        await db.query(
            `
            INSERT INTO ticket_activity (
                ticket_id,
                user_id,
                action,
                old_value,
                new_value,
                description
            )
            VALUES (?, ?, 'TICKET_ASSIGNED', ?, ?, ?)
            `,
            [
                ticketId,
                req.user.id,
                currentStatus,
                newStatus,
                `Ticket assigned to ${staffRows[0].name}`
            ]
        );

        res.json({
            success: true,
            message:
                "Ticket assigned successfully"
        });
    } catch (error) {
        console.error(
            "Assign ticket error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to assign ticket"
        });
    }
};


/* --------------------------------------------------
   UPDATE TICKET STATUS
-------------------------------------------------- */

const updateTicketStatus = async (
    req,
    res
) => {
    try {
        const ticketId = req.params.id;
        const {
            status
        } = req.body;

        const validStatuses = [
            "OPEN",
            "ASSIGNED",
            "IN_PROGRESS",
            "WAITING_FOR_STUDENT",
            "RESOLVED",
            "CLOSED",
            "REOPENED"
        ];

        if (
            !validStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid ticket status"
            });
        }

        const [ticketRows] =
            await db.query(
                `
                SELECT
                    id,
                    status
                FROM tickets
                WHERE id = ?
                LIMIT 1
                `,
                [ticketId]
            );

        if (ticketRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const oldStatus =
            ticketRows[0].status;

        if (oldStatus === status) {
            return res.status(400).json({
                success: false,
                message:
                    "Ticket is already in this status"
            });
        }

        let resolvedAt = null;
        let closedAt = null;

        if (status === "RESOLVED") {
            resolvedAt =
                new Date();
        }

        if (status === "CLOSED") {
            closedAt =
                new Date();

            if (!resolvedAt) {
                const [existingRows] =
                    await db.query(
                        `
                        SELECT resolved_at
                        FROM tickets
                        WHERE id = ?
                        `,
                        [ticketId]
                    );

                resolvedAt =
                    existingRows[0]
                        ?.resolved_at || null;
            }
        }

        await db.query(
            `
            UPDATE tickets
            SET
                status = ?,
                resolved_at = CASE
                    WHEN ? = 'RESOLVED'
                        THEN COALESCE(resolved_at, CURRENT_TIMESTAMP)
                    WHEN ? = 'CLOSED'
                        THEN COALESCE(resolved_at, CURRENT_TIMESTAMP)
                    WHEN ? = 'REOPENED'
                        THEN NULL
                    ELSE resolved_at
                END,
                closed_at = CASE
                    WHEN ? = 'CLOSED'
                        THEN CURRENT_TIMESTAMP
                    WHEN ? = 'REOPENED'
                        THEN NULL
                    ELSE closed_at
                END
            WHERE id = ?
            `,
            [
                status,
                status,
                status,
                status,
                status,
                status,
                ticketId
            ]
        );

        await db.query(
            `
            INSERT INTO ticket_activity (
                ticket_id,
                user_id,
                action,
                old_value,
                new_value,
                description
            )
            VALUES (?, ?, 'STATUS_CHANGED', ?, ?, ?)
            `,
            [
                ticketId,
                req.user.id,
                oldStatus,
                status,
                `Ticket status changed from ${oldStatus} to ${status}`
            ]
        );

        res.json({
            success: true,
            message:
                "Ticket status updated successfully"
        });
    } catch (error) {
        console.error(
            "Update ticket status error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to update ticket status"
        });
    }
};


/* --------------------------------------------------
   ESCALATE TICKET
-------------------------------------------------- */

const escalateTicket = async (
    req,
    res
) => {
    try {
        const ticketId = req.params.id;
        const {
            reason
        } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message:
                    "Escalation reason is required"
            });
        }

        const [ticketRows] =
            await db.query(
                `
                SELECT id
                FROM tickets
                WHERE id = ?
                LIMIT 1
                `,
                [ticketId]
            );

        if (ticketRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const [openEscalations] =
            await db.query(
                `
                SELECT id
                FROM ticket_escalations
                WHERE ticket_id = ?
                  AND status = 'OPEN'
                LIMIT 1
                `,
                [ticketId]
            );

        if (openEscalations.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Ticket already has an open escalation"
            });
        }

        await db.query(
            `
            INSERT INTO ticket_escalations (
                ticket_id,
                escalated_by,
                reason,
                status
            )
            VALUES (?, ?, ?, 'OPEN')
            `,
            [
                ticketId,
                req.user.id,
                reason
            ]
        );

        await db.query(
            `
            INSERT INTO ticket_activity (
                ticket_id,
                user_id,
                action,
                description
            )
            VALUES (?, ?, 'TICKET_ESCALATED', ?)
            `,
            [
                ticketId,
                req.user.id,
                `Ticket escalated: ${reason}`
            ]
        );

        res.json({
            success: true,
            message:
                "Ticket escalated successfully"
        });
    } catch (error) {
        console.error(
            "Escalate ticket error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to escalate ticket"
        });
    }
};


/* --------------------------------------------------
   GET TICKET SLA
-------------------------------------------------- */

const getTicketSla = async (
    req,
    res
) => {
    try {
        const ticketId = req.params.id;

        const [rows] = await db.query(
            `
            SELECT
                t.id,
                t.priority,
                t.status,
                t.created_at,
                t.sla_due_at,
                t.resolved_at,
                t.closed_at
            FROM tickets t
            WHERE t.id = ?
            LIMIT 1
            `,
            [ticketId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const ticket = rows[0];

        const now = new Date();

        const createdAt =
            new Date(ticket.created_at);

        const ageHours = Math.max(
            0,
            (
                now.getTime() -
                createdAt.getTime()
            ) /
            (1000 * 60 * 60)
        );

        let slaStatus =
            "NO_SLA";

        let remainingHours = null;
        let overdueHours = null;

        if (ticket.sla_due_at) {
            const dueAt =
                new Date(ticket.sla_due_at);

            const isCompleted =
                ticket.status === "RESOLVED" ||
                ticket.status === "CLOSED";

            if (isCompleted) {
                const completionDate =
                    ticket.resolved_at
                        ? new Date(
                            ticket.resolved_at
                        )
                        : ticket.closed_at
                            ? new Date(
                                ticket.closed_at
                            )
                            : now;

                if (
                    completionDate.getTime() <=
                    dueAt.getTime()
                ) {
                    slaStatus =
                        "COMPLETED_WITHIN_SLA";
                } else {
                    slaStatus =
                        "BREACHED";

                    overdueHours =
                        Math.max(
                            0,
                            (
                                completionDate.getTime() -
                                dueAt.getTime()
                            ) /
                            (1000 * 60 * 60)
                        );
                }
            } else if (
                now.getTime() >
                dueAt.getTime()
            ) {
                slaStatus =
                    "BREACHED";

                overdueHours =
                    Math.max(
                        0,
                        (
                            now.getTime() -
                            dueAt.getTime()
                        ) /
                        (1000 * 60 * 60)
                    );
            } else {
                remainingHours =
                    Math.max(
                        0,
                        (
                            dueAt.getTime() -
                            now.getTime()
                        ) /
                        (1000 * 60 * 60)
                    );

                if (
                    remainingHours <= 4
                ) {
                    slaStatus =
                        "APPROACHING";
                } else {
                    slaStatus =
                        "ON_TRACK";
                }
            }
        }

        res.json({
            success: true,
            sla: {
                priority:
                    ticket.priority,

                status:
                    ticket.status,

                created_at:
                    ticket.created_at,

                sla_due_at:
                    ticket.sla_due_at,

                age_hours:
                    Number(
                        ageHours.toFixed(2)
                    ),

                remaining_hours:
                    remainingHours === null
                        ? null
                        : Number(
                            remainingHours.toFixed(
                                2
                            )
                        ),

                overdue_hours:
                    overdueHours === null
                        ? null
                        : Number(
                            overdueHours.toFixed(
                                2
                            )
                        ),

                sla_status:
                    slaStatus
            }
        });
    } catch (error) {
        console.error(
            "Get ticket SLA error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to calculate ticket SLA"
        });
    }
};


/* --------------------------------------------------
   GET DASHBOARD
-------------------------------------------------- */

const getDashboard = async (
    req,
    res
) => {
    try {
        const [
            summaryRows,
            priorityRows,
            statusRows,
            categoryRows
        ] = await Promise.all([
            db.query(`
                SELECT
                    COUNT(*) AS total_tickets,

                    SUM(
                        status NOT IN (
                            'RESOLVED',
                            'CLOSED'
                        )
                    ) AS active_tickets,

                    SUM(
                        status = 'OPEN'
                    ) AS open_tickets,

                    SUM(
                        status = 'ASSIGNED'
                    ) AS assigned_tickets,

                    SUM(
                        status = 'IN_PROGRESS'
                    ) AS in_progress_tickets,

                    SUM(
                        status = 'WAITING_FOR_STUDENT'
                    ) AS waiting_for_student,

                    SUM(
                        status = 'RESOLVED'
                    ) AS resolved_tickets,

                    SUM(
                        status = 'CLOSED'
                    ) AS closed_tickets,

                    SUM(
                        sla_due_at IS NOT NULL
                        AND sla_due_at < CURRENT_TIMESTAMP
                        AND status NOT IN (
                            'RESOLVED',
                            'CLOSED'
                        )
                    ) AS breached_tickets

                FROM tickets
            `),

            db.query(`
                SELECT
                    priority,
                    COUNT(*) AS count
                FROM tickets
                GROUP BY priority
                ORDER BY
                    FIELD(
                        priority,
                        'URGENT',
                        'HIGH',
                        'MEDIUM',
                        'LOW'
                    )
            `),

            db.query(`
                SELECT
                    status,
                    COUNT(*) AS count
                FROM tickets
                GROUP BY status
                ORDER BY count DESC
            `),

            db.query(`
                SELECT
                    tc.name AS category,
                    COUNT(t.id) AS count
                FROM ticket_categories tc
                LEFT JOIN tickets t
                    ON tc.id = t.category_id
                GROUP BY
                    tc.id,
                    tc.name
                ORDER BY count DESC
            `)
        ]);

        const summary =
            summaryRows[0][0];

        const [unassignedRows] =
            await db.query(`
                SELECT COUNT(*) AS count
                FROM tickets t
                WHERE t.status NOT IN (
                    'RESOLVED',
                    'CLOSED'
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM ticket_assignments ta
                    WHERE ta.ticket_id = t.id
                      AND ta.is_current = TRUE
                )
            `);

        const [escalatedRows] =
            await db.query(`
                SELECT COUNT(*) AS count
                FROM ticket_escalations
                WHERE status = 'OPEN'
            `);

        const [approachingRows] =
            await db.query(`
                SELECT COUNT(*) AS count
                FROM tickets
                WHERE sla_due_at IS NOT NULL
                  AND sla_due_at >= CURRENT_TIMESTAMP
                  AND sla_due_at <= DATE_ADD(
                      CURRENT_TIMESTAMP,
                      INTERVAL 4 HOUR
                  )
                  AND status NOT IN (
                      'RESOLVED',
                      'CLOSED'
                  )
            `);

        res.json({
            success: true,

            summary: {
                total_tickets:
                    Number(
                        summary.total_tickets
                    ),

                active_tickets:
                    Number(
                        summary.active_tickets || 0
                    ),

                open_tickets:
                    Number(
                        summary.open_tickets || 0
                    ),

                assigned_tickets:
                    Number(
                        summary.assigned_tickets || 0
                    ),

                in_progress_tickets:
                    Number(
                        summary.in_progress_tickets ||
                        0
                    ),

                waiting_for_student:
                    Number(
                        summary.waiting_for_student ||
                        0
                    ),

                resolved_tickets:
                    Number(
                        summary.resolved_tickets || 0
                    ),

                closed_tickets:
                    Number(
                        summary.closed_tickets || 0
                    ),

                breached_tickets:
                    Number(
                        summary.breached_tickets || 0
                    ),

                unassigned_tickets:
                    Number(
                        unassignedRows[0].count
                    ),

                escalated_tickets:
                    Number(
                        escalatedRows[0].count
                    ),

                approaching_sla_tickets:
                    Number(
                        approachingRows[0].count
                    )
            },

            priority_breakdown:
                priorityRows[0].map(
                    (item) => ({
                        priority:
                            item.priority,
                        count:
                            Number(item.count)
                    })
                ),

            status_breakdown:
                statusRows[0].map(
                    (item) => ({
                        status:
                            item.status,
                        count:
                            Number(item.count)
                    })
                ),

            category_breakdown:
                categoryRows[0].map(
                    (item) => ({
                        category:
                            item.category,
                        count:
                            Number(item.count)
                    })
                )
        });
    } catch (error) {
        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load dashboard"
        });
    }
};


/* --------------------------------------------------
   GET TICKET BY ID
-------------------------------------------------- */

const getTicketById = async (
    req,
    res
) => {
    try {
        const ticketId = req.params.id;

        const [ticketRows] =
            await db.query(
                `
                SELECT
                    t.id,
                    t.ticket_number,
                    t.student_id,
                    u.name AS student_name,
                    u.email AS student_email,
                    tc.name AS category,
                    t.subject,
                    t.description,
                    t.priority,
                    t.status,
                    t.created_at,
                    t.updated_at,
                    t.sla_due_at,
                    t.resolved_at,
                    t.closed_at
                FROM tickets t

                INNER JOIN users u
                    ON t.student_id = u.id

                INNER JOIN ticket_categories tc
                    ON t.category_id = tc.id

                WHERE t.id = ?
                LIMIT 1
                `,
                [ticketId]
            );

        if (ticketRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const ticket =
            ticketRows[0];

        if (
            req.user.role === "STUDENT" &&
            ticket.student_id !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to view this ticket"
            });
        }

        let commentsQuery = `
            SELECT
                c.id,
                c.comment,
                c.is_internal,
                c.created_at,
                u.name AS user_name,
                r.name AS user_role
            FROM ticket_comments c

            INNER JOIN users u
                ON c.user_id = u.id

            INNER JOIN roles r
                ON u.role_id = r.id

            WHERE c.ticket_id = ?
        `;

        const commentParams = [
            ticketId
        ];

        if (
            req.user.role === "STUDENT"
        ) {
            commentsQuery += `
                AND c.is_internal = FALSE
            `;
        }

        commentsQuery += `
            ORDER BY c.created_at ASC
        `;

        const [comments] =
            await db.query(
                commentsQuery,
                commentParams
            );

        const [activities] =
            await db.query(
                `
                SELECT
                    a.id,
                    a.action,
                    a.old_value,
                    a.new_value,
                    a.description,
                    a.created_at,
                    u.name AS user_name
                FROM ticket_activity a

                LEFT JOIN users u
                    ON a.user_id = u.id

                WHERE a.ticket_id = ?

                ORDER BY a.created_at ASC
                `,
                [ticketId]
            );

        res.json({
            success: true,
            ticket,
            comments,
            activities
        });
    } catch (error) {
        console.error(
            "Get ticket details error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load ticket details"
        });
    }
};


/* --------------------------------------------------
   ADD COMMENT
-------------------------------------------------- */

const addComment = async (
    req,
    res
) => {
    try {
        const ticketId = req.params.id;

        const {
            comment
        } = req.body;

        if (
            !comment ||
            !comment.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot be empty"
            });
        }

        const [ticketRows] =
            await db.query(
                `
                SELECT
                    id,
                    student_id,
                    status
                FROM tickets
                WHERE id = ?
                LIMIT 1
                `,
                [ticketId]
            );

        if (ticketRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const ticket =
            ticketRows[0];

        if (
            req.user.role === "STUDENT" &&
            ticket.student_id !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to comment on this ticket"
            });
        }

        if (
            ticket.status === "CLOSED"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot add comments to a closed ticket"
            });
        }

        await db.query(
            `
            INSERT INTO ticket_comments (
                ticket_id,
                user_id,
                comment,
                is_internal
            )
            VALUES (?, ?, ?, FALSE)
            `,
            [
                ticketId,
                req.user.id,
                comment.trim()
            ]
        );

        await db.query(
            `
            INSERT INTO ticket_activity (
                ticket_id,
                user_id,
                action,
                description
            )
            VALUES (?, ?, 'COMMENT_ADDED', ?)
            `,
            [
                ticketId,
                req.user.id,
                "Comment added to ticket"
            ]
        );

        res.status(201).json({
            success: true,
            message:
                "Comment added successfully"
        });
    } catch (error) {
        console.error(
            "Add comment error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to add comment"
        });
    }
};


/* --------------------------------------------------
   EXPORTS
-------------------------------------------------- */

module.exports = {
    createTicket,
    getMyTickets,
    getAllTickets,
    getMyAssignedTickets,
    getStaffUsers,
    assignTicket,
    updateTicketStatus,
    escalateTicket,
    getTicketSla,
    getDashboard,
    getTicketById,
    addComment
};