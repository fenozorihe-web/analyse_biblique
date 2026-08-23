import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

// Forcer le chargement du fichier .env depuis la racine du projet
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Vérification de sécurité dans la console
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Alerte : GEMINI_API_KEY n'est pas lue par le fichier analyzer.js !");
}

// Initialisation du client avec la clé d'environnement
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyse un texte biblique avec le modèle gratuit Gemini
 * @param {string} bibleText - Le verset ou texte biblique
 * @returns {Promise<Object>} L'analyse exégétique et théologique en JSON
 */
export async function analyzeBibleText(bibleText) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: `Analyse le texte suivant : "${bibleText}"`,
      config: {
        temperature: 0.2, // Faible température pour garantir la rigueur académique
        responseMimeType: "application/json",
        
        // 1. MISE À JOUR DU SCHÉMA : Ajout des champs de genre et de méthode
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            genre_litteraire: { type: Type.STRING }, // Ex: "Narratif historique", "Épître / Argumentatif"
            methode_analyse_recommandee: { type: Type.STRING }, // Ex: "Analyse narrative", "Analyse historique-grammaticale"
            mots_cles_originaux: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mot: { type: Type.STRING },
                  transliteration: { type: Type.STRING },
                  // Ce champ contiendra l'explication basée sur la méthode du genre
                  sens_selon_methode: { type: Type.STRING } 
                },
                required: ["mot", "transliteration", "sens_selon_methode"]
              }
            },
            cles_theologiques: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
             // NOUVEAU : Analyse à l'échelle du livre et du canon biblique
             pertinence_canonique: {
              type: Type.OBJECT,
              properties: {
                dans_le_livre: { type: Type.STRING }, // Rôle de ce texte dans la théologie propre du livre
                dans_le_canon: { type: Type.STRING }  // Lien avec l'ensemble de l'Ancien/Nouveau Testament
              },
              required: ["dans_le_livre", "dans_le_canon"]
            },
            // NOUVEAU : Ancrage confessionnel luthérien
            connexion_lutherienne: {
              type: Type.OBJECT,
              properties: {
                articulation_doctrinale: { type: Type.STRING }, // Ex: Loi et Évangile, Justification par la foi, Théologie de la croix
                references_confessionnelles: { type: Type.STRING } // Liens avec le Petit Catéchisme, la Confession d'Augsbourg, etc.
              },
              required: ["articulation_doctrinale", "references_confessionnelles"]
            },
            concepts_abstraits_recherche: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "genre_litteraire", 
            "methode_analyse_recommandee", 
            "mots_cles_originaux", 
            "cles_theologiques",
            "pertinence_canonique",
            "connexion_lutherienne", 
            "concepts_abstraits_recherche"
          ]
        },
        
        // 2. MISE À JOUR DES INSTRUCTIONS : Cadrage exégétique selon le genre
        systemInstruction: `Tu es un théologien universitaire expert en exégèse biblique (langues originales grec/hébreu) et en méthodologie critique. 
        Ton rôle est d'analyser le texte biblique selon son genre littéraire propre.

        Suis rigoureusement ces consignes :
        1. Identifie le "genre_litteraire" du texte (ex: Évangile/Récit narratif, Épître/Lettre doctrinale, Poésie/Sagesse, Prophétie, Apocalyptique).
        2. Détermine la "methode_analyse_recommandee" la plus adaptée à ce genre :
           - Pour les Épîtres : Analyse historique-grammaticale, rhétorique littéraire, logique argumentative.
           - Pour les Évangiles et récits de l'Ancien Testament : Analyse narrative (intrigue, personnages, cadre, étude lexicale).
           - Pour les Psaumes / Proverbes : Analyse poétique, parallélisme, étude métaphorique et sémantique.
           - Pour la Prophétie / Apocalyptique : Analyse historico-critique, étude des symboles et motifs théologiques.
        3. Pour chaque mot clé dans "mots_cles_originaux", fournis son sens ("sens_selon_methode") en appliquant STRICTEMENT la méthode d'analyse choisie (par exemple, si c'est narratif, explique le rôle du mot dans l'intrigue ou le portrait du personnage ; si c'est une épître, explique sa fonction grammaticale ou théologique dans l'argumentation de l'auteur). Defends aussi son sens avec de versets bibliques correspondants qui seront juste cités entre paranthèse après le sens.
        4. Extrais les "cles_theologiques" majeures du texte avec des explications pertinentes par un paragraphe court supporté par des versets bibliques, mis en entre parathèse, pour chacun.
        4. Développe la "pertinence_canonique" :
           - "dans_le_livre" : Explique comment ce texte contribue au message théologique global du livre où il se trouve.
           - "dans_le_canon" : Fais dialoguer ce texte avec le reste de la Bible. Si c'est l'AT, montre comment il pointe vers le NT ou le Christ (typologie/accomplissement). Si c'est le NT, montre comment il s'enracine dans l'AT.
        5. Formule la "connexion_lutherienne" :
           - "articulation_doctrinale" : Analyse le texte sous le prisme des grandes articulations luthériennes. Distingue clairement comment la tension entre la Loi (qui condamne le péché) et l'Évangile (qui console par la grâce) s'y exprime. Évoque la justification par la foi, la théologie de la croix ou le "Simul justus et peccator" si pertinent.
           - "references_confessionnelles" : Relie le texte aux écrits symboliques luthériens (ex: Le Petit ou Grand Catéchisme de Luther, la Confession d'Augsbourg, ou la Formule de Concorde).
        5. Génère 3 à 5 "concepts_abstraits_recherche" simples, en français, au singulier et en minuscules (ex: paix, justice, humilite) pour effectuer une recherche sémantique d'Ohabolana dans MongoDB.`
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erreur dans analyzer.js (Gemini Théologie Luthérienne) :", error);
    throw error;
  }
}