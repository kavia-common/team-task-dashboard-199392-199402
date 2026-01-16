import React from "react";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasksPage } from "./TasksPage";
import { renderWithProviders } from "../test/test-utils";

jest.mock("../api/tasks", () => ({
  listTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  listComments: jest.fn(),
  addComment: jest.fn()
}));

jest.mock("../context/AuthContext", () => ({
  useAuthContext: jest.fn()
}));

const tasksApi = require("../api/tasks");
const authContext = require("../context/AuthContext");

function buildPage(items, { total = items.length, limit = 20, offset = 0 } = {}) {
  return {
    items,
    meta: { total, limit, offset }
  };
}

describe("TasksPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authenticated state so TasksPage can call listTasks with a token.
    authContext.useAuthContext.mockReturnValue({
      token: "test-token",
      user: { email: "test@example.com" },
      loading: false,
      error: null,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      refreshMe: jest.fn()
    });

    // Default: no comments in these tests.
    tasksApi.listComments.mockResolvedValue([]);
  });

  test("renders tasks from API after entering project id and applying (All statuses)", async () => {
    const items = [
      { id: "t1", title: "Task Open", status: "open", priority: "low", updated_at: "2024-01-10T00:00:00Z" },
      { id: "t2", title: "Task In Progress", status: "in_progress", priority: "medium", updated_at: "2024-01-11T00:00:00Z" },
      { id: "t3", title: "Task Done", status: "done", priority: "high", updated_at: "2024-01-12T00:00:00Z" }
    ];

    // listTasks should return all items when status filter is empty (Any).
    tasksApi.listTasks.mockImplementation(async ({ filters }) => {
      const status = filters?.status;
      const filtered = status ? items.filter((t) => t.status === status) : items;
      return buildPage(filtered, { total: filtered.length, limit: 20, offset: 0 });
    });

    renderWithProviders(<TasksPage />);

    const user = userEvent;

    // Provide required project id.
    await user.type(screen.getByLabelText(/project id/i), "project-123");

    // Apply/Refresh triggers the API load.
    await user.click(screen.getByRole("button", { name: /apply\s*\/\s*refresh/i }));

    // Wait for API call and ensure all tasks are shown.
    await waitFor(() => expect(tasksApi.listTasks).toHaveBeenCalled());

    const table = await screen.findByRole("table", { name: /tasks table/i });
    const tbody = within(table).getAllByRole("rowgroup")[1];

    expect(within(tbody).getByText("Task Open")).toBeInTheDocument();
    expect(within(tbody).getByText("Task In Progress")).toBeInTheDocument();
    expect(within(tbody).getByText("Task Done")).toBeInTheDocument();

    // Pagination controls should render (meta present) and not block list rendering.
    expect(
      screen.getByRole("group", { name: /pagination controls/i })
    ).toBeInTheDocument();
  });

  test("filters tasks by status (in_progress, done) after changing filter and applying", async () => {
    const items = [
      { id: "t1", title: "Task Open", status: "open", priority: "low", updated_at: "2024-01-10T00:00:00Z" },
      { id: "t2", title: "Task In Progress", status: "in_progress", priority: "medium", updated_at: "2024-01-11T00:00:00Z" },
      { id: "t3", title: "Task Done", status: "done", priority: "high", updated_at: "2024-01-12T00:00:00Z" }
    ];

    tasksApi.listTasks.mockImplementation(async ({ filters }) => {
      const status = filters?.status;
      const filtered = status ? items.filter((t) => t.status === status) : items;
      return buildPage(filtered, { total: filtered.length, limit: 20, offset: 0 });
    });

    renderWithProviders(<TasksPage />);

    const user = userEvent;

    await user.type(screen.getByLabelText(/project id/i), "project-123");

    // First load with Any status (All).
    await user.click(screen.getByRole("button", { name: /apply\s*\/\s*refresh/i }));

    const tableAll = await screen.findByRole("table", { name: /tasks table/i });
    const tbodyAll = within(tableAll).getAllByRole("rowgroup")[1];

    expect(within(tbodyAll).getByText("Task Open")).toBeInTheDocument();
    expect(within(tbodyAll).getByText("Task In Progress")).toBeInTheDocument();
    expect(within(tbodyAll).getByText("Task Done")).toBeInTheDocument();

    // Switch to In Progress and apply again.
    await user.selectOptions(screen.getByLabelText(/^status$/i), "in_progress");
    await user.click(screen.getByRole("button", { name: /apply\s*\/\s*refresh/i }));

    await waitFor(() => {
      expect(screen.getByText("Task In Progress")).toBeInTheDocument();
      expect(screen.queryByText("Task Open")).not.toBeInTheDocument();
      expect(screen.queryByText("Task Done")).not.toBeInTheDocument();
    });

    // Switch to Done and apply again.
    await user.selectOptions(screen.getByLabelText(/^status$/i), "done");
    await user.click(screen.getByRole("button", { name: /apply\s*\/\s*refresh/i }));

    await waitFor(() => {
      expect(screen.getByText("Task Done")).toBeInTheDocument();
      expect(screen.queryByText("Task Open")).not.toBeInTheDocument();
      expect(screen.queryByText("Task In Progress")).not.toBeInTheDocument();
    });
  });
});
