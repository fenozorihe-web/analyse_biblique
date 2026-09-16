/**
 * Gabarit HTML de la zone d'Analyse Interlinéaire Multi-Versions et Onglets Linguistiques
 * @returns {string} Code HTML avec styles Tailwind
 */
export function getInterlinearResultTemplate() {
    return `
      <div id="arrangementBlock" class="hidden grid lg:grid-cols-3 gap-6 animate-fadeIn">
          
          <!-- Colonne Gauche & Milieu : Les Versions et les Mots cliquables -->
          <div class="lg:col-span-2 space-y-6">
              
              <!-- Boite des Versions Comparées avec Onglets Navigateurs -->
              <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                  <div class="flex justify-between items-center border-b pb-3 mb-4">
                      <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">📂 Versions de la Bible</h3>
                      
                      <!-- Onglets de sélection linguistique -->
                      <div class="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                          <button type="button" id="tab_mg" class="px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-sm transition cursor-pointer">🇲🇬 MG</button>
                          <button type="button" id="tab_fr" class="px-3 py-1.5 rounded-lg transition cursor-pointer">🇫🇷 FR</button>
                          <button type="button" id="tab_en" class="px-3 py-1.5 rounded-lg transition cursor-pointer">🇬🇧 EN</button>
                      </div>
                  </div>

                  <!-- Panneaux d'affichage des versions (affichés/masqués par onglets) -->
                  <div class="space-y-3.5 text-sm leading-relaxed">
                      <!-- Onglet Malagasy (Actif par défaut) -->
                      <div id="panel_mg" class="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                          <span class="text-xs font-bold text-blue-700 block uppercase mb-1">Malgache Protestante :</span>
                          <p id="ver_mg" class="text-slate-800 font-semibold text-base"></p>
                      </div>

                      <!-- Onglet Français -->
                      <div id="panel_fr" class="hidden space-y-3">
                          <div class="p-3 bg-slate-50 rounded-xl border">
                              <span class="text-xs font-bold text-emerald-600 block uppercase mb-1">Louis Segond 1910 :</span>
                              <p id="ver_ls" class="text-slate-700"></p>
                          </div>
                          <div class="p-3 bg-slate-50 rounded-xl border">
                              <span class="text-xs font-bold text-purple-600 block uppercase mb-1">Version Darby :</span>
                              <p id="ver_db" class="text-slate-600 italic"></p>
                          </div>
                      </div>

                      <!-- Onglet Anglais -->
                      <div id="panel_en" class="hidden space-y-3">
                          <div class="p-3 bg-slate-50 rounded-xl border">
                              <span class="text-xs font-bold text-amber-600 block uppercase mb-1">King James Version (KJV) :</span>
                              <p id="ver_kjv" class="text-slate-700 font-serif"></p>
                          </div>
                          <div class="p-3 bg-slate-50 rounded-xl border">
                              <span class="text-xs font-bold text-indigo-600 block uppercase mb-1">English Standard Version (ESV) :</span>
                              <p id="ver_esv" class="text-slate-700"></p>
                          </div>
                      </div>
                  </div>
              </div>
      
              <!-- Boite d'Analyse Mot par Mot (Style "Mots Cliquables") -->
              <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                  <h3 class="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">🔤 Texte Original (Interlinéaire Interactif)</h3>
                  <p class="text-xs text-slate-400 mb-4">👉 Cliquez sur n'importe quel mot en langue originale pour l'analyser syntaxiquement.</p>
                  <div id="interactiveWordsContainer" class="flex flex-wrap gap-3 p-4 bg-slate-900 rounded-2xl min-h-[80px] justify-start items-center"></div>
              </div>
          </div>
      
          <!-- Colonne Droite : Le Panneau d'Analyse Syntaxique Dynamique de 2026 -->
          <div class="lg:col-span-1">
              <div class="bg-gradient-to-b from-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-lg sticky top-6 min-h-[420px] flex flex-col justify-between">
                  <h3 class="text-lg font-bold text-blue-300 border-b border-slate-700 pb-2 mb-4 flex items-center gap-1.5">🔬 Analyse Syntaxique & Sens</h3>
                  <div id="syntaxDetailsPanel" class="space-y-4 flex-1 flex flex-col justify-center text-center text-slate-400 italic">
                      <p>Aucun mot sélectionné.<br>Sélectionnez un mot hébreu ou grec à gauche pour décortiquer sa grammaire.</p>
                  </div>
              </div>
          </div>
      </div>
    `;
}