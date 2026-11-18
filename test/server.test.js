const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("../server");

let server;
let baseUrl;

before(async () => {
  server = createServer({ students: [] });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("the home page serves the student management UI", async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(await response.text(), /Student Management/);
});

test("students can be created, listed, updated, and deleted", async () => {
  const createResponse = await fetch(`${baseUrl}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "  Alex Lee ", email: "alex@example.com", course: "Node.js" })
  });
  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.equal(created.name, "Alex Lee");

  const listResponse = await fetch(`${baseUrl}/api/students`);
  assert.deepEqual(await listResponse.json(), [created]);

  const updateResponse = await fetch(`${baseUrl}/api/students/${created.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Alex Lee", email: "alex@example.com", course: "DevOps" })
  });
  assert.equal(updateResponse.status, 200);
  assert.equal((await updateResponse.json()).course, "DevOps");

  const deleteResponse = await fetch(`${baseUrl}/api/students/${created.id}`, { method: "DELETE" });
  assert.equal(deleteResponse.status, 204);
  assert.deepEqual(await (await fetch(`${baseUrl}/api/students`)).json(), []);
});

test("invalid students and missing records return clear errors", async () => {
  const invalidResponse = await fetch(`${baseUrl}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", email: "alex@example.com", course: "Node.js" })
  });
  assert.equal(invalidResponse.status, 400);
  assert.match((await invalidResponse.json()).error, /required/);

  const missingResponse = await fetch(`${baseUrl}/api/students/999`, { method: "DELETE" });
  assert.equal(missingResponse.status, 404);
});
