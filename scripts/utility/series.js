const yourConnectionURI = process.env.MONGODB_URI;
const { MongoClient } = require("mongodb");

async function mongoDB() {
  const client = new MongoClient(yourConnectionURI);
  await client.connect();
  const db = client.db("aoe29");

  return db;
}

module.exports = {
  async getSeries(team1, team2, seriesType) {
    const db = await mongoDB();
    const teams = db.collection("team");
    const teamOne = await teams.findOne({ name: team1 });
    const teamTwo = (await teams.findOne({ name: team2 })) || null;
    const series = db.collection("series");
    const queries = [teamOne];
    if (teamTwo) {
      queries.push(teamTwo);
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
  async putSeries(team1, team2, seriesType, matchNumber, matchId) {
    const db = await mongoDB();
    const teams = db.collection("team");
    const teamOne = await teams.findOne({ name: team1 });
    const teamTwo = await teams.findOne({ name: team2 });
    const seriesCollection = db.collection("series");
    const query = {
      homeTeamId: teamOne._id,
      guestTeamId: teamTwo._id,
      seriesType,
    };
    if (teamOne.seed > teamTwo.seed) {
      query.homeTeamId = teamTwo._id;
      query.guestTeamId = teamOne._id;
    }
    const series = await seriesCollection.findOne(query);
    if (!series) {
      db.client.close();
      return {
        ok: false,
        message: "Series not found",
      };
    }
    if (series.matches.length === 0) {
      series.matches = ["placeholder", undefined, undefined, undefined];
    }
    series.matches[matchNumber] = matchId;
    await seriesCollection.updateOne(query, {
      $set: { matches: series.matches },
    });

    const u = {
      tier: series.homeTeamLineup[0].tier,
    };
    u.profileId = await db
      .collection("team")
      .findOne({ name: teamOne.name })
      .then((t) => t.lineup.find((p) => p.tier === u.tier).profileId);

    db.client.close();
    return {
      ok: true,
      message: "Match ID added to series",
      profileIdToFetchMatchAPI: u.profileId,
    };
  },
};
