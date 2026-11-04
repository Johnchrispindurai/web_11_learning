# Little Sprouts — Experiment 11: Node.js + MongoDB CRUD

A kids-learning themed student dashboard demonstrating the Experiment 11 objectives:
connect Node.js to MongoDB and perform Create, Read, Update and Delete operations
on the `Students` collection in the `CollegeDB` database.

## Features
- Responsive Little Sprouts kids-learning themed UI
- Add student records (Create / `insertOne()`)
- Display student records (Read / `find()`)
- Edit student records (Update / `updateOne()`)
- Delete student records (Delete / `deleteOne()`)
- MongoDB ObjectId handling and basic input validation
- Error messages for connection and database failures
- Local Express server and Vercel serverless API
- `.env` excluded from Git; `.env.example` included

## 1. MongoDB Atlas setup
1. Create or open a MongoDB Atlas cluster.
2. Create a database user and password.
3. In Atlas Network Access, allow your deployment to connect. For a student demo,
   `0.0.0.0/0` allows connections from Vercel, but use strong credentials and
   restrict access where practical.
4. Copy the Atlas connection string. Replace the username and password placeholders.
5. Do not share or commit the connection string.

## 2. Run locally
Create a `.env` file in the project root (copy `.env.example`) and set:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=CollegeDB
```

Then run:

```bash
npm install
npm start
```

Open http://localhost:3000.

## 3. Deploy to Vercel
1. Push this project folder to GitHub.
2. Import the repository in Vercel.
3. Framework Preset: **Other**.
4. Root Directory: `./`.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Install Command: `npm install`.
8. Before deploying, open **Environment Variables** and add:
   - Name: `MONGODB_URI`
   - Value: your complete MongoDB Atlas connection string
   - Environments: Production, Preview and Development (as needed)
   - Add `MONGODB_DB` with value `CollegeDB` (optional; this is the default).
9. Click Deploy. If you add/change environment variables later, redeploy.

## 4. API endpoints
- `GET /api/students` — list all students
- `POST /api/students` — create a student; JSON body `{ "name":"Arun", "department":"CSE", "year":2 }`
- `PUT /api/students?id=OBJECT_ID` — update a student using the same JSON body
- `DELETE /api/students?id=OBJECT_ID` — delete a student

## Important
- Never put your real `.env` file or MongoDB password in GitHub or inside the ZIP.
- If the Atlas URI password contains special characters, URL-encode those characters.
- This is an educational CRUD demo, not a production student information system.
