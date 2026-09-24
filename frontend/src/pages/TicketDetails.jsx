import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";


const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [ticket, setTicket] = useState(null);
    const [sla, setSla] = useState(null);
    const [staff, setStaff] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingStaff, setLoadingStaff] = useState(false);

    const [updatingStatus, setUpdatingStatus] =
        useState(false);

    const [assigningTicket, setAssigningTicket] =
        useState(false);

    const [escalatingTicket, setEscalatingTicket] =
        useState(false);

    const [addingComment, setAddingComment] =
        useState(false);

    const [error, setError] = useState("");
    const [staffError, setStaffError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [selectedStatus, setSelectedStatus] =
        useState("");

    const [selectedStaff, setSelectedStaff] =
        useState("");

    const [comment, setComment] =
        useState("");


    const isStudent =
        user?.role === "STUDENT";

    const isStaffOrAdmin =
        user?.role === "STAFF" ||
        user?.role === "ADMIN";


    useEffect(() => {
        fetchTicketDetails();

        if (isStaffOrAdmin) {
            fetchStaff();
        }
    }, [id]);


    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                ticketResponse,
                slaResponse
            ] = await Promise.all([
                api.get(`/tickets/${id}`),
                api.get(`/tickets/${id}/sla`)
            ]);

            const ticketData =
                ticketResponse.data.ticket;

            setTicket(ticketData);

            setSla(
                slaResponse.data.sla ||
                slaResponse.data
            );

            setSelectedStatus(
                ticketData?.status || ""
            );

            setSelectedStaff(
                ticketData?.assigned_to
                    ? String(
                        ticketData.assigned_to
                    )
                    : ""
            );

        } catch (error) {
            console.error(
                "Fetch ticket details error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load ticket details."
            );
        } finally {
            setLoading(false);
        }
    };


    const fetchStaff = async () => {
        try {
            setLoadingStaff(true);
            setStaffError("");

            const response =
                await api.get("/tickets/staff");

            setStaff(
                response.data.staff || []
            );

        } catch (error) {
            console.error(
                "Fetch staff error:",
                error
            );

            setStaffError(
                error.response?.data?.message ||
                "Unable to load staff members."
            );
        } finally {
            setLoadingStaff(false);
        }
    };


    const handleStatusUpdate = async () => {
        if (!selectedStatus) {
            return;
        }

        if (
            selectedStatus ===
            ticket?.status
        ) {
            return;
        }

        try {
            setUpdatingStatus(true);
            setError("");
            setSuccess("");

            await api.patch(
                `/tickets/${id}/status`,
                {
                    status: selectedStatus
                }
            );

            setSuccess(
                "Ticket status updated successfully."
            );

            await fetchTicketDetails();

        } catch (error) {
            console.error(
                "Update status error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to update ticket status."
            );
        } finally {
            setUpdatingStatus(false);
        }
    };


    const handleAssignTicket = async () => {
        if (!selectedStaff) {
            setError(
                "Please select a staff member."
            );

            return;
        }

        try {
            setAssigningTicket(true);
            setError("");
            setSuccess("");

            await api.post(
                `/tickets/${id}/assign`,
                {
                    assigned_to:
                        Number(selectedStaff)
                }
            );

            setSuccess(
                "Ticket assigned successfully."
            );

            await fetchTicketDetails();

        } catch (error) {
            console.error(
                "Assign ticket error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to assign ticket."
            );
        } finally {
            setAssigningTicket(false);
        }
    };


    const handleEscalateTicket = async () => {
        const reason =
            window.prompt(
                "Enter the reason for escalation:"
            );

        if (!reason) {
            return;
        }

        if (!reason.trim()) {
            setError(
                "Escalation reason is required."
            );

            return;
        }

        try {
            setEscalatingTicket(true);
            setError("");
            setSuccess("");

            await api.patch(
                `/tickets/${id}/escalate`,
                {
                    reason:
                        reason.trim()
                }
            );

            setSuccess(
                "Ticket escalated successfully."
            );

            await fetchTicketDetails();

        } catch (error) {
            console.error(
                "Escalate ticket error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to escalate ticket."
            );
        } finally {
            setEscalatingTicket(false);
        }
    };


    const handleAddComment = async () => {
        const trimmedComment =
            comment.trim();

        if (!trimmedComment) {
            setError(
                "Please enter a comment."
            );

            setSuccess("");

            return;
        }

        try {
            setAddingComment(true);
            setError("");
            setSuccess("");

            await api.post(
                `/tickets/${id}/comments`,
                {
                    comment:
                        trimmedComment
                }
            );

            setComment("");

            setSuccess(
                "Comment added successfully."
            );

            await fetchTicketDetails();

        } catch (error) {
            console.error(
                "Add comment error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to add comment."
            );
        } finally {
            setAddingComment(false);
        }
    };


    const getStatusStyle = (
        status
    ) => {
        const styles = {
            OPEN:
                "bg-blue-100 text-blue-700",

            ASSIGNED:
                "bg-purple-100 text-purple-700",

            IN_PROGRESS:
                "bg-yellow-100 text-yellow-700",

            WAITING_FOR_STUDENT:
                "bg-orange-100 text-orange-700",

            RESOLVED:
                "bg-green-100 text-green-700",

            CLOSED:
                "bg-slate-200 text-slate-700",

            REOPENED:
                "bg-red-100 text-red-700"
        };

        return (
            styles[status] ||
            "bg-slate-100 text-slate-700"
        );
    };


    const getPriorityStyle = (
        priority
    ) => {
        const styles = {
            LOW:
                "bg-slate-100 text-slate-700",

            MEDIUM:
                "bg-blue-100 text-blue-700",

            HIGH:
                "bg-orange-100 text-orange-700",

            URGENT:
                "bg-red-100 text-red-700"
        };

        return (
            styles[priority] ||
            "bg-slate-100 text-slate-700"
        );
    };


    const getSlaStyle = () => {
        if (!sla) {
            return "bg-slate-100 text-slate-700";
        }

        if (
            sla.status === "BREACHED" ||
            sla.status === "OVERDUE"
        ) {
            return "bg-red-100 text-red-700";
        }

        if (
            sla.status === "AT_RISK"
        ) {
            return "bg-orange-100 text-orange-700";
        }

        return "bg-green-100 text-green-700";
    };


    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleString();
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">

                <p className="text-slate-600">
                    Loading ticket details...
                </p>

            </div>
        );
    }


    if (error && !ticket) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

                <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg w-full text-center">

                    <h2 className="text-xl font-bold text-slate-800">
                        Unable to load ticket
                    </h2>

                    <p className="text-red-600 mt-3">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                isStudent
                                    ? "/student"
                                    : "/dashboard"
                            )
                        }
                        className="mt-6 px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                    >
                        Go Back
                    </button>

                </div>

            </div>
        );
    }


    if (!ticket) {
        return null;
    }


    return (
        <div className="min-h-screen bg-slate-100">

            {/* Header */}
            <header className="bg-white border-b border-slate-200">

                <div className="max-w-7xl mx-auto px-6 py-4">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>

                            <h1 className="text-2xl font-bold text-slate-800">
                                EduSupport
                            </h1>

                            <p className="text-sm text-slate-500 mt-1">
                                Ticket Details
                            </p>

                        </div>


                        <button
                            onClick={() =>
                                navigate(
                                    isStudent
                                        ? "/student"
                                        : "/dashboard"
                                )
                            }
                            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                        >
                            ← Back
                        </button>

                    </div>

                </div>

            </header>


            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* Error */}
                {error && (
                    <div className="mb-6">

                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                            {error}
                        </div>

                    </div>
                )}


                {/* Success */}
                {success && (
                    <div className="mb-6">

                        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
                            {success}
                        </div>

                    </div>
                )}


                {/* Ticket Header */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                        <div>

                            <div className="flex flex-wrap items-center gap-2">

                                <span className="text-sm font-semibold text-slate-500">
                                    {ticket.ticket_number}
                                </span>

                                <span
                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(
                                        ticket.priority
                                    )}`}
                                >
                                    {ticket.priority}
                                </span>

                                <span
                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                        ticket.status
                                    )}`}
                                >
                                    {ticket.status}
                                </span>

                            </div>


                            <h2 className="text-2xl font-bold text-slate-800 mt-4">
                                {ticket.subject}
                            </h2>

                            <p className="text-sm text-slate-500 mt-2">
                                Created{" "}
                                {formatDate(
                                    ticket.created_at
                                )}
                            </p>

                        </div>

                    </div>

                </div>


                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Description */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">

                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                Issue Description
                            </h3>

                            <p className="text-slate-700 whitespace-pre-wrap leading-7">
                                {ticket.description}
                            </p>

                        </div>


                        {/* Comments */}
                        <div className="bg-white rounded-xl border border-slate-200">

                            <div className="p-6 border-b border-slate-200">

                                <h3 className="text-lg font-semibold text-slate-800">
                                    Comments & Replies
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                    Communicate with the support team.
                                </p>

                            </div>


                            <div className="p-6">

                                {ticket.comments &&
                                ticket.comments.length >
                                    0 ? (
                                    <div className="space-y-4">

                                        {ticket.comments.map(
                                            (item) => (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="bg-slate-50 rounded-lg p-4"
                                                >

                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                                                        <div>

                                                            <p className="font-semibold text-slate-800">
                                                                {
                                                                    item.user_name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {
                                                                    item.user_role
                                                                }
                                                            </p>

                                                        </div>

                                                        <p className="text-xs text-slate-500">
                                                            {formatDate(
                                                                item.created_at
                                                            )}
                                                        </p>

                                                    </div>


                                                    <p className="text-slate-700 mt-3 whitespace-pre-wrap">
                                                        {
                                                            item.comment
                                                        }
                                                    </p>

                                                </div>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <p className="text-slate-500">
                                        No comments yet.
                                    </p>
                                )}


                                {/* Add Comment */}
                                <div className="mt-6">

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Add Comment
                                    </label>

                                    <textarea
                                        value={
                                            comment
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setComment(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        rows={4}
                                        maxLength={3000}
                                        placeholder="Write your message..."
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">

                                        <p className="text-xs text-slate-400">
                                            {
                                                comment.length
                                            }{" "}
                                            / 3000 characters
                                        </p>

                                        <button
                                            onClick={
                                                handleAddComment
                                            }
                                            disabled={
                                                addingComment ||
                                                !comment.trim()
                                            }
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {addingComment
                                                ? "Adding..."
                                                : "Add Comment"}
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* Activity History */}
                        <div className="bg-white rounded-xl border border-slate-200">

                            <div className="p-6 border-b border-slate-200">

                                <h3 className="text-lg font-semibold text-slate-800">
                                    Activity History
                                </h3>

                            </div>


                            <div className="p-6">

                                {ticket.activity &&
                                ticket.activity.length >
                                    0 ? (
                                    <div className="space-y-5">

                                        {ticket.activity.map(
                                            (item) => (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="flex gap-4"
                                                >

                                                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0">
                                                    </div>

                                                    <div>

                                                        <p className="font-medium text-slate-800">
                                                            {
                                                                item.action
                                                            }
                                                        </p>

                                                        {item.description && (
                                                            <p className="text-sm text-slate-600 mt-1">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                        )}

                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {
                                                                item.user_name ||
                                                                "System"
                                                            }{" "}
                                                            •{" "}
                                                            {formatDate(
                                                                item.created_at
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <p className="text-slate-500">
                                        No activity recorded yet.
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>


                    {/* Right */}
                    <div className="space-y-6">

                        {/* Ticket Information */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">

                            <h3 className="text-lg font-semibold text-slate-800 mb-5">
                                Ticket Information
                            </h3>


                            <div className="space-y-4">

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Category
                                    </p>

                                    <p className="font-medium text-slate-800 mt-1">
                                        {
                                            ticket.category_name ||
                                            "-"
                                        }
                                    </p>
                                </div>


                                <div>
                                    <p className="text-xs text-slate-500">
                                        Student
                                    </p>

                                    <p className="font-medium text-slate-800 mt-1">
                                        {
                                            ticket.student_name ||
                                            "-"
                                        }
                                    </p>
                                </div>


                                <div>
                                    <p className="text-xs text-slate-500">
                                        Priority
                                    </p>

                                    <span
                                        className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(
                                            ticket.priority
                                        )}`}
                                    >
                                        {
                                            ticket.priority
                                        }
                                    </span>
                                </div>


                                <div>
                                    <p className="text-xs text-slate-500">
                                        Status
                                    </p>

                                    <span
                                        className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                            ticket.status
                                        )}`}
                                    >
                                        {
                                            ticket.status
                                        }
                                    </span>
                                </div>


                                <div>
                                    <p className="text-xs text-slate-500">
                                        Created
                                    </p>

                                    <p className="font-medium text-slate-800 mt-1">
                                        {formatDate(
                                            ticket.created_at
                                        )}
                                    </p>
                                </div>

                            </div>

                        </div>


                        {/* SLA */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">

                            <h3 className="text-lg font-semibold text-slate-800 mb-5">
                                SLA Information
                            </h3>


                            {sla ? (
                                <div className="space-y-4">

                                    <div>

                                        <p className="text-xs text-slate-500">
                                            SLA Status
                                        </p>

                                        <span
                                            className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getSlaStyle()}`}
                                        >
                                            {
                                                sla.status ||
                                                "On Track"
                                            }
                                        </span>

                                    </div>


                                    <div>

                                        <p className="text-xs text-slate-500">
                                            Due Date
                                        </p>

                                        <p className="font-medium text-slate-800 mt-1">
                                            {formatDate(
                                                sla.sla_due_at ||
                                                ticket.sla_due_at
                                            )}
                                        </p>

                                    </div>


                                    {sla.remaining_hours !==
                                        undefined && (
                                        <div>

                                            <p className="text-xs text-slate-500">
                                                Remaining
                                            </p>

                                            <p className="font-medium text-slate-800 mt-1">
                                                {
                                                    sla.remaining_hours
                                                }{" "}
                                                hours
                                            </p>

                                        </div>
                                    )}

                                </div>
                            ) : (
                                <p className="text-slate-500">
                                    SLA information unavailable.
                                </p>
                            )}

                        </div>


                        {/* Staff/Admin Controls */}
                        {isStaffOrAdmin && (
                            <>
                                {/* Assignment */}
                                <div className="bg-white rounded-xl border border-slate-200 p-6">

                                    <h3 className="text-lg font-semibold text-slate-800 mb-5">
                                        Assignment
                                    </h3>


                                    {staffError && (
                                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                                            {staffError}
                                        </div>
                                    )}


                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Assign to Staff
                                    </label>


                                    <select
                                        value={
                                            selectedStaff
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSelectedStaff(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            loadingStaff ||
                                            assigningTicket
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    >

                                        <option value="">
                                            Select staff
                                        </option>

                                        {staff.map(
                                            (member) => (
                                                <option
                                                    key={
                                                        member.id
                                                    }
                                                    value={
                                                        member.id
                                                    }
                                                >
                                                    {
                                                        member.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>


                                    <button
                                        onClick={
                                            handleAssignTicket
                                        }
                                        disabled={
                                            assigningTicket ||
                                            !selectedStaff
                                        }
                                        className="w-full mt-3 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {assigningTicket
                                            ? "Assigning..."
                                            : "Assign Ticket"}
                                    </button>

                                </div>


                                {/* Status */}
                                <div className="bg-white rounded-xl border border-slate-200 p-6">

                                    <h3 className="text-lg font-semibold text-slate-800 mb-5">
                                        Update Status
                                    </h3>


                                    <select
                                        value={
                                            selectedStatus
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSelectedStatus(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            updatingStatus
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    >

                                        <option value="OPEN">
                                            Open
                                        </option>

                                        <option value="ASSIGNED">
                                            Assigned
                                        </option>

                                        <option value="IN_PROGRESS">
                                            In Progress
                                        </option>

                                        <option value="WAITING_FOR_STUDENT">
                                            Waiting for Student
                                        </option>

                                        <option value="RESOLVED">
                                            Resolved
                                        </option>

                                        <option value="CLOSED">
                                            Closed
                                        </option>

                                        <option value="REOPENED">
                                            Reopened
                                        </option>

                                    </select>


                                    <button
                                        onClick={
                                            handleStatusUpdate
                                        }
                                        disabled={
                                            updatingStatus ||
                                            selectedStatus ===
                                                ticket.status
                                        }
                                        className="w-full mt-3 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
                                    >
                                        {updatingStatus
                                            ? "Updating..."
                                            : "Update Status"}
                                    </button>

                                </div>


                                {/* Quick Actions */}
                                <div className="bg-white rounded-xl border border-slate-200 p-6">

                                    <h3 className="text-lg font-semibold text-slate-800 mb-5">
                                        Quick Actions
                                    </h3>


                                    <button
                                        onClick={
                                            handleEscalateTicket
                                        }
                                        disabled={
                                            escalatingTicket
                                        }
                                        className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {escalatingTicket
                                            ? "Escalating..."
                                            : "Escalate Ticket"}
                                    </button>

                                </div>
                            </>
                        )}

                    </div>

                </div>

            </main>

        </div>
    );
};


export default TicketDetails;