/**
 * Génère le formulaire HTML d'ajout d'un Ohabolana
 * @returns {string} Code HTML avec styles Tailwind
 */
export function getAjoutProverbTemplate() {
    return `
      <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-slate-100 mt-4">
          <div class="mb-6 border-b pb-4">
              <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  ➕ Enregistrer un Ohabolana (Proverbe)
              </h2>
              <p class="text-sm text-slate-500 mt-1">
                  Saisissez le ohabolana en malgache et laissez l'IA générer la traduction et le contexte culturel.
              </p>
          </div>
  
          <form id="formProverb" class="space-y-5">
              <!-- Proverbe Malagasy -->
              <div class="flex flex-col gap-1.5">
                  <label for="proverbe_malagasy" class="text-sm font-semibold text-slate-700">Proverbe original (Malagasy)</label>
                  <div class="flex gap-2">
                      <textarea id="proverbe_malagasy" required rows="2"
                          class="flex-1 border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-slate-800 font-medium"
                          placeholder="Ex: Ny fihavanana no sarobidy kokoa noho ny vola..."></textarea>
                      <button type="button" id="btnAiAnalyzeProverb"
                          class="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 min-w-[110px] cursor-pointer shadow-sm">
                          <span>🤖 Analyser via IA</span>
                          <div id="aiProverbLoader" class="hidden animate-spin rounded-full h-4 w-5 border-2 border-white border-t-transparent"></div>
                      </button>
                  </div>
              </div>
  
              <!-- Traduction Française -->
              <div class="flex flex-col gap-1.5">
                  <label for="traduction_francaise" class="text-sm font-semibold text-slate-700">Traduction en Français (Générée par l'IA)</label>
                  <textarea id="traduction_francaise" required rows="2"
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-slate-800"
                      placeholder="La traduction s'affichera ici après analyse..."></textarea>
              </div>
  
              <!-- Concepts Clés -->
              <div class="flex flex-col gap-1.5">
                  <label for="concepts_cles" class="text-sm font-semibold text-slate-700">Concepts Clés (Générés par l'IA - Séparés par des virgules)</label>
                  <input type="text" id="concepts_cles" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-slate-800 font-semibold"
                      placeholder="Les mots-clés s'afficheront ici (ex: paix, fihavanana)...">
              </div>
  
              <!-- Explication Culturelle -->
              <div class="flex flex-col gap-1.5">
                  <label for="explication_culturelle" class="text-sm font-semibold text-slate-700">Arrière-plan et Explication Culturelle (Générée par l'IA)</label>
                  <textarea id="explication_culturelle" required rows="4"
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-slate-800 text-xs leading-relaxed"
                      placeholder="L'explication anthropologique et sociétale s'affichera ici..."></textarea>
              </div>
  
              <!-- Bouton de soumission -->
              <div class="pt-2">
                  <button type="submit" id="btnSubmitProverb"
                      class="w-full px-5 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow shadow-orange-100 cursor-pointer">
                      <span>Enregistrer dans MongoDB</span>
                      <div id="proverbLoader" class="hidden animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  </button>
              </div>
          </form>
      </div>
    `;
}
