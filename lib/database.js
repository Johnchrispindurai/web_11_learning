const { MongoClient, ObjectId } = require("mongodb");

let cachedClient = global.__littleSproutsMongoClient;
let cachedPromise = global.__littleSproutsMongoPromise;

async function getClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is missing.");

  if (cachedClient) return cachedClient;

  if (!cachedPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000
    });
    cachedPromise = client.connect().then(connected => {
      cachedClient = connected;
      global.__littleSproutsMongoClient = connected;
      return connected;
    }).catch(error => {
      cachedPromise = null;
      global.__littleSproutsMongoPromise = null;
      throw error;
    });
    global.__littleSproutsMongoPromise = cachedPromise;
  }
  return cachedPromise;
}

async function getStudentsCollection() {
  const client = await getClient();
  const dbName = process.env.MONGODB_DB || "CollegeDB";
  return client.db(dbName).collection("Students");
}

function toObjectId(value) {
  if (!ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}

module.exports = { getStudentsCollection, toObjectId };
