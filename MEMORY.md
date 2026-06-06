# Project Memory: My Todoist Clone

## Project Conventions
- **Frontend:** React + TailwindCSS v4 served via Nginx (running on port 8080).
- **Backend:** Node.js + Express + SQLite (running on port 5001).
- **Docker Setup:** Run all services under Docker Compose.
- **Git Strategy:** Commit only after completing and validating a full feature through exhaustive testing.
- **Rules:** Follow Karpathy Clean Code guidelines strictly.

## Development Philosophy & Testing Strategy (CRITICAL)
- **Time/Effort Allocation (80-5-15 Rule):**
  - **80% Planning:** Research context, document requirements, design logic, and plan for all possible edge cases and error vectors before writing any code.
  - **5% Implementation:** Write minimal, clean, and direct code to implement the planned logic.
  - **15% Testing:** Design robust tests that actively try to break the code.
- **Testing Philosophy:** 
  - A test suite is considered "successful" only when it covers the widest variety of scenarios and actively uncovers realistic bugs, rather than just passing basic flows.
  - If a test fails (identifies a bug), the bug is treated as a sub-feature to fix. We update the plan and implementation, then test again.
  - No Git commit is allowed until all edge-case tests are fully satisfied.

## Active Phase
- **Operation & Maintenance:** Project running with MongoDB & Multi-user Authentication.

## Completed Tasks
- **Task 0:** Setup workspace and verified the self-wake-up loop. 
- **Task 1 (Backend API & Validations):** Written REST API with strict validations and verified via automated test script.
- **Task 2 (Frontend React & Heatmap):** Created React interface using Tailwind v4 Vite plugin, implemented GitHub-style contribution heatmap.
- **Task 3 (Docker Compose & Deploy):** Designed multi-stage build frontend with Nginx Alpine serving static build.
- **Task 4 (Aesthetics & Remaining Features):** Polished Dark Mode UI with vibrant glassmorphism.
- **Task 5 (Auth & MongoDB Migration):** Migrated from SQLite to MongoDB, implemented JWT-based Authentication, and enabled Multi-tenant data isolation. Passed 11/11 tests.
- **Task 6 (Mobile UI):** Upgraded `Sidebar.tsx` to include a mobile-friendly sticky bottom tab bar for seamless navigation.
- **Task 7 (Search & Categories):** Implemented real-time Search functionality and custom Categories (Chung, Công việc, Cá nhân, Học tập) to organize tasks and improve discoverability.

## Docker Status
- **Frontend Container:** `todo-frontend` -> Port `8080` (Up)
- **Backend Container:** `todo-backend` -> Port `5001` (Up)
- **MongoDB Container:** `todo-mongodb` -> Port `27017` (Up)
- **Database Path:** Mapped to docker volume `todo-mongo-data`
