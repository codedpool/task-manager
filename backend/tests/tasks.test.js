const request = require("supertest");
const mongoose = require("mongoose");
const { app, setupDB, teardownDB, clearDB, createUser } = require("./helpers");

let userToken, adminToken, userId, adminId;

beforeAll(setupDB);
afterAll(teardownDB);

beforeEach(async () => {
  await clearDB();
  const user = await createUser("user@example.com", "password123", "user");
  userToken = user.token;
  userId = user.user._id;

  const admin = await createUser("admin@example.com", "password123", "admin");
  adminToken = admin.token;
  adminId = admin.user._id;
});

describe("POST /api/tasks", () => {
  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Test Task",
        description: "A test task",
        dueDate: "2026-12-31",
        assignedTo: userId,
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test Task");
    expect(res.body.status).toBe("todo");
    expect(res.body.priority).toBe("medium");
  });

  it("should not create without title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ dueDate: "2026-12-31", assignedTo: userId });

    expect(res.status).toBe(400);
  });

  it("should not create without auth", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Test", dueDate: "2026-12-31", assignedTo: userId });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/tasks", () => {
  beforeEach(async () => {
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Task 1", dueDate: "2026-12-31", assignedTo: userId, status: "todo", priority: "high" });
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Task 2", dueDate: "2026-11-30", assignedTo: userId, status: "in_progress", priority: "low" });
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Task 3", dueDate: "2026-10-15", assignedTo: userId, status: "done", priority: "medium" });
  });

  it("should list all tasks for the user", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBe(3);
    expect(res.body.totalTasks).toBe(3);
  });

  it("should filter by status", async () => {
    const res = await request(app)
      .get("/api/tasks?status=todo")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBe(1);
    expect(res.body.tasks[0].status).toBe("todo");
  });

  it("should filter by priority", async () => {
    const res = await request(app)
      .get("/api/tasks?priority=high")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBe(1);
    expect(res.body.tasks[0].priority).toBe("high");
  });

  it("should paginate results", async () => {
    const res = await request(app)
      .get("/api/tasks?page=1&limit=2")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBe(2);
    expect(res.body.totalPages).toBe(2);
  });

  it("should sort by dueDate ascending", async () => {
    const res = await request(app)
      .get("/api/tasks?sortBy=dueDate&order=asc")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    const dates = res.body.tasks.map((t) => new Date(t.dueDate).getTime());
    expect(dates[0]).toBeLessThanOrEqual(dates[1]);
  });
});

describe("GET /api/tasks/:id", () => {
  it("should get task by id", async () => {
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Detail Task", dueDate: "2026-12-31", assignedTo: userId });

    const res = await request(app)
      .get(`/api/tasks/${createRes.body._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Detail Task");
  });

  it("should return 404 for non-existent task", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/tasks/:id", () => {
  it("should update own task", async () => {
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Original", dueDate: "2026-12-31", assignedTo: userId });

    const res = await request(app)
      .put(`/api/tasks/${createRes.body._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Updated", status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
    expect(res.body.status).toBe("in_progress");
  });

  it("should allow admin to update any task", async () => {
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "User Task", dueDate: "2026-12-31", assignedTo: userId });

    const res = await request(app)
      .put(`/api/tasks/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Admin Updated" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Admin Updated");
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("should delete own task", async () => {
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "To Delete", dueDate: "2026-12-31", assignedTo: userId });

    const res = await request(app)
      .delete(`/api/tasks/${createRes.body._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("should allow admin to delete any task", async () => {
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Admin Delete", dueDate: "2026-12-31", assignedTo: userId });

    const res = await request(app)
      .delete(`/api/tasks/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("should return 404 for non-existent task", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });
});

describe("Authorization", () => {
  it("admin should see all tasks", async () => {
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "User Only Task", dueDate: "2026-12-31", assignedTo: userId });

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBe(1);
  });
});
