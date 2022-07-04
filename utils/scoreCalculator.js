const { connectDB } = require('../db');
const { Group } = require('../models/groups');
const { Score } = require('../models/score');
const _ = require('lodash');
const datefns = require('date-fns');
const { Weekly } = require('../models/weekly');
// connectDB();

// /**
//  * @function getWeeklyGameNumber(date)
//  * @param {Date=} date
//  * @returns {Object<Number>} {firstGameNumber, lastGameNumber}
//  * @description Returns the current week's start and end game number.
//  * @example getWeeklyGameNumber();
//  * // returns { firstGameNumber: 1, lastGameNumber: 7 }
//  * @example getWeeklyGameNumber(new Date('2020-06-19'));
//  * // returns { firstGameNumber: 201, lastGameNumber: 207 }
//  */

// const getWeeklyGameNumber = (date) => {
//   const today = new Date() || date;
//   const wordleStartingDate = new Date('June 19, 2021');
//   const weekStartsOn = datefns.startOfWeek(today, { weekStartsOn: 1 }); // Get start of week
//   const weekEndsOn = datefns.endOfWeek(today, { weekStartsOn: 1 }); // Get end of week
//   const oneDay = 1000 * 60 * 60 * 24; // Miliiseconds * Seconds * Minutes * Hours = 1 day

//   const firstGameNumber = datefns.differenceInDays(
//     weekStartsOn,
//     wordleStartingDate
//   );
//   const lastGameNumber = datefns.differenceInCalendarDays(
//     weekEndsOn,
//     wordleStartingDate
//   );
//   return { firstGameNumber, lastGameNumber };
// };

/**
 * @function getWeekLyGameNumber(gameNumber)
 * @param {Number} gameNumber
 * @returns {Object<Number>} {firstGameNumber, lastGameNumber}
 * @description Returns the current week's start and end game number.
 * @example getWeeklyGameNumber(375);
 * //returns { firstGameNumber: 373, lastGameNumber: 379 }
 */

const getWeeklyGameNumber = (gameNumber) => {
  const firstGameNumber = gameNumber - ((gameNumber - 2) % 7);
  const lastGameNumber = firstGameNumber + 6;

  return { firstGameNumber, lastGameNumber };
};

// getWeeklyGameNumber()

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
    userAvgScore = _.orderBy(userAvgScore, ['avgScore'], ['asc']);
    // console.log('loggin weekly score\n', userAvgScore, '\n********');
    return Promise.resolve(userAvgScore);
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * @function getWeekStartAndEnd(date)
 * @param {Date=} date
 * @returns {Object<Date>} {weekStart, weekEnd}
 * @description Returns the start and end date of the current week.
 * @example getWeekStartAndEnd();
 * // returns { weekStart: 2020-06-19, weekEnd: 2020-06-25 }
 * @example getWeekStartAndEnd(new Date('2020-06-19'));
 * // returns { weekStart: 2020-06-19, weekEnd: 2020-06-25 }
 */

function getWeekStartAndEnd(date) {
  const today = new Date() || date; // Get current date if not provided
  const weekStartsOn = datefns.startOfWeek(today, { weekStartsOn: 1 }); // Get start of week
  const weekEndsOn = datefns.endOfWeek(today, { weekStartsOn: 1 }); // Get end of week
  return { weekStart: weekStartsOn, weekEnd: weekEndsOn };
}

/**
 * @function getWeeklyScore()
 * @param {String} groupId
 * @param {Number} gameNumber
 * @returns {Promise<Array>} userId, _serialized, score
 */
const getWeeklyScore = async (groupId, gameNumber) => {
  try {
    const { weekStart, weekEnd } = getWeekStartAndEnd();
    const { firstGameNumber, lastGameNumber } = getWeeklyGameNumber(gameNumber);

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
      gameNumber: { $gte: firstGameNumber, $lte: lastGameNumber },
    }).select(' userId score'); // only select userId and score
    // console.log('allScore', allScore);
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
      firstGameNumber,
      lastGameNumber,
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
        firstGameNumber,
        lastGameNumber,
        scores: [...userweeklyAvgScore],
      });
      await newData.save();
    }

    // Order the returning array in descending order
    userweeklyAvgScore = _.orderBy(userweeklyAvgScore, ['score'], ['desc']);
    // console.log('loggin weekly score\n', userweeklyAvgScore, '\n********');
    return Promise.resolve({
      userweeklyAvgScore,
      firstGameNumber,
      lastGameNumber,
    });
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
module.exports = { getAvgScore, getWeeklyScore, getWeeklyGameNumber };
