import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import tasksReducer from "@/store/tasksSlice";
import usersReducer from "@/store/usersSlice";
import TaskForm from "@/components/TaskForm";

// Mock api
jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { users: [] } }),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

function createStore() {
  return configureStore({
    reducer: { auth: authReducer, tasks: tasksReducer, users: usersReducer },
  });
}

function renderWithStore(ui) {
  const store = createStore();
  return render(<Provider store={store}>{ui}</Provider>);
}

describe("TaskForm", () => {
  it("renders create form fields", async () => {
    renderWithStore(<TaskForm />);

    // Wait for component to finish loading
    expect(await screen.findByRole("button", { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
    expect(screen.getByText(/priority/i)).toBeInTheDocument();
    expect(screen.getByText(/due date/i)).toBeInTheDocument();
    expect(screen.getByText(/assign to/i)).toBeInTheDocument();
  });

  it("shows validation error for missing title", async () => {
    const user = userEvent.setup();
    renderWithStore(<TaskForm />);

    await user.click(await screen.findByRole("button", { name: /create task/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
  });

  it("shows validation error for missing due date", async () => {
    const user = userEvent.setup();
    renderWithStore(<TaskForm />);

    // Wait for form to render, then type in first text input (title)
    const titleInput = await screen.findByPlaceholderText(/task title/i);
    await user.type(titleInput, "Test Task");
    await user.click(screen.getByRole("button", { name: /create task/i }));

    expect(await screen.findByText(/due date is required/i)).toBeInTheDocument();
  });

  it("shows validation error for missing assignment", async () => {
    const user = userEvent.setup();
    renderWithStore(<TaskForm />);

    const titleInput = await screen.findByPlaceholderText(/task title/i);
    await user.type(titleInput, "Test Task");
    await user.click(screen.getByRole("button", { name: /create task/i }));

    // Should show both due date and assignment errors
    expect(await screen.findByText(/please assign a user/i)).toBeInTheDocument();
  });

  it("has cancel button", async () => {
    renderWithStore(<TaskForm />);
    expect(await screen.findByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });
});
