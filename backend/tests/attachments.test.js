const request = require("supertest");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const { app, setupDB, teardownDB, clearDB, createUser } = require("./helpers");

let userToken, userId, taskId;

const testUploadDir = path.join(__dirname, "uploads");
const testPdfPath = path.join(__dirname, "test.pdf");

beforeAll(async () => {
  await setupDB();
  fs.mkdirSync(testUploadDir, { recursive: true });
  fs.writeFileSync(testPdfPath, "%PDF-1.4 test content");
});

afterAll(async () => {
  fs.rmSync(testUploadDir, { recursive: true, force: true });
  fs.rmSync(testPdfPath, { force: true });
  await teardownDB();
});

beforeEach(async () => {
  await clearDB();
  const user = await createUser();
  userToken = user.token;
  userId = user.user._id;

  const taskRes = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ title: "Upload Test", dueDate: "2026-12-31", assignedTo: userId });
  taskId = taskRes.body._id;
});

describe("POST /api/tasks/:id/attachments", () => {
  it("should upload a PDF file", async () => {
    const res = await request(app)
      .post(`/api/tasks/${taskId}/attachments`)
      .set("Authorization", `Bearer ${userToken}`)
      .attach("files", testPdfPath);

    expect(res.status).toBe(201);
    expect(res.body.length).toBe(1);
    expect(res.body[0].originalName).toBe("test.pdf");
  });

  it("should reject non-PDF files", async () => {
    const txtPath = path.join(__dirname, "test.txt");
    fs.writeFileSync(txtPath, "not a pdf");

    const res = await request(app)
      .post(`/api/tasks/${taskId}/attachments`)
      .set("Authorization", `Bearer ${userToken}`)
      .attach("files", txtPath);

    expect(res.status).toBe(400);
    fs.rmSync(txtPath, { force: true });
  });

  it("should not upload without auth", async () => {
    const res = await request(app)
      .post(`/api/tasks/${taskId}/attachments`)
      .set("Content-Type", "application/json")
      .send({});

    expect(res.status).toBe(401);
  });

  it("should reject when no files sent", async () => {
    const res = await request(app)
      .post(`/api/tasks/${taskId}/attachments`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(400);
  });

  it("should enforce max 3 attachments", async () => {
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post(`/api/tasks/${taskId}/attachments`)
        .set("Authorization", `Bearer ${userToken}`)
        .attach("files", testPdfPath);
    }

    const res = await request(app)
      .post(`/api/tasks/${taskId}/attachments`)
      .set("Authorization", `Bearer ${userToken}`)
      .attach("files", testPdfPath);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/max 3/i);
  });
});

describe("GET /api/tasks/:id/attachments/:fileId", () => {
  it("should download an uploaded file", async () => {
    const uploadRes = await request(app)
      .post(`/api/tasks/${taskId}/attachments`)
      .set("Authorization", `Bearer ${userToken}`)
      .attach("files", testPdfPath);

    const fileId = uploadRes.body[0]._id;
    const res = await request(app)
      .get(`/api/tasks/${taskId}/attachments/${fileId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/pdf/);
  });

  it("should return 404 for non-existent attachment", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/tasks/${taskId}/attachments/${fakeId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });

  it("should not download without auth", async () => {
    const uploadRes = await request(app)
      .post(`/api/tasks/${taskId}/attachments`)
      .set("Authorization", `Bearer ${userToken}`)
      .attach("files", testPdfPath);

    const fileId = uploadRes.body[0]._id;
    const res = await request(app)
      .get(`/api/tasks/${taskId}/attachments/${fileId}`);

    expect(res.status).toBe(401);
  });
});
