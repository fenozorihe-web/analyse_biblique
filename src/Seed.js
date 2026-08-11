import mongoose from "mongoose";
import dotenv from "dotenv";
import Proverb from "./models/Proverb.js";

// Charger les variables d'environnement (.env)
dotenv.config();

// === VOS DONNÉES SCANNÉES ET NETTOYÉES ===
// Remplacez ces exemples par les proverbes issus de votre livre
const proverbesDeTest = [
  {
    proverbe_malagasy: "Ny fihavanana no talen-tsakafo: tsy hita izay hohanina raha tsy misy izany.",
    traduction_francaise: "La communion fraternelle est le premier des aliments : on ne sait que manger s'il n'y a pas d'harmonie.",
    concepts_cles: ["paix", "fihavanana", "communion", "solidarite", "famille", "unite"],
    explication_culturelle: "Ce ohabolana montre que les relations humaines harmonieuses (Fihavanana) sont plus précieuses que les biens matériels ou la nourriture physique.",
    applications_theologiques: ["Amour fraternel", "Corps du Christ", "Jean 13:35"]
  },
  {
    proverbe_malagasy: "Ny teny toy de kitoza : tsinjaraina vao homana.",
    traduction_francaise: "La parole est comme la viande séchée : on la découpe avant de la manger.",
    concepts_cles: ["parole", "sagesse", "prudence", "communication", "respect"],
    explication_culturelle: "Enseigne l'importance de réfléchir mûrement avant de parler, de peser ses mots pour ne pas blesser la communauté ou créer des conflits.",
    applications_theologiques: ["Maîtrise de la langue", "Sagesse", "Jacques 3"]
  },
  {
    proverbe_malagasy: "Ny handrina tsy mihoatra ny volo.",
    traduction_francaise: "Le front ne dépasse pas les cheveux.",
    concepts_cles: ["respect", "humilite", "autorite", "orgueil", "sagesse"],
    explication_culturelle: "Rappelle l'ordre social traditionnel et l'importance du respect envers les aînés, les dirigeants ou les structures établies. Nul ne doit s'élever au-dessus de sa condition par orgueil.",
    applications_theologiques: ["Humilité", "Soumission", "1 Pierre 5:5"]
  }
];

/**
 * Fonction principale d'importation
 */
async function seedDatabase() {
  try {
    // Vérification de la variable d'environnement
    if (!process.env.MONGODB_URI) {
      throw new Error("La variable MONGODB_URI n'est pas définie dans le fichier .env");
    }

    console.log("Connexion à la base de données MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connecté avec succès !");

    console.log("Nettoyage des anciens proverbes (optionnel)...");
    // Optionnel : Supprime les anciens proverbes pour repartir à zéro à chaque fois
    // Supprimez cette ligne si vous souhaitez ajouter des données sans effacer les anciennes
    await Proverb.deleteMany({}); 

    console.log("Insertion des nouveaux ohabolana...");
    const result = await Proverb.insertMany(proverbesDeTest);
    
    console.log(`🎉 Succès ! ${result.length} proverbes ont été importés dans votre base de données.`);

  } catch (error) {
    console.error("❌ Erreur lors de l'importation :", error);
  } finally {
    // Toujours fermer la connexion à la fin du script
    await mongoose.disconnect();
    console.log("Connexion MongoDB fermée.");
  }
}

// Exécuter le script
// seedDatabase();