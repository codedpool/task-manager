import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import tasksReducer from "@/store/tasksSlice";
import usersReducer from "@/store/usersSlice";
import TaskForm from "@/components/TaskForm";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { act } from "react";

// Mock api
jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
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
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { users: [{ _id: "u1", email: "u1@e.com" }] } });
    api.post.mockResolvedValue({ data: { _id: "new-task-id" } });
    api.put.mockResolvedValue({ data: { _id: "edited-task-id" } });
  });

  it("submits the form properly when all valid data is provided", async () => { 
    const user = userEvent.setup();
    renderWithStore(<TaskForm />);

    const titleInput = await screen.findByPlaceholderText(/task title/i);       
    await user.type(titleInput, "Test Task Valid");

    const descInput = screen.getByPlaceholderText(/Optional description/i);     
    await user.type(descInput, "Desc");

    const statusSelect = screen.getByLabelText(/status/i);
    await user.selectOptions(statusSelect, "in_progress");

    const prioritySelect = screen.getByLabelText(/priority/i);
    await user.selectOptions(prioritySelect, "high");

    const dateInput = screen.getByLabelText(/due date/i);
    await user.type(dateInput, "2026-10-10");

    const userSelect = screen.getByLabelText(/assign to/i);
    await user.selectOptions(userSelect, "u1");

    await user.click(screen.getByRole("button", { name: /create task/i }));     

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/tasks", expect.objectContaining({ 
        title: "Test Task Valid",
        description: "Desc",
        status: "in_progress",
        priority: "high",
        dueDate: "2026-10-10",
        assignedTo: "u1",
      }));
    });
  });

  it("handles cancel button", async () => {
    const user = userEvent.setup();
    renderWithStore(<TaskForm />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));
  });

  it("displays error when submitting without required fields", async () => {
    const user = userEvent.setup();
    renderWithStore(<TaskForm />);
    
    // Submit empty form
    await user.click(screen.getByRole("button", { name: /create task/i }));
    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
    });
  });
  
  it("handles file uploads properly", async () => {
    const user = userEvent.setup();
    renderWithStore(<TaskForm />);
    
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]');
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText(/test.pdf/i)).toBeInTheDocument();
    });
    
    // Test removing file
    await user.click(screen.getByRole("button", { name: /remove/i }));
    
    await waitFor(() => {
      expect(screen.queryByText(/test.pdf/i)).not.toBeInTheDocument();
    });
  });
});
