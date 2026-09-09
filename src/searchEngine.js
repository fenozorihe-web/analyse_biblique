import Proverb from "./models/Proverb.js";
import Pericope from "./models/Pericope.js";

/**
 * Recherche des ohabolana malgaches basés sur des concepts
 * @param {Array<string>} aiConcepts - Tableau de mots-clés (ex: ['paix', 'justice'])
 * @returns {Promise<Array>} Liste des documents de proverbes trouvés
 */
export async function findMatchingProverbs(aiConcepts) {
  try {
    // 1. Nettoyage des concepts (minuscules et suppression des espaces inutiles)
    const cleanedConcepts = aiConcepts.map(concept => 
      concept.toLowerCase().trim()
    );

    // 2. Requête avec l'opérateur $in
    // Recherche tous les documents où au moins un élément de 'concepts_cles' correspond à notre liste
    const proverbs = await Proverb.find({
      concepts_cles: { $in: cleanedConcepts }
    })
    .limit(3) // Sécurité : on limite à 3 ohabolana pour le sermon
    .lean();  // Optimisation de performance Mongoose (retourne du JSON brut)

    return proverbs;
  } catch (error) {
    console.error("Erreur dans searchEngine.js :", error);
    throw error;
  }
}

/**
 * Trouve la péricope complète contenant le texte recherché
 */
export async function findPericopeByText(userText) {
  try {
    // Exemple de recherche simple : on cherche si le texte utilisateur est mentionné 
    // dans l'une des colonnes de lectures liturgiques de la BDD
    const pericope = await Pericope.findOne({
      $or: [
        { ancien_testament: new RegExp(userText, "i") },
        { epitre: new RegExp(userText, "i") },
        { evangile: new RegExp(userText, "i") }
      ]
    });

    return pericope || null;
  } catch (error) {
    console.error("Erreur lors de la recherche de la péricope :", error);
    return null;
  }
}