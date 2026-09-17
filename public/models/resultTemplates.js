/**
 * Gabarit HTML de l'Analyse Interlinéaire Parallèle avec Tooltip flottant
 * @returns {string} Code HTML
 */
export function getInterlinearResultTemplate() {
    return `
      <div id="arrangementBlock" class="hidden grid lg:grid-cols-3 gap-6 animate-fadeIn relative">
          
          <!-- Colonne Gauche & Milieu : Les 2 Textes Originaux Comparés + Autres Versions -->
          <div class="lg:col-span-2 space-y-6">
              
              <!-- BLOC PARALLÈLE INTERACTIF (LOUIS SEGOND VS LANGUE ORIGINALE) -->
              <div class="grid md:grid-cols-2 gap-4">
                  
                  <!-- Case 1 : Louis Segond (Interactive au survol) -->
                  <div class="bg-white rounded-2xl p-5 shadow-md border border-slate-100 flex flex-col">
                      <h3 class="text-sm font-bold text-slate-900 border-b pb-2 mb-3 flex items-center gap-1.5">🇫🇷 Version Louis Segond 1910</h3>
                      <div id="fluidInteractiveText" class="text-base leading-loose text-slate-800 tracking-wide bg-slate-50 p-4 rounded-xl border flex-1 h-full min-h-[150px]">
                          <!-- Injecté dynamiquement par app.js -->
                      </div>
                  </div>

                  <!-- Case 2 : Langue Originale (Grec/Hébreu cliquable mot à mot) -->
                  <div class="bg-white rounded-2xl p-5 shadow-md border border-slate-100 flex flex-col">
                      <h3 class="text-sm font-bold text-slate-900 border-b pb-2 mb-3 flex items-center gap-1.5">🔤 Texte Source (Hébreu / Grec Koinè)</h3>
                      <div id="originalInteractiveText" class="text-xl leading-loose font-serif text-slate-900 tracking-wide bg-slate-900 p-4 rounded-xl border border-slate-800 flex-1 h-full min-h-[150px]">
                          <!-- Injecté dynamiquement par app.js -->
                      </div>
                  </div>

              </div>

              <!-- BOITE DES AUTRES VERSIONS COMPRIMEES PAR ONGLETS -->
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
                      <div id="panel_mg" class="p-3 bg-slate-50 rounded-xl border border-slate-100"></div>
                      <div id="panel_db" class="hidden p-3 bg-slate-50 rounded-xl border border-slate-100 italic"></div>
                      <div id="panel_en" class="hidden space-y-2">
                          <div class="p-3 bg-slate-50 rounded-xl border font-serif"><strong class="text-xs text-amber-700 block uppercase mb-0.5">King James Version :</strong><p id="ver_kjv"></p></div>
                          <div class="p-3 bg-slate-50 rounded-xl border"><strong class="text-xs text-indigo-700 block uppercase mb-0.5">English Standard Version :</strong><p id="ver_esv"></p></div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Colonne Droite : Panneau fixe d'Analyse Morphologique au Clic -->
          <div class="lg:col-span-1">
              <div class="bg-gradient-to-b from-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-lg sticky top-6 min-h-[400px] flex flex-col justify-between">
                  <h3 class="text-lg font-bold text-blue-300 border-b border-slate-700 pb-2 mb-4 flex items-center gap-1.5">🔬 Analyse Syntaxique Courante</h3>
                  <div id="syntaxDetailsPanel" class="space-y-4 flex-1 flex flex-col justify-center text-center text-slate-400 italic text-sm">
                      <p>Veuillez cliquer sur un mot (soit en français, soit en langue originale) pour décortiquer sa grammaire ici.</p>
                  </div>
              </div>
          </div>

          <!-- MODALE FLOTTANTE (TOOLTIP INTERACTIF UNIQUE AU SURVOL DE LA SOURIS) -->
          <div id="floatingTooltip" class="hidden pointer-events-none absolute bg-slate-950/95 text-white p-4 rounded-xl shadow-xl border border-slate-700/60 max-w-xs z-50 text-xs space-y-1.5 backdrop-blur-xs">
          </div>
      </div>
    `;
}