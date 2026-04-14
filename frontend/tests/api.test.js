import api from "../src/lib/api";

describe("api axios instance", () => {
  it("should add Authorization header if token exists", async () => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "dummy-token"),
      },
      writable: true,
    });

    const config = { headers: {} };
    const requestHandler = api.interceptors.request.handlers[0].fulfilled;
    const finalConfig = await requestHandler(config);
    expect(finalConfig.headers.Authorization).toEqual("Bearer dummy-token");    
  });

  it("should not add header if no token", async () => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
      },
      writable: true,
    });

    const config = { headers: {} };
    const requestHandler = api.interceptors.request.handlers[0].fulfilled;
    const finalConfig = await requestHandler(config);
    expect(finalConfig.headers.Authorization).toBeUndefined();
  });
});
