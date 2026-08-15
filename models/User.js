const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
   name: {
    type: String,
    required: true,
    trim: true
   },
   email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
   },
   password: {
    type: String,
    required: true
   },
   profilePhoto: {
    type: String,
    default: ""
   },
   city: String,
   locality: String,
   budget: Number,
   gender: String,
   preferredGender: String,
   foodPreference: String,
   socialLevel: Number,
   guestFrequency: String,
   cleanliness: Number,
   sleepCondition: String,
   noiseHabit: String,
   smoking: String,
   okayWithSmoker: String,
   drinking: String,
   okayWithDrinker: String,
   jobStatus: String,
   preferredJobStatus: String,
   dailySchedule: String,
   okayDifferentSchedule: String,
   workMode: String,
   quietDuringWork: String,
   nonNegotiables: [String],
   compatibilityScore: {
    type: Number,
    default: 0
   }
},
{
    timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;
