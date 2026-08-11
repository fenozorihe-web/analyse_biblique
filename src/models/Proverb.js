import mongoose from "mongoose";

// Définition de la structure (Schema) d'un proverbe malgache
const proverbSchema = new mongoose.Schema(
  {
    // Le proverbe original en langue malagasy
    proverbe_malagasy: {
      type: String,
      required: [true, "Le texte du ohabolana original est obligatoire."],
      unique: true, // Évite de dupliquer accidentellement le même proverbe
      trim: true,
    },
    
    // Sa traduction littérale ou dynamique en français
    traduction_francaise: {
      type: String,
      required: [true, "La traduction en français est obligatoire."],
      trim: true,
    },
    
    // Tableau de concepts (Ex: ["paix", "fihavanana", "famille", "justice"])
    // C'est ce champ précis que l'IA va interroger
    concepts_cles: [
      {
        type: String,
        lowercase: true, // Force le stockage en minuscules pour faciliter les requêtes
        trim: true,
      },
    ],
    
    // L'arrière-plan culturel malgache ou l'usage traditionnel du proverbe
    explication_culturelle: {
      type: String,
      required: [true, "L'explication du contexte culturel est recommandée."],
      trim: true,
    },
    
    // Pistes ou correspondances de théologie chrétienne (Optionnel)
    applications_theologiques: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    // Ajoute automatiquement les champs 'createdAt' et 'updatedAt' à chaque document
    timestamps: true, 
  }
);

// --- OPTIMISATION POUR LES RECHERCHES ---
// Crée un index textuel combiné pour vous permettre de faire des recherches globales 
// de texte si vous décidez d'étendre votre moteur de recherche plus tard.
proverbSchema.index({ 
  concepts_cles: "text", 
  proverbe_malagasy: "text" 
});

// Compilation du schéma pour créer le modèle Mongoose
const Proverb = mongoose.model("Proverb", proverbSchema);

export default Proverb;