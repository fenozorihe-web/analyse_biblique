import {displayAnalyse} from "./models/fonctions.js"
// import {displayPredication} from "./fonctions.js"
import { getAjoutPericopeTemplate } from "./models/ajoutApp.js";
import { getAjoutProverbTemplate } from "./models/ajoutProv.js";

// ✅ NOUVEL IMPORT ÉPURÉ
import { initBibleCalendar } from "./models/bibleSelector.js"; 
import { getInterlinearResultTemplate } from "./models/resultTemplates.js";

// Sélection des éléments de l'interface globale
const bibleTextInput = document.getElementById('bibleText');
const resultSection = document.getElementById('resultSection');

// Les deux blocs d'interfaces exclusifs
const sermonBlock = document.getElementById('sermonBlock');
const sermonContainer = document.getElementById('sermonContainer');
const analyserInterfaceBlock = document.getElementById('analyserInterfaceBlock');

const exegeseContainer = document.getElementById('exegeseContainer');
const theologieContainer = document.getElementById('theologieContainer');
const proverbesContainer = document.getElementById('proverbesContainer');

// Nouveaux éléments de l'interface (Liste et Bouton Unique)
const actionSelect = document.getElementById('actionSelect');
const btnSubmitAction = document.getElementById('btnSubmitAction');
const globalLoader = document.getElementById('globalLoader');

// Nouveaux éléments pour la gestion de l'administration des péricopes
const btnToggleAdmin = document.getElementById('btnToggleAdmin');
const adminBlock = document.getElementById('adminBlock');
const formContainer = document.getElementById('formContainer');

// URL de votre API Backend Node.js
const API = '/api'; 

// =======================================================
// ⚙️ SECTIONS DE GESTION DU TOGGLE ADMINISTRATIVE (PROVERBES ET PERICOPES)
// =======================================================

const mainFormSection = document.getElementById('mainFormSection'); // Récupération du formulaire principal
const btnToggleProverbAdmin = document.getElementById('btnToggleProverbAdmin'); // Nouveau bouton

if (btnToggleAdmin && btnToggleProverbAdmin && adminBlock && formContainer && mainFormSection) {
    
    // Logiciel de fermeture centralisée pour nettoyer l'écran
    const closeAllAdminPanels = () => {
        adminBlock.classList.add('hidden');
        mainFormSection.classList.remove('hidden');
        btnToggleAdmin.textContent = "⚙️ Gérer les Péricopes";
        btnToggleProverbAdmin.textContent = "🍃 Gérer les Ohabolana";
    };

    // 1. Bouton d'administration n°1 : Les Péricopes
    btnToggleAdmin.addEventListener('click', () => {
        if (!adminBlock.classList.contains('hidden') && btnToggleAdmin.textContent.includes('Fermer')) {
            closeAllAdminPanels();
            return;
        }
        formContainer.innerHTML = `<p class="text-center text-slate-400 italic py-4">Chargement du formulaire...</p>`;
        adminBlock.classList.remove('hidden');
        mainFormSection.classList.add('hidden');
        btnToggleAdmin.textContent = "❌ Fermer l'Administration";
        btnToggleProverbAdmin.textContent = "🍃 Gérer les Ohabolana";

        formContainer.innerHTML = getAjoutPericopeTemplate();
        setupPericopeFormListener();
    });

    // 2. Bouton d'administration n°2 : Les Ohabolana
    btnToggleProverbAdmin.addEventListener('click', () => {
        if (!adminBlock.classList.contains('hidden') && btnToggleProverbAdmin.textContent.includes('Fermer')) {
            closeAllAdminPanels();
            return;
        }
        formContainer.innerHTML = `<p class="text-center text-slate-400 italic py-4">Chargement du formulaire...</p>`;
        adminBlock.classList.remove('hidden');
        mainFormSection.classList.add('hidden');
        btnToggleProverbAdmin.textContent = "❌ Fermer l'Administration";
        btnToggleAdmin.textContent = "⚙️ Gérer les Péricopes";

        formContainer.innerHTML = getAjoutProverbTemplate();
        setupProverbFormListener(); // Lance l'écouteur ci-dessous
    });
}

/**
 * Configure la gestion de la soumission du formulaire d'Ohabolana
 */
function setupProverbFormListener() {
    const form = document.getElementById("formProverb");
    const proverbLoader = document.getElementById("proverbLoader");
    const btnSubmitProverb = document.getElementById("btnSubmitProverb");
    
    // Nouveaux boutons liés à l'automatisme IA
    const btnAiAnalyzeProverb = document.getElementById("btnAiAnalyzeProverb");
    const aiProverbLoader = document.getElementById("aiProverbLoader");

    // 🤖 ACTION : Clic sur le bouton d'analyse par l'IA
    if (btnAiAnalyzeProverb) {
        btnAiAnalyzeProverb.addEventListener('click', async () => {
            const malagasyText = document.getElementById("proverbe_malagasy").value.trim();

            if (!malagasyText) {
                alert("Veuillez d'abord écrire ou coller un proverbe en malgache avant de lancer l'IA.");
                document.getElementById("proverbe_malagasy").focus();
                return;
            }

            // Verrouillage de l'interface
            if (aiProverbLoader) aiProverbLoader.classList.remove("hidden");
            btnAiAnalyzeProverb.disabled = true;
            btnAiAnalyzeProverb.classList.add("opacity-75");

            try {
                const response = await fetch(`${API}/analyseProverbe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ malagasyText: malagasyText })
                });

                const data = await response.json();

                if (data.success) {
                    // Injection automatique des données renvoyées par Gemini dans les champs du formulaire !
                    document.getElementById("traduction_francaise").value = data.traduction_francaise;
                    document.getElementById("explication_culturelle").value = data.explication_culturelle;
                    
                    // Transformation du tableau de concepts en chaîne de caractères séparée par des virgules
                    document.getElementById("concepts_cles").value = (data.concepts_cles || []).join(", ");
                } else {
                    alert(`❌ Erreur IA : ${data.message}`);
                }
            } catch (error) {
                console.error(error);
                alert("Impossible de joindre le serveur d'analyse IA.");
            } finally {
                if (aiProverbLoader) aiProverbLoader.classList.add("hidden");
                btnAiAnalyzeProverb.disabled = false;
                btnAiAnalyzeProverb.classList.remove("opacity-75");
            }
        });
    }

    // ENREGISTREMENT FINAL DANS MONGODB ATLAS
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const rawConcepts = document.getElementById("concepts_cles").value.split(",");
            const cleanedConcepts = rawConcepts.map(c => c.trim().toLowerCase()).filter(c => c !== "");

            const payload = {
                proverbe_malagasy: document.getElementById("proverbe_malagasy").value.trim(),
                traduction_francaise: document.getElementById("traduction_francaise").value.trim(),
                concepts_cles: cleanedConcepts,
                explication_culturelle: document.getElementById("explication_culturelle").value.trim() // S'adapte à votre index.js actuel
            };
            
            console.log("Le payload to be sent to bacend is:",  payload);

            if (proverbLoader) proverbLoader.classList.remove("hidden");
            if (btnSubmitProverb) {
                btnSubmitProverb.disabled = true;
                btnSubmitProverb.classList.add("opacity-75");
            }

            try {
                const response = await fetch(`${API}/ajoutProverbe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (data.success) {
                    alert("🎉 Succès : Le ohabolana a été enregistré avec succès dans MongoDB Atlas !");
                    form.reset();
                } else {
                    alert(`❌ Échec : ${data.message || "Erreur"}`);
                }
            } catch (error) {
                console.error(error);
                alert("Erreur réseau lors de la sauvegarde.");
            } finally {
                if (proverbLoader) proverbLoader.classList.add("hidden");
                if (btnSubmitProverb) {
                    btnSubmitProverb.disabled = false;
                    btnSubmitProverb.classList.remove("opacity-75");
                }
            }
        });
    }
}

/**
 * Configure la gestion de la soumission du formulaire de péricope
 */
function setupPericopeFormListener() {
    const form = document.getElementById("formPericope");
    const pericopeLoader = document.getElementById("pericopeLoader");
    const btnSubmitPericope = document.getElementById("btnSubmitPericope");

    // ✅ APPORT MAJEUR : Branchement du calendrier en une seule ligne grâce au module externe !
    const champsLectures = ["ancien_testament", "epitre_1", "epitre_2", "epitre_3", "evangile_1", "evangile_2", "evangile_3"];
    champsLectures.forEach(id => {
        const inputField = document.getElementById(id);
        if (inputField) {
            inputField.addEventListener("click", () => {
                // Appelle la fonction importée du fichier bibleSelector.js
                initBibleCalendar(inputField); 
            });
        }
    });

    // Écouteur de soumission du formulaire vers MongoDB
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                dimanche_ou_fete: document.getElementById("dimanche_ou_fete").value.trim(),
                ancien_testament: document.getElementById("ancien_testament").value.trim(),
                epitre_1: document.getElementById("epitre_1").value.trim(),
                epitre_2: document.getElementById("epitre_2").value.trim(),
                epitre_3: document.getElementById("epitre_3").value.trim(),
                evangile_1: document.getElementById("evangile_1").value.trim(),
                evangile_2: document.getElementById("evangile_2").value.trim(),
                evangile_3: document.getElementById("evangile_3").value.trim()
            };

            if (pericopeLoader) pericopeLoader.classList.remove("hidden");
            if (btnSubmitPericope) {
                btnSubmitPericope.disabled = true;
                btnSubmitPericope.classList.add("opacity-75", "cursor-not-allowed");
            }

            try {
                const response = await fetch(`${API}/ajoutPericope`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (data.success) {
                    alert("🎉 Péricope liturgique enregistrée avec succès dans MongoDB !");
                    form.reset();
                } else {
                    alert(`❌ Échec : ${data.message || "Erreur"}`);
                }
            } catch (error) {
                console.error(error);
                alert("Impossible d'enregistrer la péricope.");
            } finally {
                if (pericopeLoader) pericopeLoader.classList.add("hidden");
                if (btnSubmitPericope) {
                    btnSubmitPericope.disabled = false;
                    btnSubmitPericope.classList.remove("opacity-75", "cursor-not-allowed");
                }
            }
        });
    }
}

// ============================================
// 🚀 ÉCOUTEUR D'ÉVÉNEMENT SUR L'ACTION UNIQUE
// ============================================

if (btnSubmitAction && actionSelect) {
    btnSubmitAction.addEventListener('click', async () => {
        const textValue = bibleTextInput.value.trim();
        console.log("Le contenu à executer est:", textValue, "et le btnSubmitAction listener est entendu");

        // 1. Validation de la saisie de texte
        if (!textValue) {
            alert("Veuillez introduire un texte biblique avant de lancer l'action.");
            bibleTextInput.focus();
            return;
        }

        // 2. Récupération de l'action choisie dans la liste déroulante
        const selectedAction = actionSelect.value; 

        // 3. Configuration dynamique de la route selon la valeur exacte du select
        let API_URL = "";
        if (selectedAction === "predire") {
            API_URL = `${API}/prediction`;
        } else if (selectedAction === "analyser" || selectedAction === "analyse") {
            API_URL = `${API}/analyse`;
        } else if (selectedAction === "enseigner") {
            API_URL = `${API}/enseignement`; 
        } else if (selectedAction === "arranger") {
            API_URL = `${API}/arrangement`;   
        }

        if (!API_URL) {
            console.error("Action inconnue ou non gérée :", selectedAction);
            alert("Cette action n'est pas encore prise en charge par le serveur.");
            return;
        }

        // 4. Activation de l'état de chargement graphique
        globalLoader.classList.remove('hidden');
        btnSubmitAction.disabled = true;
        btnSubmitAction.classList.add('opacity-75', 'cursor-not-allowed');
        actionSelect.disabled = true; 
        
        // On cache tout par défaut pendant le chargement
        if (resultSection) resultSection.classList.add('hidden');
        sermonBlock.classList.add('hidden');
        analyserInterfaceBlock.classList.add('hidden');

        try {
            // Appel AJAX vers votre serveur Express
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userBibleText: textValue,
                    actionRequested: selectedAction
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur serveur avec le statut ${response.status}`);
            }

            const data = await response.json();
            console.log("Données reçues du serveur :", data);
            
            // ✅ Grâce au correctif backend, data.success et data.html sont lisibles directement !
            if (data.success) {
                if (selectedAction === "predire") {
                    // 1. Injection du sermon
                    if (sermonContainer && data.html) {
                        sermonContainer.innerHTML = data.html;
                    }
                    
                    // 2. Injection des proverbes spécifiques au sermon
                    const provContainer = document.getElementById('proverbesSermonContainer');
                    if (provContainer) {
                        provContainer.innerHTML = ''; // Nettoyage
                        if (data.illustrations_malgaches && data.illustrations_malgaches.length > 0) {
                            data.illustrations_malgaches.forEach(prov => {
                                const div = document.createElement('div');
                                div.className = 'bg-orange-50/50 p-3 rounded-xl border border-orange-100';
                                div.innerHTML = `
                                    <p class="font-semibold text-orange-950 italic">« ${prov.proverbe_malagasy} »</p>
                                    <p class="text-xs text-gray-500 mt-1">Traduction : ${prov.traduction_francaise}</p>
                                `;
                                provContainer.appendChild(div);
                            });
                            document.getElementById('sermonProverbesBlock').classList.remove('hidden');
                        } else {
                            // Masquer le bloc s'il n'y a aucun proverbe correspondant
                            document.getElementById('sermonProverbesBlock').classList.add('hidden');
                        }
                    }
                
                    // 3. Affichage et défilement
                    if (sermonBlock) sermonBlock.classList.remove('hidden');
                    if (resultSection) {
                        resultSection.classList.remove('hidden');
                        resultSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                else if (selectedAction === "analyser" || selectedAction === "analyse") {
                    // Appelle votre fonction existante (assurez-vous qu'elle s'appelle bien displayAnalyse ou displayResults)
                        displayAnalyse(data)
                } 
                else if (selectedAction === "arranger" && data.bibleData) {
                    const bData = data.bibleData;
            
                    const outputZone = document.getElementById("dynamicInterlinearOutput");
                    if (outputZone) outputZone.innerHTML = getInterlinearResultTemplate();
            
                    const arrangementBlock = document.getElementById('arrangementBlock');
                    const fluidInteractiveText = document.getElementById("fluidInteractiveText");
                    const floatingTooltip = document.getElementById("floatingTooltip");
            
                    // Injection des versions comparées (MG, DB, KJV, ESV)
                    let htmlMg = "", htmlDb = "", htmlKjv = "", htmlEsv = "";
                    bData.versets.forEach(v => {
                        htmlMg += `<span class="text-blue-600 font-bold mr-1">${v.numero_verset}</span>${v.texte_malgache} `;
                        htmlDb += `<span class="text-purple-600 font-bold mr-1">${v.numero_verset}</span>${v.texte_darby} `;
                        htmlKjv += `<span class="text-amber-600 font-bold mr-1">${v.numero_verset}</span>${v.texte_kjv} `;
                        htmlEsv += `<span class="text-indigo-600 font-bold mr-1">${v.numero_verset}</span>${v.texte_esv} `;
                    });
            
                    document.getElementById("panel_mg").innerHTML = htmlMg;
                    document.getElementById("panel_db").innerHTML = htmlDb;
                    document.getElementById("ver_kjv").innerHTML = htmlKjv;
                    document.getElementById("ver_esv").innerHTML = htmlEsv;
            
                    // Configuration des onglets
                    const tabs = { mg: document.getElementById('tab_mg'), db: document.getElementById('tab_db'), en: document.getElementById('tab_en') };
                    const panels = { mg: document.getElementById('panel_mg'), db: document.getElementById('panel_db'), en: document.getElementById('panel_en') };
                    Object.keys(tabs).forEach(k => {
                        if (tabs[k]) {
                            tabs[k].addEventListener('click', () => {
                                Object.keys(tabs).forEach(x => { tabs[x].className = "px-3 py-1.5 rounded-lg transition cursor-pointer"; panels[x].classList.add('hidden'); });
                                tabs[k].className = "px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-sm transition cursor-pointer";
                                panels[k].classList.remove('hidden');
                            });
                        }
                    });
            
                    // Rendu du texte fluide interactif
                    if (fluidInteractiveText && bData.versets) {
                        fluidInteractiveText.innerHTML = "";
            
                        bData.versets.forEach((verset) => {
                            const vNum = document.createElement("span");
                            vNum.className = "text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded-md mr-1.5 align-middle select-none";
                            vNum.textContent = verset.numero_verset;
                            fluidInteractiveText.appendChild(vNum);
            
                            verset.mots_louis_segond.forEach((item) => {
                                const spanMot = document.createElement("span");
                                spanMot.className = "inline-block px-0.5 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition cursor-help font-medium mr-1";
                                spanMot.textContent = item.mot_francais;
            
                                // 🛸 A. EFFET AU SURVOL (MOUSEENTER) : Seuls le mot original et le strong s'affichent
                                spanMot.addEventListener("mouseenter", () => {
                                    floatingTooltip.innerHTML = `
                                        <div class="border-b border-slate-700 pb-1">
                                            <span class="text-[10px] uppercase font-bold text-blue-400">Terme Original</span>
                                            <p class="text-xl font-serif font-bold text-white">${item.mot_original} <span class="text-xs font-sans font-normal text-slate-400">(${item.translitteration})</span></p>
                                        </div>
                                        <div class="pt-1.5 text-[11px] font-mono text-amber-400">
                                            🔑 Code Strong : <span class="bg-slate-900 px-1.5 py-0.5 rounded text-white border border-slate-800">${item.lemme_strong}</span>
                                        </div>
                                    `;
                                    floatingTooltip.classList.remove("hidden");
                                });
            
                                spanMot.addEventListener("mousemove", (e) => {
                                    floatingTooltip.style.left = `${e.pageX + 15}px`;
                                    floatingTooltip.style.top = `${e.pageY + 15}px`;
                                });
            
                                spanMot.addEventListener("mouseleave", () => {
                                    floatingTooltip.classList.add("hidden");
                                });
            
                                // ⚡ B. EFFET AU CLIC : Affiche l'analyse syntaxique complète, le sens littéral et l'impact théologique à droite
                                spanMot.addEventListener("click", () => {
                                    fluidInteractiveText.querySelectorAll("span").forEach(s => s.classList.remove("text-blue-700", "bg-blue-100", "font-bold"));
                                    spanMot.classList.add("text-blue-700", "bg-blue-100", "font-bold");
            
                                    const panel = document.getElementById("syntaxDetailsPanel");
                                    if (panel) {
                                        panel.className = "space-y-4 flex-1 text-left not-italic text-sm text-slate-200 overflow-y-auto max-h-[60vh] pr-1 silverware-scroll animate-fadeIn";
                                        panel.innerHTML = `
                                            <div>
                                                <span class="text-xs uppercase tracking-widest text-blue-400 font-bold">Terme Lexical Sélectionné</span>
                                                <p class="text-3xl font-serif font-bold text-white mt-1">${item.mot_original} <span class="text-xs font-sans font-normal text-slate-400">(${item.translitteration})</span></p>
                                            </div>
                                            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
                                                <span class="text-xs uppercase font-bold text-amber-400 block mb-0.5">Analyse Morphologique & Syntaxique</span>
                                                <p class="font-mono text-slate-100 leading-relaxed">${item.analyse_syntaxique}</p>
                                            </div>
                                            <div>
                                                <span class="text-xs uppercase font-bold text-emerald-400">Sens Littéral & Racine</span>
                                                <p class="text-sm font-semibold text-white mt-0.5">« ${item.sens_litteral} » <span class="bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-mono text-xs">${item.lemme_strong}</span></p>
                                            </div>
                                            <div class="pt-2 border-t border-slate-700/60">
                                                <span class="text-xs uppercase font-bold text-indigo-400 block mb-1">🎯 Impact et Portée Théologique</span>
                                                <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800">${item.impact_syntaxique_theologique}</p>
                                            </div>
                                        `;
                                    }
                                });
            
                                fluidInteractiveText.appendChild(spanMot);
                            });
                        });
                    }
            
                    if (arrangementBlock) arrangementBlock.classList.remove('hidden');
                    if (resultSection) {
                        resultSection.classList.remove('hidden');
                        resultSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }                       
                else {
                    alert("Résultats reçus pour une action non gérée graphiquement.");
                }
            } else {
                alert(data.message || "Une erreur est survenue lors du traitement par le serveur.");
            }

        } catch (error) {
            console.error("Erreur de connexion avec le backend :", error);
            alert("Impossible de joindre le serveur backend.");
        } finally {
            // Désactivation de l'état de chargement
            globalLoader.classList.add('hidden');
            btnSubmitAction.disabled = false;
            btnSubmitAction.classList.remove('opacity-75', 'cursor-not-allowed');
            actionSelect.disabled = false;
        }
    });
} else {
    console.log("Le bouton n'est pas encore entendu");
}