// server/seedTherapists.js
const mongoose = require("mongoose");
const Therapist = require("./models/Therapist");
require("dotenv").config();

const therapists = [
  {
    name: "Dr. Sarah Johnson",
    specialization: "Cognitive Behavioral Therapy"
  },
  {
    name: "Dr. Michael Chen",
    specialization: "Family Counseling"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Therapist.deleteMany({});
    await Therapist.insertMany(therapists);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();