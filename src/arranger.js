import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEYS = [
    process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
].filter(key => key !== undefined && key !== "");

export async function arrangeBibleText(userBibleText) {
    const requestConfig = {
        temperature: 0.1,
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
                        originale: { type: "string" },
                        malgache_protestante: { type: "string" },
                        louis_segond: { type: "string" },
                        darby: { type: "string" },
                        kjv: { type: "string", description: "King James Version" },
                        esv: { type: "string", description: "English Standard Version" }
                    },
                    required: ["originale", "malgache_protestante", "louis_segond", "darby", "kjv", "esv"]
                },
                mots_cles_theologiques: {
                    type: "array",
                    items: { type: "string" }
                },
                decorticage_interlineaire: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            mot_original: { type: "string" },
                            translitteration: { type: "string" },
                            lemme_strong: { type: "string" },
                            analyse_syntaxique: { type: "string" },
                            sens_litteral: { type: "string" },
                            // ✅ AJOUT DE L'ANALYSE PAR ETAPE DE SENS GRAMMATICAL ET IMPACT THEOLOGIQUE
                            impact_syntaxique_theologique: { 
                                type: "string", 
                                description: "Explication approfondie en français de l'impact du temps verbal (ex: Aoriste, Parfait), du mode ou de la déclinaison sur le sens théologique précis du verset." 
                            }
                        },
                        required: ["mot_original", "translitteration", "lemme_strong", "analyse_syntaxique", "sens_litteral", "impact_syntaxique_theologique"]
                    }
                }
            },
            required: ["reference_identifiee", "versions", "mots_cles_theologiques", "decorticage_interlineaire"]
        },
        systemInstruction: `Tu es un érudit en langues bibliques (Hébreu biblique, Araméen et Grec Koinè) et expert des traductions protestantes internationales (malgaches, françaises, anglaises).
        Ton rôle est d'agir comme un moteur de recherche interlinéaire complet.
        1. Identifie le texte biblique. Utilise l'Hébreu pour l'Ancien Testament, le Grec Koinè pour le Nouveau.
        2. Traduis le verset dans toutes les versions demandées, y compris la King James (KJV) et l'English Standard Version (ESV).
        3. Découpe le texte original MOT PAR MOT. Pour chaque mot, explique de manière approfondie l'impact de sa morphologie grammaticale (temps verbal, déclinaisons, cas) sur l'interprétation exégétique et doctrinale du passage.`
    };

    const MODELES_A_TESTER = ["gemini-2.5-flash", "gemini-3.1-pro-preview"];
    let responseText = "";
    let successGeneration = false;

    for (const modelName of MODELES_A_TESTER) {
        for (let i = 0; i < API_KEYS.length; i++) {
            if (successGeneration) break;
            try {
                console.log(`🤖 [Linguistique Expert] Modèle [${modelName}] Clé n°${i + 1}...`);
                const ai = new GoogleGenAI({ apiKey: API_KEYS[i] });
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: `Versions et exégèse mot à mot pour : "${userBibleText}"`,
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
        return { success: true, data: JSON.parse(responseText) };
    } catch (error) {
        throw error;
    }
}