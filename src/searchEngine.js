import Proverb from "./models/Proverb.js";

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