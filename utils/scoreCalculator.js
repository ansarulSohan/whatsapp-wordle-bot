const { connectDB } = require('../db');
const { Group } = require('../models/groups');
const { Score } = require('../models/score');
const _ = require('lodash');
const datefns = require('date-fns');
const { Weekly } = require('../models/weekly');
// connectDB();

/**
 *
 * @function getAvgScore(groupId)
 * @param {String} groupId
 * @returns {Promise<Array>} userId, _serialized, avgScore
 */
const getAvgScore = async (groupId) => {
  try {
    console.log('Group ID: ', groupId);
    // Get all participants of the group.
    const { participants } = await Group.findOne({ groupId }).select(
      'participants.user participants._serialized'
    );

    // map all users and _serialized id to two different arrays.
    const users = participants.map((x) => x.user);
    const _serialized = participants.map((x) => x._serialized);

    // Array of calculated scores, initialized.
    let userAvgScore = [];

    // Find all scored of the group from db.
    let allScore = await Score.find({ groupId, userId: { $in: users } }).select(
      ' userId score'
    ); // only select userId and score

    // Loop through the returned collections
    for (let i = 0; i < users.length; i++) {
      // Filter all scores of an individual
      let score = allScore.filter((x) => x.userId === users[i]);

      // Map only the score
      score = score.map((x) => x.score);

      // calculate the average
      let avgScore = score.length
        ? parseFloat((_.sum(score) / score.length).toFixed(2))
        : 0;

      userAvgScore.push({
        userId: users[i],
        _serialized: _serialized[i],
        avgScore,
      });
    }
    // sort the array in descending order according to the avgScore.
    userAvgScore = _.orderBy(userAvgScore, ['avgScore'], ['desc']);
    // console.log('loggin weekly score\n', userAvgScore, '\n********');
    return Promise.resolve(userAvgScore);
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * @function getWeeklyScore(groupId)
 * @param {String} groupId
 * @returns {Promise<Array>} userId, _serialized, score
 */
const getWeeklyScore = async (groupId) => {
  try {
    //calculate weekStart
    const weekStart = new Date(
      datefns.startOfWeek(new Date(), { weekStartsOn: 1 })
    );

    //Calculate weekend
    const weekEnd = new Date(
      datefns.endOfWeek(new Date(), { weekStartsOn: 1 })
    );

    // Get all participants of the group.
    const { participants } = await Group.findOne({ groupId }).select(
      'participants.user participants._serialized'
    );

    // map all users and _serialized id to two different arrays.
    const users = participants.map((x) => x.user);
    const _serialized = participants.map((x) => x._serialized);

    // Array of calculated scores, initialized.
    let userweeklyAvgScore = [];

    // Find all scored of the group from db within date range.
    let allScore = await Score.find({
      groupId,
      userId: { $in: users },
      date: {
        $gte: weekStart,
        $lt: weekEnd,
      },
    }).select(' userId score'); // only select userId and score

    // Loop through the returned collections
    for (let i = 0; i < users.length; i++) {
      // Filter all scores of an individual
      let score = allScore.filter((x) => x.userId === users[i]);

      // Map only the score
      score = score.map((x) => 7 - x.score);

      // calculate the weekly average
      let weeklyAvgScore = _.sum(score);

      userweeklyAvgScore.push({ userId: users[i], score: weeklyAvgScore });
    }

    // Check if the group info already exists
    const weeklyScoreFromDb = await Weekly.findOne({
      groupId,
      weekStart: { $gte: weekStart },
      weekEnd: { $lte: weekEnd },
    });

    // if Exists
    if (weeklyScoreFromDb) {
      // Update database
      await Weekly.findOneAndUpdate(
        { groupId },
        { $set: { scores: [...userweeklyAvgScore] } }
      );
    } else {
      // Else, save a new Entry
      const newData = new Weekly({
        groupId,
        weekStart,
        weekEnd,
        scores: [...userweeklyAvgScore],
      });
      await newData.save();
    }

    // Order the returning array in descending order
    userweeklyAvgScore = _.orderBy(userweeklyAvgScore, ['score'], ['desc']);
    // console.log('loggin weekly score\n', userweeklyAvgScore, '\n********');
    return Promise.resolve(userweeklyAvgScore);
  } catch (error) {
    return Promise.reject(error);
  }
};

// (async () => {
//   const allTime = await getAvgScore('120363026841352920@g.us');
//   const weekly = await getWeeklyScore('120363026841352920@g.us');
//   console.log(allTime);
//   console.log(weekly);
//   return;
// })();
module.exports = { getAvgScore, getWeeklyScore };
