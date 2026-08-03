const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    // Authentication
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    // Profile Photo
    profilePhoto: {
        type: String,
        default: ""
    },

    // Location
    city: String,
    locality: String,
    budget: Number,

    // Gender
    gender: String,
    preferredGender: String,

    // Lifestyle
    foodPreference: String,
    socialLevel: Number,
    guestFrequency: String,
    cleanliness: Number,
    sleepCondition: String,
    noiseHabit: String,

    // Smoking & Drinking
    smoking: String,
    okayWithSmoker: String,
    drinking: String,
    okayWithDrinker: String,

    // Work
    jobStatus: String,
    preferredJobStatus: String,
    dailySchedule: String,
    okayDifferentSchedule: String,
    workMode: String,
    quietDuringWork: String,

    // Non Negotiables
    nonNegotiables: [String]
},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
