/**
 * Gabarit HTML de l'Analyse Interlinéaire Verticale avec Panneau Exégétique Fixe
 * @returns {string} Code HTML
 */
export function getInterlinearResultTemplate() {
    return `
      <div id="arrangementBlock" class="hidden grid lg:grid-cols-3 gap-6 animate-fadeIn relative">
          
          <!-- Colonne Gauche & Milieu : Zone Interlinéaire Verticale + Autres Versions -->
          <div class="lg:col-span-2 space-y-6">
              
              <!-- BLOC TEXTE INTERACTIF INTERLINÉAIRE VERTICAL -->
              <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                  <h3 class="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">📖 Texte Interlinéaire Universitaire</h3>
                  <p class="text-xs text-slate-400 mb-5">👉 Chaque mot français est aligné verticalement avec sa source. Cliquez sur un bloc pour ouvrir sa grammaire.</p>
                  
                  <!-- Zone d'injection du texte interlinéaire fluide par verset -->
                  <div id="fluidInteractiveText" class="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
                  </div>
              </div>

              <!-- BOITE DES AUTRES VERSIONS COMPRIMÉES PAR ONGLETS -->
              <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                  <div class="flex justify-between items-center border-b pb-3 mb-4">
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider">📋 Comparer les versions internationales</h3>
                      <div class="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                          <button type="button" id="tab_mg" class="px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-sm transition cursor-pointer">🇲🇬 MG</button>
                          <button type="button" id="tab_db" class="px-3 py-1.5 rounded-lg transition cursor-pointer">🇫🇷 Darby</button>
                          <button type="button" id="tab_en" class="px-3 py-1.5 rounded-lg transition cursor-pointer">🇬🇧 EN (KJV/ESV)</button>
                      </div>
                  </div>

                  <div class="text-sm leading-relaxed space-y-2" id="otherVersionsPanels">
                      <div id="panel_mg" class="p-3 bg-slate-100 rounded-xl border"></div>
                      <div id="panel_db" class="hidden p-3 bg-slate-100 rounded-xl border italic"></div>
                      <div id="panel_en" class="hidden space-y-2">
                          <div class="p-3 bg-slate-100 rounded-xl border font-serif"><strong class="text-xs text-amber-700 block uppercase mb-0.5">King James Version :</strong><p id="ver_kjv"></p></div>
                          <div class="p-3 bg-slate-100 rounded-xl border"><strong class="text-xs text-indigo-700 block uppercase mb-0.5">English Standard Version :</strong><p id="ver_esv"></p></div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Colonne Droite : Panneau fixe d'Analyse Morphologique au Clic -->
          <div class="lg:col-span-1">
              <div class="bg-gradient-to-b from-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-lg sticky top-6 min-h-[420px] flex flex-col justify-between">
                  <h3 class="text-lg font-bold text-blue-300 border-b border-slate-700 pb-2 mb-4 flex items-center gap-1.5">🔬 Analyse Syntaxique Complète</h3>
                  <div id="syntaxDetailsPanel" class="space-y-4 flex-1 flex flex-col justify-center text-center text-slate-400 italic text-sm">
                      <p>Veuillez cliquer sur un bloc de mots à gauche pour décortiquer son analyse grammaticale, sa racine Strong et sa portée théologique ici.</p>
                  </div>
              </div>
          </div>
      </div>
    `;
}