import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Tableau de rotation des clés d'environnement gratuites
const API_KEYS = [
  process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
].filter(key => key !== undefined && key !== "");

/**
 * Analyse exégétique et luthérienne d'un texte biblique via l'API Gemini
 * @param {string} userBibleText - Le texte soumis par le frontend
 */
export async function analyzeBibleText(userBibleText) {
  const requestConfig = {
    temperature: 0.2,
    responseMimeType: "application/json",

    // Configuration de sécurité tolérante pour la théologie
    safety_settings: [
      { category: "HATE_SPEECH", threshold: "OFF" },
      { category: "HARASSMENT", threshold: "OFF" },
      { category: "SEXUALLY_EXPLICIT", threshold: "OFF" },
      { category: "DANGEROUS_CONTENT", threshold: "OFF" }
    ],

    responseSchema: {
      type: "object",
      properties: {
        genre_litteraire: { type: "string" },
        methode_analyse_recommandee: { type: "string" },
        concepts_abstraits_recherche: {
          type: "array",
          items: { type: "string" },
          description: "3 à 5 mots-clés conceptuels abstraits en français pour chercher des Ohabolana."
        },
        mots_cles_originaux: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mot: { type: "string" },
              transliteration: { type: "string" },
              sens_selon_methode: { type: "string" }
            },
            required: ["mot", "transliteration", "sens_selon_methode"]
          }
        },
        cles_theologiques: {
          type: "array",
          items: { type: "string" }
        },
        pertinence_canonique: {
          type: "object",
          properties: {
            dans_le_livre: { type: "string" },
            dans_le_canon: { type: "string" }
          },
          required: ["dans_le_livre", "dans_le_canon"]
        },
        connexion_lutherienne: {
          type: "object",
          properties: {
            articulation_doctrinale: { type: "string" },
            references_confessionnelles: { type: "string" }
          },
          required: ["articulation_doctrinale", "references_confessionnelles"]
        }
      },
      required: [
        "genre_litteraire",
        "methode_analyse_recommandee",
        "concepts_abstraits_recherche",
        "mots_cles_originaux",
        "cles_theologiques",
        "pertinence_canonique",
        "connexion_lutherienne"
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
  };

  const MODELES_A_TESTER = ["gemini-2.5-flash", "gemini-3.1-pro-preview"];
  let responseText = "";
  let successGeneration = false;

  // ✅ RECOURS ET ROTATION MUTUALISÉE DES CLÉS POUR L'ANALYSE
  for (const modelName of MODELES_A_TESTER) {
    for (let i = 0; i < API_KEYS.length; i++) {
      if (successGeneration) break;

      try {
        console.log(`🤖 [Analyse] Essai : Modèle [${modelName}] avec Clé API n°${i + 1}...`);

        // Initialisation explicite de l'instance avec l'index de clé actif (Évite l'erreur d'identifiant par défaut !)
        const ai = new GoogleGenAI({ apiKey: API_KEYS[i] });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Analyse le texte suivant : "${userBibleText}"`,
          config: requestConfig
        });

        responseText = response.text;
        successGeneration = true;
        console.log(`✅ Analyse complétée avec succès ! [Modèle: ${modelName}, Clé: ${i + 1}]`);
        break;
      } catch (err) {
        console.warn(`⚠️ Modèle [${modelName}] indisponible avec la Clé n°${i + 1}. Cause: ${err.message || err}`);
      }
    }
  }

  if (!successGeneration) {
    throw new Error("L'intégralité des serveurs d'IA de secours pour l'analyse lexicale sont saturés.");
  }

  return JSON.parse(responseText);
}