const yourConnectionURI = process.env.MONGODB_URI;
const { MongoClient } = require("mongodb");

async function mongoDB() {
  const client = new MongoClient(yourConnectionURI);
  await client.connect();
  const db = client.db("aoe29");

  return db;
}

module.exports = {
  async getTeam(teamName) {
    const db = await mongoDB();
    const teams = db.collection("team");
    const team = await teams.findOne({ name: teamName });
    db.client.close();
    return team;
  },
};
