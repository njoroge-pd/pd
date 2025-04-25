require("dotenv").config(); // ← ADD THIS
const { connectDB, mongoose } = require("../config/db");
const Candidate = require("../models/Candidate");

const candidates = [
  { name: "Mwangi Njoroge", position: "president" },
  { name: "Achieng Otieno", position: "president" },
  { name: "Mutua Wambua", position: "president" },

  { name: "Nyambura Muthoni", position: "vicePresident" },
  { name: "Kiptoo Langat", position: "vicePresident" },
  { name: "Nasimiyu Barasa", position: "vicePresident" },

  { name: "Kamau Karanja", position: "secretaryGeneral" },
  { name: "Wanjiku Nduta", position: "secretaryGeneral" },
  { name: "Omondi Odhiambo", position: "secretaryGeneral" },

  { name: "Makena Mwende", position: "financeSecretary" },
  { name: "Chesire Kipruto", position: "financeSecretary" },
  { name: "Amina Abdi", position: "financeSecretary" },
];

const seed = async () => {
  try {
    await connectDB();

    await Candidate.deleteMany({});
    await Candidate.insertMany(candidates);

    console.log("✅ Database seeded.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
};

seed();
