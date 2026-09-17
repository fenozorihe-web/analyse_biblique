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
                mots_cles_theologiques: { type: "array", items: { type: "string" } },
                versets: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            numero_verset: { type: "integer" },
                            texte_original_integral: { type: "string", description: "Le verset complet en Hébreu ou Grec Koinè." },
                            texte_malgache: { type: "string" },
                            texte_darby: { type: "string" },
                            texte_kjv: { type: "string" },
                            texte_esv: { type: "string" },
                            mots_interlineaires: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        mot_francais: { type: "string", description: "Le mot ou segment de phrase français correspondant." },
                                        mot_original: { type: "string", description: "Le mot en caractères grecs ou hébreux." },
                                        translitteration: { type: "string" },
                                        lemme_strong: { type: "string" },
                                        analyse_syntaxique: { type: "string" },
                                        sens_litteral: { type: "string" },
                                        impact_syntaxique_theologique: { type: "string" }
                                    },
                                    required: ["mot_francais", "mot_original", "translitteration", "lemme_strong", "analyse_syntaxique", "sens_litteral", "impact_syntaxique_theologique"]
                                }
                            }
                        },
                        required: ["numero_verset", "texte_original_integral", "texte_malgache", "texte_darby", "texte_kjv", "texte_esv", "mots_interlineaires"]
                    }
                }
            },
            required: ["reference_identifiee", "mots_cles_theologiques", "versets"]
        },
        systemInstruction: `Tu es un expert en langues bibliques. Découpe le passage par numéro de verset. 
        Pour chaque verset, fournis l'équivalent hébreu/grec dans 'texte_original_integral'. 
        Dans le tableau 'mots_interlineaires', sépare la phrase Louis Segond mot par mot et associe à chaque mot français son équivalent hébreu/grec exact avec son code strong, son analyse morphologique et l'impact du choix de sa déclinaison.`
    };

    const MODELES_A_TESTER = ["gemini-2.5-flash", "gemini-3.1-pro-preview"];
    let responseText = "";
    let successGeneration = false;

    for (const modelName of MODELES_A_TESTER) {
        for (let i = 0; i < API_KEYS.length; i++) {
            if (successGeneration) break;
            try {
                console.log(`🤖 [Moteur Interlinéaire Multi-Langues] Essai : Modèle [${modelName}]...`);
                const ai = new GoogleGenAI({ apiKey: API_KEYS[i] });
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: `Génère l'exégèse et les versions pour : "${userBibleText}"`,
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
    return { success: true, data: JSON.parse(responseText) };
}