/**
 * Gabarit HTML de l'Analyse Interlinéaire avec intégration des numéros de versets et pop-up de survol
 * @returns {string} Code HTML
 */
export function getInterlinearResultTemplate() {
    return `
      <div id="arrangementBlock" class="hidden grid lg:grid-cols-3 gap-6 animate-fadeIn relative">
          
          <!-- Colonne Principale (Versions et Texte Interactif) -->
          <div class="lg:col-span-2 space-y-6">
              
              <!-- 1. TEXTE INTERACTIF (LOUIS SEGOND AVEC SURVOL DYNAMIQUE) -->
              <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                  <h3 class="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">🔍 Étude Interlinéaire Interactive (Louis Segond)</h3>
                  <p class="text-xs text-slate-400 mb-4">✨ Passez votre souris sur les mots pour afficher instantanément leur racine grecque ou hébraïque.</p>
                  
                  <!-- Zone où le texte français fluide parsemé de numéros de versets va s'injecter -->
                  <div id="fluidInteractiveText" class="text-base leading-loose text-slate-800 tracking-wide bg-slate-50 p-5 rounded-2xl border border-slate-100 selection:bg-blue-100">
                  </div>
              </div>

              <!-- 2. AUTRES VERSIONS SÉLECTIONNABLES PAR ONGLETS -->
              <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                  <div class="flex justify-between items-center border-b pb-3 mb-4">
                      <h3 class="text-lg font-bold text-slate-900">📋 Comparer les autres versions</h3>
                      <div class="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                          <button type="button" id="tab_mg" class="px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-sm transition cursor-pointer">🇲🇬 MG</button>
                          <button type="button" id="tab_db" class="px-3 py-1.5 rounded-lg transition cursor-pointer">🇫🇷 Darby</button>
                          <button type="button" id="tab_en" class="px-3 py-1.5 rounded-lg transition cursor-pointer">🇬🇧 KJV/ESV</button>
                      </div>
                  </div>

                  <div class="text-sm leading-relaxed space-y-2" id="otherVersionsPanels">
                      <div id="panel_mg" class="p-3 bg-slate-50 rounded-xl border border-slate-200"></div>
                      <div id="panel_db" class="hidden p-3 bg-slate-50 rounded-xl border border-slate-200 italic"></div>
                      <div id="panel_en" class="hidden space-y-2">
                          <div class="p-3 bg-slate-50 rounded-xl border font-serif"><strong class="text-xs text-amber-700 block uppercase mb-0.5">King James :</strong><p id="ver_kjv"></p></div>
                          <div class="p-3 bg-slate-50 rounded-xl border"><strong class="text-xs text-indigo-700 block uppercase mb-0.5">ESV :</strong><p id="ver_esv"></p></div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Colonne Droite : Panneau de détails théologiques au Clic -->
          <div class="lg:col-span-1">
              <div class="bg-gradient-to-b from-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-lg sticky top-6 min-h-[380px] flex flex-col justify-between">
                  <h3 class="text-lg font-bold text-blue-300 border-b border-slate-700 pb-2 mb-4">🎯 Exégèse & Portée du Mot</h3>
                  <div id="syntaxDetailsPanel" class="space-y-4 flex-1 flex flex-col justify-center text-center text-slate-400 italic">
                      <p>Cliquez sur un mot à gauche pour verrouiller son analyse théologique complète et son sens grammatical ici.</p>
                  </div>
              </div>
          </div>

          <!-- ======================================================== -->
          <!-- 🛸 INTERFACE MODALE FLOTTANTE (TOOLTIP INTERACTIF) -->
          <!-- ======================================================== -->
          <div id="floatingTooltip" class="hidden pointer-events-none absolute bg-slate-950/95 text-white p-4 rounded-xl shadow-xl border border-slate-700/60 max-w-xs z-50 text-xs transition-all duration-75 space-y-2 backdrop-blur-xs">
              <!-- Injecté dynamiquement au mouvement de la souris -->
          </div>
      </div>
    `;
}