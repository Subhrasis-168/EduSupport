import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import api from "../services/api";


const StaffDashboard = () => {
    const navigate = useNavigate();

    const [dashboard, setDashboard] =
        useState(null);

    const [tickets, setTickets] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [priorityFilter, setPriorityFilter] =
        useState("ALL");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");


    useEffect(() => {
        fetchDashboardData();
    }, []);


    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                dashboardResponse,
                ticketsResponse
            ] = await Promise.all([
                api.get("/tickets/dashboard"),
                api.get("/tickets")
            ]);

            setDashboard(
                dashboardResponse.data
            );

            setTickets(
                ticketsResponse.data.tickets || []
            );

        } catch (error) {
            console.error(
                "Dashboard error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load dashboard"
            );

        } finally {
            setLoading(false);
        }
    };


    const handleTicketClick = (
        ticketId
    ) => {
        navigate(
            `/tickets/${ticketId}`
        );
    };


    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
        setCategoryFilter("ALL");
    };


    const categories = useMemo(() => {

        const uniqueCategories =
            tickets
                .map(
                    (ticket) =>
                        ticket.category
                )
                .filter(Boolean);

        return [
            ...new Set(uniqueCategories)
        ].sort();

    }, [tickets]);


    const filteredTickets = useMemo(() => {

        const search =
            searchTerm
                .trim()
                .toLowerCase();

        return tickets.filter(
            (ticket) => {

                const matchesSearch =
                    !search ||
                    String(
                        ticket.ticket_number || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        ticket.student_name || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        ticket.subject || ""
                    )
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =
                    statusFilter === "ALL" ||
                    ticket.status === statusFilter;


                const matchesPriority =
                    priorityFilter === "ALL" ||
                    ticket.priority === priorityFilter;


                const matchesCategory =
                    categoryFilter === "ALL" ||
                    ticket.category === categoryFilter;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPriority &&
                    matchesCategory
                );
            }
        );

    }, [
        tickets,
        searchTerm,
        statusFilter,
        priorityFilter,
        categoryFilter
    ]);


    /*
    |--------------------------------------------------------------------------
    | STATUS CHART
    |--------------------------------------------------------------------------
    */

    const statusChartData = useMemo(() => {

        const statusOrder = [
            "OPEN",
            "ASSIGNED",
            "IN_PROGRESS",
            "WAITING_FOR_STUDENT",
            "RESOLVED",
            "CLOSED",
            "REOPENED"
        ];

        const statusMap = {};

        statusOrder.forEach(
            (status) => {
                statusMap[status] = 0;
            }
        );

        tickets.forEach(
            (ticket) => {

                if (
                    statusMap[ticket.status] !==
                    undefined
                ) {
                    statusMap[ticket.status] += 1;
                }

            }
        );

        return statusOrder
            .filter(
                (status) =>
                    statusMap[status] > 0
            )
            .map(
                (status) => ({
                    name:
                        formatStatus(status),
                    value:
                        statusMap[status]
                })
            );

    }, [tickets]);


    /*
    |--------------------------------------------------------------------------
    | PRIORITY CHART
    |--------------------------------------------------------------------------
    */

    const priorityChartData = useMemo(() => {

        const priorityOrder = [
            "URGENT",
            "HIGH",
            "MEDIUM",
            "LOW"
        ];

        const priorityMap = {};

        priorityOrder.forEach(
            (priority) => {
                priorityMap[priority] = 0;
            }
        );

        tickets.forEach(
            (ticket) => {

                if (
                    priorityMap[
                        ticket.priority
                    ] !== undefined
                ) {
                    priorityMap[
                        ticket.priority
                    ] += 1;
                }

            }
        );

        return priorityOrder
            .filter(
                (priority) =>
                    priorityMap[priority] > 0
            )
            .map(
                (priority) => ({
                    name: priority,
                    tickets:
                        priorityMap[priority]
                })
            );

    }, [tickets]);


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">

                <p className="text-slate-600">
                    Loading dashboard...
                </p>

            </div>
        );
    }


    if (error) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

                <div className="rounded-xl bg-white p-6 shadow">

                    <h2 className="text-xl font-semibold text-red-600">
                        Dashboard Error
                    </h2>

                    <p className="mt-2 text-slate-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={
                            fetchDashboardData
                        }
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    const summary =
        dashboard?.summary || {};


    return (
        <div className="min-h-screen bg-slate-100">

            {/* HEADER */}

            <header className="border-b bg-white">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    <div>

                        <h1 className="text-2xl font-bold text-slate-800">
                            EduSupport Dashboard
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Student Support & Ticket Management
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            fetchDashboardData
                        }
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Refresh
                    </button>

                </div>

            </header>


            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* SUMMARY */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <DashboardCard
                        title="Total Tickets"
                        value={
                            summary.total_tickets || 0
                        }
                    />

                    <DashboardCard
                        title="Open Tickets"
                        value={
                            summary.open_tickets || 0
                        }
                    />

                    <DashboardCard
                        title="Assigned"
                        value={
                            summary.assigned_tickets || 0
                        }
                    />

                    <DashboardCard
                        title="In Progress"
                        value={
                            summary.in_progress_tickets || 0
                        }
                    />

                    <DashboardCard
                        title="Waiting for Student"
                        value={
                            summary.waiting_for_student || 0
                        }
                    />

                    <DashboardCard
                        title="Resolved"
                        value={
                            summary.resolved_tickets || 0
                        }
                    />

                    <DashboardCard
                        title="SLA Breached"
                        value={
                            summary.breached_tickets || 0
                        }
                    />

                    <DashboardCard
                        title="Escalated"
                        value={
                            summary.escalated_tickets || 0
                        }
                    />

                </div>


                {/* CHARTS */}

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                    <DashboardSection
                        title="Ticket Status Distribution"
                    >

                        <div className="h-80">

                            {statusChartData.length === 0 ? (

                                <div className="flex h-full items-center justify-center">

                                    <p className="text-sm text-slate-500">
                                        No status data available.
                                    </p>

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <PieChart>

                                        <Pie
                                            data={
                                                statusChartData
                                            }
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="45%"
                                            outerRadius={95}
                                            label
                                        >

                                            {statusChartData.map(
                                                (
                                                    entry,
                                                    index
                                                ) => (

                                                    <Cell
                                                        key={
                                                            `status-${index}`
                                                        }
                                                        fill={
                                                            getStatusChartColor(
                                                                entry.name
                                                            )
                                                        }
                                                    />

                                                )
                                            )}

                                        </Pie>

                                        <Tooltip />

                                        <Legend />

                                    </PieChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </DashboardSection>


                    <DashboardSection
                        title="Ticket Priority Distribution"
                    >

                        <div className="h-80">

                            {priorityChartData.length === 0 ? (

                                <div className="flex h-full items-center justify-center">

                                    <p className="text-sm text-slate-500">
                                        No priority data available.
                                    </p>

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <BarChart
                                        data={
                                            priorityChartData
                                        }
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 0,
                                            bottom: 10
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="name"
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                        />

                                        <Tooltip />

                                        <Bar
                                            dataKey="tickets"
                                            name="Tickets"
                                            fill="#2563eb"
                                            radius={[
                                                6,
                                                6,
                                                0,
                                                0
                                            ]}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </DashboardSection>

                </div>


                {/* BREAKDOWNS */}

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                    <DashboardSection
                        title="Priority Breakdown"
                    >

                        <div className="space-y-4">

                            {(
                                dashboard?.priority_breakdown ||
                                []
                            ).map(
                                (item) => (

                                    <BreakdownRow
                                        key={
                                            item.priority
                                        }
                                        label={
                                            item.priority
                                        }
                                        value={
                                            item.count
                                        }
                                    />

                                )
                            )}

                        </div>

                    </DashboardSection>


                    <DashboardSection
                        title="Status Breakdown"
                    >

                        <div className="space-y-4">

                            {(
                                dashboard?.status_breakdown ||
                                []
                            ).map(
                                (item) => (

                                    <BreakdownRow
                                        key={
                                            item.status
                                        }
                                        label={
                                            item.status
                                        }
                                        value={
                                            item.count
                                        }
                                    />

                                )
                            )}

                        </div>

                    </DashboardSection>


                    <DashboardSection
                        title="Category Breakdown"
                    >

                        <div className="space-y-4">

                            {(
                                dashboard?.category_breakdown ||
                                []
                            ).map(
                                (item) => (

                                    <BreakdownRow
                                        key={
                                            item.category
                                        }
                                        label={
                                            item.category
                                        }
                                        value={
                                            item.count
                                        }
                                    />

                                )
                            )}

                        </div>

                    </DashboardSection>


                    <DashboardSection
                        title="Pending Actions"
                    >

                        <div className="space-y-4">

                            <ActionRow
                                label="Unassigned Tickets"
                                value={
                                    summary.unassigned_tickets ||
                                    0
                                }
                            />

                            <ActionRow
                                label="Escalated Tickets"
                                value={
                                    summary.escalated_tickets ||
                                    0
                                }
                            />

                            <ActionRow
                                label="Approaching SLA"
                                value={
                                    summary.approaching_sla_tickets ||
                                    0
                                }
                            />

                            <ActionRow
                                label="SLA Breached"
                                value={
                                    summary.breached_tickets ||
                                    0
                                }
                            />

                        </div>

                    </DashboardSection>

                </div>


                {/* TICKET MANAGEMENT */}

                <div className="mt-8">

                    <DashboardSection
                        title="Ticket Management"
                    >

                        {/* FILTERS */}

                        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                                <div className="lg:col-span-2">

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Search Tickets
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            searchTerm
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSearchTerm(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search ticket number, student or subject..."
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            statusFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusFilter(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    >

                                        <option value="ALL">
                                            All Statuses
                                        </option>

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

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Priority
                                    </label>

                                    <select
                                        value={
                                            priorityFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPriorityFilter(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    >

                                        <option value="ALL">
                                            All Priorities
                                        </option>

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


                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Category
                                    </label>

                                    <select
                                        value={
                                            categoryFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCategoryFilter(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    >

                                        <option value="ALL">
                                            All Categories
                                        </option>

                                        {categories.map(
                                            (
                                                category
                                            ) => (

                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="flex items-end">

                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                    >
                                        Clear Filters
                                    </button>

                                </div>

                            </div>


                            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">

                                <p className="text-sm text-slate-500">

                                    Showing{" "}

                                    <span className="font-semibold text-slate-700">
                                        {
                                            filteredTickets.length
                                        }
                                    </span>

                                    {" "}of{" "}

                                    <span className="font-semibold text-slate-700">
                                        {
                                            tickets.length
                                        }
                                    </span>

                                    {" "}tickets

                                </p>

                            </div>

                        </div>


                        {/* LEGENDS */}

                        <div className="mb-5 flex flex-wrap items-center gap-3">

                            <span className="text-xs font-medium text-slate-500">
                                SLA:
                            </span>

                            <SlaBadge
                                status="ON_TRACK"
                            />

                            <SlaBadge
                                status="AT_RISK"
                            />

                            <SlaBadge
                                status="BREACHED"
                            />

                            <span className="ml-2 text-xs font-medium text-slate-500">
                                Escalation:
                            </span>

                            <EscalationBadge
                                escalated={true}
                            />

                        </div>


                        {/* DESKTOP TABLE */}

                        <div className="hidden overflow-x-auto md:block">

                            <table className="w-full text-left">

                                <thead>

                                    <tr className="border-b border-slate-200">

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Ticket
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Student
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Category
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Subject
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Priority
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Assigned To
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Age
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            SLA
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            SLA Due
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Escalation
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredTickets.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="11"
                                                className="px-4 py-10 text-center"
                                            >

                                                <p className="text-sm font-medium text-slate-600">
                                                    No tickets found
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Try changing or clearing your filters.
                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredTickets.map(
                                            (ticket) => {

                                                const sla =
                                                    getSlaInfo(
                                                        ticket
                                                    );

                                                const ageing =
                                                    getTicketAge(
                                                        ticket.created_at
                                                    );

                                                const escalation =
                                                    getEscalationInfo(
                                                        ticket
                                                    );


                                                return (

                                                    <tr
                                                        key={
                                                            ticket.id
                                                        }
                                                        onClick={() =>
                                                            handleTicketClick(
                                                                ticket.id
                                                            )
                                                        }
                                                        className={`cursor-pointer border-b border-slate-100 transition hover:bg-blue-50 ${
                                                            sla.status ===
                                                            "BREACHED"
                                                                ? "bg-red-50/50"
                                                                : ""
                                                        }`}
                                                    >

                                                        <td className="px-4 py-4">

                                                            <span className="font-semibold text-blue-600">
                                                                {
                                                                    ticket.ticket_number
                                                                }
                                                            </span>

                                                        </td>


                                                        <td className="px-4 py-4 text-sm text-slate-700">
                                                            {
                                                                ticket.student_name ||
                                                                "N/A"
                                                            }
                                                        </td>


                                                        <td className="px-4 py-4 text-sm text-slate-600">
                                                            {
                                                                ticket.category ||
                                                                "-"
                                                            }
                                                        </td>


                                                        <td className="max-w-xs px-4 py-4 text-sm text-slate-700">

                                                            <p className="truncate">
                                                                {
                                                                    ticket.subject
                                                                }
                                                            </p>

                                                        </td>


                                                        <td className="px-4 py-4">

                                                            <PriorityBadge
                                                                priority={
                                                                    ticket.priority
                                                                }
                                                            />

                                                        </td>


                                                        <td className="px-4 py-4">

                                                            <StatusBadge
                                                                status={
                                                                    ticket.status
                                                                }
                                                            />

                                                        </td>


                                                        <td className="px-4 py-4 text-sm text-slate-600">
                                                            {
                                                                ticket.assigned_to ||
                                                                ticket.assigned_to_name ||
                                                                "Unassigned"
                                                            }
                                                        </td>


                                                        <td className="px-4 py-4">

                                                            <AgeBadge
                                                                age={
                                                                    ageing
                                                                }
                                                            />

                                                        </td>


                                                        <td className="px-4 py-4">

                                                            <SlaBadge
                                                                status={
                                                                    sla.status
                                                                }
                                                            />

                                                        </td>


                                                        <td className="px-4 py-4">

                                                            <span className="text-xs text-slate-600">

                                                                {sla.dueText ||
                                                                    "N/A"}

                                                            </span>

                                                        </td>


                                                        <td className="px-4 py-4">

                                                            <EscalationBadge
                                                                escalated={
                                                                    escalation.escalated
                                                                }
                                                            />

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* MOBILE */}

                        <div className="space-y-4 md:hidden">

                            {filteredTickets.length === 0 ? (

                                <div className="rounded-lg bg-slate-50 p-5 text-center">

                                    <p className="text-sm font-medium text-slate-600">
                                        No tickets found
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Try changing or clearing your filters.
                                    </p>

                                </div>

                            ) : (

                                filteredTickets.map(
                                    (ticket) => {

                                        const sla =
                                            getSlaInfo(
                                                ticket
                                            );

                                        const ageing =
                                            getTicketAge(
                                                ticket.created_at
                                            );

                                        const escalation =
                                            getEscalationInfo(
                                                ticket
                                            );


                                        return (

                                            <button
                                                type="button"
                                                key={
                                                    ticket.id
                                                }
                                                onClick={() =>
                                                    handleTicketClick(
                                                        ticket.id
                                                    )
                                                }
                                                className={`w-full rounded-lg border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 ${
                                                    sla.status ===
                                                    "BREACHED"
                                                        ? "border-red-200 bg-red-50/50"
                                                        : "border-slate-200 bg-white"
                                                }`}
                                            >

                                                <div className="flex items-start justify-between gap-3">

                                                    <div>

                                                        <p className="text-sm font-semibold text-blue-600">
                                                            {
                                                                ticket.ticket_number
                                                            }
                                                        </p>

                                                        <p className="mt-1 font-medium text-slate-800">
                                                            {
                                                                ticket.subject
                                                            }
                                                        </p>

                                                    </div>


                                                    <StatusBadge
                                                        status={
                                                            ticket.status
                                                        }
                                                    />

                                                </div>


                                                <div className="mt-4 grid grid-cols-2 gap-3">

                                                    <div>

                                                        <p className="text-xs text-slate-400">
                                                            Student
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-700">
                                                            {
                                                                ticket.student_name ||
                                                                "N/A"
                                                            }
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <p className="text-xs text-slate-400">
                                                            Category
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-700">
                                                            {
                                                                ticket.category ||
                                                                "-"
                                                            }
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <p className="text-xs text-slate-400">
                                                            Priority
                                                        </p>

                                                        <div className="mt-1">

                                                            <PriorityBadge
                                                                priority={
                                                                    ticket.priority
                                                                }
                                                            />

                                                        </div>

                                                    </div>


                                                    <div>

                                                        <p className="text-xs text-slate-400">
                                                            Assigned To
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-700">
                                                            {
                                                                ticket.assigned_to ||
                                                                ticket.assigned_to_name ||
                                                                "Unassigned"
                                                            }
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <p className="text-xs text-slate-400">
                                                            Ticket Age
                                                        </p>

                                                        <div className="mt-1">

                                                            <AgeBadge
                                                                age={
                                                                    ageing
                                                                }
                                                            />

                                                        </div>

                                                    </div>


                                                    <div>

                                                        <p className="text-xs text-slate-400">
                                                            SLA
                                                        </p>

                                                        <div className="mt-1">

                                                            <SlaBadge
                                                                status={
                                                                    sla.status
                                                                }
                                                            />

                                                        </div>

                                                    </div>


                                                    <div>

                                                        <p className="text-xs text-slate-400">
                                                            Escalation
                                                        </p>

                                                        <div className="mt-1">

                                                            <EscalationBadge
                                                                escalated={
                                                                    escalation.escalated
                                                                }
                                                            />

                                                        </div>

                                                    </div>

                                                </div>


                                                <div className="mt-4 border-t border-slate-100 pt-3">

                                                    <p className="text-xs text-slate-400">
                                                        SLA Due
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-600">
                                                        {
                                                            sla.dueText ||
                                                            "N/A"
                                                        }
                                                    </p>

                                                </div>

                                            </button>

                                        );

                                    }
                                )

                            )}

                        </div>

                    </DashboardSection>

                </div>

            </main>

        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Escalation Information
|--------------------------------------------------------------------------
*/

const getEscalationInfo = (
    ticket
) => {

    const value =
        ticket.is_escalated ??
        ticket.escalated ??
        ticket.escalation_status ??
        ticket.escalationStatus;

    if (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "OPEN" ||
        value === "ESCALATED"
    ) {
        return {
            escalated: true
        };
    }

    return {
        escalated: false
    };
};


/*
|--------------------------------------------------------------------------
| Status Chart Color
|--------------------------------------------------------------------------
*/

const getStatusChartColor = (
    status
) => {

    const colors = {
        Open: "#3b82f6",
        Assigned: "#8b5cf6",
        "In Progress": "#6366f1",
        "Waiting For Student": "#f59e0b",
        Resolved: "#22c55e",
        Closed: "#64748b",
        Reopened: "#ef4444"
    };

    return (
        colors[status] ||
        "#94a3b8"
    );
};


/*
|--------------------------------------------------------------------------
| Format Status
|--------------------------------------------------------------------------
*/

const formatStatus = (
    status
) => {

    if (!status) {
        return "";
    }

    return status
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );
};


/*
|--------------------------------------------------------------------------
| SLA Calculation
|--------------------------------------------------------------------------
*/

const getSlaInfo = (
    ticket
) => {

    if (
        ticket.status === "RESOLVED" ||
        ticket.status === "CLOSED"
    ) {

        return {
            status: "COMPLETED",
            label: "Completed",
            dueText:
                ticket.sla_due_at
                    ? formatDate(
                        ticket.sla_due_at
                    )
                    : ""
        };

    }


    if (!ticket.sla_due_at) {

        return {
            status: "NO_SLA",
            label: "No SLA",
            dueText: ""
        };

    }


    const dueDate =
        new Date(
            ticket.sla_due_at
        );

    const now =
        new Date();

    const difference =
        dueDate.getTime() -
        now.getTime();


    if (difference <= 0) {

        const overdueHours =
            Math.ceil(
                Math.abs(
                    difference
                ) /
                (1000 * 60 * 60)
            );

        return {
            status: "BREACHED",
            label:
                `${overdueHours}h overdue`,
            dueText:
                `Due ${formatDate(
                    ticket.sla_due_at
                )}`
        };

    }


    if (
        difference <=
        24 * 60 * 60 * 1000
    ) {

        const remainingHours =
            Math.ceil(
                difference /
                (1000 * 60 * 60)
            );

        return {
            status: "AT_RISK",
            label:
                `${remainingHours}h remaining`,
            dueText:
                `Due ${formatDate(
                    ticket.sla_due_at
                )}`
        };

    }


    const remainingDays =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );

    return {
        status: "ON_TRACK",
        label:
            `${remainingDays}d remaining`,
        dueText:
            `Due ${formatDate(
                ticket.sla_due_at
            )}`
    };
};


/*
|--------------------------------------------------------------------------
| Ticket Age
|--------------------------------------------------------------------------
*/

const getTicketAge = (
    createdAt
) => {

    if (!createdAt) {

        return {
            label: "N/A",
            status: "NORMAL"
        };

    }


    const createdDate =
        new Date(createdAt);

    const now =
        new Date();


    const difference =
        Math.max(
            0,
            now.getTime() -
            createdDate.getTime()
        );


    const totalHours =
        Math.floor(
            difference /
            (1000 * 60 * 60)
        );


    const days =
        Math.floor(
            totalHours / 24
        );


    const hours =
        totalHours % 24;


    let label;


    if (days > 0) {
        label =
            `${days}d ${hours}h`;
    } else {
        label =
            `${hours}h`;
    }


    return {
        label,
        status:
            days >= 3
                ? "AGING"
                : "NORMAL"
    };
};


/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

const formatDate = (
    date
) => {

    if (!date) {
        return "N/A";
    }

    return new Date(
        date
    ).toLocaleString();
};


/*
|--------------------------------------------------------------------------
| Dashboard Card
|--------------------------------------------------------------------------
*/

const DashboardCard = ({
    title,
    value
}) => {

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
                {title}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-800">
                {value}
            </p>

        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Dashboard Section
|--------------------------------------------------------------------------
*/

const DashboardSection = ({
    title,
    children
}) => {

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-lg font-semibold text-slate-800">
                {title}
            </h2>

            {children}

        </section>
    );
};


/*
|--------------------------------------------------------------------------
| Breakdown Row
|--------------------------------------------------------------------------
*/

const BreakdownRow = ({
    label,
    value
}) => {

    return (
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">

            <span className="text-sm text-slate-600">
                {label}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {value}
            </span>

        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Action Row
|--------------------------------------------------------------------------
*/

const ActionRow = ({
    label,
    value
}) => {

    return (
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">

            <span className="text-sm font-medium text-slate-600">
                {label}
            </span>

            <span className="text-lg font-bold text-slate-800">
                {value}
            </span>

        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Priority Badge
|--------------------------------------------------------------------------
*/

const PriorityBadge = ({
    priority
}) => {

    const styles = {
        URGENT:
            "bg-red-100 text-red-700",

        HIGH:
            "bg-orange-100 text-orange-700",

        MEDIUM:
            "bg-yellow-100 text-yellow-700",

        LOW:
            "bg-green-100 text-green-700"
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                styles[priority] ||
                "bg-slate-100 text-slate-700"
            }`}
        >
            {priority}
        </span>
    );
};


/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

const StatusBadge = ({
    status
}) => {

    const styles = {
        OPEN:
            "bg-blue-100 text-blue-700",

        ASSIGNED:
            "bg-purple-100 text-purple-700",

        IN_PROGRESS:
            "bg-indigo-100 text-indigo-700",

        WAITING_FOR_STUDENT:
            "bg-yellow-100 text-yellow-700",

        RESOLVED:
            "bg-green-100 text-green-700",

        CLOSED:
            "bg-slate-200 text-slate-700",

        REOPENED:
            "bg-red-100 text-red-700"
    };

    const formattedStatus =
        status
            ? status.replaceAll(
                "_",
                " "
            )
            : "";

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                styles[status] ||
                "bg-slate-100 text-slate-700"
            }`}
        >
            {formattedStatus}
        </span>
    );
};


/*
|--------------------------------------------------------------------------
| SLA Badge
|--------------------------------------------------------------------------
*/

const SlaBadge = ({
    status
}) => {

    const styles = {
        ON_TRACK:
            "bg-green-100 text-green-700",

        AT_RISK:
            "bg-orange-100 text-orange-700",

        BREACHED:
            "bg-red-100 text-red-700",

        COMPLETED:
            "bg-slate-100 text-slate-700",

        NO_SLA:
            "bg-slate-100 text-slate-500"
    };

    const labels = {
        ON_TRACK:
            "On Track",

        AT_RISK:
            "At Risk",

        BREACHED:
            "Breached",

        COMPLETED:
            "Completed",

        NO_SLA:
            "No SLA"
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                styles[status] ||
                "bg-slate-100 text-slate-700"
            }`}
        >
            {
                labels[status] ||
                status
            }
        </span>
    );
};


/*
|--------------------------------------------------------------------------
| Escalation Badge
|--------------------------------------------------------------------------
*/

const EscalationBadge = ({
    escalated
}) => {

    if (escalated) {

        return (
            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                Escalated
            </span>
        );

    }


    return (
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            Normal
        </span>
    );
};


/*
|--------------------------------------------------------------------------
| Age Badge
|--------------------------------------------------------------------------
*/

const AgeBadge = ({
    age
}) => {

    if (!age) {
        return null;
    }

    const styles = {
        AGING:
            "bg-orange-100 text-orange-700",

        NORMAL:
            "bg-slate-100 text-slate-700"
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                styles[age.status] ||
                styles.NORMAL
            }`}
        >
            {age.label}
        </span>
    );
};


export default StaffDashboard;