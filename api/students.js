const { getStudentsCollection, toObjectId } = require("../lib/database");

module.exports = async function handler(req, res) {
  try {
    const students = await getStudentsCollection();

    if (req.method === "GET") {
      const records = await students.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(records);
    }

    if (req.method === "POST") {
      const { name, department, year } = req.body || {};
      if (!name?.trim() || !department?.trim() || ![1, 2, 3, 4].includes(Number(year))) {
        return res.status(400).json({ error: "Enter a name, department and year from 1 to 4." });
      }
      const student = {
        name: name.trim(),
        department: department.trim().toUpperCase(),
        year: Number(year),
        createdAt: new Date()
      };
      const result = await students.insertOne(student);
      return res.status(201).json({ ...student, _id: result.insertedId });
    }

    const id = req.query.id || (req.url.split("?")[0].split("/").pop());
    const objectId = toObjectId(id);
    if (!objectId) return res.status(400).json({ error: "Provide a valid student id in ?id=..." });

    if (req.method === "PUT") {
      const { name, department, year } = req.body || {};
      if (!name?.trim() || !department?.trim() || ![1, 2, 3, 4].includes(Number(year))) {
        return res.status(400).json({ error: "Enter a name, department and year from 1 to 4." });
      }
      const result = await students.updateOne(
        { _id: objectId },
        { $set: { name: name.trim(), department: department.trim().toUpperCase(), year: Number(year), updatedAt: new Date() } }
      );
      if (!result.matchedCount) return res.status(404).json({ error: "Student not found." });
      return res.status(200).json(await students.findOne({ _id: objectId }));
    }

    if (req.method === "DELETE") {
      const result = await students.deleteOne({ _id: objectId });
      if (!result.deletedCount) return res.status(404).json({ error: "Student not found." });
      return res.status(200).json({ success: true, message: "Student deleted." });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("Vercel /api/students:", error);
    return res.status(500).json({
      error: process.env.NODE_ENV === "development"
        ? error.message
        : "Database operation failed. Check MONGODB_URI and Atlas network access."
    });
  }
};
