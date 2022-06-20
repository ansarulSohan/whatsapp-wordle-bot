const { connectDB } = require('../db');
const { Group } = require('../models/groups');
const { Score } = require('../models/score');
const _ = require('lodash');
const datefns = require('date-fns');
const { Weekly } = require('../models/weekly');
connectDB();

const getAvgScore = async (groupId) => {
  console.log(groupId);
  const { participants } = await Group.findOne({ groupId }).select(
    'participants.user'
  );
  // console.log({ participants });
  const users = participants.map((x) => x.user);
  let userAvgScore = [];
  // console.log(score);
  // score = score.map(x => {return {score: x.score, userId: x.userId}});
  let allScore = await Score.find({ userId: { $in: users } }).select(
    ' userId score'
  );
  for (let i = 0; i < users.length; i++) {
    // console.log(score);
    let score = allScore.filter((x) => x.userId === users[i]);
    console.log(score);
    // console.log(score);
    // score = score.map(x => {return {score: x.score, userId: x.userId}});
    score = score.map((x) => x.score);
    // console.log(score);
    let avgScore = parseInt(parseInt(_.sum(score)) / score.length);
    avgScore
      ? userAvgScore.push({ userId: users[i], avgScore })
      : userAvgScore.push({ userId: users[i], avgScore: 0 });
  }
  // console.log(userAvgScore);
  userAvgScore = _.chunk(_.orderBy(userAvgScore, ['avgScore'], ['desc']), 3);
  // console.log(userAvgScore[0]);
  return userAvgScore[0];
};
// ;(async() => {
//   await avgCalculator('120363023814250177@g.us');
// })();

const getWeeklyScore = async (groupId) => {
  const weekStart = new Date(
    datefns.startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekEnd = new Date(datefns.endOfWeek(new Date(), { weekStartsOn: 1 }));
  console.log(weekStart, weekEnd);
  const { participants } = await Group.findOne({ groupId }).select(
    'participants.user'
  );
  console.log({ participants });
  const users = participants.map((x) => x.user);
  let userweeklyAvgScore = [];
  // console.log(score);
  // score = score.map(x => {return {score: x.score, userId: x.userId}});
  let allScore = await Score.find({
    userId: { $in: users },
    date: {
      $gte: weekStart,
      $lt: weekEnd,
    },
  }).select(' userId score');
  // console.log('*******');
  // console.log(allScore);
  // console.log('*******');
  for (let i = 0; i < users.length; i++) {
    // console.log(score);
    let score = allScore.filter((x) => x.userId === users[i]);
    console.log(score);
    // console.log(score);
    // score = score.map(x => {return {score: x.score, userId: x.userId}});
    score = score.map((x) => x.score);
    // console.log(score);
    let weeklyAvgScore = parseInt(parseInt(_.sum(score)) / score.length);
    weeklyAvgScore
      ? userweeklyAvgScore.push({ userId: users[i], score: weeklyAvgScore })
      : userweeklyAvgScore.push({ userId: users[i], score: 0 });
  }

  const weeklyScoreFromDb = await Weekly.findOne({
    groupId,
    weekStart: { $gte: weekStart },
    weekEnd: { $lt: weekEnd },
  });
  if (weeklyScoreFromDb) {
    weeklyScoreFromDb.scores = [...userweeklyAvgScore];
    await weeklyScoreFromDb.save();
  } else {
    const newData = new Weekly({
      groupId,
      weekStart,
      weekEnd,
      scores: [...userweeklyAvgScore],
    });
    await newData.save();
  }
  // console.log(userweeklyAvgScore);
  userweeklyAvgScore = _.orderBy(
    userweeklyAvgScore,
    ['weeklyAvgScore'],
    ['desc']
  );
  // console.log(userweeklyAvgScore);
  return userweeklyAvgScore;
};
module.exports = { getAvgScore, getWeeklyScore };
