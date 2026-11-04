require("dotenv").config();
const express = require("express");
const path = require("path");
const { getStudentsCollection, toObjectId } = require("./lib/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/students", async (req, res) => {
  try {
    const students = await getStudentsCollection();
    const records = await students.find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json(records);
  } catch (error) {
    console.error("GET /api/students:", error);
    res.status(500).json({ error: "Could not retrieve student records. Check MONGODB_URI." });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const { name, department, year } = req.body || {};
    if (!name?.trim() || !department?.trim() || ![1, 2, 3, 4].includes(Number(year))) {
      return res.status(400).json({ error: "Enter a name, department and year from 1 to 4." });
    }
    const students = await getStudentsCollection();
    const student = {
      name: name.trim(),
      department: department.trim().toUpperCase(),
      year: Number(year),
      createdAt: new Date()
    };
    const result = await students.insertOne(student);
    res.status(201).json({ ...student, _id: result.insertedId });
  } catch (error) {
    console.error("POST /api/students:", error);
    res.status(500).json({ error: "Could not add student. Check your database connection." });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const objectId = toObjectId(req.params.id);
    if (!objectId) return res.status(400).json({ error: "Invalid student ID." });
    const { name, department, year } = req.body || {};
    if (!name?.trim() || !department?.trim() || ![1, 2, 3, 4].includes(Number(year))) {
      return res.status(400).json({ error: "Enter a name, department and year from 1 to 4." });
    }
    const students = await getStudentsCollection();
    const result = await students.updateOne(
      { _id: objectId },
      { $set: { name: name.trim(), department: department.trim().toUpperCase(), year: Number(year), updatedAt: new Date() } }
    );
    if (!result.matchedCount) return res.status(404).json({ error: "Student not found." });
    const updated = await students.findOne({ _id: objectId });
    res.status(200).json(updated);
  } catch (error) {
    console.error("PUT /api/students/:id:", error);
    res.status(500).json({ error: "Could not update student." });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    const objectId = toObjectId(req.params.id);
    if (!objectId) return res.status(400).json({ error: "Invalid student ID." });
    const students = await getStudentsCollection();
    const result = await students.deleteOne({ _id: objectId });
    if (!result.deletedCount) return res.status(404).json({ error: "Student not found." });
    res.status(200).json({ success: true, message: "Student deleted." });
  } catch (error) {
    console.error("DELETE /api/students/:id:", error);
    res.status(500).json({ error: "Could not delete student." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Little Sprouts Experiment 11 running at http://localhost:${PORT}`);
});
