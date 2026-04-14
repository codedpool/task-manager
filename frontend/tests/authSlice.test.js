import authReducer, {
  setLoading,
  setCredentials,
  setError,
} from "../src/store/authSlice";

describe("authSlice", () => {
  const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
  };

  it("should handle initial state", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setLoading", () => {
    const actual = authReducer(initialState, setLoading(true));
    expect(actual.loading).toBe(true);
  });
  
  it("should handle setCredentials", () => {
    const user = { id: 1, email: "test@example.com" };
    const actual = authReducer(initialState, setCredentials({ user, token: "newtoken" }));
    expect(actual.user).toEqual(user);
    expect(actual.token).toBe("newtoken");
    expect(actual.error).toBeNull();
  });

  it("should handle setError", () => {
    const actual = authReducer({ ...initialState, loading: true }, setError("Error msg"));
    expect(actual.error).toBe("Error msg");
    expect(actual.loading).toBe(false);
  });
});
