import mongoose from "mongoose";

const PericopeSchema = new mongoose.Schema({
  dimanche_ou_fete: { type: String, required: true },
  ancien_testament: String,
  epitre: String,
  evangile: String,
  mots_cles: [String]
}, { 
  collection: 'pericopes' // Force Mongoose à cibler la collection en minuscules si nécessaire
});

const Pericope = mongoose.models.Pericope || mongoose.model("Pericope", PericopeSchema);

export default Pericope;