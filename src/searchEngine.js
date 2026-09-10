import Proverb from "./models/Proverb.js";
import Pericope from "models/Pericope.js";

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

    // 💡 SÉCURITÉ ANTI-TIMEOUT : Si le texte est très long (ex: un verset copié), 
    // on extrait uniquement le premier mot (le Livre) pour éviter le plantage du RegExp
    if (searchTerm.length > 30) {
      const words = searchTerm.split(/[\s,.:]+/);
      searchTerm = words[0]; // Prend par exemple "Matthieu" ou "Romains"
    }

    console.log(`🔎 Requête MongoDB optimisée sur le mot-clé : "${searchTerm}"`);

    // Recherche insensible à la casse dans les trois colonnes liturgiques
    const pericope = await Pericope.findOne({
      $or: [
        { ancien_testament: { $regex: searchTerm, $options: "i" } },
        { epitre: { $regex: searchTerm, $options: "i" } },
        { evangile: { $regex: searchTerm, $options: "i" } }
      ]
    }).lean();

    return pericope || null;
  } catch (error) {
    console.error("Erreur critique lors de la recherche de la péricope :", error);
    return null; // Retourne null en sécurité pour ne pas faire crasher l'API principale
  }
}