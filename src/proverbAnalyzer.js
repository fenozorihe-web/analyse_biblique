import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Stockage de vos clés gratuites dans un tableau de rotation
const API_KEYS = [
    process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY, // Clé principale
    process.env.GEMINI_API_KEY_2,                               // Clé de secours A
    process.env.GEMINI_API_KEY_3                                // Clé de secours B
].filter(key => key !== undefined && key !== ""); // Élimine les variables vides

/**
 * Analyse un ohabolana malagasy avec tolérance aux pannes et rotation de clés API
 * @param {string} malagasyText 
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
                    description: "3 à 5 mots-clés conceptuels en français traduisant le sens profond."
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

    // Liste ordonnée de vos modèles préférés par ordre de performance
    const MODELES_A_TESTER = ["gemini-2.5-flash", "gemini-3.1-pro-preview"];
    
    // Algorithme de double boucle : On teste chaque modèle avec chaque clé API
    for (const modelName of MODELES_A_TESTER) {
        for (let i = 0; i < API_KEYS.length; i++) {
            const currentKey = API_KEYS[i];
            
            try {
                console.log(`🤖 [IA Proverbe] Essai : Modèle [${modelName}] avec Clé API n°${i + 1}...`);
                
                // Initialisation dynamique du client avec la clé active de la rotation
                const ai = new GoogleGenAI({ apiKey: currentKey });
                
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: `Analyse ce ohabolana malagasy : "${malagasyText}"`,
                    config: requestConfig
                });

                // Si l'appel réussit, on renvoie immédiatement le résultat au frontend !
                console.log(`✅ Succès avec le modèle [${modelName}] et la Clé n°${i + 1}`);
                return JSON.parse(response.text);

            } catch (error) {
                console.warn(`⚠️ Échec (Erreur ${error.status || 'Quota'}) sur le modèle [${modelName}] avec la Clé n°${i + 1}. Transition...`);
                // Le code ignore l'erreur et passe immédiatement à l'itération suivante (clé ou modèle suivant)
            }
        }
    }

    // Si le code arrive ici, c'est que toutes les clés et tous les modèles ont échoué
    throw new Error("Désolé, toutes les clés API de secours et tous les modèles gratuits de Google sont actuellement saturés. Veuillez réessuyer dans quelques minutes.");
}
