const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const page = fs.readFileSync(path.join(__dirname, "public", "index.html"));
const initialStudents = () => [
  { id: 1, name: "Asha Kumar", email: "asha@example.com", course: "DevOps" },
  { id: 2, name: "Ravi Patel", email: "ravi@example.com", course: "Node.js" }
];

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Request body must be valid JSON"));
      }
    });
    request.on("error", reject);
  });
}

function validateStudent(student) {
  if (
    !student ||
    typeof student.name !== "string" ||
    !student.name.trim() ||
    typeof student.email !== "string" ||
    !student.email.trim() ||
    typeof student.course !== "string" ||
    !student.course.trim()
  ) {
    return "Name, email, and course are required.";
  }
  return null;
}

function createServer({ students = initialStudents() } = {}) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    const studentMatch = url.pathname.match(/^\/api\/students\/(\d+)$/);

    try {
      if (request.method === "GET" && url.pathname === "/") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(page);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/students") {
        sendJson(response, 200, students);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/students") {
        const student = await readJson(request);
        const validationError = validateStudent(student);
        if (validationError) {
          sendJson(response, 400, { error: validationError });
          return;
        }

        const created = {
          id: students.reduce((highest, item) => Math.max(highest, item.id), 0) + 1,
          name: student.name.trim(),
          email: student.email.trim(),
          course: student.course.trim()
        };
        students.push(created);
        sendJson(response, 201, created);
        return;
      }

      if (studentMatch && request.method === "PUT") {
        const id = Number(studentMatch[1]);
        const index = students.findIndex((student) => student.id === id);
        if (index === -1) {
          sendJson(response, 404, { error: "Student not found." });
          return;
        }

        const student = await readJson(request);
        const validationError = validateStudent(student);
        if (validationError) {
          sendJson(response, 400, { error: validationError });
          return;
        }

        students[index] = {
          id,
          name: student.name.trim(),
          email: student.email.trim(),
          course: student.course.trim()
        };
        sendJson(response, 200, students[index]);
        return;
      }

      if (studentMatch && request.method === "DELETE") {
        const id = Number(studentMatch[1]);
        const index = students.findIndex((student) => student.id === id);
        if (index === -1) {
          sendJson(response, 404, { error: "Student not found." });
          return;
        }

        students.splice(index, 1);
        response.writeHead(204);
        response.end();
        return;
      }

      sendJson(response, 404, { error: "Not found." });
    } catch (error) {
      if (!response.headersSent) {
        sendJson(response, 400, { error: error.message });
      } else {
        response.destroy(error);
      }
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, "0.0.0.0", () => {
    console.log(`Student Management app listening on port ${port}`);
  });
}

module.exports = { createServer };
