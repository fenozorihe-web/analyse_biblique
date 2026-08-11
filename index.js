import dotenv from "dotenv";
dotenv.config(); // DOIT ETRE EN PREMIER

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Importation de vos modules personnalisés
import { analyzeBibleText } from "./src/analyzer.js";
import { findMatchingProverbs } from "./src/searchEngine.js";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARES ===
app.use(cors()); // Autorise votre page HTML front-end à appeler cette API
app.use(express.json()); // Permet à Express de lire le format JSON envoyé par le Front-end

// === CONNEXION MONGODB ===
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connexion réussie à MongoDB"))
  .catch((err) => console.error("❌ Échec de la connexion MongoDB :", err));

// === LA ROUTE EXPRESS COMPLETE ===
app.post("/api/analyze", async (req, res) => {
  try {
    // 1. Récupération du texte biblique envoyé par le Front-end
    const { userBibleText } = req.body;

    if (!userBibleText || userBibleText.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Le texte biblique est requis." 
      });
    }

    console.log(`\n📥 Nouvelle requête reçue pour : "${userBibleText.substring(0, 30)}..."`);

    // 2. Étape 1 : Appel à l'IA pour l'exégèse et les concepts
    console.log("🤖 Appel à l'API OpenAI (Analyse exégétique)...");
    const aiAnalysis = await analyzeBibleText(userBibleText);

    // 3. Étape 2 : Extraction des concepts pour la recherche
    const conceptsToSearch = aiAnalysis.concepts_abstraits_recherche;
    console.log(`🔍 Mots-clés extraits pour MongoDB : [${conceptsToSearch.join(", ")}]`);

    // 4. Étape 3 : Recherche des ohabolana dans la base de données
    console.log("🍃 Recherche des ohabolana correspondants dans MongoDB...");
    const matchedProverbs = await findMatchingProverbs(conceptsToSearch);
    console.log(`📦 ${matchedProverbs.length} proverbe(s) malgache(s) trouvé(s).`);

    // 5. Étape 4 : Envoi de la réponse structurée finale au Front-end
    return res.status(200).json({
      success: true,
      genre_litteraire: aiAnalysis.genre_litteraire,
      methode_analyse_recommandee: aiAnalysis.methode_analyse_recommandee,
      exegese: aiAnalysis.mots_cles_originaux,
      theologie: aiAnalysis.cles_theologiques,
      // NOUVELLES LIGNES À RAJOUTER SUR LE SERVEUR :
      pertinence_canonique: aiAnalysis.pertinence_canonique,
      connexion_lutherienne: aiAnalysis.connexion_lutherienne,
      illustrations_malgaches: matchedProverbs
    });

  } catch (error) {
    console.error("❌ Erreur serveur lors du traitement :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur interne est survenue durant l'analyse."
    });
  }
});

// === DEMARRAGE DU SERVEUR ===
app.listen(PORT, () => {
  console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});