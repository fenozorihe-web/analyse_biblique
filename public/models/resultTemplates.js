/**
 * Gabarit HTML de la zone d'Analyse Interlinéaire Multi-Versions
 * @returns {string} Code HTML avec styles Tailwind
 */
export function getInterlinearResultTemplate() {
    return `
      <div id="arrangementBlock" class="hidden grid lg:grid-cols-3 gap-6 animate-fadeIn">
          
          <!-- Colonne Gauche & Milieu : Les Versions et les Mots cliquables -->
          <div class="lg:col-span-2 space-y-6">
              
              <!-- Boite des Versions Comparées -->
              <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                  <h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">📂 Versions de la Bible</h3>
                  <div class="space-y-3.5 text-sm leading-relaxed">
                      <div class="p-3 bg-slate-50 rounded-xl border">
                          <span class="text-xs font-bold text-blue-600 block uppercase mb-1">🇲🇬 Malagasy (Protestanta) :</span> 
                          <p id="ver_mg" class="text-slate-800 font-medium"></p>
                      </div>
                      <div class="p-3 bg-slate-50 rounded-xl border">
                          <span class="text-xs font-bold text-emerald-600 block uppercase mb-1">🇫🇷 Louis Segond 1910 :</span> 
                          <p id="ver_ls" class="text-slate-700"></p>
                      </div>
                      <div class="p-3 bg-slate-50 rounded-xl border">
                          <span class="text-xs font-bold text-purple-600 block uppercase mb-1">🇫🇷 Version Darby :</span> 
                          <p id="ver_db" class="text-slate-600 italic"></p>
                      </div>
                  </div>
              </div>
      
              <!-- Boite d'Analyse Mot par Mot (Style "Mots Cliquables") -->
              <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                  <h3 class="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">🔤 Texte Original (Interlinéaire Interactif)</h3>
                  <p class="text-xs text-slate-400 mb-4">👉 Cliquez sur n'importe quel mot en langue originale pour l'analyser syntaxiquement.</p>
                  
                  <!-- C'est ici que les mots originaux vont être injectés sous forme de jetons cliquables -->
                  <div id="interactiveWordsContainer" class="flex flex-wrap gap-3 p-4 bg-slate-900 rounded-2xl min-h-[80px] justify-start items-center">
                  </div>
              </div>
          </div>
      
          <!-- Colonne Droite : Le Panneau d'Analyse Syntaxique Dynamique -->
          <div class="lg:col-span-1">
              <div class="bg-gradient-to-b from-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-lg sticky top-6 min-h-[350px] flex flex-col justify-between">
                  <h3 class="text-lg font-bold text-blue-300 border-b border-slate-700 pb-2 mb-4 flex items-center gap-1.5">🔬 Analyse Syntaxique</h3>
                  
                  <div id="syntaxDetailsPanel" class="space-y-4 flex-1 flex flex-col justify-center text-center text-slate-400 italic">
                      <p>Aucun mot sélectionné.<br>Sélectionnez un mot hébreu ou grec à gauche pour décortiquer sa grammaire.</p>
                  </div>
              </div>
          </div>
      </div>
    `;
}