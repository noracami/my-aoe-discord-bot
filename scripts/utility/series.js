const yourConnectionURI = process.env.MONGODB_URI;
const { MongoClient } = require("mongodb");

async function mongoDB() {
  const client = new MongoClient(yourConnectionURI);
  await client.connect();
  const db = client.db("aoe29");

  return db;
}

module.exports = {
  async getSeries(team1, team2 = "", seriesType = "all") {
    const db = await mongoDB();
    const teams = db.collection("team");
    const team1 = await teams.findOne({ name: team1 });
    const team2 = (await teams.findOne({ name: team2 })) || "";
    const series = db.collection("series");
    const queries = [team1];
    if (team2) {
      queries.push(team2);
      queries.sort((a, b) => a.seed - b.seed);
    }
    const query = {};
    if (queries.length === 2) {
      query.homeTeamId = queries[0]._id;
      query.guestTeamId = queries[1]._id;
    } else {
      query.$or = [
        { homeTeamId: queries[0]._id },
        { guestTeamId: queries[0]._id },
      ];
    }
    if (seriesType !== "all") {
      query.seriesType = seriesType;
    }
    console.log({ query });
    const seriesData = await series.find(query).toArray();

    db.client.close();
    return seriesData;
  },
};
