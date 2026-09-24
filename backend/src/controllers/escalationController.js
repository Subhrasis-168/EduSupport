const db = require("../config/db");

/*
|--------------------------------------------------------------------------
| GET ESCALATION STATUS FOR ALL TICKETS
|--------------------------------------------------------------------------
*/

const getEscalationStatus = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                t.id AS ticket_id,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM ticket_escalations te
                        WHERE te.ticket_id = t.id
                          AND te.status = 'OPEN'
                    )
                    THEN TRUE
                    ELSE FALSE
                END AS is_escalated
            FROM tickets t
            ORDER BY t.id DESC
            `
        );

        res.json({
            success: true,
            escalations: rows
        });

    } catch (error) {
        console.error(
            "Get escalation status error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch escalation status"
        });
    }
};


module.exports = {
    getEscalationStatus
};