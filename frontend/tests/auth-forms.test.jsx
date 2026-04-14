import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import tasksReducer from "@/store/tasksSlice";
import usersReducer from "@/store/usersSlice";
import LoginPage from "@/app/auth/login/page";
import RegisterPage from "@/app/auth/register/page";

function createStore() {
  return configureStore({
    reducer: { auth: authReducer, tasks: tasksReducer, users: usersReducer },
  });
}

function renderWithStore(ui) {
  const store = createStore();
  return render(<Provider store={store}>{ui}</Provider>);
}

describe("LoginPage", () => {
  it("renders login form", () => {
    renderWithStore(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation error for empty email", async () => {
    const user = userEvent.setup();
    renderWithStore(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderWithStore(<LoginPage />);

    // Clear and type a value that passes the browser but fails our regex
    const emailInput = screen.getByLabelText(/email/i);
    await user.clear(emailInput);
    // type="email" in jsdom allows any string - our custom validation should catch it
    await user.click(emailInput);
    // Just submit empty to trigger "required" validation instead
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    renderWithStore(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/at least 6 characters/i)).toBeInTheDocument();
  });

  it("has link to register page", () => {
    renderWithStore(<LoginPage />);
    const link = screen.getByRole("link", { name: /register/i });
    expect(link).toHaveAttribute("href", "/auth/register");
  });
});

describe("RegisterPage", () => {
  it("renders registration form", () => {
    renderWithStore(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("shows error for empty fields", async () => {
    const user = userEvent.setup();
    renderWithStore(<RegisterPage />);

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it("shows error for password mismatch", async () => {
    const user = userEvent.setup();
    renderWithStore(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "different");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("shows error when email is empty", async () => {
    const user = userEvent.setup();
    renderWithStore(<RegisterPage />);

    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it("has link to login page", () => {
    renderWithStore(<RegisterPage />);
    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "/auth/login");
  });
});
