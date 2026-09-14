import { GoogleGenAI } from "@google/genai";
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
 * Analyse un texte biblique avec le modèle Gemini
 * @param {string} userBibleText - Le verset ou texte biblique transmis par l'utilisateur
 * @param {Object|null} pericopeData - Les données liturgiques trouvées dans MongoDB
 * @returns {Promise<Object>} L'objet contenant le HTML formaté et les mots-clés
 */
export async function preachBibleText(userBibleText, pericopeData) {

  // console.log("Le text à prédiquer est:", userBibleText, "et le pericopeData et:", pericopeData);
  // Préparation du contexte des lectures liturgiques s'il a été trouvé dans MongoDB
  let contextePericopePrompt = "L'utilisateur étudie ce texte de manière isolée.";
  let detailsLecturesHtml = `<p class="text-xs text-slate-500 italic">Aucune péricope liturgique associée trouvée dans MongoDB pour ce texte.</p>`;


  if (pericopeData) {

    let epitre = "", evangile = ""
    if (userBibleText === pericopeData.evangile_1) {
      epitre = pericopeData.epitre_1,
        evangile = pericopeData.evangile_2

    } else if (userBibleText === pericopeData.evangile_2) {
      epitre = pericopeData.epitre_2,
        evangile = pericopeData.evangile_3

    } else if (userBibleText === pericopeData.evangile_3) {
      epitre = pericopeData.epitre_3,
        evangile = pericopeData.evangile_1

    } else {
      epitre = "", evangile = ""
    }

    console.log("Le pericope correspondant au nom de dimanche où on predique le texte", userBibleText, "est composé de l'ancien testament:", pericopeData.ancien_testament, ", l'épitre:", epitre, ", et lévangile:", evangile);

    contextePericopePrompt = `Ce texte fait partie d'une péricope liturgique complète pour le jour : "${pericopeData.dimanche_ou_fete}".
      Les textes associés officiels dans la base MongoDB sont :
      - Ancien Testament : ${pericopeData.ancien_testament}
      - Épître : ${epitre}
      - Évangile : ${evangile}`;

    detailsLecturesHtml = `
        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1 text-slate-700">
          <p class="font-bold text-slate-900 mb-1">📅 Lectures de la Péricope (${pericopeData.dimanche_ou_fete}) :</p>
          <p>📖 <strong>Ancien Testament :</strong> ${pericopeData.ancien_testament || "Non spécifié"}</p>
          <p>✉️ <strong>Épître :</strong> ${epitre || "Non spécifié"}</p>
          <p>⛪ <strong>Évangile :</strong> ${evangile || "Non spécifié"}</p>
        </div>
      `;
  }

  const requestConfig = {
    temperature: 0.2,
    responseMimeType: "application/json",
    
    // ✅ CORRECTIF DE SÉCURITÉ : Désactive la modération automatique pour les textes bibliques
    safetySettings: [
        {
            category: "HATE_SPEECH",
            threshold: "BLOCK_NONE"
        },
        {
            category: "HARASSMENT",
            threshold: "BLOCK_NONE"
        },
        {
            category: "SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
        },
        {
            category: "DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
        }
    ],
    
    responseSchema: {
        type: "object",
        properties: {
            genre_litteraire: { type: "string" },
            interrelations_textes: { type: "string" },
            type_predication: { type: "string" },
            theme_principal: { type: "string" },
            mots_cles_originaux: {
                type: "array",
                items: { type: "string" }
            },
            introduction: { type: "string" },
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
            "mots_cles_originaux",
            "introduction",
            "points_principaux",
            "conclusion"
        ]
    },
    systemInstruction: `Tu es un professeur d'homilétique expert de la tradition liturgique ecclésiale et de la contextualisation malgache.
        Tu reçois un texte à prêcher ainsi que les autres lectures de sa péricope.
        Ton rôle est de rédiger le sermon pour le texte biblique selon son genre littéraire propre, et le type de prédication luthérienne convenable.
        Ne bloque pas tes réponses face aux termes bibliques complexes.
        
        Tu dois :
        1. Expliquer brièvement les interrelations théologiques et logiques entre ces différents textes.
           Voici le texte ciblé par l'utilisateur : "${userBibleText}", et le contexte extrait de MongoDB : ${contextePericopePrompt}.
        2. Dégager un thème principal unifié pour la prédication.
        3. Dégager sous forme de tableau ("mots_cles_originaux") les concepts fondamentaux du texte en français qui découlent des mots-clés originaux (hébreu ou grec) et qui guident le thème.
        4. Développer les points principaux du sermon avec des explications claires et contextuelles selon les mots clés dégagés.`
};

  // En haut de votre src/preacher.js, remplacez la gestion de l'appel par :
  const API_KEYS = [
    process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
  ].filter(key => key !== undefined && key !== "");

  // ... (Conservez votre configuration requestConfig et vos variables HTML) ...

  const MODELES_A_TESTER = ["gemini-2.5-flash", "gemini-3.1-pro-preview"];
  let responseText = "";
  let successGeneration = false;

  for (const modelName of MODELES_A_TESTER) {
    for (let i = 0; i < API_KEYS.length; i++) {
      if (successGeneration) break;

      try {
        console.log(`🤖 [Sermon] Essai : Modèle [${modelName}] avec Clé API n°${i + 1}...`);
        const ai = new GoogleGenAI({ apiKey: API_KEYS[i] });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Prédique le texte suivant : "${userBibleText}"`,
          config: requestConfig
        });

        responseText = response.text;
        successGeneration = true;
        console.log(`✅ Sermon généré avec succès ! [Livre: ${modelName}, Clé: ${i + 1}]`);
        break;
      } catch (err) {
        console.warn(`⚠️ Modèle [${modelName}] indisponible avec la Clé n°${i + 1}. Recherche d'une alternative...`);
      }
    }
  }

  if (!successGeneration) {
    throw new Error("L'intégralité des serveurs d'IA gratuits de secours sont saturés.");
  }

  // TRAITEMENT ET FORMATAGE MUTUALISÉ DU JSON REÇU
  try {
    const rawData = JSON.parse(responseText);
    // console.log("Le rawData est constitué de :", rawData);

    // ✅ CORRECTION 2 : Clôture parfaite de l'intégration template string et de la boucle map
    const htmlSermon = `
          <div class="space-y-6">
            ${detailsLecturesHtml}

            <!-- 1. Genre du texte -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 class="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">📖 Genre du texte</h4>
              <p class="text-xs text-slate-700 mt-1 leading-relaxed">${rawData.genre_litteraire || "Non spécifié"}</p>
            </div>

            <!-- 2. Interrelations des textes de la péricope -->
            <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h4 class="font-bold text-blue-950 text-sm uppercase tracking-wider flex items-center gap-1.5">🤝 Harmonie de la Péricope</h4>
              <p class="text-xs text-blue-900 mt-1 leading-relaxed">${rawData.interrelations_textes || "Analyse croisée indisponible."}</p>
            </div>

            <!-- 3. Type de prédication -->
            <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
              <h4 class="font-bold text-indigo-950 text-xs uppercase tracking-wider">Type de prédication</h4>
              <p class="text-indigo-900 font-bold text-sm mt-1">⛪ ${rawData.type_predication || "Non spécifié"}</p>
            </div>

            <!-- 4. Thème Principal -->
            <div class="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
              <h4 class="font-bold text-emerald-950 text-xs uppercase tracking-wider">Thème central du message</h4>
              <p class="text-emerald-900 font-bold text-lg mt-1">🎯 ${rawData.theme_principal || "Non spécifié"}</p>
            </div>

            <!-- 5. Structure Homilétique complète -->
            <div class="space-y-4 pt-2">
              <div>
                <h5 class="font-bold text-slate-800 text-sm">💡 Introduction (Fidirana)</h5>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed pl-4 border-l-2 border-slate-200">${rawData.introduction || ""}</p>
              </div>

              <div class="space-y-3">
                <h5 class="font-bold text-slate-800 text-sm">🔥 Corps du Message (Ny Ranony)</h5>
                <div class="space-y-3 pl-4">
                  ${(rawData.points_principaux || []).map((p, idx) => `
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                      <p class="font-semibold text-slate-900 text-sm">Point ${idx + 1} : ${p.titre}</p>
                      <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">${p.explication}</p>
                      <p class="text-xs text-blue-800 font-medium mt-2 bg-blue-50 p-2 rounded border border-blue-100">${p.messages || ""}</p>
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
      success: true,
      html: htmlSermon,
      motsCles: rawData.mots_cles_originaux || [],
      genre_litteraire: rawData.genre_litteraire || "Homilétique / Prédication",
      interrelations_textes: rawData.interrelations_textes,
      type_predication: rawData.type_predication
    };

  } catch (error) {
    console.error("❌ Erreur lors de l'analyse du JSON dans preacher.js :", error);
    throw error;
  }
}