const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../src/app");

let mongoServer;

async function setupDB() {
  process.env.MONGOMS_MD5_CHECK = "0";
  mongoServer = await MongoMemoryServer.create();
  process.env.JWT_SECRET = "test-secret";
  process.env.UPLOAD_DIR = "./tests/uploads";
  await mongoose.connect(mongoServer.getUri());
}

async function teardownDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}

async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

async function createUser(
  email = "user@example.com",
  password = "password123",
  role = "user",
) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password, role });
  return { token: res.body.token, user: res.body.user };
}

module.exports = { app, setupDB, teardownDB, clearDB, createUser };
