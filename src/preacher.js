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
 * @param {string} text - Le verset ou texte biblique transmis par l'utilisateur
 * @param {Object|null} pericopeData - Les données liturgiques trouvées dans MongoDB
 * @returns {Promise<Object>} L'objet contenant le HTML formaté et les mots-clés
 */

export async function preachBibleText(text, pericopeData) {
  
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

    try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: `Predis le texte suivant : "${bibleText}"`,
      config: {
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
                        mots_cles_ohabolana: { 
                            type: "array", 
                            items: { type: "string" },
                            description: "Liste de 3 à 5 mots-clés en français pour chercher des proverbes malgaches correspondants" 
                        },
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
                        "mots_cles_ohabolana",
                        "points_principaux", 
                        "conclusion"
                    ]
                  },
                  systemInstruction: `Tu es un professeur d'homilétique expert de la tradition liturgique ecclésiale et de la contextualisation malgache.
                On va te fournir un texte à prêcher ainsi que les autres lectures de sa péricope.
                Ton rôle est de rédiger le sermon pour le texte biblique selon son genre littéraire propre, et le type de prédication luthérienne convenable.
                
                Tu dois :
                1. Expliquer brièvement les interrelations théologiques et logiques entre ces différents textes.
                   Voici le texte ciblé par l'utilisateur : "${text}", et le contexte extrait de MongoDB : ${contextePericopePrompt}.
                2. Dégager un thème principal unifié pour la prédication.
                3. Générer un tableau de mots-clés simples ("mots_cles_ohabolana") pour trouver des correspondances de proverbes malgaches (ex: ["repentance", "sagesse"]).
                4. Développer les points principaux du sermon avec des explications claires et contextuelles.`
        },
    });

    //Lecture correcte du format JSON retourné par Gemini
    const rawData = JSON.parse(response.text);

    // Construction HTML optimisé incluant l'interrelation des textes
    const htmlSermon = `
      <div class="space-y-6">
        <!-- Bloc d'infos des textes de la péricope extraits de MongoDB -->
        ${detailsLecturesHtml}

        <!-- 1. Interrelations des textes de la péricope -->
        <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <h4 class="font-bold text-blue-950 text-sm uppercase tracking-wider flex items-center gap-1.5">🤝 Harmonie de la Péricope</h4>
          <p class="text-xs text-blue-900 mt-1 leading-relaxed">${rawData.interrelations_textes || "Analyse croisée indisponible."}</p>
        </div>

        <!-- 2. Thème Principal -->
        <div class="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
          <h4 class="font-bold text-emerald-950 text-xs uppercase tracking-wider">Thème central du message</h4>
          <p class="text-emerald-900 font-bold text-lg mt-1">🎯 ${rawData.theme_principal || "Non spécifié"}</p>
        </div>

        <!-- 3. Structure Homilétique complète -->
        <div class="space-y-4 pt-2">
          <div>
            <h5 class="font-bold text-slate-800 text-sm">💡 Introduction (Fidirana)</h5>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed pl-4 border-l-2 border-slate-200">${rawData.introduction || ""}</p>
          </div>

          <div class="space-y-3">
            <h5 class="font-bold text-slate-800 text-sm">🔥 Corps du Message (Ny Ranony)</h5>
            <div class="space-y-3 pl-4">
              ${(rawData.points_principaux || []).map((p, idx) => `
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p class="font-semibold text-slate-900 text-xs">Point ${idx + 1} : ${p.titre}</p>
                  <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">${p.explication}</p>
                </div>
              `).join("")}
            </div>
          </div>

          <div>
            <h5 class="font-bold text-slate-800 text-sm">🏁 Conclusion & Application (Famaranana)</h5>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed pl-4 border-l-2 border-slate-200">${rawData.conclusion || ""}</p>
          </div>
        </div>
      </div>
    `;

        return {
            // genre_litteraire: rawData.genre_litteraire || "Homilétique / Prédication",
            // interrelations_textes: rawData.interrelations_textes,
            // type_predication: rawData.type_predication,
            // theme_principal: rawData.theme_principal,
            // introduction: rawData.introduction,
            // points_principaux: rawData.points_principaux,
            // conclusion: rawData.conclusion
            success: true,
            html: htmlSermon,
            motsCles: rawData.mots_cles_ohabolana || []
        };

  } catch (error) {
    console.error("Erreur dans preacher.js :", error);
    throw error;
  }
}