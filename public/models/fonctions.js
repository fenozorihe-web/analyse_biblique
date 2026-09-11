export function displayAnalyse(data) {
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
            wordDiv.className = 'border-b border-gray-100 pb-3 last:border-0 mb-2';
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
            li.className = 'leading-relaxed text-slate-700 mb-1';
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
                provDiv.className = 'bg-white p-3 rounded-lg border border-orange-200/60 shadow-sm space-y-2 mb-2';
                provDiv.innerHTML = `
                    <p class="font-semibold text-orange-950 italic text-sm">« ${prov.proverbe_malagasy} »</p>
                    <p class="text-xs text-gray-500 font-medium border-l-2 border-gray-300 pl-2">Traduction : ${prov.traduction_francaise}</p>
                    <p class="text-xs text-gray-700 bg-orange-50/50 p-2 rounded border border-orange-100/70 leading-relaxed">${prov.explication_culturelle || ''}</p>
                `;
                proverbesContainer.appendChild(provDiv);
            });
        }
    }

    // ✅ CORRECTION 1 & 3 : Affichage exclusif du bloc d'analyse et scroll fluide
    if (analyserInterfaceBlock) {
        analyserInterfaceBlock.classList.remove('hidden')
    };
    if (resultSection) {
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
}

const genre_texte = document.getElementById('genre_texte');
const interrelation_textes = document.getElementById('interrelation_textes');
const type_predication = document.getElementById('type_predication');
const theme_principal = document.getElementById('theme_principal');
const introduction = document.getElementById('introduction');
const points_principaux = document.getElementById('points_principaux');
const conclusion = document.getElementById('conclusion');

export function displayPredication (data) {
    if (genre_texte) genreElement.innerHTML = `Genre : ${data.genre_litteraire || 'Non spécifié'}`;
    if (interrelation_textes) methodeElement.innerHTML = data.methode_analyse_recommandee || '';
    if (type_predication) methodeElement.innerHTML = data.type_predication || '';
    if (theme_principal) methodeElement.innerHTML = data.theme_principal || '';
    if (introduction) methodeElement.innerHTML = data.introduction || '';
    if (points_principaux) methodeElement.innerHTML = data.points_principaux || '';
    if (conclusion) methodeElement.innerHTML = data.conclusion || '';
}
