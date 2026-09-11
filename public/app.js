import {displayAnalyse} from "./models/fonctions.js"
// import {displayPredication} from "./fonctions.js"
import { getAjoutPericopeTemplate } from "./models/ajoutApp.js";

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
if (btnToggleAdmin && adminBlock && formContainer) {
    btnToggleAdmin.addEventListener('click', async () => {

        console.log("L'addEventListener est maintenant entendu.");
        // Si l'interface d'administration est déjà ouverte, on la ferme au clic
        if (!adminBlock.classList.contains('hidden')) {
            adminBlock.classList.add('hidden');
            btnToggleAdmin.textContent = "⚙️ Gérer les Péricopes";
            return;
        }

        formContainer.innerHTML = `<p class="text-center text-slate-400 italic py-4">Chargement du formulaire...</p>`;
        adminBlock.classList.remove('hidden');
        btnToggleAdmin.textContent = "❌ Fermer l'Administration";

        const template = getAjoutPericopeTemplate()
        console.log(template);

        formContainer.innerHTML = template;

        // try {
        //     // Appel vers votre route GET pour récupérer le template HTML
        //     const response = await fetch(`${API}/ajoutPericope`);
        //     const data = await response.json();

        //     if (data.success && data.html) {
        //         // Injection dynamique du code HTML du formulaire
        //         formContainer.innerHTML = data.html;
                
        //         // Activation des écouteurs sur le nouveau formulaire injecté
        //         setupPericopeFormListener();
        //     } else {
        //         formContainer.innerHTML = `<p class="text-red-500 font-medium">Erreur lors de la génération du formulaire.</p>`;
        //     }
        // } catch (error) {
        //     console.error("Erreur d'appel formulaire :", error);
        //     formContainer.innerHTML = `<p class="text-red-500 font-medium">Impossible de joindre le serveur.</p>`;
        // }
    });
}

/**
 * Configure la gestion de la soumission du formulaire de péricope injecté
 */
function setupPericopeFormListener() {
    const form = document.getElementById("formPericope");
    const pericopeLoader = document.getElementById("pericopeLoader");
    const btnSubmitPericope = document.getElementById("btnSubmitPericope");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const payload = {
                dimanche_ou_fete: document.getElementById("dimanche_ou_fete").value.trim(),
                ancien_testament: document.getElementById("ancien_testament").value.trim(),
                epitre: document.getElementById("epitre").value.trim(),
                evangile: document.getElementById("evangile").value.trim()
            };

            // Blocage graphique du formulaire pendant le traitement
            if (pericopeLoader) pericopeLoader.classList.remove("hidden");
            if (btnSubmitPericope) {
                btnSubmitPericope.disabled = true;
                btnSubmitPericope.classList.add("opacity-75", "cursor-not-allowed");
            }

            try {
                // Envoi des données saisies vers votre route POST
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
                    alert(`❌ Échec : ${data.message || "Erreur de traitement"}`);
                }
            } catch (error) {
                console.error("Erreur insertion :", error);
                alert("Impossible d'enregistrer la péricope. Vérifiez la connexion du serveur.");
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