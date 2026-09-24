const express = require("express");

const {
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
} = require("../controllers/ticketController");

const {
    getEscalationStatus
} = require("../controllers/escalationController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Student Routes
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    authMiddleware,
    roleMiddleware("STUDENT"),
    createTicket
);

router.get(
    "/my-tickets",
    authMiddleware,
    roleMiddleware("STUDENT"),
    getMyTickets
);


/*
|--------------------------------------------------------------------------
| Staff / Admin Listing Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    authMiddleware,
    roleMiddleware(
        "STAFF",
        "ADMIN"
    ),
    getAllTickets
);

router.get(
    "/my-assigned",
    authMiddleware,
    roleMiddleware("STAFF"),
    getMyAssignedTickets
);


/*
|--------------------------------------------------------------------------
| IMPORTANT
| Specific routes MUST come before /:id
|--------------------------------------------------------------------------
*/

router.get(
    "/staff",
    authMiddleware,
    roleMiddleware(
        "STAFF",
        "ADMIN"
    ),
    getStaffUsers
);

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware(
        "STAFF",
        "ADMIN"
    ),
    getDashboard
);


/*
|--------------------------------------------------------------------------
| ESCALATION STATUS
|--------------------------------------------------------------------------
*/

router.get(
    "/escalation-status",
    authMiddleware,
    roleMiddleware(
        "STAFF",
        "ADMIN"
    ),
    getEscalationStatus
);


/*
|--------------------------------------------------------------------------
| Ticket Actions
|--------------------------------------------------------------------------
*/

router.post(
    "/:id/assign",
    authMiddleware,
    roleMiddleware(
        "STAFF",
        "ADMIN"
    ),
    assignTicket
);

router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware(
        "STAFF",
        "ADMIN"
    ),
    updateTicketStatus
);

router.patch(
    "/:id/escalate",
    authMiddleware,
    roleMiddleware(
        "STAFF",
        "ADMIN"
    ),
    escalateTicket
);


/*
|--------------------------------------------------------------------------
| Ticket Details / SLA / Comments
|--------------------------------------------------------------------------
*/

router.get(
    "/:id/sla",
    authMiddleware,
    roleMiddleware(
        "STUDENT",
        "STAFF",
        "ADMIN"
    ),
    getTicketSla
);

router.post(
    "/:id/comments",
    authMiddleware,
    roleMiddleware(
        "STUDENT",
        "STAFF",
        "ADMIN"
    ),
    addComment
);


/*
|--------------------------------------------------------------------------
| Generic Ticket Route
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "STUDENT",
        "STAFF",
        "ADMIN"
    ),
    getTicketById
);


module.exports = router;