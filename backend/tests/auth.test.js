const request = require("supertest");
const { app, setupDB, teardownDB, clearDB } = require("./helpers");

beforeAll(setupDB);
afterAll(teardownDB);
afterEach(clearDB);

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user.role).toBe("user");
  });

  it("should not register with duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "password456" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it("should not register without email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ password: "password123" });

    expect(res.status).toBe(400);
  });

  it("should not register with short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "123" });

    expect(res.status).toBe(400);
  });

  it("should register an admin user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "admin@example.com", password: "password123", role: "admin" });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("admin");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "password123" });
  });

  it("should login with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should not login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("should not login with non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("should not login without required fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("should return current user with valid token", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "password123" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registerRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("test@example.com");
  });

  it("should reject request without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("should reject request with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken123");

    expect(res.status).toBe(401);
  });
});
