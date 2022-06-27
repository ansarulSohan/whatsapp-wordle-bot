// const datefns = require('date-fns');
// console.log();

const { getWeeklyGameNumber } = require('./utils/scoreCalculator');

// const { connectDB } = require('./db');
// const { getWeeklyScore } = require('./utils/scoreCalculator');

// connectDB();

// (async () => {
//   const weekly = await getWeeklyScore('120363024452467021@g.us');
//   console.log(weekly);
// })();

const { firstGameNumber, lastGameNumber } = getWeeklyGameNumber(375);
console.log(firstGameNumber, lastGameNumber);
