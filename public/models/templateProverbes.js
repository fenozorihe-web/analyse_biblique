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
                  Ajoutez un proverbe traditionnel malgache, sa traduction et ses concepts associés dans MongoDB.
              </p>
          </div>
  
          <form id="formProverb" class="space-y-5">
              <!-- Proverbe Malagasy -->
              <div class="flex flex-col gap-1.5">
                  <label for="proverbe_malagasy" class="text-sm font-semibold text-slate-700">Proverbe original (Malagasy)</label>
                  <textarea id="proverbe_malagasy" required rows="2"
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-slate-800 font-medium"
                      placeholder="Ex: Ny fihavanana no sarobidy kokoa noho ny vola..."></textarea>
              </div>
  
              <!-- Traduction Française -->
              <div class="flex flex-col gap-1.5">
                  <label for="traduction_francaise" class="text-sm font-semibold text-slate-700">Traduction en Français</label>
                  <textarea id="traduction_francaise" required rows="2"
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-slate-800"
                      placeholder="Ex: La parenté/communion est plus précieuse que l'argent..."></textarea>
              </div>
  
              <!-- Concepts Clés -->
              <div class="flex flex-col gap-1.5">
                  <label for="concepts_cles" class="text-sm font-semibold text-slate-700">Concepts Clés (Séparés par des virgules)</label>
                  <input type="text" id="concepts_cles" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-slate-800 font-semibold"
                      placeholder="Ex: paix, justice, fihavanana, communion, repentance">
                  <p class="text-[11px] text-slate-400 mt-0.5">💡 Ces mots permettent à l'IA d'interroger ce proverbe lors des sermons ou analyses.</p>
              </div>
  
              <!-- Explication Culturelle -->
              <div class="flex flex-col gap-1.5">
                  <label for="explication_culturelle" class="text-sm font-semibold text-slate-700">Arrière-plan et Explication Culturelle</label>
                  <textarea id="explication_culturelle" required rows="3"
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-slate-800 text-xs leading-relaxed"
                      placeholder="Expliquez comment et quand ce ohabolana est utilisé dans la société traditionnelle malgache..."></textarea>
              </div>
  
              <!-- Bouton de soumission -->
              <div class="pt-2">
                  <button type="submit" id="btnSubmitProverb"
                      class="w-full px-5 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow shadow-orange-100 cursor-pointer">
                      <span>Enregistrer le Ohabolana dans MongoDB</span>
                      <div id="proverbLoader" class="hidden animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  </button>
              </div>
          </form>
      </div>
    `;
}
