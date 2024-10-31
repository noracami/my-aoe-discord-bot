const yourConnectionURI = process.env.MONGODB_URI;
const { MongoClient } = require("mongodb");

async function mongoDB() {
  const client = new MongoClient(yourConnectionURI);
  await client.connect();
  const db = client.db("aoe29");

  return db;
}

module.exports = {
  async getMatch(matchId, profileId = null) {
    const db = await mongoDB();

    // 1. fetch the match from db first
    console.log("1. fetch the match from db first");
    // find the match where matchId is equal and is latest match
    const matchInMongo = await db
      .collection("match")
      .findOne({ matchId: parseInt(matchId) }, {}, { sort: { _id: -1 } });

    if (matchInMongo) {
      if (matchInMongo.finished !== null) {
        // found the completed match
        db.client.close();
        return matchInMongo;
      } else {
        const profile_id = matchInMongo.teams[0].players[0].profileId;
        const match = await fetch(
          `https://data.aoe2companion.com/api/matches?profile_ids=${profile_id}&leaderboard_id=unranked&page=1`
        )
          .then((res) => res.json())
          .then((data) =>
            data.matches.find((m) => `${m.matchId}` === `${matchId}`)
          );
        if (match.finished !== null) {
          // update the match in db, insert it
          await db.collection("match").insertOne(match);
        } else {
          // match is still not finished
          // no-op
        }
        db.client.close();
        return match;
      }
    }

    // if profileId is not provided, we can't fetch the match from api
    if (!profileId) {
      db.client.close();
      return null;
    }

    // 2. fetch the match from https://data.aoe2companion.com/
    console.log("2. fetch the match from https://data.aoe2companion.com/");
    // https://data.aoe2companion.com/api/matches?profile_ids=199325&leaderboard_ids=unranked&page=1
    const res = await fetch(
      `https://data.aoe2companion.com/api/matches?profile_ids=${profileId}&leaderboard_id=unranked&page=1`
    ).then((res) => res.json());

    // console.table(res.matches.map((m) => [m.matchId, m.started, m.finished]));

    const findMatch = res.matches.find((m) => `${m.matchId}` === `${matchId}`);

    const a = res.matches.map((m) => m.matchId.toString());
    console.warn(a.includes(matchId));
    // .then((data) => data.matches.find((m) => m.matchId === matchId));

    // 3. if match is not found, return
    console.log("3. if match is not found, return");
    if (!findMatch) {
      db.client.close();
      return null;
    }

    // 4. if match is found, save the match in db
    console.log("4. if match is found, save the match in db");
    await db.collection("match").insertOne(findMatch);

    // 5. return the match
    console.log("5. return the match");
    db.client.close();
    return findMatch;

    const { matches } = await fetch(url).then((res) => res.json());
    const match = matches.find((m) => m.matchId === matchId);
    if (!match) {
      return null;
    }

    await db.collection("match").insertOne(match);

    db.client.close();
    return match;
    //   matches: Array {
    //     "matchId": 347966687,
    //     "started": "2024-10-26T20:08:40.000Z",
    //     "finished": "2024-10-26T20:35:03.000Z",
    //     "leaderboardId": "unranked",
    //     "leaderboardName": "Unranked",
    //     "name": ".",
    //     "server": null,
    //     "internalLeaderboardId": 0,
    //     "map": "unknown",
    //     "mapName": "PopulationBoost Arabia (Custom)",
    //     "mapImageUrl": "https://frontend.cdn.aoe2companion.com/public/aoe2/de/maps/cm_generic.png",
    //     "privacy": 2,
    //     "difficulty": 3,
    //     "startingAge": 0,
    //     "fullTechTree": false,
    //     "allowCheats": false,
    //     "empireWarsMode": true,
    //     "endingAge": 0,
    //     "gameMode": "random_map",
    //     "gameModeName": "Random Map",
    //     "lockSpeed": true,
    //     "lockTeams": false,
    //     "mapSize": 168,
    //     "population": 200,
    //     "hideCivs": false,
    //     "recordGame": true,
    //     "regicideMode": true,
    //     "gameVariant": 2,
    //     "resources": 0,
    //     "sharedExploration": false,
    //     "speed": 2,
    //     "speedName": "Normal",
    //     "suddenDeathMode": true,
    //     "teamPositions": false,
    //     "teamTogether": true,
    //     "treatyLength": 0,
    //     "turboMode": true,
    //     "victory": 1,
    //     "revealMap": 0,
    //     "scenario": null,
    //     "teams": [
    //         {
    //             "teamId": 1,
    //             "players": [
    //                 {
    //                     "profileId": 199325,
    //                     "name": "GL.Hera",
    //                     "rating": 1920,
    //                     "ratingDiff": -31,
    //                     "civ": "goths",
    //                     "civName": "Goths",
    //                     "civImageUrl": "https://frontend.cdn.aoe2companion.com/public/aoe2/de/civilizations/goths.png",
    //                     "color": 1,
    //                     "colorHex": "#405BFF",
    //                     "slot": 0,
    //                     "status": 0,
    //                     "team": 1,
    //                     "replay": false,
    //                     "won": false,
    //                     "country": "ca",
    //                     "shared": true,
    //                     "verified": true
    //                 }
    //             ]
    //         },
    //         {
    //             "teamId": 2,
    //             "players": [
    //                 {
    //                     "profileId": 2564564,
    //                     "name": "EddyDantes",
    //                     "rating": 1342,
    //                     "ratingDiff": 10,
    //                     "civ": "turks",
    //                     "civName": "Turks",
    //                     "civImageUrl": "https://frontend.cdn.aoe2companion.com/public/aoe2/de/civilizations/turks.png",
    //                     "color": 6,
    //                     "colorHex": "#FF57B3",
    //                     "slot": 1,
    //                     "status": 0,
    //                     "team": 2,
    //                     "replay": false,
    //                     "won": true,
    //                     "country": "us",
    //                     "shared": true,
    //                     "verified": false
    //                 },
    //                 {
    //                     "profileId": 1756532,
    //                     "name": "Dan",
    //                     "rating": 1280,
    //                     "ratingDiff": 10,
    //                     "civ": "berbers",
    //                     "civName": "Berbers",
    //                     "civImageUrl": "https://frontend.cdn.aoe2companion.com/public/aoe2/de/civilizations/berbers.png",
    //                     "color": 8,
    //                     "colorHex": "#FF9600",
    //                     "slot": 3,
    //                     "status": 0,
    //                     "team": 2,
    //                     "replay": false,
    //                     "won": true,
    //                     "country": "mx",
    //                     "shared": false,
    //                     "verified": false
    //                 },
    //                 {
    //                     "profileId": 19131069,
    //                     "name": "DiO",
    //                     "rating": 1271,
    //                     "ratingDiff": 10,
    //                     "civ": "romans",
    //                     "civName": "Romans",
    //                     "civImageUrl": "https://frontend.cdn.aoe2companion.com/public/aoe2/de/civilizations/romans.png",
    //                     "color": 2,
    //                     "colorHex": "#FF0000",
    //                     "slot": 2,
    //                     "status": 0,
    //                     "team": 2,
    //                     "replay": false,
    //                     "won": true,
    //                     "country": "us",
    //                     "shared": false,
    //                     "verified": false
    //                 }
    //             ]
    //         }
    //     ]
    // }
  },
};
