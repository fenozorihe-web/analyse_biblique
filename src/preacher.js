import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

// Forcer le chargement du fichier .env depuis la racine du projet
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Vérification de sécurité dans la console
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Alerte : GEMINI_API_KEY n'est pas lue par le fichier preacher.js !");
}

// Initialisation du client avec la clé d'environnement
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyse un texte biblique avec le modèle Gemini-2.5-flash
 * @param {string} userBibleText - Le verset ou texte biblique transmis par l'utilisateur
 * @param {Object|null} pericopeData - Les données liturgiques trouvées dans MongoDB
 * @returns {Promise<Object>} L'objet contenant le HTML formaté et les mots-clés
 */

export async function preachBibleText(userBibleText, pericopeData) {
  
    // Préparation du contexte des lectures liturgiques s'il a été trouvé dans MongoDB
    let contextePericopePrompt = "L'utilisateur étudie ce texte de manière isolée.";
    let detailsLecturesHtml = `<p class="text-xs text-slate-500 italic">Aucune péricope liturgique associée trouvée dans MongoDB pour ce texte.</p>`;

    if (pericopeData) {
      contextePericopePrompt = `Ce texte fait partie d'une péricope liturgique complète pour le jour : "${pericopeData.dimanche_ou_fete}".
      Les textes associés officiels dans la base MongoDB sont :
      - Ancien Testament : ${pericopeData.ancien_testament}
      - Épître : ${pericopeData.epitre}
      - Évangile : ${pericopeData.evangile}`;

      detailsLecturesHtml = `
        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1 text-slate-700">
          <p class="font-bold text-slate-900 mb-1">📅 Lectures de la Péricope (${pericopeData.dimanche_ou_fete}) :</p>
          <p>📖 <strong>Ancien Testament :</strong> ${pericopeData.ancien_testament || "Non spécifié"}</p>
          <p>✉️ <strong>Épître :</strong> ${pericopeData.epitre || "Non spécifié"}</p>
          <p>⛪ <strong>Évangile :</strong> ${pericopeData.evangile || "Non spécifié"}</p>
        </div>
      `;
    }

    const requestConfig = {
        temperature: 0.2, // Faible température pour garantir la rigueur académique
        responseMimeType: "application/json",
                // 1. MISE À JOUR DU SCHÉMA : Ajout des champs de genre et de méthode
                responseSchema: {
                    type: "object",
                    properties: {
                        genre_litteraire: { type: "string" },
                        interrelations_textes: { type: "string" }, // Type string direct réaligné sur l'instruction
                        type_predication: { type: "string" },
                        theme_principal: { type: "string" },
                        introduction: { type: "string" },
                        // mots_cles_ohabolana: { 
                        //     type: "array", 
                        //     items: { type: "string" },
                        //     description: "Liste de 3 à 5 mots-clés en français pour chercher des proverbes malgaches correspondants" 
                        // },
                        points_principaux: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    titre: { type: "string" },
                                    explication: { type: "string" },
                                    messages: { type: "string" } 
                                },
                                required: ["titre", "explication", "messages"]
                            }
                        },
                        conclusion: { type: "string" }
                    },
                    required: [
                        "genre_litteraire", 
                        "interrelations_textes", 
                        "type_predication", 
                        "theme_principal",
                        "introduction",
                        // "mots_cles_ohabolana",
                        "points_principaux", 
                        "conclusion"
                    ]
                  },
                  systemInstruction: `Tu es un professeur d'homilétique expert de la tradition liturgique ecclésiale et de la contextualisation malgache.
                On va te fournir un texte à prêcher ainsi que les autres lectures de sa péricope.
                Ton rôle est de rédiger le sermon pour le texte biblique selon son genre littéraire propre, et le type de prédication luthérienne convenable.
                
                Tu dois :
                1. Expliquer brièvement les interrelations théologiques et logiques entre ces différents textes.
                   Voici le texte ciblé par l'utilisateur : "${userBibleText}", et le contexte extrait de MongoDB : ${contextePericopePrompt}.
                2. Dégager un thème principal unifié pour la prédication.
                3. Générer un tableau de mots-clés simples ("mots_cles_ohabolana") pour trouver des correspondances de proverbes malgaches (ex: ["repentance", "sagesse"]).
                4. Développer les points principaux du sermon avec des explications claires et contextuelles.`
    }

    try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: `Predique le texte suivant : "${userBibleText}"`,
      config: requestConfig
    });
    //Lecture correcte du format JSON retourné par Gemini
    const rawData = JSON.parse(response.text);
    console.log("Le rawData est contitué par:", rawData);
    
    return rawData

  } catch (firstError) {
    // En cas d'erreur 503 ou de surcharge, on capture l'exception et on bascule immédiatement sur le modèle de secours
    console.warn("⚠️ Le modèle principal est saturé (Erreur 503). Bascule automatique sur gemini-1.5-flash de secours...");
    
    try {
        response = await ai.models.generateContent({
            model: "gemini-1.5-flash", // Modèle alternatif très robuste aux surcharges
            contents: `Prédique le texte suivant : "${text}"`,
            config: requestConfig
        });
        return JSON.parse(response.text)
        
    } catch (fallbackError) {
        console.error("❌ Les deux modèles de l'API Gemini ont échoué.", fallbackError);
        throw fallbackError;
    }
}
}