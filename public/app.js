import {displayAnalyse} from "./models/fonctions.js"
// import {displayPredication} from "./fonctions.js"
import { getAjoutPericopeTemplate } from "./models/ajoutApp.js";
// ✅ NOUVEL IMPORT ÉPURÉ
import { initBibleCalendar } from "./models/bibleSelector.js"; 

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

// ==========================================
// ⚙️ GESTION DU BOUTON ET DU FORMULAIRE D'AJOUT
// ==========================================
const mainFormSection = document.getElementById('mainFormSection'); // Récupération du formulaire principal

if (btnToggleAdmin && adminBlock && formContainer && mainFormSection) {
    btnToggleAdmin.addEventListener('click', async () => {

        console.log("L'addEventListener est maintenant entendu.");
        
        // 🔄 CAS 1 : L'administration est ouverte, l'utilisateur CLIQUE SUR FERMER
        if (!adminBlock.classList.contains('hidden')) {
            adminBlock.classList.add('hidden'); // Ferme l'administration
            
            // ✅ CORRECTION FIXE : Fait réapparaître instantanément le formulaire principal
            mainFormSection.classList.remove('hidden'); 
            
            btnToggleAdmin.textContent = "⚙️ Gérer les Péricopes";
            return;
        }

        // 🔄 CAS 2 : L'administration est fermée, l'utilisateur CLIQUE SUR OUVRIR
        formContainer.innerHTML = `<p class="text-center text-slate-400 italic py-4">Chargement du formulaire...</p>`;
        adminBlock.classList.remove('hidden');
        mainFormSection.classList.add('hidden'); // Cache complètement le formulaire principal
        btnToggleAdmin.textContent = "❌ Fermer l'Administration";

        const template = getAjoutPericopeTemplate();
        console.log(template);

        formContainer.innerHTML = template;

        // Activation de l'écouteur d'événement sur le formulaire d'ajout
        setupPericopeFormListener();
    });
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
                } else {
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