# Blaise Café Management System — Master Development Prompt

## 1. Project Overview

I am building a real-world **Coffee Shop Management System for Blaise Café**.

The **only intended user is the café owner**, who will primarily use a mobile phone. The application must therefore be mobile-first, with a clean, simple, fast, and touch-friendly interface. Do not build staff accounts, staff management, staff-specific permissions, or multi-role workflows.

This project is also a portfolio and learning project. I already have experience with **React, TypeScript, Vite, Supabase, PostgreSQL, and frontend development**, so I want this project to expand my full-stack knowledge.

I want to learn and properly implement:

- Next.js
- Node.js
- Express.js
- REST API architecture
- Prisma ORM
- PostgreSQL
- Owner authentication
- Zod validation
- Backend business logic
- Database transactions
- Error handling
- API security
- Deployment
- Production-oriented project architecture

Do not simplify the project into a basic CRUD application. Build it as a realistic small-business management system while avoiding unnecessary enterprise-level complexity.

---

## 2. Technology Stack

Use the following stack unless there is a strong technical reason to change something.

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React
- Recharts

### Backend
- Node.js
- Express.js
- TypeScript
- REST API
- Zod
- Prisma

### Database and Authentication
- Supabase
- PostgreSQL
- Supabase Auth

### Deployment
- Vercel for the Next.js frontend
- Render for the Express.js backend
- Supabase for PostgreSQL and authentication

### Version Control
- Git
- GitHub

---

## 3. Architecture

Use a separated frontend/backend architecture.

```text
blaise-cafe/
├── frontend/
│   └── Next.js
│       ├── TypeScript
│       ├── Tailwind CSS
│       └── Recharts
└── backend/
    └── Node.js + Express
        ├── TypeScript
        ├── Zod
        ├── Prisma
        └── REST API
                |
                v
        Supabase PostgreSQL
```

The frontend should communicate with the backend through REST APIs. The frontend should not directly handle important database business operations.

Use this flow:

```text
Owner's Mobile UI
   ↓
Next.js
   ↓
HTTP Request
   ↓
Express Route
   ↓
Authentication Middleware
   ↓
Zod Validation
   ↓
Controller
   ↓
Service Layer
   ↓
Prisma
   ↓
PostgreSQL
   ↓
Response
   ↓
Next.js UI
```

---

## 4. Important Architecture Rules

### Rule 1 — Business logic belongs in the backend

Do not rely on the frontend to calculate important business values, including:

- Order totals
- Subtotals
- Discounts
- Payment fees
- GCash net amount
- Change
- Inventory deductions
- Sales totals
- End-of-day totals

These should be calculated and validated by the backend. The frontend should display the results returned by the backend.

### Rule 2 — Never trust client-submitted totals

For example, if the frontend sends:

```json
{
  "total": 100
}
```

do not blindly save `100`. The backend should retrieve the relevant product prices and calculate the actual total.

### Rule 3 — Use database transactions

Operations involving multiple database changes should use Prisma transactions when they must succeed or fail together.

For example:

```text
Create Order
    ↓
Create Order Items
    ↓
Create Payment
    ↓
Update Inventory (when inventory tracking is implemented)
```

### Rule 4 — Validate API requests

Use Zod for request validation. Validate required fields, data types, numeric ranges, string lengths, enum values, IDs, quantities, prices, and dates. Never assume frontend input is valid.

### Rule 5 — Owner authentication

Use Supabase Auth to let the owner sign in securely. Protected API endpoints must verify authentication. There is only one intended application user: the owner.

Do not implement staff accounts, staff invitations, role-based access for multiple user types, staff management, or staff-specific permissions. Keep authorization straightforward while ensuring all private data and business operations require the owner's valid authenticated session.

### Rule 6 — Keep the project understandable

Do not over-engineer the application. Avoid unnecessary microservices, event buses, complicated state management, excessive abstractions, design patterns, or libraries. The goal is a maintainable small-business application.

---

## 5. Suggested Project Structure

Use a structure similar to this, adjusting it as the project grows:

```text
blaise-cafe/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   └── ...
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── schemas/
│   │   ├── lib/
│   │   ├── types/
│   │   └── server.ts
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
└── README.md
```

---

## 6. Main Features

The system should eventually include the following modules.

### Authentication
- Owner login
- Owner logout
- Session handling
- Protected frontend routes
- Protected backend endpoints

### Dashboard
The owner should be able to see:
- Today's sales
- Number of orders
- Cash sales
- GCash sales
- GCash fees
- GCash net
- Top-selling products
- Recent orders
- Sales trends

The dashboard must use real database data. Do not use hardcoded statistics once the backend exists.

---

## 7. Product Management

Products should have information such as:

- ID
- Name
- Category
- Description
- Price
- Active/inactive status
- Created timestamp
- Updated timestamp

Functions:
- Create product
- View products
- Edit product
- Deactivate product
- Search products
- Filter by category

Avoid permanently deleting products if doing so would break historical orders. Prefer an `active` or `is_active` field.

---

## 8. Categories

Example categories include:
- Coffee
- Non-Coffee
- Pastries
- Snacks
- Other

These are examples only and should be configurable.

---

## 9. Order Management

Orders are the core feature of the system.

The owner should be able to:
1. Start a new order.
2. Select products.
3. Select quantities.
4. Review the order.
5. See the calculated subtotal.
6. Select a payment method.
7. Complete payment.
8. Save the transaction.

Example:

```text
Spanish Latte × 1
Americano × 1
Croissant × 1

Total: ₱325
```

The backend must calculate the total.

---

## 10. Order Database Structure

A basic relationship should resemble:

```text
orders
   │
   └── order_items
           │
           └── products
```

An order should contain information such as:
- ID
- Order number
- Owner/user ID if needed for auditing
- Subtotal
- Discount
- Total
- Status
- Created timestamp
- Updated timestamp

Order items should contain:
- ID
- Order ID
- Product ID
- Quantity
- Unit price
- Subtotal

**Important:** Store the unit price at the time of the sale in `order_items`. If the product price later changes, historical orders must not change.

Because this is a single-owner system, do not add unnecessary multi-tenant or staff ownership structures. Still associate important records with timestamps and, where useful, the authenticated owner for auditability.

---

## 11. Payment Management

Initial payment methods:
- `CASH`
- `GCASH`

Design the system so additional payment methods can be added later if the café needs them.

Payment information may include:
- ID
- Order ID
- Payment method
- Amount
- Fee
- Net amount
- Status
- Created timestamp

Choose a payment data model that supports the café's actual workflow. Do not assume split payments are needed unless the owner confirms that requirement.

---

## 12. Cash Payment

Example:

```text
Total: ₱325
Amount Received: ₱500
Change: ₱175
```

The backend should validate that the amount received is sufficient. Change should be calculated from the amount received and the amount due.

---

## 13. GCash Payment

The system should support GCash tracking.

Example:

```text
Gross GCash Payment
₱4,600

GCash Fee
₱92

GCash Net
₱4,508
```

The exact fee calculation should be configurable rather than hardcoded throughout the application. For example, use a configurable fee percentage or another fee rule based on the café's actual agreement.

The backend should calculate:

```text
Gross - Fee = Net
```

Do not allow the frontend to determine the final GCash net amount. Confirm the actual GCash fee rules with the owner before finalizing this feature.

---

## 14. End-of-Day Report

Create an end-of-day workflow.

Example:

```text
October 8, 2026

Total Sales       ₱12,450
Orders                  67

Cash Sales         ₱7,800
GCash Sales        ₱4,650
GCash Fees            ₱93
GCash Net          ₱4,557
```

For cash reconciliation:

```text
Expected Cash
₱7,800

Actual Cash Counted
₱7,750

Difference
-₱50
```

The system should clearly show whether there is a shortage, excess, or exact match.

Define the cash reconciliation formula carefully with the owner. For example, expected cash may need to account for opening cash, cash refunds, cash expenses paid from the drawer, and cash paid out—not just cash sales.

Keep payment totals, sales totals, fees, refunds, and expenses distinct so reports are not misleading.

---

## 15. Inventory

Add inventory after the basic order/payment workflow is working.

Initial inventory functionality:
- Current stock
- Low-stock threshold
- Stock adjustments
- Stock-in
- Stock-out
- Inventory history

Eventually support automatic inventory deductions when appropriate.

Do not build complicated ingredient/recipe management unless the café actually requires it. Confirm whether the owner wants to track finished products, ingredients, or both.

---

## 16. Expenses

Create an expense module.

Example:

```text
Coffee Beans     ₱1,200
Milk               ₱500
Packaging          ₱300
Electricity        ₱850
```

Expense fields may include:
- ID
- Description
- Category
- Amount
- Date
- Created timestamp

Distinguish expenses from payment processing fees and inventory purchases where necessary. Do not label sales minus recorded expenses as formal accounting profit unless all relevant costs and accounting rules are accounted for.

---

## 17. Sales Reports

Reports should support:
- Today
- Yesterday
- This week
- This month
- Custom date range

Display:
- Total sales
- Number of orders
- Average order value
- Cash sales
- GCash sales
- GCash fees
- Net GCash
- Top-selling products

Use Recharts for appropriate visualizations. Define how cancelled orders, refunds, discounts, and time zones affect report totals.

---

## 18. Audit Logs

Consider adding audit logs for important actions, such as:
- Owner added a product
- Owner changed a product price
- Owner created an order
- Owner completed a payment
- Owner recorded an expense
- Owner adjusted inventory

This can help the owner review changes and troubleshoot mistakes. Do not build staff activity or staff management features.

---

## 19. Mobile-First UI

The primary device is a mobile phone. Design for screens around 360px wide and larger before expanding to tablets and desktops.

Prioritize:
- Large touch targets
- Simple navigation
- Readable text
- Minimal typing
- Clear buttons
- Fast workflows
- Bottom navigation where appropriate
- Cards instead of wide desktop tables
- Mobile-friendly forms
- Responsive dialogs
- Loading states
- Empty states
- Error states

The owner should be able to perform common tasks with minimal taps.

---

## 20. Suggested Mobile Navigation

Start with a simple structure such as:

```text
Home
Orders
Products
Reports
More
```

Adjust it if usability testing suggests a better arrangement.

Prioritize the main workflow:

```text
Dashboard
   ↓
New Order
   ↓
Payment
   ↓
Completed
```

This workflow should be quick and easy to use on a phone.

---

## 21. Development Order

Build the application in the following order.

### Phase 1 — Planning
1. Define requirements.
2. Define business workflows.
3. Design the database schema.
4. Define API requirements.
5. Confirm owner-specific requirements and business rules.

### Phase 2 — Foundation
6. Create a GitHub repository.
7. Create the Next.js frontend.
8. Create the Express backend.
9. Configure TypeScript.
10. Configure Tailwind CSS.
11. Configure Supabase.
12. Configure PostgreSQL.
13. Configure Prisma.
14. Create database migrations.
15. Create seed data.

### Phase 3 — Owner Authentication
16. Configure Supabase Auth.
17. Build the owner login UI.
18. Implement authentication middleware.
19. Implement protected routes and API endpoints.
20. Test expired and invalid sessions.

### Phase 4 — Products
21. Build the product API.
22. Build the category API.
23. Build the product UI.
24. Add search.
25. Add filtering.
26. Add create/edit/deactivate functionality.

### Phase 5 — Orders
27. Build the order API.
28. Build the order service.
29. Build the order UI.
30. Add product selection.
31. Add quantities.
32. Calculate totals on the backend.
33. Save order items.
34. Add order status.

### Phase 6 — Payments
35. Build the payment API.
36. Add cash payment.
37. Add GCash payment.
38. Add change calculation.
39. Add GCash fee calculation.
40. Complete order/payment transactions.
41. Use Prisma database transactions.

### Phase 7 — Dashboard
42. Build the dashboard API.
43. Calculate daily sales.
44. Calculate order count.
45. Calculate payment totals.
46. Calculate top products.
47. Build the mobile dashboard.
48. Add charts.

### Phase 8 — End-of-Day
49. Build the daily sales summary.
50. Add cash reconciliation.
51. Add GCash reconciliation if the owner needs it.
52. Record end-of-day data.
53. Build the report UI.

### Phase 9 — Inventory
54. Create inventory tables.
55. Build the inventory API.
56. Add stock adjustments.
57. Add low-stock alerts.
58. Connect inventory to sales where appropriate.

### Phase 10 — Expenses
59. Build the expense API.
60. Build the expense UI.
61. Add expense categories.
62. Connect expenses to reporting.

### Phase 11 — Reports
63. Daily reports.
64. Weekly reports.
65. Monthly reports.
66. Custom date reports.
67. Sales charts.
68. Product performance.

### Phase 12 — Audit Logs
69. Create the audit log system if needed.
70. Record important owner actions.
71. Build an audit log viewer.

### Phase 13 — Testing
72. Test authentication.
73. Test protected endpoints.
74. Test products.
75. Test orders.
76. Test payments.
77. Test transactions.
78. Test reports.
79. Test invalid inputs.
80. Test the mobile UI.
81. Test API error handling.

### Phase 14 — Production
82. Configure production environment variables.
83. Deploy the backend to Render.
84. Deploy the frontend to Vercel.
85. Connect the production database.
86. Configure CORS.
87. Configure authentication URLs.
88. Test production workflows.
89. Optimize performance.
90. Add proper error handling and logging.
91. Complete documentation.

---

## 22. Development Strategy

Do not build the entire application in one response or one step.

Work incrementally. For each phase:

1. Explain what we are building.
2. Explain why it is needed.
3. Show the required files.
4. Implement the smallest working version.
5. Explain important code.
6. Test it.
7. Fix errors.
8. Only then move to the next phase.

Do not skip ahead unless explicitly requested.

---

## 23. Coding Rules

When generating code:
- Use TypeScript.
- Prefer clear, maintainable code.
- Avoid unnecessary dependencies.
- Follow consistent naming conventions.
- Keep frontend and backend responsibilities separate.
- Use environment variables for secrets.
- Never expose secret keys to the frontend.
- Never hardcode database credentials.
- Never hardcode business calculations throughout the application.
- Use reusable components where appropriate.
- Use proper HTTP status codes.
- Return consistent API responses.
- Implement centralized error handling.
- Validate API input with Zod.
- Use Prisma for database access.
- Use transactions when multiple database operations must succeed together.

---

## 24. API Design

Use RESTful endpoints. Examples:

### Authentication
```text
GET /api/auth/me
POST /api/auth/logout
```

Supabase Auth can handle sign-in through its supported client flow. Do not create a redundant custom password-login endpoint unless there is a clear reason.

### Products
```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
```

### Orders
```text
GET   /api/orders
GET   /api/orders/:id
POST  /api/orders
PATCH /api/orders/:id
```

### Payments
```text
POST /api/payments
GET  /api/payments/:id
```

### Reports
```text
GET /api/reports/daily
GET /api/reports/sales
GET /api/reports/products
```

The exact endpoints may evolve as the application develops. Avoid arbitrary order/payment edits that would compromise financial history; use explicit, validated workflows for cancellation, refunds, and corrections.

---

## 25. Error Handling

Use consistent API responses.

Example error:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Example success:

```json
{
  "success": true,
  "data": {}
}
```

Validation errors should provide useful information without exposing sensitive implementation details. Use centralized Express error handling.

---

## 26. Security

Implement basic production security practices:
- Authentication
- Input validation
- Environment variables
- CORS configuration
- Secure password handling through Supabase Auth
- Protection against invalid input
- Server-side business validation
- Appropriate database permissions
- No secret keys in frontend code
- No sensitive information in logs

For Supabase, use the publishable/anon key only where intended and protect privileged keys. Never expose the service-role key to the browser. Verify Supabase access tokens on the Express backend and derive the authenticated identity from the verified token, not from a client-submitted user ID.

Even though the system has only one intended user, protect all private data and operations. Do not rely on the UI alone to enforce access. Configure the database and API so an unauthenticated person cannot read or modify café data.

---

## 27. UI Design Direction

The UI should feel like a modern café business application. It should be:
- Clean
- Simple
- Professional
- Warm
- Modern
- Mobile-first

Use the **Blaise Café logo provided separately as the branding reference**.

Derive the application's primary color, secondary color, accent color, background colors, typography direction, and button styling from the logo. Do not randomly introduce unrelated colors. Prioritize usability over visual complexity.

---

## 28. Important Business Principle

The application should preserve historical sales information.

For example, if a Spanish Latte sells for ₱120 today and its price changes to ₱130 tomorrow, yesterday's order must still show the original ₱120 unit price. Do not recalculate historical orders using the current product price.

Use appropriate decimal/money handling in PostgreSQL and Prisma; avoid floating-point arithmetic for financial calculations. Define rounding rules for fees and totals explicitly.

---

## 29. MVP Definition

The first usable version should contain only:

```text
Owner Authentication
       ↓
Products
       ↓
Create Order
       ↓
Payment
       ↓
Save Transaction
       ↓
Dashboard
       ↓
Daily Sales
```

The MVP is successful when the owner can:

1. Log in.
2. View products.
3. Create an order.
4. Select quantities.
5. See the correct total.
6. Select Cash or GCash.
7. Complete the payment.
8. Save the transaction.
9. See the sale reflected on the dashboard.
10. View the day's sales.

Only after this workflow works should we add inventory, expenses, advanced reports, and audit logs.

---

## 30. Learning Goal

While helping me build this application, prioritize teaching me the concepts behind the implementation.

I want to understand:
- Why Next.js is being used.
- Why Express.js is separate.
- How REST APIs work.
- How HTTP requests flow from frontend to backend.
- How middleware works.
- How authentication works.
- How Zod validation works.
- How Prisma works.
- How Prisma communicates with PostgreSQL.
- How database transactions work.
- How backend business logic should be structured.
- How errors should be handled.
- How production deployment works.

Do not just give me code without explanation. Keep explanations practical and directly related to Blaise Café.

---

## 31. AI Coding Assistant Rules

When I ask you to implement something:

1. Identify which project layer it belongs to.
2. Check the existing architecture before creating new files.
3. Do not rewrite unrelated code.
4. Do not introduce a new library unless necessary.
5. Explain what files will change.
6. Give complete code when a file needs substantial changes.
7. For small changes, show only the relevant changes when appropriate.
8. Keep the implementation consistent with the existing architecture.
9. Do not move business logic into the frontend merely to make implementation easier.
10. Do not skip validation or authentication.
11. Do not assume database fields that have not been defined.
12. If a requirement is ambiguous, ask a focused question or state the safest reasonable assumption.
13. Prefer simple solutions that I can understand and maintain.
14. Do not jump to later phases until the current feature is working.
15. Do not introduce staff, employee accounts, multiple user roles, staff permissions, or staff management. The only intended user is the owner.

---

## 32. Overall Goal

The final Blaise Café Management System should be a realistic, production-oriented, mobile-first full-stack application demonstrating my ability to build:

```text
Modern Frontend
       +
REST API
       +
Backend Business Logic
       +
Owner Authentication
       +
Database
       +
Transactions
       +
Reports
       +
Deployment
```

The final application should demonstrate practical skills in:

**Next.js + TypeScript + Tailwind CSS + Node.js + Express.js + Prisma + PostgreSQL + Supabase + Zod + REST APIs + Git/GitHub.**

Build this project incrementally and prioritize correctness, maintainability, learning, and real-world usability over unnecessary complexity.

## 33. First Task

Start with **Phase 1 — Planning**.

Do not generate the entire application yet. Help me confirm the business requirements and workflows for Blaise Café, identify any important questions that must be answered by the owner, and then propose a database schema and API plan. Clearly separate confirmed requirements from assumptions. Once the plan is agreed upon, proceed one phase at a time.
