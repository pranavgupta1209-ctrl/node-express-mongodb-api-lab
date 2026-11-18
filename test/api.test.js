import assert from "node:assert/strict";
import { once } from "node:events";
import { spawnSync } from "node:child_process";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../backend/src/app.js";
import connectDatabase from "../backend/src/config/database.js";
import { User } from "../backend/src/models/user.model.js";
import { Post } from "../backend/src/models/post.model.js";

let database;
let server;
let baseUrl;
let createdPostId;
const account = {
  username: "studentdemo",
  email: "student@example.com",
  password: "DemoPass123!",
};

// These tests use a disposable real MongoDB process, never an Atlas database.
before(async () => {
  database = await MongoMemoryServer.create();
  process.env.MONGODB_URI = database.getUri("api_lab_test");
  await connectDatabase();
  await User.init();
  server = app.listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
}, { timeout: 180000 });

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (database) await database.stop();
});

async function request(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json(), headers: response.headers };
}

function checkNoPassword(body) {
  const text = JSON.stringify(body);
  assert.equal(/password|\$2[aby]\$/i.test(text), false);
}

test("health and unknown routes return JSON with correct status codes", async () => {
  assert.equal((await request("GET", "/")).status, 200);
  const missing = await request("GET", "/missing");
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get("content-type"), /application\/json/);
  assert.equal((await request("GET", "/api/v1/users/register")).status, 404);
});

test("malformed and oversized JSON return 400 without internal details", async () => {
  for (const body of ['{"name":', JSON.stringify({ value: "x".repeat(103000) })]) {
    const response = await fetch(`${baseUrl}/api/v1/posts/create`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
    });
    assert.equal(response.status, 400);
    assert.equal("stack" in await response.json(), false);
  }
});

test("registration validates missing, mistyped, malformed and long inputs", async () => {
  const invalidBodies = [
    undefined, {}, [], null,
    { ...account, username: " " }, { ...account, username: "invalid name" },
    { ...account, username: "a".repeat(31) }, { ...account, username: 3 },
    { ...account, email: "bad-email" }, { ...account, email: { $ne: null } },
    { ...account, password: "short" }, { ...account, password: 123456 },
    { ...account, password: "x".repeat(73) }, { ...account, password: "é".repeat(37) },
  ];
  for (const body of invalidBodies) {
    assert.equal((await request("POST", "/api/v1/users/register", body)).status, 400);
  }
  assert.equal(await User.countDocuments(), 0);
});

test("registration normalizes user details and never returns a password", async () => {
  const response = await request("POST", "/api/v1/users/register", {
    ...account, username: " StudentDemo ", email: " STUDENT@EXAMPLE.COM ",
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.user.username, account.username);
  assert.equal(response.body.user.email, account.email);
  assert.ok(response.body.user.createdAt);
  checkNoPassword(response.body);
});

test("duplicate emails and usernames return 409", async () => {
  for (const body of [account, { ...account, email: "other@example.com" },
    { ...account, username: "other" }]) {
    assert.equal((await request("POST", "/api/v1/users/register", body)).status, 409);
  }
  assert.equal(await User.countDocuments(), 1);
});

test("unique indexes protect concurrent registrations", async () => {
  const body = { ...account, username: "concurrent", email: "race@example.com" };
  const results = await Promise.all([
    request("POST", "/api/v1/users/register", body),
    request("POST", "/api/v1/users/register", body),
  ]);
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);
  assert.equal(await User.countDocuments({ username: "concurrent" }), 1);
});

test("bcrypt stores a hash, compares passwords and skips unchanged passwords", async () => {
  const hidden = await User.findOne({ email: account.email });
  assert.equal(hidden.password, undefined);
  const user = await User.findOne({ email: account.email }).select("+password");
  const originalHash = user.password;
  assert.notEqual(originalHash, account.password);
  assert.match(originalHash, /^\$2[aby]\$/);
  assert.equal(await user.comparePassword(account.password), true);
  assert.equal(await user.comparePassword("WrongPass123!"), false);
  assert.equal(await user.comparePassword(undefined), false);
  checkNoPassword(user.toJSON());
  user.username = "studentdemo_updated";
  await user.save();
  assert.equal(user.password, originalHash);
  user.password = "ChangedPass123!";
  await user.save();
  assert.notEqual(user.password, originalHash);
  assert.equal(await user.comparePassword("ChangedPass123!"), true);
  user.password = account.password;
  await user.save();
});

test("login verifies normalized credentials without issuing tokens or sessions", async () => {
  const response = await request("POST", "/api/v1/users/login", {
    email: " STUDENT@EXAMPLE.COM ", password: account.password,
  });
  assert.equal(response.status, 200);
  checkNoPassword(response.body);
  assert.equal(response.body.token, undefined);
  assert.equal(response.headers.get("set-cookie"), null);
});

test("login rejects missing input and gives the same 401 for unknown or wrong credentials", async () => {
  assert.equal((await request("POST", "/api/v1/users/login", {})).status, 400);
  const wrong = await request("POST", "/api/v1/users/login", {
    email: account.email, password: "WrongPass123!",
  });
  const unknown = await request("POST", "/api/v1/users/login", {
    email: "unknown@example.com", password: account.password,
  });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.deepEqual(wrong.body, unknown.body);
});

test("logout explicitly describes its educational behavior", async () => {
  const response = await request("POST", "/api/v1/users/logout");
  assert.equal(response.status, 200);
  assert.match(response.body.message, /demonstration/);
  assert.equal(response.headers.get("set-cookie"), null);
});

test("reading an empty collection returns an empty JSON array", async () => {
  const response = await request("GET", "/api/v1/posts/getPosts");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});

test("creating posts rejects invalid fields without inserting documents", async () => {
  const valid = { name: "Backend Learning", description: "First project", age: 20 };
  for (const body of [undefined, {}, [], null, { name: "x" },
    { ...valid, name: " " }, { ...valid, description: [] },
    { ...valid, name: "x".repeat(101) }, { ...valid, description: "x".repeat(2001) },
    { ...valid, age: "20" }, { ...valid, age: null }, { ...valid, age: 0 },
    { ...valid, age: 151 }, { ...valid, unexpected: true }]) {
    assert.equal((await request("POST", "/api/v1/posts/create", body)).status, 400);
  }
  assert.equal(await Post.countDocuments(), 0);
});

test("create persists trimmed fields and timestamps, and read retrieves the document", async () => {
  const response = await request("POST", "/api/v1/posts/create", {
    name: " Backend Learning ", description: " My first MongoDB API project ", age: 20,
  });
  assert.equal(response.status, 201);
  createdPostId = response.body.post._id;
  assert.match(createdPostId, /^[a-f0-9]{24}$/);
  assert.equal(response.body.post.name, "Backend Learning");
  assert.ok(response.body.post.createdAt);
  const stored = await Post.findById(createdPostId);
  assert.equal(stored.description, "My first MongoDB API project");
  const read = await request("GET", "/api/v1/posts/getPosts");
  assert.equal(read.status, 200);
  assert.equal(read.body[0]._id, createdPostId);
});

test("update returns the changed document and preserves untouched fields", async () => {
  const response = await request("PATCH", `/api/v1/posts/update/${createdPostId}`, {
    description: " Updated using Postman ",
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.post.description, "Updated using Postman");
  assert.equal(response.body.post.age, 20);
  assert.equal((await Post.findById(createdPostId)).description, "Updated using Postman");
});

test("update enforces schema limits and rejects empty, unsafe or mistyped fields", async () => {
  for (const body of [undefined, {}, [], { age: 0 }, { age: 151 }, { age: "20" },
    { age: null }, { name: " " }, { description: null }, { name: "x".repeat(101) },
    { description: "x".repeat(2001) }, { _id: createdPostId }, { createdAt: "2020-01-01" },
    { $set: { age: 30 } }, { unknown: "x" }]) {
    assert.equal((await request("PATCH", `/api/v1/posts/update/${createdPostId}`, body)).status, 400);
  }
  assert.equal((await Post.findById(createdPostId)).age, 20);
});

test("update and delete return 400 for invalid IDs and 404 for missing documents", async () => {
  for (const id of ["bad-id", "123456789012", "z".repeat(24)]) {
    assert.equal((await request("PATCH", `/api/v1/posts/update/${id}`, { age: 21 })).status, 400);
    assert.equal((await request("DELETE", `/api/v1/posts/delete/${id}`)).status, 400);
  }
  const missing = new mongoose.Types.ObjectId().toString();
  assert.equal((await request("PATCH", `/api/v1/posts/update/${missing}`, { age: 21 })).status, 404);
  assert.equal((await request("DELETE", `/api/v1/posts/delete/${missing}`)).status, 404);
});

test("delete removes the document and a second deletion returns 404", async () => {
  const path = `/api/v1/posts/delete/${createdPostId}`;
  const response = await request("DELETE", path);
  assert.equal(response.status, 200);
  assert.equal(response.body.postId, createdPostId);
  assert.equal(await Post.findById(createdPostId), null);
  assert.equal((await request("DELETE", path)).status, 404);
  assert.deepEqual((await request("GET", "/api/v1/posts/getPosts")).body, []);
});

test("unexpected database errors produce a generic 500 response", async (context) => {
  context.mock.method(Post, "findByIdAndDelete", async () => {
    throw new Error("mongodb://private-user:private-password@private-host");
  });
  context.mock.method(console, "error", () => {});
  const response = await request("DELETE", `/api/v1/posts/delete/${createdPostId}`);
  assert.equal(response.status, 500);
  assert.deepEqual(response.body, { message: "Unexpected server error. Please try again." });
});

test("startup fails safely for missing URI, unreachable database, invalid port and busy port", { timeout: 60000 }, () => {
  const cases = [
    { MONGODB_URI: "your_mongodb_atlas_connection_string", PORT: "8000" },
    { MONGODB_URI: "mongodb://127.0.0.1:1/unreachable", PORT: "8000" },
    { MONGODB_URI: database.getUri(), PORT: "invalid" },
    { MONGODB_URI: database.getUri(), PORT: String(server.address().port) },
  ];
  for (const settings of cases) {
    const result = spawnSync(process.execPath, ["backend/src/index.js"], {
      cwd: new URL("..", import.meta.url),
      env: { ...process.env, ...settings },
      encoding: "utf8", timeout: 20000,
    });
    assert.equal(result.error, undefined, result.stdout + result.stderr);
    assert.equal(result.status, 1);
    assert.equal(result.stdout.includes("Server running"), false);
    assert.equal((result.stdout + result.stderr).includes(settings.MONGODB_URI), false);
    assert.match(result.stderr, /Startup failed|already in use/);
  }
});
