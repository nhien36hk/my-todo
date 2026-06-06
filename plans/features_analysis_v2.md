# Features Analysis & Plan: Search & Categories

## 1. Goal
Evaluate the current application and identify missing core Todoist-clone features. Implement "Search" and "Categories (Tags)" to enhance task organization and discoverability, while adhering strictly to the 80-5-15 rule and Visual Excellence guidelines.

## 2. Requirements & Edge Cases (80% Planning)

### 2.1 Categories (Tags)
- **Backend**:
  - Update `Todo` schema in `backend/models/Todo.js` to include a `category` field (String, default: "Chung").
  - Update POST and PUT endpoints in `backend/server.js` to accept and save the `category` field.
- **Frontend**:
  - Update `client.ts` interface `Todo` to include `category: string`.
  - Update `AddTaskForm.tsx` to include a visually appealing dropdown or pill-selector for categories (e.g., "Công việc", "Cá nhân", "Học tập", "Chung").
  - Update `TaskItem.tsx` to display the category as a small, colored badge next to the title or due date.
- **Edge Cases**:
  - Blank category -> Default to "Chung" (General).
  - Backward compatibility -> Existing tasks without category will default to "Chung" when fetched or updated.

### 2.2 Search Functionality
- **Frontend Only**:
  - Search can be fully implemented on the client-side since we already fetch all tasks into `todos` state.
  - Add a Search Bar in `App.tsx` (above the TaskList or in the Header).
  - Add a `searchQuery` state in `App.tsx`.
  - Pass the filtered tasks to `TaskList.tsx` based on both `activeFilter` AND `searchQuery`.
  - The search should be case-insensitive and match against `title` and `description`.
- **Edge Cases**:
  - Searching when there are no tasks.
  - No results found -> Display a beautiful empty state "Không tìm thấy kết quả nào cho '...'".

### 2.3 Testing Strategy (15% Testing)
- Verify creating a task with a specific category saves correctly and displays the badge.
- Verify that typing in the search box immediately filters the list.
- Verify clearing the search box restores the original list.
- Run the backend test suite (`node backend/test_auth.js`) to ensure adding the new field didn't break existing validations.

## 3. Execution Steps (5% Execution)
1. Update Backend (`Todo.js`, `server.js`).
2. Update Frontend API Interface (`client.ts`).
3. Update `AddTaskForm.tsx` to add category selector.
4. Update `TaskItem.tsx` to display category.
5. Update `App.tsx` to add Search bar and filter logic.
6. Restart Backend & Rebuild Frontend via Docker.
