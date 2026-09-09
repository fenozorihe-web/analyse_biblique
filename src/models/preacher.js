import mongoose from "mongoose";

// Modèle imaginaire pour vos péricopes (à adapter selon votre structure de collection)
const PericopeSchema = new mongoose.Schema({
  dimanche_ou_fete: String,
  ancien_testament: String,
  epitre: String,
  evangile: String,
  mots_cles: [String]
});

const Pericope = mongoose.models.Pericope || mongoose.model("Pericope", PericopeSchema);

export default Pericope;