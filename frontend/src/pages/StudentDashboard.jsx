import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";


const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showCreateForm, setShowCreateForm] =
        useState(false);

    const [creatingTicket, setCreatingTicket] =
        useState(false);

    const [formData, setFormData] = useState({
        category_id: "",
        subject: "",
        description: "",
        priority: "MEDIUM"
    });


    const categories = [
        {
            id: 1,
            name: "Fees"
        },
        {
            id: 2,
            name: "Attendance"
        },
        {
            id: 3,
            name: "ID Card"
        },
        {
            id: 4,
            name: "Documents"
        },
        {
            id: 5,
            name: "Certificates"
        },
        {
            id: 6,
            name: "Technical Support"
        },
        {
            id: 7,
            name: "Other"
        }
    ];


    useEffect(() => {
        fetchMyTickets();
    }, []);


    const fetchMyTickets = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/tickets/my-tickets"
            );

            setTickets(
                response.data.tickets || []
            );
        } catch (error) {
            console.error(
                "Fetch student tickets error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load your tickets."
            );
        } finally {
            setLoading(false);
        }
    };


    const getStatusStyle = (status) => {
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


    const getPriorityStyle = (priority) => {
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


    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString();
    };


    const handleLogout = () => {
        logout();

        navigate("/login");
    };


    const handleInputChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    const handleCreateTicket = async (
        event
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const subject =
            formData.subject.trim();

        const description =
            formData.description.trim();


        if (!formData.category_id) {
            setError(
                "Please select a category."
            );

            return;
        }


        if (!subject) {
            setError(
                "Please enter a subject."
            );

            return;
        }


        if (!description) {
            setError(
                "Please enter a description."
            );

            return;
        }


        if (subject.length < 5) {
            setError(
                "Subject must be at least 5 characters."
            );

            return;
        }


        if (description.length < 10) {
            setError(
                "Description must be at least 10 characters."
            );

            return;
        }


        try {
            setCreatingTicket(true);

            const response =
                await api.post(
                    "/tickets",
                    {
                        category_id:
                            Number(
                                formData.category_id
                            ),

                        subject,

                        description,

                        priority:
                            formData.priority
                    }
                );


            setFormData({
                category_id: "",
                subject: "",
                description: "",
                priority: "MEDIUM"
            });


            setShowCreateForm(false);

            setSuccess(
                response.data.message ||
                "Ticket created successfully."
            );


            await fetchMyTickets();


            if (
                response.data.ticket?.id
            ) {
                navigate(
                    `/tickets/${response.data.ticket.id}`
                );
            }

        } catch (error) {
            console.error(
                "Create ticket error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to create ticket."
            );
        } finally {
            setCreatingTicket(false);
        }
    };


    const handleCancelCreate = () => {
        setShowCreateForm(false);

        setFormData({
            category_id: "",
            subject: "",
            description: "",
            priority: "MEDIUM"
        });

        setError("");
    };


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
                                Student Support Portal
                            </p>

                        </div>


                        <div className="flex items-center gap-4">

                            <div className="text-right">

                                <p className="font-medium text-slate-800">
                                    {user?.name}
                                </p>

                                <p className="text-sm text-slate-500">
                                    {user?.email}
                                </p>

                            </div>


                            <button
                                onClick={
                                    handleLogout
                                }
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                            >
                                Logout
                            </button>

                        </div>

                    </div>

                </div>

            </header>


            {/* Main */}
            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* Welcome */}
                <div className="mb-8">

                    <h2 className="text-3xl font-bold text-slate-800">
                        Welcome, {user?.name}
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Track your support requests and
                        create new tickets when you need help.
                    </p>

                </div>


                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                    <div className="bg-white rounded-xl border border-slate-200 p-5">

                        <p className="text-sm text-slate-500">
                            Total Tickets
                        </p>

                        <p className="text-3xl font-bold text-slate-800 mt-2">
                            {tickets.length}
                        </p>

                    </div>


                    <div className="bg-white rounded-xl border border-slate-200 p-5">

                        <p className="text-sm text-slate-500">
                            Open
                        </p>

                        <p className="text-3xl font-bold text-blue-600 mt-2">
                            {
                                tickets.filter(
                                    (ticket) =>
                                        ticket.status ===
                                            "OPEN" ||
                                        ticket.status ===
                                            "REOPENED"
                                ).length
                            }
                        </p>

                    </div>


                    <div className="bg-white rounded-xl border border-slate-200 p-5">

                        <p className="text-sm text-slate-500">
                            In Progress
                        </p>

                        <p className="text-3xl font-bold text-yellow-600 mt-2">
                            {
                                tickets.filter(
                                    (ticket) =>
                                        ticket.status ===
                                        "IN_PROGRESS"
                                ).length
                            }
                        </p>

                    </div>


                    <div className="bg-white rounded-xl border border-slate-200 p-5">

                        <p className="text-sm text-slate-500">
                            Resolved
                        </p>

                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {
                                tickets.filter(
                                    (ticket) =>
                                        ticket.status ===
                                            "RESOLVED" ||
                                        ticket.status ===
                                            "CLOSED"
                                ).length
                            }
                        </p>

                    </div>

                </div>


                {/* Success Message */}
                {success && (
                    <div className="mb-6">

                        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">

                            {success}

                        </div>

                    </div>
                )}


                {/* Error Message */}
                {error && (
                    <div className="mb-6">

                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">

                            {error}

                        </div>

                    </div>
                )}


                {/* Create Ticket Form */}
                {showCreateForm && (
                    <div className="bg-white rounded-xl border border-slate-200 mb-8">

                        <div className="p-6 border-b border-slate-200">

                            <h3 className="text-xl font-semibold text-slate-800">
                                Create Support Ticket
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Describe your issue so the support
                                team can help you.
                            </p>

                        </div>


                        <form
                            onSubmit={
                                handleCreateTicket
                            }
                            className="p-6 space-y-6"
                        >

                            {/* Category */}
                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Category
                                </label>

                                <select
                                    name="category_id"
                                    value={
                                        formData.category_id
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map(
                                        (category) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* Subject */}
                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Subject
                                </label>

                                <input
                                    type="text"
                                    name="subject"
                                    value={
                                        formData.subject
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Example: Fee payment not updated"
                                    maxLength={200}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>


                            {/* Priority */}
                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={
                                        formData.priority
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                >

                                    <option value="LOW">
                                        Low
                                    </option>

                                    <option value="MEDIUM">
                                        Medium
                                    </option>

                                    <option value="HIGH">
                                        High
                                    </option>

                                    <option value="URGENT">
                                        Urgent
                                    </option>

                                </select>

                            </div>


                            {/* Description */}
                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Explain your issue in detail..."
                                    rows={6}
                                    maxLength={5000}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500"
                                />

                                <p className="text-xs text-slate-400 mt-1">
                                    {
                                        formData.description.length
                                    }{" "}
                                    / 5000 characters
                                </p>

                            </div>


                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        handleCancelCreate
                                    }
                                    disabled={
                                        creatingTicket
                                    }
                                    className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        creatingTicket
                                    }
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {creatingTicket
                                        ? "Creating..."
                                        : "Create Ticket"}
                                </button>

                            </div>

                        </form>

                    </div>
                )}


                {/* Tickets Section */}
                <div className="bg-white rounded-xl border border-slate-200">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-slate-200">

                        <div>

                            <h3 className="text-xl font-semibold text-slate-800">
                                My Tickets
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                View and track your support requests.
                            </p>

                        </div>


                        {!showCreateForm && (
                            <button
                                onClick={() => {
                                    setShowCreateForm(
                                        true
                                    );

                                    setError("");
                                    setSuccess("");
                                }}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                + Create Ticket
                            </button>
                        )}

                    </div>


                    {/* Loading */}
                    {loading && (
                        <div className="p-8 text-center">

                            <p className="text-slate-500">
                                Loading your tickets...
                            </p>

                        </div>
                    )}


                    {/* Empty State */}
                    {!loading &&
                        !error &&
                        tickets.length === 0 && (
                            <div className="p-10 text-center">

                                <h4 className="text-lg font-semibold text-slate-700">
                                    No tickets found
                                </h4>

                                <p className="text-slate-500 mt-2">
                                    You have not created any
                                    support tickets yet.
                                </p>

                            </div>
                        )}


                    {/* Tickets */}
                    {!loading &&
                        tickets.length > 0 && (
                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead className="bg-slate-50 border-b border-slate-200">

                                        <tr>

                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                                Ticket
                                            </th>

                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                                Subject
                                            </th>

                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                                Category
                                            </th>

                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                                Priority
                                            </th>

                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                                Status
                                            </th>

                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                                Created
                                            </th>

                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {tickets.map(
                                            (ticket) => (
                                                <tr
                                                    key={
                                                        ticket.id
                                                    }
                                                    className="border-b border-slate-100 hover:bg-slate-50"
                                                >

                                                    <td className="px-6 py-4">

                                                        <p className="font-semibold text-slate-800">
                                                            {
                                                                ticket.ticket_number
                                                            }
                                                        </p>

                                                    </td>


                                                    <td className="px-6 py-4">

                                                        <p className="font-medium text-slate-800">
                                                            {
                                                                ticket.subject
                                                            }
                                                        </p>

                                                    </td>


                                                    <td className="px-6 py-4 text-sm text-slate-600">

                                                        {
                                                            ticket.category_name ||
                                                            "-"
                                                        }

                                                    </td>


                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(
                                                                ticket.priority
                                                            )}`}
                                                        >
                                                            {
                                                                ticket.priority
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                                                ticket.status
                                                            )}`}
                                                        >
                                                            {
                                                                ticket.status
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">

                                                        {
                                                            formatDate(
                                                                ticket.created_at
                                                            )
                                                        }

                                                    </td>


                                                    <td className="px-6 py-4">

                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/tickets/${ticket.id}`
                                                                )
                                                            }
                                                            className="text-blue-600 font-medium hover:text-blue-800"
                                                        >
                                                            View
                                                        </button>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                </div>

            </main>

        </div>
    );
};


export default StudentDashboard;