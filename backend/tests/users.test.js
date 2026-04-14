const request = require("supertest");
const mongoose = require("mongoose");
const { app, setupDB, teardownDB, clearDB, createUser } = require("./helpers");

let adminToken, adminId, userToken, userId;

beforeAll(setupDB);
afterAll(teardownDB);

beforeEach(async () => {
  await clearDB();
  const admin = await createUser("admin@example.com", "password123", "admin");
  adminToken = admin.token;
  adminId = admin.user._id;

  const user = await createUser("user@example.com", "password123", "user");
  userToken = user.token;
  userId = user.user._id;
});

describe("POST /api/users", () => {
  it("should allow admin to create a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "new@example.com", password: "password123", role: "user" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("new@example.com");
    expect(res.body.role).toBe("user");
  });

  it("should reject duplicate email", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "admin@example.com", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it("should reject missing password", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "nopass@example.com" });

    expect(res.status).toBe(400);
  });

  it("should deny non-admin access", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ email: "new@example.com", password: "password123" });

    expect(res.status).toBe(403);
  });
});

describe("GET /api/users", () => {
  it("should list users for admin", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(2);
    expect(res.body.totalUsers).toBe(2);
  });

  it("should search by email", async () => {
    const res = await request(app)
      .get("/api/users?search=admin")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].email).toMatch(/admin/);
  });

  it("should filter by role", async () => {
    const res = await request(app)
      .get("/api/users?role=admin")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].role).toBe("admin");
  });

  it("should paginate results", async () => {
    const res = await request(app)
      .get("/api/users?page=1&limit=1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.totalPages).toBe(2);
  });

  it("should sort by email ascending", async () => {
    const res = await request(app)
      .get("/api/users?sortBy=email&order=asc")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users[0].email).toBe("admin@example.com");
  });

  it("should deny access for non-admin", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});

describe("GET /api/users/:id", () => {
  it("should get user by id for admin", async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("user@example.com");
  });

  it("should return 404 for non-existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/users/:id", () => {
  it("should update user role", async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "admin" });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe("admin");
  });

  it("should update user email", async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "updated@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("updated@example.com");
  });

  it("should reject duplicate email", async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "admin@example.com" });

    expect(res.status).toBe(400);
  });

  it("should return 404 for non-existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "admin" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete user", async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("should return 404 for non-existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
