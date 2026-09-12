/**
 * Génère le formulaire HTML d'ajout de péricope avec Sélecteur Calendrier Biblique
 * @returns {string} Code HTML avec styles Tailwind
 */
export function getAjoutPericopeTemplate() {
    return `
      <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-slate-100 mt-4 relative">
          <div class="mb-6 border-b pb-4">
              <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  ➕ Enregistrer une Péricope Liturgique
              </h2>
              <p class="text-sm text-slate-500 mt-1">
                  Ajoutez un jour de fête et ses lectures associées dans la base MongoDB.
              </p>
          </div>
  
          <form id="formPericope" class="space-y-5">
              <!-- Dimanche ou Fête -->
              <div class="flex flex-col gap-1.5">
                  <label for="dimanche_ou_fete" class="text-sm font-semibold text-slate-700">Nom du Dimanche ou de la Fête</label>
                  <input type="text" id="dimanche_ou_fete" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-slate-800"
                      placeholder="Ex: 1er Dimanche de l'Avent, Noël...">
              </div>
  
              <!-- Ancien Testament -->
              <div class="flex flex-col gap-1.5 relative">
                  <label for="ancien_testament" class="text-sm font-semibold text-slate-700">Lecture de l'Ancien Testament</label>
                  <input type="text" id="ancien_testament" required readonly
                      class="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/70 focus:ring-4 focus:ring-blue-100 outline-none transition cursor-pointer text-slate-800 font-medium pl-10"
                      placeholder="Cliquez pour choisir un passage...">
                  <span class="absolute left-3.5 top-[38px] text-slate-400 pointer-events-none">📖</span>
              </div>
  
              <!-- Épître -->
              <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-slate-700">Lectures de l'Épître</label>
                  <div class="space-y-2">
                      <div class="relative">
                          <input type="text" id="epitre_1" required readonly
                              class="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/70 outline-none transition cursor-pointer text-slate-800 font-medium pl-10"
                              placeholder="Épître 1 (Obligatoire) - Cliquez pour choisir...">
                          <span class="absolute left-3.5 top-[14px] text-slate-400 pointer-events-none">✉️</span>
                      </div>
                      <div class="relative">
                          <input type="text" id="epitre_2" readonly
                              class="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/70 outline-none transition cursor-pointer text-slate-800 font-medium pl-10"
                              placeholder="Épître 2 (Optionnelle) - Cliquez pour choisir...">
                          <span class="absolute left-3.5 top-[14px] text-slate-400 pointer-events-none">✉️</span>
                      </div>
                      <div class="relative">
                          <input type="text" id="epitre_3" readonly
                              class="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/70 outline-none transition cursor-pointer text-slate-800 font-medium pl-10"
                              placeholder="Épître 3 (Optionnelle) - Cliquez pour choisir...">
                          <span class="absolute left-3.5 top-[14px] text-slate-400 pointer-events-none">✉️</span>
                      </div>
                  </div>
              </div>
  
              <!-- Évangile -->
              <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-slate-700">Lectures de l'Évangile</label>
                  <div class="space-y-2">
                      <div class="relative">
                          <input type="text" id="evangile_1" required readonly
                              class="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/70 outline-none transition cursor-pointer text-slate-800 font-medium pl-10"
                              placeholder="Évangile 1 (Obligatoire) - Cliquez pour choisir...">
                          <span class="absolute left-3.5 top-[14px] text-slate-400 pointer-events-none">⛪</span>
                      </div>
                      <div class="relative">
                          <input type="text" id="evangile_2" readonly
                              class="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/70 outline-none transition cursor-pointer text-slate-800 font-medium pl-10"
                              placeholder="Évangile 2 (Optionnelle) - Cliquez pour choisir...">
                          <span class="absolute left-3.5 top-[14px] text-slate-400 pointer-events-none">⛪</span>
                      </div>
                      <div class="relative">
                          <input type="text" id="evangile_3" readonly
                              class="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/70 outline-none transition cursor-pointer text-slate-800 font-medium pl-10"
                              placeholder="Évangile 3 (Optionnelle) - Cliquez pour choisir...">
                          <span class="absolute left-3.5 top-[14px] text-slate-400 pointer-events-none">⛪</span>
                      </div>
                  </div>
              </div>
  
              <!-- Bouton de soumission -->
              <div class="pt-2">
                  <button type="submit" id="btnSubmitPericope"
                      class="w-full px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow shadow-emerald-100">
                      <span>Enregistrer dans MongoDB</span>
                      <div id="pericopeLoader" class="hidden animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  </button>
              </div>
          </form>

          <!-- ======================================================== -->
          <!-- 🎴 FENÊTRE MODALE STYLE CALENDRIER INTERACTIF -->
          <!-- ======================================================== -->
          <div id="bibleModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col max-h-[85vh] border border-slate-100">
                  
                  <!-- Entête pop-up avec fil d'ariane -->
                  <div class="p-5 border-b bg-slate-50 rounded-t-2xl">
                      <div class="flex justify-between items-center mb-2">
                          <h3 class="font-bold text-slate-900 text-lg flex items-center gap-1.5">📅 Sélecteur de Passage</h3>
                          <button type="button" id="closeModal" class="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-200 border w-8 h-8 rounded-xl transition font-bold text-sm flex items-center justify-center">✕</button>
                      </div>
                      <!-- Fil d'ariane indicatif -->
                      <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <span id-step="1" class="text-blue-600">1. Livre</span> ➔ 
                          <span id-step="2">2. Chapitre</span> ➔ 
                          <span id-step="3">3. Versets</span>
                      </div>
                  </div>

                  <!-- Écran de Rappel/Aperçu dynamique -->
                  <div class="bg-indigo-50 border-b border-indigo-100 px-6 py-2.5 flex justify-between items-center text-xs">
                      <span class="font-medium text-indigo-900">Sélection :</span>
                      <span id="modalPreview" class="font-bold text-indigo-950 bg-white px-3 py-1 rounded-lg border border-indigo-200 shadow-sm text-sm italic">Aucun livre choisi</span>
                  </div>

                  <!-- Zone de navigation "Grille Calendrier" défilante -->
                  <div id="modalGridContainer" class="p-6 overflow-y-auto grid grid-cols-4 gap-2.5 max-h-[50vh]">
                      <!-- Injecté dynamiquement par JavaScript -->
                  </div>

                  <!-- Pied de page avec bouton de retour ou validation -->
                  <div class="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-between items-center">
                      <button type="button" id="btnModalBack" class="hidden px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 rounded-xl font-semibold text-xs transition">
                          ⬅ Retour
                      </button>
                      <button type="button" id="btnValidatePassage" disabled class="ml-auto px-5 py-2.5 bg-blue-600 opacity-50 cursor-not-allowed text-white rounded-xl font-bold text-xs transition shadow-sm">
                          Valider le passage
                      </button>
                  </div>
              </div>
          </div>
      </div>
    `;
}