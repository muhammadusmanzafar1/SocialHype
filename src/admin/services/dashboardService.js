const AppVisit = require('../../socialhype/models/appVisit');
const User = require('../../auth/models/user');
const ExclusiveContentPurchase = require('../../socialhype/models/exclusiveContentPurchase');
const paidCommunity = require('../../socialhype/models/paidCommunity');
const AdRevenue = require('../../socialhype/models/adRevenue');
const moment = require('moment');


exports.getMetrics = async (query) => {
    const { range = 'day' } = query;
    const { currentStart, currentEnd, previousStart, previousEnd } = getTimeRange(range);
  
    const currentVisits = await AppVisit.countDocuments({ timestamp: { $gte: currentStart, $lte: currentEnd } });
    const previousVisits = await AppVisit.countDocuments({ timestamp: { $gte: previousStart, $lte: previousEnd } });
  
    const currentNewUsers = await User.countDocuments({ createdAt: { $gte: currentStart, $lte: currentEnd } });
    const previousNewUsers = await User.countDocuments({ createdAt: { $gte: previousStart, $lte: previousEnd } });
  
    const currentVerified = await User.countDocuments({ isEmailVerified: true, createdAt: { $gte: currentStart, $lte: currentEnd } });
    const currentNonVerified = await User.countDocuments({ isEmailVerified: false, createdAt: { $gte: currentStart, $lte: currentEnd } });
    const prevVerified = await User.countDocuments({ isEmailVerified: true, createdAt: { $gte: previousStart, $lte: previousEnd } });
    const prevNonVerified = await User.countDocuments({ isEmailVerified: false, createdAt: { $gte: previousStart, $lte: previousEnd } });
  
  
    const getPercentChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev * 100).toFixed(2);
    };
  
    return {
      visits: {
        count: currentVisits,
        change: getPercentChange(currentVisits, previousVisits)
      },
      newUsers: {
        count: currentNewUsers,
        change: getPercentChange(currentNewUsers, previousNewUsers)
      },
      verifiedUsers: {
        count: currentVerified,
        change: getPercentChange(currentVerified, prevVerified)
      },
      nonVerifiedUsers: {
        count: currentNonVerified,
        change: getPercentChange(currentNonVerified, prevNonVerified)
      }
    };
  };


const getTimeRange = (range) => {
    const now = new Date();
    let currentStart, previousStart, previousEnd;
  
    if (range === 'day') {
      currentStart = new Date(now.setHours(0, 0, 0, 0));
      previousEnd = new Date(currentStart.getTime() - 1);
      previousStart = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === 'week') {
      const day = now.getDay();
      currentStart = new Date(now.setDate(now.getDate() - day));
      currentStart.setHours(0, 0, 0, 0);
      previousEnd = new Date(currentStart.getTime() - 1);
      previousStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'month') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      previousEnd = new Date(currentStart.getTime() - 1);
      previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1);
    } else if (range === 'year') {
      currentStart = new Date(now.getFullYear(), 0, 1);
      previousEnd = new Date(currentStart.getTime() - 1);
      previousStart = new Date(previousEnd.getFullYear(), 0, 1);
    }
  
    return { currentStart, currentEnd: new Date(), previousStart, previousEnd };
  };
  

 exports.getGroupedUserStats = async (range, now) => {
    let groupFormat;
    let start;
    const match = {};
  
    switch (range) {
      case 'day':
        start = moment(now).startOf('day');
        groupFormat = '%Y-%m-%d';
        break;
      case 'week':
        start = moment(now).startOf('week');
        groupFormat = '%Y-%m-%d'; 
        break;
      case 'month':
        start = moment(now).startOf('month');
        groupFormat = '%Y-%m-%d';
        break;
      case 'year':
        start = moment(now).startOf('year');
        groupFormat = '%Y-%m';
        break;
      case 'all':
        start = moment('2000-01-01'); 
        groupFormat = '%Y-%m';
        break;
    }
  
    match.createdAt = { $gte: start.toDate(), $lte: now };
  
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: "$createdAt" }
          },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ];
  
    const result = await User.aggregate(pipeline);
  
    return result.map(r => ({ date: r._id, value: r.count }));
  };

 exports.getUserChangeStats = async (range, now) => {
    let currentStart, previousStart, previousEnd;
  
    if (range === 'day') {
      currentStart = moment(now).startOf('day');
      previousStart = moment(currentStart).subtract(1, 'day');
      previousEnd = moment(currentStart).subtract(1, 'second');
    } else if (range === 'week') {
      currentStart = moment(now).startOf('week');
      previousStart = moment(currentStart).subtract(1, 'week');
      previousEnd = moment(currentStart).subtract(1, 'second');
    } else if (range === 'month') {
      currentStart = moment(now).startOf('month');
      previousStart = moment(currentStart).subtract(1, 'month');
      previousEnd = moment(currentStart).subtract(1, 'second');
    } else if (range === 'year') {
      currentStart = moment(now).startOf('year');
      previousStart = moment(currentStart).subtract(1, 'year');
      previousEnd = moment(currentStart).subtract(1, 'second');
    } else {
      return { current: 0, previous: 0, change: 0 };
    }
  
    const [currentCount, previousCount] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: currentStart.toDate(), $lte: now } }),
      User.countDocuments({ createdAt: { $gte: previousStart.toDate(), $lte: previousEnd.toDate() } })
    ]);
  
    const change = previousCount === 0
      ? (currentCount > 0 ? 100 : 0)
      : (((currentCount - previousCount) / previousCount) * 100).toFixed(2);
  
    return {
      current: currentCount,
      previous: previousCount,
      change: parseFloat(change)
    };
  };
  

  exports.getTrafficByUser = async (query) => {
    const { range = 'all' } = query;
  
    const { startDate, endDate } = getDateRange(range);
    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      country: { $exists: true, $ne: null },
      gender: { $in: ['Male', 'Female'] }
    };
  
    const usersByCountry = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { country: "$country", gender: "$gender" },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.country",
          genderCounts: {
            $push: {
              gender: "$_id.gender",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      },
      {
        $project: {
          country: "$_id",
          _id: 0,
          genderSplit: {
            $arrayToObject: {
              $map: {
                input: "$genderCounts",
                as: "g",
                in: {
                  k: {
                    $cond: [
                      { $eq: ["$$g.gender", "Male"] },
                      "male",
                      "female"
                    ]
                  },
                  v: {
                    $round: [
                      { $multiply: [{ $divide: ["$$g.count", "$total"] }, 100] },
                      0
                    ]
                  }
                }
              }
            }
          }
        }
      }
    ]);
  
    const totalStats = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          genderBreakdown: {
            $push: {
              gender: "$_id",
              count: "$count"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalUsers: "$total",
          genderBreakdown: {
            $arrayToObject: {
              $map: {
                input: "$genderBreakdown",
                as: "g",
                in: {
                  k: {
                    $cond: [
                      { $eq: ["$$g.gender", "Male"] },
                      "male",
                      "female"
                    ]
                  },
                  v: {
                    $round: [
                      { $multiply: [{ $divide: ["$$g.count", "$total"] }, 100] },
                      0
                    ]
                  }
                }
              }
            }
          }
        }
      }
    ]);
  
    return {
      usersByCountry,
      totalUsers: totalStats[0]?.totalUsers || 0,
      genderPercentage: totalStats[0]?.genderBreakdown || { male: 0, female: 0 }
    };
  };

  const getDateRange = (range) => {
    const now = moment();
    let startDate;
  
    switch (range) {
      case "day":
        startDate = now.clone().startOf("day");
        break;
      case "week":
        startDate = now.clone().startOf("week");
        break;
      case "month":
        startDate = now.clone().startOf("month");
        break;
      case "year":
        startDate = now.clone().startOf("year");
        break;
      default:
        startDate = moment("2000-01-01");
    }
  
    return {
      startDate: startDate.toDate(),
      endDate: now.toDate()
    };
  };

  exports.getTopCountries = async () => {
    const topCountries = await AppVisit.aggregate([
      {
        $group: {
          _id: "$country",
          totalVisits: { $sum: 1 }
        }
      },
      { $sort: { totalVisits: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          country: "$_id",
          totalVisits: 1
        }
      }
    ]);
  
    return topCountries;
  };
  