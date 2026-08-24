// Sélection des éléments de l'interface globale
const bibleTextInput = document.getElementById('bibleText');
const resultSection = document.getElementById('resultSection');

const exegeseContainer = document.getElementById('exegeseContainer');
const theologieContainer = document.getElementById('theologieContainer');
const proverbesContainer = document.getElementById('proverbesContainer');

// Nouveaux éléments de l'interface (Liste et Bouton Unique)
const actionSelect = document.getElementById('actionSelect');
const btnSubmitAction = document.getElementById('btnSubmitAction');
const globalLoader = document.getElementById('globalLoader');

// URL de votre API Backend Node.js
const API_URL = '/api/items'; 

// Écouteur d'événement sur le bouton unique
if (btnSubmitAction && actionSelect) {
    btnSubmitAction.addEventListener('click', async () => {
        const textValue = bibleTextInput.value.trim();
        
        // 1. Validation de la saisie de texte
        if (!textValue) {
            alert("Veuillez introduire un texte biblique avant de lancer l'action.");
            bibleTextInput.focus();
            return;
        }

        // 2. Récupération de l'action choisie dans la liste déroulante
        const selectedAction = actionSelect.value; // Renvoie 'analyser', 'predire', 'enseigner' ou 'arranger'

        // 3. Activation de l'état de chargement graphique
        globalLoader.classList.remove('hidden');
        btnSubmitAction.disabled = true;
        btnSubmitAction.classList.add('opacity-75', 'cursor-not-allowed');
        actionSelect.disabled = true; // Bloque aussi la liste pendant le traitement
        resultSection.classList.add('hidden');

        try {
            // Appel AJAX vers votre serveur Express
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Envoi des données dynamiques au serveur
                body: JSON.stringify({ 
                    userBibleText: textValue,
                    actionRequested: selectedAction 
                })
            });

            const data = await response.json();

            if (data.success) {
                displayResults(data);
            } else {
                alert("Une erreur est survenue lors du traitement par le serveur.");
            }

        } catch (error) {
            console.error("Erreur de connexion avec le backend :", error);
            alert("Impossible de joindre le serveur backend.");
        } finally {
            // 4. Désactivation de l'état de chargement
            globalLoader.classList.add('hidden');
            btnSubmitAction.disabled = false;
            btnSubmitAction.classList.remove('opacity-75', 'cursor-not-allowed');
            actionSelect.disabled = false;
        }
    });
}

/**
 * Injecte dynamiquement les données reçues (Inchangée mais sécurisée)
 */
function displayResults(data) {
    const genreElement = document.getElementById('genreLittéraire');
    const methodeElement = document.getElementById('methodeAnalyse');

    if (genreElement) genreElement.innerHTML = `Genre : ${data.genre_litteraire || 'Non spécifié'}`;
    if (methodeElement) methodeElement.innerHTML = data.methode_analyse_recommandee || '';
    
    if (exegeseContainer) exegeseContainer.innerHTML = '';
    if (theologieContainer) theologieContainer.innerHTML = '';
    if (proverbesContainer) proverbesContainer.innerHTML = '';

    if (exegeseContainer && data.exegese) {
        data.exegese.forEach(item => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'border-b border-gray-100 pb-3 last:border-0';
            wordDiv.innerHTML = `
                <p class="font-bold text-slate-900 text-base">${item.mot} <span class="text-xs text-blue-600 font-normal italic bg-blue-50 px-2 py-0.5 rounded ml-1">${item.transliteration || ''}</span></p>
                <p class="text-xs text-gray-600 mt-1 leading-relaxed">${item.sens_selon_methode}</p>
            `;
            exegeseContainer.appendChild(wordDiv);
        });
    }

    if (theologieContainer && data.theologie) {
        data.theologie.forEach(concept => {
            const li = document.createElement('li');
            li.className = 'leading-relaxed';
            li.textContent = concept;
            theologieContainer.appendChild(li);
        });
    }

    const canonLivre = document.getElementById('canonLivre');
    const canonGlobal = document.getElementById('canonGlobal');
    const lutherDoctrinale = document.getElementById('lutherDoctrinale');
    const lutherConfession = document.getElementById('lutherConfession');

    if (canonLivre && data.pertinence_canonique) canonLivre.textContent = data.pertinence_canonique.dans_le_livre;
    if (canonGlobal && data.pertinence_canonique) canonGlobal.textContent = data.pertinence_canonique.dans_le_canon;
    if (lutherDoctrinale && data.connexion_lutherienne) lutherDoctrinale.textContent = data.connexion_lutherienne.articulation_doctrinale;
    if (lutherConfession && data.connexion_lutherienne) lutherConfession.textContent = data.connexion_lutherienne.references_confessionnelles;

    if (proverbesContainer) {
        if (!data.illustrations_malgaches || data.illustrations_malgaches.length === 0) {
            proverbesContainer.innerHTML = `
                <div class="text-center py-6 text-gray-400 italic">
                    Aucun ohabolana correspondant trouvé dans votre livre numérique pour ces thèmes.
                </div>`;
        } else {
            data.illustrations_malgaches.forEach(prov => {
                const provDiv = document.createElement('div');
                provDiv.className = 'bg-white p-3 rounded-lg border border-orange-200/60 shadow-sm space-y-2';
                provDiv.innerHTML = `
                    <p class="font-semibold text-orange-950 italic text-sm">« ${prov.proverbe_malagasy} »</p>
                    <p class="text-xs text-gray-500 font-medium border-l-2 border-gray-300 pl-2">Traduction : ${prov.traduction_francaise}</p>
                    <p class="text-xs text-gray-700 bg-orange-50/50 p-2 rounded border border-orange-100/70 leading-relaxed">${prov.explication_culturelle}</p>
                `;
                proverbesContainer.appendChild(provDiv);
            });
        }
    }

    if (resultSection) {
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
}