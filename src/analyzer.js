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
        systemInstruction: `Tu es un professeur d'exégèse biblique et de théologie systématique luthérienne.
        Tu analyses le texte fourni en dégageant sa structure littéraire, son analyse lexicale, sa portée canonique globale, et son articulation doctrinale confessionnelle.`
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