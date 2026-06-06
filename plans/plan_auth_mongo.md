# Features Analysis & Migration Plan: Auth & MongoDB

## 1. Goal
Migrate the single-user SQLite application to a multi-tenant application using MongoDB. Add User Authentication (Login/Signup) so each user has their own private database of tasks. Ensure the UI is highly responsive and optimized for mobile devices.

## 2. Requirements & Edge Cases (80% Planning)

### 2.1 Backend Migration (MongoDB & Auth)
- **Database Switch**: 
  - Replace `sqlite` and `sqlite3` with `mongoose`.
  - Add a MongoDB container to `docker-compose.yml`.
  - Define Mongoose schemas for `User` and `Todo`.
- **Authentication**:
  - Add endpoints: `POST /api/auth/register`, `POST /api/auth/login`.
  - Secure passwords using `bcryptjs`.
  - Generate and verify JWT tokens using `jsonwebtoken`.
  - Protect `Todo` endpoints (`/api/todos/*`) with an `auth` middleware.
- **Multi-tenant logic**:
  - `Todo` schema must include a `userId` referencing the `User` model.
  - Queries must filter by `userId` (e.g., `Todo.find({ userId: req.user.id })`).
- **Edge Cases**:
  - Duplicate email during registration -> Return 400.
  - Invalid login credentials -> Return 401.
  - Missing token / Expired token -> Return 401.
  - Trying to access/delete another user's Todo -> Return 404 or 403.
  - MongoDB connection failure -> Graceful exit / retry logic.

### 2.2 Frontend Authentication
- **State Management**:
  - Store token in `localStorage`.
  - Provide a way to logout (clear token).
  - Conditionally render the Login/Signup screen if not authenticated.
- **API Interceptor**:
  - Update `api/client.ts` to attach `Authorization: Bearer <token>` to all requests.
  - Handle 401 Unauthorized responses globally by logging the user out.
- **Login/Signup UI**:
  - Create a beautifully designed, glassmorphism modal or page for Auth.
  - Handle form validation and loading states.
  - Display error alerts properly.

### 2.3 Mobile-Responsive UI Optimization
- **Current State**: The sidebar currently becomes a horizontal scrollable bar on mobile (`flex-row overflow-x-auto`).
- **Improvements**:
  - Create a sticky bottom navigation bar for mobile, hiding the top/left sidebar. This provides an app-like experience.
  - Alternatively, make the horizontal bar stick to the bottom and style it like a tab bar.
  - Add a "Logout" button that is easily accessible.
  - Ensure task items are easily tappable (larger touch targets for checkboxes and action buttons).
  - Optimize the Heatmap for narrow screens (it might overflow or look squeezed). Ensure horizontal scrolling is smooth.

### 2.4 Testing Strategy (15% Testing)
- **Backend Tests**:
  - Add `backend/test_auth.js` to simulate register, login, invalid credentials, duplicate email.
  - Update `backend/test.js` to use a valid JWT token before running its tests.
  - Test data isolation: User A creates a task. User B should NOT see User A's task. User B trying to delete User A's task should fail.
- **Frontend Verification**:
  - Manually test Login -> Create Task -> Logout -> Login as another user -> Empty list.
  - Test on Chrome DevTools Mobile View (iPhone 12/14) for responsive UI.

## 3. Step-by-Step Implementation Plan (5% Execution)
1. **Docker Compose**: Add `mongodb` service.
2. **Backend**: 
   - Install `mongoose`, `bcryptjs`, `jsonwebtoken`.
   - Setup `db.js` for MongoDB connection.
   - Create models (`User.js`, `Todo.js`).
   - Create auth routes (`routes/auth.js`) and middleware (`middleware/auth.js`).
   - Update `server.js` endpoints to use Mongoose and auth middleware.
   - Update `backend/test.js` and add `backend/test_auth.js` to verify.
3. **Frontend**:
   - Update `client.ts` to include token.
   - Create `Auth.tsx` (Login/Signup component).
   - Update `App.tsx` to handle authentication state and render `Auth` or Main App.
   - Improve mobile responsiveness in `Sidebar.tsx` and layout.
   - Add Logout functionality.
4. **Integration & Final Polish**:
   - Rebuild Docker images.
   - Full manual QA.
