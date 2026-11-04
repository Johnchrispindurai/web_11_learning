const API = "/api/students";
const form = document.getElementById("studentForm");
const rows = document.getElementById("studentRows");
const toast = document.getElementById("toast");
const searchInput = document.getElementById("searchInput");
const submitButton = document.getElementById("submitButton");
const cancelEdit = document.getElementById("cancelEdit");
let students = [];
let editingId = null;

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}
function setStatus(state, message) {
  const el = document.getElementById("dbStatus");
  el.className = `db-status ${state}`;
  el.innerHTML = `<i></i>${message}`;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
function updateStats(list) {
  document.getElementById("totalCount").textContent = list.length;
  document.getElementById("cseCount").textContent = list.filter(s => s.department === "CSE").length;
  document.getElementById("departmentCount").textContent = new Set(list.map(s => s.department)).size;
}
function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(query) || s.department.toLowerCase().includes(query)
  );
  if (!filtered.length) {
    rows.innerHTML = `<tr><td colspan="4" class="empty">${students.length ? "🔎 No matching learners found." : "🌱 No students yet. Add the first learner!"}</td></tr>`;
  } else {
    rows.innerHTML = filtered.map((student, index) => `
      <tr>
        <td><div class="student-name"><span class="student-avatar">${["🧒","👧","👦","🧑‍🎓","🌟"][index % 5]}</span>${escapeHtml(student.name)}</div></td>
        <td><span class="dept-pill">${escapeHtml(student.department)}</span></td>
        <td>${Number(student.year)}${["","st","nd","rd","th"][Number(student.year)] || "th"} year</td>
        <td><div class="action-buttons">
          <button class="edit-btn" data-action="edit" data-id="${student._id}">Edit</button>
          <button class="delete-btn" data-action="delete" data-id="${student._id}">Delete</button>
        </div></td>
      </tr>`).join("");
  }
  document.getElementById("recordCount").textContent = `${filtered.length} of ${students.length} learners`;
  updateStats(students);
}
async function loadStudents() {
  setStatus("", "Connecting to garden database…");
  try {
    const response = await fetch(API);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load students.");
    students = data;
    setStatus("connected", "MongoDB connected");
    renderStudents();
  } catch (error) {
    setStatus("error", "Database connection issue");
    rows.innerHTML = `<tr><td colspan="4" class="empty">🌧️ ${escapeHtml(error.message)}<br><br>Check your Vercel MONGODB_URI environment variable and Atlas Network Access.</td></tr>`;
    document.getElementById("recordCount").textContent = "Unable to load records";
    updateStats([]);
  }
}
function resetForm() {
  form.reset();
  editingId = null;
  document.getElementById("formTitle").textContent = "Add a learner";
  submitButton.innerHTML = 'Add student <b>＋</b>';
  cancelEdit.classList.add("hidden");
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const payload = {
    name: form.name.value.trim(),
    department: form.department.value,
    year: Number(form.year.value)
  };
  if (!payload.name || !payload.department || !payload.year) return notify("Please complete all student details.");
  submitButton.disabled = true;
  submitButton.textContent = editingId ? "Saving changes…" : "Planting learner…";
  try {
    const response = await fetch(editingId ? `${API}?id=${encodeURIComponent(editingId)}` : API, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The database could not save this record.");
    notify(editingId ? "Learner details updated! 🌼" : "New learner added to the garden! 🌱");
    resetForm();
    await loadStudents();
  } catch (error) {
    notify(error.message);
  } finally {
    submitButton.disabled = false;
    if (!editingId) submitButton.innerHTML = 'Add student <b>＋</b>';
    else submitButton.textContent = "Update student";
  }
});
rows.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const student = students.find(item => item._id === button.dataset.id);
  if (!student) return;
  if (button.dataset.action === "edit") {
    editingId = student._id;
    form.name.value = student.name;
    form.department.value = student.department;
    form.year.value = String(student.year);
    document.getElementById("formTitle").textContent = "Edit learner details";
    submitButton.innerHTML = 'Update student <b>✓</b>';
    cancelEdit.classList.remove("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (button.dataset.action === "delete") {
    if (!window.confirm(`Delete ${student.name}'s record?`)) return;
    button.disabled = true;
    try {
      const response = await fetch(`${API}?id=${encodeURIComponent(student._id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete student.");
      notify("Student record deleted.");
      if (editingId === student._id) resetForm();
      await loadStudents();
    } catch (error) {
      notify(error.message);
      button.disabled = false;
    }
  }
});
cancelEdit.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderStudents);
document.getElementById("refreshButton").addEventListener("click", loadStudents);
loadStudents();
