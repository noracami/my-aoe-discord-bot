// 建立 Tournament data
// 建立 Stage data
// 建立 SubStage data
// 建立 Team data
// 建立 Series data
// 建立 Match data
// 建立 Player data
// 建立 Roster data

const yourConnectionURI = process.env.MONGODB_URI;
const dayjs = require("dayjs");
const { MongoClient } = require("mongodb");

async function setUpDb() {
  const client = new MongoClient(yourConnectionURI);
  await client.connect();
  const db = client.db("aoe29");

  return db;
}

async function clearDb(db) {
  await db.dropCollection("tournament");
  await db.dropCollection("stage");
  await db.dropCollection("sub_stage");
  await db.dropCollection("team");
  await db.dropCollection("series");
  await db.dropCollection("match");
  await db.dropCollection("player");
  await db.dropCollection("roster");

  console.log("Database cleared successfully");
}

async function insertTournament(db) {
  const tournament = db.collection("tournament");
  // to save time with unix timestamp
  const tournamentData = {
    name: "第四屆社畜盃團戰賽",
    start: dayjs("2024-09-17T00:00:00+08:00").unix(),
    estimated_end: dayjs("2024-12-15T23:59:59+08:00").unix(),
    end: null,
    status: "active",
  };
  await tournament.insertOne(tournamentData);

  return tournamentData;
}

async function insertStages(db, tournamentId) {
  const data = [
    {
      name: "小組積分賽",
      en_name: "Group Stage",
      tournament_id: tournamentId,
      start: dayjs("2024-10-21T00:00:00+08:00").unix(),
      estimated_end: dayjs("2024-12-08T23:59:59+08:00").unix(),
      end: null,
      status: "active",
      sub_stages: [],
    },
    {
      name: "決賽",
      en_name: "Final Stage",
      tournament_id: tournamentId,
      start: null,
      estimated_end: null,
      end: null,
      status: "not started",
      sub_stages: [],
    },
  ];

  // 1
  for (const d of data) {
    await db.collection("stage").insertOne(d);
    await db
      .collection("tournament")
      .updateOne({ _id: tournamentId }, { $push: { stages: d } });
  }

  return await db
    .collection("stage")
    .find({ tournament_id: tournamentId })
    .toArray();
}

async function insertSubStage(db, stageId, data) {
  const subStage = db.collection("sub_stage");
  const subStageData = {
    stage_id: stageId,
    ...data,
  };
  await subStage.insertOne(subStageData);
  await db
    .collection("stage")
    .updateOne({ _id: stageId }, { $push: { sub_stages: subStageData } });

  // return subStageData;
  return await db
    .collection("sub_stage")
    .findOne({ stage_id: stageId, name: data.name });
}

async function insertTeams(db, data) {
  const teams = db.collection("team");
  await teams.insertMany(data);

  return db.collection("team").find().toArray();
}

async function arrangeTeams(db, subStageId, teamIds) {
  await db
    .collection("sub_stage")
    .updateOne({ _id: subStageId }, { $set: { teams: teamIds } });
}

async function insertPlayer(db, data) {
  const player = db.collection("player");
  const playerData = {
    ...data,
  };
  await player.insertOne(playerData);

  return playerData;
}

async function dropDb(db) {
  await db.dropDatabase();
}

async function main() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // 取得 db
  const db = await setUpDb();

  await clearDb(db);

  // 建立 Tournament data
  const tournament = await insertTournament(db);

  // 取得 Tournament 的 id
  const tournamentId = tournament._id;
  console.log(`Tournament data created with id: ${tournamentId}`);

  // 建立 Stage data
  const stages = await insertStages(db, tournamentId);
  console.log(`Stage data created with id: ${stages.map((s) => s._id)}`);
  // console.log(stages);

  // await new Promise((resolve) => {
  //   console.log("\n\n\n");
  //   rl.question("Do you want to stop here? (yes/no): ", (answer) => {
  //     if (answer === "yes") {
  //       console.log("Seeds ran successfully!");
  //       rl.close();
  //       process.exit(0);
  //     }
  //     resolve();
  //   });
  // });

  // 建立 SubStage data
  const groupStage = stages.find((stage) => stage.name === "小組積分賽");
  const groupA = await insertSubStage(db, groupStage._id, {
    name: "A 組",
    en_name: "Group A",
    start: dayjs("2024-10-21T00:00:00+08:00").unix(),
    estimated_end: dayjs("2024-12-08T23:59:59+08:00").unix(),
    end: null,
    status: "active",
    teams: [],
  });
  const groupB = await insertSubStage(db, groupStage._id, {
    name: "B 組",
    en_name: "Group B",
    start: dayjs("2024-10-21T00:00:00+08:00").unix(),
    estimated_end: dayjs("2024-12-08T23:59:59+08:00").unix(),
    end: null,
    status: "active",
    teams: [],
  });

  console.log(`SubStage data created with id: ${groupA._id}, ${groupB._id}`);
  // console.log(groupA);
  // console.log(groupB);

  // await new Promise((resolve) => {
  //   console.log("\n\n\n");
  //   rl.question("Do you want to stop here? (yes/no): ", (answer) => {
  //     if (answer === "yes") {
  //       console.log("Seeds ran successfully!");
  //       rl.close();
  //       process.exit(0);
  //     }
  //     resolve();
  //   });
  // });

  // 建立 Team data
  const { teams } = require("./data.json");
  const teamData = await insertTeams(db, teams);
  console.log(`Team data created with id: ${teamData._id}`);
  // console.log(teamData);

  // await new Promise((resolve) => {
  //   console.log("\n\n\n");
  //   rl.question("Do you want to stop here? (yes/no): ", (answer) => {
  //     if (answer === "yes") {
  //       console.log("Seeds ran successfully!");
  //       rl.close();
  //       process.exit(0);
  //     }
  //     resolve();
  //   });
  // });

  // arrange teams to sub stages
  const groupATeamIds = await db
    .collection("team")
    .find({ seed: { $in: [1, 4, 5, 8] } })
    .map((team) => team._id)
    .toArray();
  const groupBTeamIds = await db
    .collection("team")
    .find({ seed: { $in: [2, 3, 6, 7] } })
    .map((team) => team._id)
    .toArray();

  await arrangeTeams(db, groupA._id, groupATeamIds);
  await arrangeTeams(db, groupB._id, groupBTeamIds);

  console.log("Teams arranged to sub stages successfully!");
  // console.log(
  //   await db
  //     .collection("sub_stage")
  //     .find({ stage_id: groupStage._id })
  //     .toArray()
  // );

  // await new Promise((resolve) => {
  //   console.log("\n\n\n");
  //   rl.question("Do you want to stop here? (yes/no): ", (answer) => {
  //     if (answer === "yes") {
  //       console.log("Seeds ran successfully!");
  //       rl.close();
  //       process.exit(0);
  //     }
  //     resolve();
  //   });
  // });

  // 建立 Player data
  const { players } = require("./data.json");
  await Promise.all(
    players.map(async (player, i) => {
      const tier = (i + 1) % 8 === 0 ? 8 : (i + 1) % 8;
      const team = Math.floor(i / 8) + 1;
      const playerData = await insertPlayer(db, { tier, team, ...player });
      // update team
      await db
        .collection("team")
        .updateOne({ seed: team }, { $push: { lineup: playerData } });
    })
  );

  console.log("Player data created successfully!");
  console.log(
    await db
      .collection("team")
      .find({ seed: { $in: [1, 2] } })
      .project({ lineup: 1 })
      .map((team) => team.lineup.sort((a, b) => a.tier - b.tier))
      .toArray()
  );

  await new Promise((resolve) => {
    console.log("\n\n\n");
    rl.question("Do you want to stop here? (yes/no): ", (answer) => {
      if (answer === "yes") {
        console.log("Seeds ran successfully!");
        rl.close();
        process.exit(0);
      }
      resolve();
    });
  });

  // TODO: 建立 Series data
  // 建立 Series data

  // 建立 Match data

  // 建立 Roster data

  console.log("Seeds ran successfully!");

  // prompt user to input
  // if user input "drop", the db will be dropped
  // otherwise, the process will exit

  // 3 blank lines as separation
  console.log("\n\n\n");

  rl.question(
    "Do you want to drop the database? (yes/no): ",
    async (answer) => {
      if (answer === "yes") {
        await dropDb(db);
        console.log("Database dropped successfully");
      }

      rl.close();
      process.exit(0);
    }
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
