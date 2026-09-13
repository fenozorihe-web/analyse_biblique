import Proverb from "./models/Proverb.js";
import Pericope from "./models/Pericope.js"; // ✅ CORRECTION : Ajout de "./"

/**
 * Recherche des ohabolana malgaches basés sur des concepts clés
 * @param {Array<string>} aiConcepts - Tableau de mots-clés (ex: ['paix', 'Paix'])
 * @returns {Promise<Array>} Liste des documents de proverbes trouvés
 */
export async function findMatchingProverbs(aiConcepts) {
  try {
    if (!aiConcepts || aiConcepts.length === 0) return [];

    // 1. Nettoyage des concepts (minuscules et suppression des espaces inutiles)
    const cleanedConcepts = aiConcepts.map(concept => 
      concept.toLowerCase().trim()
    );

    // 2. Requête avec l'opérateur $in
    const proverbs = await Proverb.find({
      concepts_cles: { $in: cleanedConcepts }
    })
    .limit(3) // Sécurité : limite stricte pour la mise en page
    .lean();  // Retourne du JSON brut ultra-rapide

    return proverbs;
  } catch (error) {
    console.error("Erreur dans findMatchingProverbs (searchEngine.js) :", error);
    throw error;
  }
}

/**
 * Trouve la péricope liturgique complète contenant le texte ou la référence recherchée
 * @param {string} userText - Référence ou texte brut soumis par l'utilisateur
 */
export async function findPericopeByText(userText) {
  try {
    if (!userText || userText.trim() === "") return null;

    let searchTerm = userText.trim();

    // Isolation du premier mot (Ex: "Matthieu") en cas de verset très long copié-collé
    if (searchTerm.length > 30) {
      const words = searchTerm.split(/[\s,.:]+/);
      searchTerm = words[0];
    }

    console.log(`🔎 Requête MongoDB sur la péricope pour le mot-clé : "${searchTerm}"`);

    // ✅ REQUÊTE MISE À JOUR : Recherche sur l'intégralité des nouveaux champs multiniveaux
    const pericope = await Pericope.findOne({
      $or: [
        { dimanche_ou_fete: { $regex: searchTerm, $options: "i" } },
        { ancien_testament: { $regex: searchTerm, $options: "i" } },
        { epitre_1: { $regex: searchTerm, $options: "i" } },
        { epitre_2: { $regex: searchTerm, $options: "i" } },
        { epitre_3: { $regex: searchTerm, $options: "i" } },
        { evangile_1: { $regex: searchTerm, $options: "i" } },
        { evangile_2: { $regex: searchTerm, $options: "i" } },
        { evangile_3: { $regex: searchTerm, $options: "i" } }
      ]
    }).lean();

    return pericope || null;
  } catch (error) {
    console.error("Erreur critique lors de la recherche de la péricope :", error);
    return null;
  }
}