import { render, screen } from "@testing-library/react";
import SkeletonLoader from "@/components/SkeletonLoader";
import ErrorBoundary from "@/components/ErrorBoundary";
import TaskCard from "@/components/TaskCard";

describe("SkeletonLoader", () => {
  it("renders skeleton items", () => {
    const { container } = render(<SkeletonLoader count={3} />);
    const items = container.querySelectorAll(".animate-pulse");
    expect(items.length).toBe(3);
  });

  it("renders default count when no prop", () => {
    const { container } = render(<SkeletonLoader />);
    const items = container.querySelectorAll(".animate-pulse");
    expect(items.length).toBe(3);
  });
});

describe("ErrorBoundary", () => {
  // Suppress console.error for error boundary test
  const originalError = console.error;
  beforeAll(() => { console.error = jest.fn(); });
  afterAll(() => { console.error = originalError; });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders fallback on error", () => {
    function ThrowError() {
      throw new Error("Test error");
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});

describe("TaskCard", () => {
  const mockTask = {
    _id: "1",
    title: "Test Task",
    description: "A test description",
    status: "todo",
    priority: "high",
    dueDate: new Date("2030-12-31").toISOString(),
    assignedTo: { email: "user@example.com" },
    attachments: [{ _id: "a1", originalName: "doc.pdf", size: 1024 }],
  };

  it("renders task title", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText("To Do")).toBeInTheDocument();
  });

  it("renders priority badge", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("renders assigned user email", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
  });

  it("renders attachment count", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/1 file/)).toBeInTheDocument();
  });

  it("links to task detail", () => {
    render(<TaskCard task={mockTask} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tasks/1");
  });

  it("shows overdue indicator for past due tasks", () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date("2020-01-01").toISOString(),
    };
    render(<TaskCard task={overdueTask} />);
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });
});
