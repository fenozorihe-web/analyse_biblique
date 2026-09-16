import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEYS = [
    process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
].filter(key => key !== undefined && key !== "");

/**
 * Génère les versions bibliques et l'analyse interlinéaire mot par mot
 * @param {string} userBibleText - La référence ou le texte brut fourni par l'utilisateur
 */
export async function arrangeBibleText(userBibleText) {
    const requestConfig = {
        temperature: 0.1, // Basse température pour une précision linguistique absolue
        responseMimeType: "application/json",
        safety_settings: [
            { category: "HATE_SPEECH", threshold: "OFF" },
            { category: "HARASSMENT", threshold: "OFF" },
            { category: "SEXUALLY_EXPLICIT", threshold: "OFF" },
            { category: "DANGEROUS_CONTENT", threshold: "OFF" }
        ],
        responseSchema: {
            type: "object",
            properties: {
                reference_identifiee: { type: "string" },
                versions: {
                    type: "object",
                    properties: {
                        originale: { type: "string", description: "Le texte complet en Hébreu (Ancien Testament) ou Grec (Nouveau Testament) avec ponctuations." },
                        malgache_protestante: { type: "string" },
                        louis_segond: { type: "string" },
                        darby: { type: "string" }
                    },
                    required: ["originale", "malgache_protestante", "louis_segond", "darby"]
                },
                mots_cles_theologiques: {
                    type: "array",
                    items: { type: "string" },
                    description: "3 mots-clés conceptuels en français pour la recherche de Ohabolana."
                },
                decorticage_interlineaire: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            mot_original: { type: "string", description: "Le mot en caractères hébreux ou grecs." },
                            translitteration: { type: "string", description: "Prononciation phonétique (ex: Logos, Metanoia)." },
                            lemme_strong: { type: "string", description: "Le mot à sa forme racine avec numéro Strong si disponible." },
                            analyse_syntaxique: { type: "string", description: "Nature grammaticale précise (ex: Verbe, Aoriste Actif, 3ème pers. singulier / Nom, Masculin Singulier Datif)." },
                            sens_litteral: { type: "string", description: "Définition et traduction brute en français." }
                        },
                        required: ["mot_original", "translitteration", "lemme_strong", "analyse_syntaxique", "sens_litteral"]
                    }
                }
            },
            required: ["reference_identifiee", "versions", "mots_cles_theologiques", "decorticage_interlineaire"]
        },
        systemInstruction: `Tu es un érudit en langues bibliques (Hébreu biblique, Araméen et Grec Koinè) et expert des traductions protestantes malgaches et françaises.
        Ton rôle est d'agir comme un moteur de recherche interlinéaire.
        1. Identifie le texte biblique fourni. S'il s'agit d'un Ancien Testament, utilise l'Hébreu. Si c'est un Nouveau Testament, utilise le Grec Koinè.
        2. Fournis le texte complet dans les versions demandées (Originale, Malgache Protestante Katolika/Protestanta standard, Louis Segond 1910, Darby).
        3. Découpe le texte original MOT PAR MOT (dans l'ordre de lecture) et fournis pour chaque mot une analyse syntaxique et grammaticale d'une précision chirurgicale.`
    };

    const MODELES_A_TESTER = ["gemini-2.5-flash", "gemini-3.1-pro-preview"];
    let responseText = "";
    let successGeneration = false;

    for (const modelName of MODELES_A_TESTER) {
        for (let i = 0; i < API_KEYS.length; i++) {
            if (successGeneration) break;
            try {
                console.log(`🤖 [Interlinéaire] Essai : Modèle [${modelName}] Clé n°${i + 1}...`);
                const ai = new GoogleGenAI({ apiKey: API_KEYS[i] });
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: `Génère les versions et l'analyse mot à mot pour : "${userBibleText}"`,
                    config: requestConfig
                });
                responseText = response.text;
                successGeneration = true;
                break;
            } catch (err) {
                console.warn(`⚠️ Échec modèle [${modelName}] Clé n°${i + 1}`);
            }
        }
    }

    if (!successGeneration) throw new Error("Serveurs d'analyse linguistique saturés.");

    try {
        const rawData = JSON.parse(responseText);
        return {
            success: true,
            data: rawData
        };
    } catch (error) {
        console.error("Erreur JSON interlinéaire :", error);
        throw error;
    }
}