# Project Memory: My Todoist Clone

## Project Conventions
- **Frontend:** React + TailwindCSS (running on port 8080).
- **Backend:** Node.js (running on port 5001).
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
- **Phase 1:** Planning and Architectural Design (Refactoring plans with the new philosophy).

## Completed Tasks
- **Task 0:** Setup workspace and verified the self-wake-up loop. 
  - Test 1: Succeeded at 2026-06-06T06:12:15Z.
  - Test 2: Succeeded at 2026-06-06T06:15:23Z.

## Next Steps
- Update planning files under `/root/my-todo/plans/` to structure testing scripts and edge-case definitions.
- Implement exhaustive integration/unit test scripts for Backend API (Step 1) to test edge cases.
- Fix any bugs identified by testing, update plans accordingly, and verify success before committing.

