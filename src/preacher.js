import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function preachBibleText(text, pericopeData) {
  try {
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es un professeur d'homilétique expert de la tradition liturgique ecclésiale et de la contextualisation malgache.
          On va te fournir un texte à prêcher ainsi que les autres lectures de sa péricope. 
          
          Tu dois :
          1. Expliquer brièvement les interrelations théologiques et logiques entre ces différents textes (comment ils se répondent).
          2. Dégager un thème principal unifié pour la prédication.
          3. Développer les points principaux du sermon (Ny ranony) avec des explications claires et contextuelles.
          
          Exporte le résultat au format JSON strict avec cette structure :
          {
            "genre_litteraire": "Prophétique, Évangile, Épître...",
            "interrelations_textes": "Explication de la convergence théologique des textes de la péricope.",
            "theme_principal": "Thème global du sermon",
            "introduction": "Introduction du sermon (Fidirana)",
            "points_principaux": [
              { "titre": "Point 1", "explication": "Développement" },
              { "titre": "Point 2", "explication": "Développement" }
            ],
            "conclusion": "Conclusion et application pratique (Famaranana)",
            "cles_theologiques": ["Concept 1", "Concept 2"],
            "mots_cles_pour_ohabolana": ["ConceptA", "ConceptB"]
          }`
        },
        {
          role: "user",
          content: `Voici le texte ciblé par l'utilisateur : "${text}". 
          Contexte de la péricope extrait de MongoDB : ${contextePericopePrompt}. 
          Analyse l'harmonie de ces textes et prépare le sermon.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const rawData = JSON.parse(response.choices.message.content);

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
      genre_litteraire: rawData.genre_litteraire || "Homilétique / Prédication",
      methode_analyse_recommandee: "Analyse Homilétique Croisée",
      cles_theologiques: rawData.cles_theologiques || [],
      concepts_abstraits_recherche: rawData.mots_cles_pour_ohabolana || [],
      donnees_specifiques: htmlSermon,
      pertinence_canonique: { dans_le_livre: "Inclus dans l'analyse croisée", dans_le_canon: "Inclus dans l'analyse croisée" },
      connexion_lutherienne: { articulation_doctrinale: "Générée dans le message", references_confessionnelles: "N/A" }
    };

  } catch (error) {
    console.error("Erreur dans preacher.js :", error);
    throw error;
  }
}