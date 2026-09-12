// Base de données structurelle des principaux livres d'étude liturgique (Nom: Nombre de chapitres)
const BIBLE_STRUCTURE = {
    "Genèse": 50, "Exode": 40, "Lévitique": 27, "Nombres": 36, "Deutéronome": 34,
    "Ésaïe": 66, "Jérémie": 52, "Ézéchiel": 48, "Psaumes": 150, "Proverbes": 31,
    "Matthieu": 28, "Marc": 16, "Luc": 24, "Jean": 21,
    "Actes": 28, "Romains": 16, "1 Corinthiens": 16, "2 Corinthiens": 13,
    "Galates": 6, "Éphésiens": 6, "Philippiens": 4, "Colossiens": 4,
    "1 Thessaloniciens": 5, "2 Thessaloniciens": 3, "1 Timothée": 6, "2 Timothée": 4,
    "Hébreux": 13, "Jacques": 5, "1 Pierre": 5, "2 Pierre": 3, "Apocalypse": 22
};

// États internes de la sélection de manière isolée
let currentStep = 1; 
let selectedLivre = "";
let selectedChapitre = "";
let selectedVersetDebut = null;
let selectedVersetFin = null;
let isListenersConfigured = false; 

// ✅ FIX CRUCIAL : Variable globale au module pour suivre l'input actif en temps réel
let inputCibleActuel = null; 

/**
 * Initialise et pilote le comportement du sélecteur calendrier biblique
 * @param {HTMLInputElement} inputCible - L'élément input sur lequel l'utilisateur a cliqué
 */
export function initBibleCalendar(inputCible) {
    const bibleModal = document.getElementById("bibleModal");
    const modalGridContainer = document.getElementById("modalGridContainer");
    const modalPreview = document.getElementById("modalPreview");
    const btnModalBack = document.getElementById("btnModalBack");
    const btnValidatePassage = document.getElementById("btnValidatePassage");
    const closeModal = document.getElementById("closeModal");

    // ✅ Mettre à jour l'input cible à chaque nouvel appel/clic
    inputCibleActuel = inputCible; 

    // Réinitialisation des états à chaque ouverture de la fenêtre modale
    currentStep = 1;
    selectedLivre = "";
    selectedChapitre = "";
    selectedVersetDebut = null;
    selectedVersetFin = null;

    if (bibleModal) bibleModal.classList.remove("hidden");

    // Fonction pour rafraîchir l'affichage des étapes (fil d'ariane)
    const updateStepsUI = () => {
        document.querySelectorAll("[id-step]").forEach(el => {
            const stepNum = parseInt(el.getAttribute("id-step"));
            if (stepNum === currentStep) {
                el.className = "text-blue-600 font-bold border-b-2 border-blue-500 pb-0.5";
            } else if (stepNum < currentStep) {
                el.className = "text-emerald-600 font-medium line-through";
            } else {
                el.className = "text-slate-400 font-normal";
            }
        });
        
        if (btnModalBack) {
            if (currentStep > 1) {
                btnModalBack.classList.remove("hidden");
            } else {
                btnModalBack.classList.add("hidden");
            }
        }
    };

    // Fonction pour mettre à jour l'aperçu textuel de la référence
    const renderPreviewText = () => {
        if (!selectedLivre) {
            modalPreview.textContent = "Aucun livre choisi";
            if (btnValidatePassage) {
                btnValidatePassage.disabled = true;
                btnValidatePassage.className = "ml-auto px-5 py-2.5 bg-blue-600 opacity-50 cursor-not-allowed text-white rounded-xl font-bold text-xs transition shadow-sm";
            }
            return;
        }
        let text = selectedLivre;
        if (selectedChapitre) text += ` ${selectedChapitre}`;
        if (selectedVersetDebut) text += `:${selectedVersetDebut}`;
        if (selectedVersetFin) text += `-${selectedVersetFin}`;
        
        modalPreview.textContent = text;

        if (selectedLivre && selectedChapitre && btnValidatePassage) {
            btnValidatePassage.disabled = false;
            btnValidatePassage.className = "ml-auto px-5 py-2.5 bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-md hover:bg-blue-800 cursor-pointer";
        }
    };

    // Moteur de rendu graphique de la grille (Calendrier)
    const drawGrid = () => {
        if (!modalGridContainer) return;
        modalGridContainer.innerHTML = "";
        updateStepsUI();
        renderPreviewText();

        // ÉTAPE 1 : Choix du Livre
        if (currentStep === 1) {
            modalGridContainer.className = "p-6 overflow-y-auto grid grid-cols-3 gap-2 max-h-[50vh]";
            Object.keys(BIBLE_STRUCTURE).forEach(livre => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "p-2.5 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl border border-slate-200 transition text-left pl-3 flex items-center justify-between cursor-pointer";
                btn.innerHTML = `<span>${livre}</span> <span class="text-[10px] text-slate-400">➔</span>`;
                btn.addEventListener("click", () => {
                    selectedLivre = livre;
                    currentStep = 2;
                    drawGrid();
                });
                modalGridContainer.appendChild(btn);
            });
        }
        // ÉTAPE 2 : Choix du Chapitre
        else if (currentStep === 2) {
            modalGridContainer.className = "p-6 overflow-y-auto grid grid-cols-5 gap-2 max-h-[50vh]";
            const totalChapitres = BIBLE_STRUCTURE[selectedLivre];

            for (let i = 1; i <= totalChapitres; i++) {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "p-3 text-sm font-bold text-slate-700 bg-slate-100/70 hover:bg-blue-600 hover:text-white rounded-xl transition border text-center shadow-sm cursor-pointer";
                btn.textContent = i;
                btn.addEventListener("click", () => {
                    selectedChapitre = i;
                    currentStep = 3;
                    drawGrid();
                });
                modalGridContainer.appendChild(btn);
            }
        }
        // ÉTAPE 3 : Choix des Versets
        else if (currentStep === 3) {
            modalGridContainer.className = "p-6 overflow-y-auto grid grid-cols-6 gap-1.5 max-h-[50vh]";
            const totalVersets = 50; 

            for (let i = 1; i <= totalVersets; i++) {
                const btn = document.createElement("button");
                btn.type = "button";
                
                if (selectedVersetDebut === i) {
                    btn.className = "p-2 text-xs font-extrabold bg-blue-600 text-white rounded-lg border border-blue-700 cursor-pointer";
                } else if (selectedVersetFin === i) {
                    btn.className = "p-2 text-xs font-extrabold bg-indigo-600 text-white rounded-lg border border-indigo-700 cursor-pointer";
                } else if (selectedVersetDebut && selectedVersetFin && i > selectedVersetDebut && i < selectedVersetFin) {
                    btn.className = "p-2 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg border border-blue-100 cursor-pointer";
                } else {
                    btn.className = "p-2 text-xs font-medium bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-lg border transition cursor-pointer";
                }
                
                btn.textContent = i;
                
                btn.addEventListener("click", () => {
                    if (!selectedVersetDebut || (selectedVersetDebut && selectedVersetFin)) {
                        selectedVersetDebut = i;
                        selectedVersetFin = null;
                    } else if (selectedVersetDebut && !selectedVersetFin) {
                        if (i >= selectedVersetDebut) {
                            selectedVersetFin = i;
                        } else {
                            selectedVersetDebut = i;
                        }
                    }
                    drawGrid();
                });
                modalGridContainer.appendChild(btn);
            }
        }
    };

    // Configuration unique et définitive des boutons structurels
    if (!isListenersConfigured) {
        if (btnModalBack) {
            btnModalBack.addEventListener("click", () => {
                if (currentStep === 3) {
                    selectedVersetDebut = null;
                    selectedVersetFin = null;
                    currentStep = 2;
                } else if (currentStep === 2) {
                    selectedLivre = "";
                    currentStep = 1;
                }
                drawGrid();
            });
        }

        if (btnValidatePassage) {
            btnValidatePassage.addEventListener("click", () => {
                // ✅ MODIFICATION : Utilise la variable globale 'inputCibleActuel' mise à jour au clic
                if (inputCibleActuel && modalPreview.textContent && selectedLivre && selectedChapitre) {
                    inputCibleActuel.value = modalPreview.textContent;
                    inputCibleActuel.dispatchEvent(new Event('change'));
                }
                const modal = document.getElementById("bibleModal");
                if (modal) modal.classList.add("hidden");
            });
        }

        if (closeModal) {
            closeModal.addEventListener("click", () => {
                const modal = document.getElementById("bibleModal");
                if (modal) modal.classList.add("hidden");
            });
        }

        isListenersConfigured = true; 
    }

    // Premier lancement de la grille au clic
    drawGrid();
}
