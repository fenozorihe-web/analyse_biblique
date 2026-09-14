import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyse anthropologique et traduction d'un ohabolana malagasy via Gemini
 * @param {string} malagasyText - Le proverbe en langue malgache
 */
export async function analyzeProverbWithAi(malagasyText) {
    const requestConfig = {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
            type: "object",
            properties: {
                traduction_francaise: { type: "string" },
                concepts_cles: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3 à 5 mots-clés conceptuels en français traduisant le sens profond pour indexation de recherche."
                },
                explication_culturelle: { type: "string" }
            },
            required: ["traduction_francaise", "concepts_cles", "explication_culturelle"]
        },
        systemInstruction: `Tu es un ethno-linguiste expert de la culture malgache (herméneutique, anthropologie et Ohabolana).
        On te fournit un proverbe en langue malagasy. Tu dois l'analyser avec rigueur.
        Respecte scrupuleusement les concepts traditionnels sous-jacents (le Fihavanana, la peur du Tsiny, le respect des Ancêtres, la place du Ny Marina, etc.).
        Génère une traduction élégante en français et une explication culturelle riche détaillant l'usage et le contexte sociétal traditionnel de ce ohabolana.`
    };

    let responseText = "";

    try {
        console.log("🤖 IA Proverbe : Tentative avec gemini-2.5-flash...");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyse ce ohabolana malagasy : "${malagasyText}"`,
            config: requestConfig
        });
        responseText = response.text;
    } catch (err) {
        console.warn("⚠️ Mode principal saturé. Bascule de secours sur gemini-1.5-flash-002...");
        try {
            const fallback = await ai.models.generateContent({
                model: "gemini-1.5-flash-002",
                contents: `Analyse ce ohabolana malagasy : "${malagasyText}"`,
                config: requestConfig
            });
            responseText = fallback.text;
        } catch (fallbackError) {
            console.error("❌ Échec des deux environnements Gemini pour l'ohabolana", fallbackError);
            throw fallbackError;
        }
    }

    return JSON.parse(responseText);
}