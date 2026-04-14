import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskFilters from "@/components/TaskFilters";

describe("TaskFilters", () => {
  it("renders and calls setFilters", async () => {
    const setFilters = jest.fn();
    const user = userEvent.setup();
    const { container } = render(<TaskFilters filters={{status: "", priority: "", dueDate: ""}} setFilters={setFilters} />);

    // because label lacks 'for' attribute, we can just grab select by role or tag
    const selects = container.querySelectorAll("select");
    // status is first select
    await user.selectOptions(selects[0], "todo");
    
    expect(setFilters).toHaveBeenCalled();
  });
  
  it("calls setFilters with clear options when clear button clicked", async () => {
    const setFilters = jest.fn();
    const user = userEvent.setup();
    render(<TaskFilters setFilters={setFilters} filters={{status: "todo", priority: "high"}} />);

    const clearBtn = screen.getByRole("button", { name: /clear/i });
    await user.click(clearBtn);
    
    expect(setFilters).toHaveBeenCalledWith({
      status: "",
      priority: "",
      sortBy: "createdAt",
      order: "desc",
      page: 1,
      limit: 9
    });
  });
});
