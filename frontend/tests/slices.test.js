import tasksReducer, {
  setLoading as setTasksLoading,
  setTasks,
  setCurrentTask,
  setError as setTasksError,
} from "../src/store/tasksSlice";

import usersReducer, {
  setLoading as setUsersLoading,
  setUsers,
  setError as setUsersError,
} from "../src/store/usersSlice";

describe("tasksSlice", () => {
  const initialState = {
    items: [],
    current: null,
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
  };

  it("handles loading", () => {
    expect(tasksReducer(initialState, setTasksLoading(true)).loading).toBe(true);
  });

  it("handles setTasks", () => {
    const payload = { tasks: [{ id: 1 }], totalPages: 2, currentPage: 1 };
    const state = tasksReducer(initialState, setTasks(payload));
    expect(state.items.length).toBe(1);
    expect(state.totalPages).toBe(2);
    expect(state.currentPage).toBe(1);
    expect(state.loading).toBe(false);
  });

  it("handles setCurrentTask", () => {
    expect(tasksReducer(initialState, setCurrentTask({ id: 1 })).current.id).toBe(1);
  });

  it("handles error", () => {
    const state = tasksReducer(initialState, setTasksError("error"));
    expect(state.error).toBe("error");
    expect(state.loading).toBe(false);
  });
});

describe("usersSlice", () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
  };

  it("handles loading", () => {
    expect(usersReducer(initialState, setUsersLoading(true)).loading).toBe(true);
  });

  it("handles setUsers", () => {
    const payload = { users: [{ id: 1 }], totalPages: 2, currentPage: 1 };
    const state = usersReducer(initialState, setUsers(payload));
    expect(state.items.length).toBe(1);
    expect(state.totalPages).toBe(2);
    expect(state.currentPage).toBe(1);
    expect(state.loading).toBe(false);
  });

  it("handles error", () => {
    const state = usersReducer(initialState, setUsersError("error"));
    expect(state.error).toBe("error");
    expect(state.loading).toBe(false);
  });
});
