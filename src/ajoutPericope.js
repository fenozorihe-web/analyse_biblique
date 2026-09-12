import Pericope from "./models/Pericope.js";

/**
 * Insère une péricope liturgique dans MongoDB Atlas de façon sécurisée
 * @param {Object} data - Données transmises par le payload frontend
 */
export async function insertPericope(data) {
  try {
    const { 
      dimanche_ou_fete, 
      ancien_testament, 
      epitre_1, epitre_2, epitre_3, 
      evangile_1, evangile_2, evangile_3 
    } = data;

    // 1. Initialisation sûre du tableau de mots-clés
    const mots_cles = [];

    if (dimanche_ou_fete) {
      mots_cles.push(dimanche_ou_fete.toLowerCase().trim());
    }

    // 2. Fonction utilitaire corrigée pour extraire le premier mot (Livre) en minuscule
    const extraireLivre = (texteLecture) => {
      if (texteLecture && typeof texteLecture === "string" && texteLecture.trim() !== "") {
        const segments = texteLecture.trim().split(" ");
        if (segments && segments[0]) {
          return segments[0].toLowerCase(); // ✅ FIX DÉFINITIF : Extraction de l'index [0] textuel avant transformation
        }
      }
      return null;
    };

    // 3. Extraction sécurisée pour chaque lecture facultative ou obligatoire
    const livresExtraits = [
      extraireLivre(ancien_testament),
      extraireLivre(epitre_1),
      extraireLivre(epitre_2),
      extraireLivre(epitre_3),
      extraireLivre(evangile_1),
      extraireLivre(evangile_2),
      extraireLivre(evangile_3)
    ];

    // Ajout unique au tableau de mots-clés s'ils sont valides
    livresExtraits.forEach(livre => {
      if (livre && !mots_cles.includes(livre)) {
        mots_cles.push(livre);
      }
    });

    // 4. Instanciation Mongoose
    const nouvellePericope = new Pericope({
      dimanche_ou_fete,
      ancien_testament,
      epitre_1: epitre_1 || "",
      epitre_2: epitre_2 || "",
      epitre_3: epitre_3 || "",
      evangile_1: evangile_1 || "",
      evangile_2: evangile_2 || "",
      evangile_3: evangile_3 || "",
      mots_cles
    });

    await nouvellePericope.save();
    return { success: true, message: "Péricope enregistrée avec succès !" };

  } catch (error) {
    console.error("Erreur lors de l'insertion Mongoose dans ajoutPericope.js :", error);
    throw error;
  }
}