import mongoose from "mongoose";

const PericopeSchema = new mongoose.Schema({
  dimanche_ou_fete: { type: String, required: true },
  ancien_testament: String,
  epitre_1: String,
  epitre_2: String,
  epitre_3: String,
  evangile_1: String,
  evangile_2: String,
  evangile_3: String,
  mots_cles: [String]
}, { 
  collection: 'pericopes' // Force Mongoose à cibler la collection en minuscules si nécessaire
});

const Pericope = mongoose.models.Pericope || mongoose.model("Pericope", PericopeSchema);

export default Pericope;