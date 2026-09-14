import dotenv from "dotenv";
dotenv.config(); // DOIT ETRE EN PREMIER

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Importation de vos modules personnalisés
import { analyzeBibleText } from "./src/analyzer.js";
import { findMatchingProverbs, findPericopeByText, insertProverb } from "./src/searchEngine.js";

import { preachBibleText } from "./src/preacher.js";

// ✅ NOUVEAUX IMPORTS POUR LA PERICOPE
import { insertPericope } from "./src/ajoutPericope.js";

// import { teachBibleText } from "./src/teacher.js";
// import { arrangeBibleText } from "./src/arranger.js";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARES ===
app.use(cors()); // Autorise votre page HTML front-end à appeler cette API
app.use(express.json()); // Permet à Express de lire le format JSON envoyé par le Front-end
app.use(express.static('public'))

// === CONNEXION MONGODB ===
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connexion réussie à MongoDB"))
  .catch((err) => console.error("❌ Échec de la connexion MongoDB :", err));

// === LA ROUTE EXPRESS COMPLETE ===
//app.post("/api/analyze", async (req, res) => {
app.post('/api/analyse', async (req, res) => {
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

app.post('/api/prediction', async (req, res) => {
  try {
    const { userBibleText, actionRequested } = req.body;
    
    // 1. Validation de sécurité de l'entrée
    if (!userBibleText || userBibleText.trim() === "") {
      return res.status(400).json({ success: false, message: "Le texte biblique est requis." });
    }

    const currentAction = actionRequested;
    let resultPreacher = null;

    if (currentAction === "predire") {
      console.log("🔍 Recherche des textes de la péricope associés dans MongoDB...");
      const pericopeData = await findPericopeByText(userBibleText);
      console.log("Le pericope extrait est composé de :", pericopeData);

      console.log("🤖 Appel du module de génération homilétique (preacher.js)...");
      resultPreacher = await preachBibleText(userBibleText, pericopeData);
    } else {
      return res.status(400).json({ success: false, message: "Action non prise en charge sur cette route." });
    }

    // 2. ÉTAPE DE LIAISON CRUCIALE : Récupération automatique des ohabolana correspondants
    const conceptsToSearch = resultPreacher.motsCles || [];
    console.log(`🍃 Recherche dans MongoDB des Ohabolana liés aux thèmes : [${conceptsToSearch.join(", ")}]`);
    
    const matchedProverbs = await findMatchingProverbs(conceptsToSearch);
    console.log(`📦 ${matchedProverbs.length} proverbe(s) malgache(s) trouvé(s) pour le sermon.`);

    // 3. ENVOI DE L'OBJET GLOBAL STRUCTURÉ AU FRONTEND
    return res.status(200).json({
      success: true, // Garantit le passage de la condition if(data.success) du front
      action: currentAction,
      html: resultPreacher.html, 
      genre_litteraire: resultPreacher.genre_litteraire,
      interrelations_textes: resultPreacher.interrelations_textes,
      type_predication: resultPreacher.type_predication,
      illustrations_malgaches: matchedProverbs // Jointure réussie !
    });

  } catch (error) {
    console.error("❌ Erreur critique sur la route /api/prediction :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Une erreur interne est survenue lors de la génération homilétique." 
    });
  }
});

// ✅ ROUTE AJOUTPERICOPE CORRIGÉE : Validation assouplie (Seules les lectures n°1 sont obligatoires)
app.post('/api/ajoutPericope', async (req, res) => {
  try {
    const { 
      dimanche_ou_fete, 
      ancien_testament, 
      epitre_1, epitre_2, epitre_3,
      evangile_1, evangile_2, evangile_3 
    } = req.body;

    // Seuls les textes de base fondamentaux de la liturgie sont exigés
    if (!dimanche_ou_fete || !ancien_testament || !epitre_1 || !evangile_1) {
      return res.status(400).json({ 
        success: false, 
        message: "Le nom de la fête, l'Ancien Testament, l'Épître 1 et l'Évangile 1 sont obligatoires." 
      });
    }

    // Transmission sécurisée vers le gestionnaire d'insertion
    const result = await insertPericope({ 
      dimanche_ou_fete, 
      ancien_testament, 
      epitre_1: epitre_1 || "", 
      epitre_2: epitre_2 || "", 
      epitre_3: epitre_3 || "",
      evangile_1: evangile_1 || "", 
      evangile_2: evangile_2 || "", 
      evangile_3: evangile_3 || ""
    });
    
    return res.status(200).json(result);

  } catch (error) {
    console.error("❌ Erreur critique sur la route /api/ajoutPericope :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Une erreur interne est survenue lors de l'importation de la péricope." 
    });
  }
});

// 2. Ajoutez cette nouvelle route POST juste en dessous de votre route /api/ajoutPericope
app.post('/api/ajoutProverbe', async (req, res) => {
  try {
    const { proverbe_malagasy, traduction_francaise, concepts_cles, explication_culturelle } = req.body;

    console.log("Les elements postés de frontend sont:proverbe_malagasy:", proverbe_malagasy, "traduction_francaise:", traduction_francaise, "concepts_cles:", concepts_cles, " et l'explication_culturelle:",  explication_culturelle);

    if (!proverbe_malagasy || !traduction_francaise || !concepts_cles || !explication_culturelle) {
      return res.status(400).json({ success: false, message: "Tous les champs d'étude du Ohabolana sont obligatoires." });
    }

    // Lancement de l'insertion Mongoose
    const result = await insertProverb({
      proverbe_malagasy,
      traduction_francaise,
      concepts_cles,
      explication_culturelle
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error("❌ Erreur critique sur la route /api/ajoutProverbe :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Une erreur interne s'est produite lors de l'insertion du ohabolana." 
    });
  }
});

// 1. Ajoutez l'importation en haut de votre index.js
import { analyzeProverbWithAi } from "./src/proverbAnalyzer.js";

// 2. Ajoutez cette route juste au-dessus de votre route /api/ajoutProverbe
app.post('/api/analyseProverbe', async (req, res) => {
  try {
    const { malagasyText } = req.body;
    if (!malagasyText || malagasyText.trim() === "") {
      return res.status(400).json({ success: false, message: "Le texte malgache est requis." });
    }

    console.log(`🤖 Demande d'analyse IA pour le ohabolana : "${malagasyText.substring(0, 30)}..."`);
    const aiResult = await analyzeProverbWithAi(malagasyText);

    return res.status(200).json({
      success: true,
      traduction_francaise: aiResult.traduction_francaise,
      concepts_cles: aiResult.concepts_cles,
      explication_culturelle: aiResult.explication_culturelle
    });

  } catch (error) {
    console.error("❌ Erreur sur la route /api/analyseProverbe :", error);
    return res.status(500).json({ success: false, message: "L'IA n'a pas pu traiter ce proverbe." });
  }
});

// === DEMARRAGE DU SERVEUR ===
app.listen(PORT, () => {
  console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});