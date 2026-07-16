
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

module.exports = async function globalSetup() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = "test_jwt_secret_key";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.NODE_ENV = "test";
  process.env.MAX_STORAGE_BYTES = String(5 * 1024 * 1024); // 5 MB

  global.__MONGOD__ = mongod;
};
