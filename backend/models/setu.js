const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {Object} ISETU
 * @property {import('mongoose').Types.ObjectId} _id - SETU record ID
 * @property {string} unit_code - Unit code
 * @property {string} unit_name - Unit name
 * @property {string} code - Extended code with location and delivery info
 * @property {string} Season - Season (e.g., "2019_S1")
 * @property {number} Responses - Number of students who completed the SETU
 * @property {number} Invited - Total students invited
 * @property {number} [Response_Rate] - Response rate percentage
 * @property {number} [Level] - Unit level (1-4)
 * @property {import('mongoose').Types.Array<number>} [I1] - "The learning outcomes for this unit were clear to me" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I2] - "The instructions for Assessment tasks were clear to me" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I3] - "The assessment allowed me to demonstrate learning outcomes" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I4] - "The feedback helped me achieve learning outcomes" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I5] - "The resources helped me achieve learning outcomes" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I6] - "The activities helped me achieve learning outcomes" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I7] - "I attempted to engage to the best of my ability" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I8] - "Overall, I was satisfied with this unit" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I9] - "I could see how topics were related" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I10] - "The online resources helped me succeed" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I11] - "The workload was manageable" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I12] - "The practical/tutorial exercises assisted learning" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I13] - "Pre-class activities were useful" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [agg_score] - Aggregate score [mean aggregate, median aggregate]
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

const setuSchema = new Schema(
  {
    unit_code: { type: String, required: true, index: true },
    unit_name: { type: String, required: true },
    code: { type: String, required: true },
    Season: { type: String, required: true },
    Responses: { type: Number, required: true },
    Invited: { type: Number, required: true },
    Response_Rate: { type: Number },
    Level: { type: Number },
    /**
     * Evaluation metrics for SETU (I1 - I13)
     *
     * Array will have two values: [median/5, mean/5]
     */
    I1: { type: [Number] },
    I2: { type: [Number] },
    I3: { type: [Number] },
    I4: { type: [Number] },
    I5: { type: [Number] },
    I6: { type: [Number] },
    I7: { type: [Number] },
    I8: { type: [Number] },
    I9: { type: [Number] },
    I10: { type: [Number] },
    I11: { type: [Number] },
    I12: { type: [Number] },
    I13: { type: [Number] },
    agg_score: { type: [Number] },
  },
  { timestamps: true }
);

// Create compound index for faster queries
setuSchema.index({ unit_code: 1, Season: 1 });

// Static method to get SETU data by unit code
setuSchema.statics.findByUnitCode = function (unitCode) {
  return this.find({ unit_code: unitCode }).sort({ Season: -1 });
};

// Static method to get average SETU scores for a unit
setuSchema.statics.getAverageScores = function (unitCode) {
  return this.aggregate([
    { $match: { unit_code: unitCode } },
    {
      $group: {
        _id: '$unit_code',
        averageAggScore: { $avg: { $arrayElemAt: ['$agg_score', 0] } },
        totalResponses: { $sum: '$Responses' },
      },
    },
  ]);
};

const SETU = mongoose.model('SETU', setuSchema);
module.exports = SETU;
