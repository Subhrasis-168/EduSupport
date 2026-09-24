Markdown

# 🎓 EduSupport
### Student Support & Ticket Management System

> A full-stack student support platform for managing student requests, ticket assignment, SLA tracking, escalations, communication, and resolution workflows.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

---

## 📌 Overview

**EduSupport** is a full-stack Student Support & Ticket Management System designed to centralize and streamline student service requests.

Students can raise support requests related to areas such as:

- 💰 Fee Payments
- 📊 Attendance
- 🪪 ID Cards
- 📄 Documents
- 🎓 Certificates
- 🛠️ Technical Support
- 📌 Other Student Services

Staff members can then take ownership of these requests, assign tickets, prioritize work, monitor SLA deadlines, communicate with students, escalate issues, and track resolution progress.

The system also provides a management dashboard for monitoring ticket volume, status distribution, priorities, categories, SLA performance, and escalations.

---

# 🎯 Problem Statement

Educational institutions handle a large number of student support requests across different departments.

Without a centralized support system, common challenges include:

- Requests getting lost or overlooked
- Lack of ticket ownership
- No clear priority management
- Difficulty tracking pending requests
- Limited visibility into SLA deadlines
- Poor communication history
- Difficult escalation tracking
- Lack of management-level visibility

### EduSupport addresses these problems through a structured ticket-based workflow.

---

# 💡 Solution

EduSupport provides a centralized workflow:

```text
┌─────────────────────┐
│       Student       │
│  Creates a Request  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Ticket Created   │
│       OPEN          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Staff Assignment  │
│      ASSIGNED       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Ticket Processing │
│    IN_PROGRESS      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Resolution     │
│      RESOLVED       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│        CLOSED       │
└─────────────────────┘
Tickets can also be:


IN_PROGRESS
     │
     ├──────────────► WAITING_FOR_STUDENT
     │
     ├──────────────► ESCALATED
     │
     └──────────────► REOPENED
✨ Key Features
👨‍🎓 Student Portal
Secure authentication

Create support tickets

Select ticket category

Select ticket priority

View submitted tickets

Track ticket status

View SLA information

Add comments

View ticket activity history

👨‍💼 Staff Portal
Staff authentication

View all tickets

View assigned tickets

Assign tickets

Update ticket status

Escalate tickets

Track SLA deadlines

Add comments

View ticket activity

Filter tickets

Search tickets

Monitor operational metrics

Visualize ticket statistics

🛡️ Admin Portal
Administrators have access to management-level ticket operations including:

Ticket monitoring

Ticket assignment

Status management

Escalation management

SLA monitoring

Dashboard analytics

Support workload visibility

🎫 Ticket Management
Every support request is represented as a ticket.

A ticket contains:

Field	Description
Ticket Number	Unique ticket identifier
Student	Student who created the ticket
Category	Type of support request
Subject	Short description
Description	Detailed issue
Priority	LOW / MEDIUM / HIGH / URGENT
Status	Current ticket lifecycle state
Assignment	Current responsible staff member
SLA	Expected resolution deadline
Comments	Communication history
Activity	System activity history
Escalation	Escalation information

🔄 Ticket Lifecycle
EduSupport supports the following ticket states:


OPEN
ASSIGNED
IN_PROGRESS
WAITING_FOR_STUDENT
RESOLVED
CLOSED
REOPENED
Standard Flow

OPEN
  │
  ▼
ASSIGNED
  │
  ▼
IN_PROGRESS
  │
  ├──────────────► WAITING_FOR_STUDENT
  │
  ▼
RESOLVED
  │
  ▼
CLOSED
Reopening

CLOSED / RESOLVED
        │
        ▼
     REOPENED
        │
        ▼
   IN_PROGRESS
🚦 Priority Management
Tickets support four priority levels:

Priority	Purpose
🟢 LOW	Normal requests
🟡 MEDIUM	Standard support requests
🟠 HIGH	Important requests requiring faster attention
🔴 URGENT	Critical requests requiring immediate attention

Priority is also used to determine the applicable SLA rule.

⏱️ SLA Management
EduSupport includes SLA-based ticket monitoring.

Each priority level has a configured resolution target.

The system tracks:

SLA due time

Remaining time

SLA status

Approaching SLA

SLA breach

Resolution time

SLA Workflow

Ticket Created
      │
      ▼
Priority Selected
      │
      ▼
SLA Rule Applied
      │
      ▼
SLA Due Time Calculated
      │
      ▼
┌─────────────────────────┐
│     SLA Monitoring      │
└────────────┬────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   On Track      At Risk
      │             │
      └──────┬──────┘
             ▼
        SLA Breached
This allows staff to identify tickets that require attention before their deadline.

🚨 Escalation Management
Tickets can be escalated when additional attention or intervention is required.

Each escalation records:

Ticket

Escalated by

Escalation reason

Escalation status

Escalation timestamp

Resolution timestamp

Escalation Flow

Ticket
  │
  ▼
Requires Additional Attention
  │
  ▼
ESCALATION CREATED
  │
  ▼
OPEN ESCALATION
  │
  ├──────────────► Staff/Admin Action
  │
  ▼
RESOLVED
Open escalations are also reflected in the management dashboard.

💬 Communication & Activity Tracking
EduSupport separates user communication from system activity.

Comments
Comments represent communication between users.

Examples:


Student → Staff
Staff → Student
Staff → Staff
Activity History
Activity records system events such as:

Ticket creation

Assignment

Status changes

Escalation

Other ticket lifecycle actions

This provides a historical record of ticket processing.

📊 Management Dashboard
The staff dashboard provides operational visibility through:

KPI Metrics
Total Tickets

Open Tickets

Assigned Tickets

In Progress

Waiting for Student

Resolved Tickets

SLA Breached

Escalated Tickets

Ticket Analysis
Status distribution

Priority distribution

Category distribution

Pending workload

Unassigned tickets

Escalated tickets

SLA approaching tickets

SLA breached tickets

Visualization
The dashboard uses Recharts for data visualization.

🏗️ System Architecture

                         ┌──────────────────────┐
                         │       USERS          │
                         │                      │
                         │ Student / Staff /    │
                         │ Admin                │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    React Frontend    │
                         │                      │
                         │ React + Vite         │
                         │ Tailwind CSS         │
                         │ React Router         │
                         │ Axios                │
                         │ Recharts             │
                         └──────────┬───────────┘
                                    │
                             REST API / JSON
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Express Backend    │
                         │                      │
                         │ Node.js              │
                         │ Express.js           │
                         │ Controllers          │
                         │ Routes               │
                         │ Middleware           │
                         └──────────┬───────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                     ▼              ▼              ▼
              Authentication   Ticket Logic   SLA/Escalation
                     │              │              │
                     └──────────────┼──────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │        MySQL         │
                         │                      │
                         │ Users                │
                         │ Tickets              │
                         │ Assignments          │
                         │ Comments             │
                         │ Activities           │
                         │ Escalations          │
                         │ SLA Rules            │
                         └──────────────────────┘
🔐 Authentication & Authorization
EduSupport uses JWT-based authentication.

Authentication Flow

User Login
    │
    ▼
Email + Password
    │
    ▼
Backend Validation
    │
    ▼
Password Verification
    │
    ▼
JWT Generated
    │
    ▼
Frontend Stores Token
    │
    ▼
Axios Request
    │
    ▼
Authorization: Bearer <token>
    │
    ▼
Authentication Middleware
    │
    ▼
Role Middleware
    │
    ▼
Protected Controller
Passwords are stored using bcrypt hashing.

Role-based authorization restricts access based on:


STUDENT
STAFF
ADMIN
🗄️ Database Architecture
EduSupport uses a relational MySQL database.

Core Tables

┌───────────────┐
│     roles     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│     users     │
└───────┬───────┘
        │
        ├─────────────────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐          ┌──────────────────┐
│    tickets    │          │ticket_comments   │
└───────┬───────┘          └──────────────────┘
        │
        ├───────────────┐
        │               │
        ▼               ▼
┌───────────────┐ ┌──────────────────┐
│assignments    │ │ticket_activity   │
└───────────────┘ └──────────────────┘
        │
        ▼
┌─────────────────────┐
│ticket_escalations   │
└─────────────────────┘

ticket_categories
        │
        ▼
     tickets

sla_rules
        │
        ▼
     tickets
Database Tables
Table	Responsibility
roles	Application roles
users	Students, staff and administrators
ticket_categories	Support request categories
sla_rules	Priority-based SLA configuration
tickets	Main support ticket records
ticket_assignments	Ticket ownership history
ticket_comments	User communication
ticket_activity	Ticket event history
ticket_escalations	Escalation records

🧰 Technology Stack
Frontend
Technology	Purpose
React.js	UI development
Vite	Frontend build tool
Tailwind CSS	UI styling
React Router	Client-side routing
Axios	API communication
Recharts	Dashboard visualization

Backend
Technology	Purpose
Node.js	Runtime environment
Express.js	REST API framework
JWT	Authentication
bcryptjs	Password hashing
CORS	Cross-origin API access

Database
Technology	Purpose
MySQL	Relational database
mysql2	Node.js MySQL driver

Development Tools

Git
GitHub
VS Code
Postman / Browser API testing
MySQL
Chrome DevTools
📁 Project Structure

EduSupport/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── ticketController.js
│   │   │   └── escalationController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── ticketRoutes.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
🔌 API Overview
Authentication
http

POST /api/auth/login
Student APIs
http

POST   /api/tickets/
GET    /api/tickets/my-tickets
GET    /api/tickets/:id
GET    /api/tickets/:id/sla
POST   /api/tickets/:id/comments
Staff/Admin APIs
http

GET    /api/tickets/
GET    /api/tickets/my-assigned
GET    /api/tickets/staff
GET    /api/tickets/dashboard
GET    /api/tickets/escalation-status

POST   /api/tickets/:id/assign
PATCH  /api/tickets/:id/status
PATCH  /api/tickets/:id/escalate

GET    /api/tickets/:id
GET    /api/tickets/:id/sla
POST   /api/tickets/:id/comments
⚙️ Installation & Setup
Prerequisites
Install:

Node.js

npm

MySQL

Git

1. Clone Repository
Bash

git clone https://github.com/Subhrasis-168/EduSupport.git
cd EduSupport
2. Backend Setup
Bash

cd backend
npm install
Create:


backend/.env
Example:

env

PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=edusupport
DB_PORT=3306

JWT_SECRET=YOUR_SECRET_KEY
Start backend:

Bash

npm run dev
Backend:


http://localhost:3000
Health check:


http://localhost:3000/health
🎨 Frontend Setup
Open another terminal:

Bash

cd frontend
npm install
npm run dev
Vite will provide the local development URL.

🧪 Validation & Testing
The application was validated across the major business workflows.

Authentication Testing
Student login

Staff login

Admin login

Invalid credentials

Protected routes

JWT authorization

Role-based access

Ticket Testing
Create ticket

View tickets

View ticket details

Assign ticket

Update ticket status

Reopen ticket

Add comments

View activity history

SLA Testing
Priority-based SLA calculation

SLA remaining time

At-risk tickets

SLA breach handling

Escalation Testing
Escalate ticket

Store escalation reason

Retrieve escalation status

Display escalation information

Resolve escalation

Dashboard Testing
Ticket counts

Status breakdown

Priority breakdown

Category breakdown

SLA monitoring

Escalation monitoring

Unassigned ticket tracking

🛡️ Edge Cases Considered
The application handles scenarios such as:

Missing authentication token

Unauthorized user access

Invalid ticket IDs

Unassigned tickets

Empty ticket lists

Empty comments

Empty activity history

Reopened tickets

Escalated tickets

SLA approaching deadline

SLA breach

Invalid role access

Invalid ticket operations

🧠 Engineering Decisions
Why React?
React provides reusable components and supports role-specific interfaces without duplicating the entire frontend.

Why Express?
Express provides a lightweight REST API architecture suitable for separating routes, controllers, and middleware.

Why MySQL?
The application contains highly related entities such as users, roles, tickets, assignments, comments, activities, and escalations. A relational database provides structured relationships and referential integrity.

Why JWT?
JWT enables stateless authentication for REST API requests.

Why Separate Comments and Activities?
Comments represent human communication.

Activities represent system events.

Keeping them separate makes the ticket history easier to understand and maintain.

Why Separate Assignment History?
Assignments are stored independently so ownership changes can be tracked rather than simply overwriting the current staff member.

🤖 AI-Assisted Development
AI tools were used as development assistants during the implementation of EduSupport.

AI assistance was used for:

Requirement analysis

Feature planning

Database schema planning

API design assistance

React component development

Backend implementation assistance

Debugging

Error analysis

Code review

Documentation

Identifying edge cases

Improving implementation decisions

AI-generated code was not blindly accepted.

Generated suggestions were reviewed, adapted to the project architecture, executed locally, and validated through application testing.

🔍 Example of AI-Assisted Debugging
During development, a ticket detail response contained:


ticket
comments
activities
while the frontend initially treated the response primarily as the ticket object.

This resulted in the UI showing:


No comments yet.
No activity recorded yet.
even though the backend had stored the data.

The issue was identified by comparing:


Backend API response
        ↓
Frontend state assignment
        ↓
UI rendering
The frontend response handling was corrected so that:


ticket
comments
activities
were normalized into the ticket detail state.

The fix was then tested by:

Adding a comment.

Refreshing the ticket.

Verifying the comment appeared.

Verifying activity history appeared.

This demonstrates that AI-generated suggestions were validated against the actual application behavior rather than being accepted without testing.

📋 AI Usage Report
A separate AI Usage Report is maintained for the assignment submission.

The report documents:

AI tool used

Prompts provided

Development tasks supported by AI

Code generated

Code modified

Incorrect AI suggestions

How issues were identified

How issues were corrected

Validation performed after AI-assisted changes

🔮 Future Improvements
Possible production-level improvements include:

Email notifications

In-app notification system

File attachments

Automated SLA escalation

Department-based routing

Staff workload balancing

Pagination

Advanced ticket search

Advanced filtering

Audit logging

Automated unit tests

Integration testing

CI/CD pipeline

Docker containerization

Cloud deployment

Production monitoring

Role administration interface

🚀 Production Considerations
Before production deployment, the following would be added or strengthened:

Secure production environment variables

Strong JWT secret management

HTTPS

Database backups

Rate limiting

Input sanitization

API validation

Centralized error handling

Logging and monitoring

Automated testing

CI/CD

Database migration management

📌 Assignment Alignment
EduSupport was designed around the major requirements of the Student Support & Ticket Management problem:

Requirement	Implementation
Student requests	Ticket creation
Ticket ownership	Assignment system
Prioritization	LOW / MEDIUM / HIGH / URGENT
Status tracking	Ticket lifecycle
SLA management	Priority-based SLA
Ageing visibility	Ticket age tracking
Resolution tracking	RESOLVED / CLOSED
Activity history	Ticket activity
Communication	Ticket comments
Escalation	Escalation management
Management visibility	Dashboard
Pending-action workflow	Dashboard indicators
Role-based access	Student / Staff / Admin

📈 Project Goals
The primary goals of EduSupport are:


Centralize student support requests
              ↓
Improve ticket ownership
              ↓
Prioritize important requests
              ↓
Track SLA deadlines
              ↓
Maintain communication history
              ↓
Support escalation workflows
              ↓
Improve management visibility
👨‍💻 Author
Subhrasis Biswal
B.Tech Computer Science & Engineering — 2026

Profiles
GitHub: https://github.com/Subhrasis-168

LinkedIn: https://www.linkedin.com/in/subhrasis-biswal-782a3b318/

📄 License
This project was developed as a product engineering assignment / portfolio project.
