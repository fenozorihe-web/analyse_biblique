// ✅ IMPORTATION DE LA BASE DE DONNÉES DEPUIS LE FICHIER EXTERNE
import { BIBLE_STRUCTURE } from "./bibleData.js"; 


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

    inputCibleActuel = inputCible; 

    // Réinitialisation lors de l'ouverture
    currentStep = 1;
    selectedLivre = "";
    selectedChapitre = "";
    selectedVersetDebut = null;
    selectedVersetFin = null;

    if (bibleModal) bibleModal.classList.remove("hidden");

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
            currentStep > 1 ? btnModalBack.classList.remove("hidden") : btnModalBack.classList.add("hidden");
        }
    };

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
        // ÉTAPE 2 : Choix du Chapitre (Dynamique)
        else if (currentStep === 2) {
            modalGridContainer.className = "p-6 overflow-y-auto grid grid-cols-5 gap-2 max-h-[50vh]";
            // ✅ CORRECTION : Le nombre exact de chapitres correspond à la longueur du tableau du livre
            const totalChapitres = BIBLE_STRUCTURE[selectedLivre].length;

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
        // ÉTAPE 3 : Choix des Versets (Précision Absolue)
        else if (currentStep === 3) {
            modalGridContainer.className = "p-6 overflow-y-auto grid grid-cols-6 gap-1.5 max-h-[50vh]";
            // ✅ CORRECTION : Récupération du nombre exact de versets pour ce chapitre précis (Index i - 1)
            const totalVersets = BIBLE_STRUCTURE[selectedLivre][selectedChapitre - 1]; 

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

    drawGrid();
}