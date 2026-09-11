document.addEventListener("DOMContentLoaded", async () => {
    const formContainer = document.getElementById("formContainer");

    try {
        // 1. Récupération du HTML depuis le Backend
        const response = await fetch('/api/ajoutPericope');
        const data = await response.json();

        if (data.success && data.html) {
            // 2. Injection du gabarit HTML dans le DOM
            formContainer.innerHTML = data.html;
            
            // 3. Activation de l'écouteur d'événement sur le formulaire fraîchement injecté
            setupFormListener();
        }
    } catch (error) {
        console.error("Erreur de chargement du template :", error);
        formContainer.innerHTML = `<p class="text-center text-red-500 font-medium">Erreur lors de la récupération du formulaire.</p>`;
    }
});

function setupFormListener() {
    const form = document.getElementById("formPericope");
    const loader = document.getElementById("pericopeLoader");
    const btnSubmit = document.getElementById("btnSubmitPericope");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // Évite le rechargement de page classique

            // Récupération des valeurs saisies
            const payload = {
                dimanche_ou_fete: document.getElementById("dimanche_ou_fete").value.trim(),
                ancien_testament: document.getElementById("ancien_testament").value.trim(),
                epitre: document.getElementById("epitre").value.trim(),
                evangile: document.getElementById("evangile").value.trim(),
            };

            // Verrouillage de l'interface pendant l'enregistrement
            loader.classList.remove("hidden");
            btnSubmit.disabled = true;
            btnSubmit.classList.add("opacity-75", "cursor-not-allowed");

            try {
                const response = await fetch('/api/ajoutPericope', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (data.success) {
                    alert("🎉 Succès : La péricope liturgique a bien été enregistrée dans MongoDB !");
                    form.reset(); // Vide les champs du formulaire
                } else {
                    alert(`❌ Échec : ${data.message}`);
                }
            } catch (error) {
                console.error("Erreur lors de la soumission :", error);
                alert("Impossible de contacter le serveur backend pour insérer les données.");
            } finally {
                // Déverrouillage de l'interface graphique
                loader.classList.add("hidden");
                btnSubmit.disabled = false;
                btnSubmit.classList.remove("opacity-75", "cursor-not-allowed");
            }
        });
    }
}

export function getAjoutPericopeTemplate() {
    return `
      <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <div class="mb-6 border-b pb-4">
              <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  ➕ Enregistrer une Péricope Liturgique
              </h2>
              <p class="text-sm text-slate-500 mt-1">
                  Ajoutez un jour de fête et ses lectures associées dans la base MongoDB.
              </p>
          </div>
  
          <form id="formPericope" class="space-y-5">
              <!-- Dimanche ou Fête -->
              <div class="flex flex-col gap-1.5">
                  <label for="dimanche_ou_fete" class="text-sm font-semibold text-slate-700">Nom du Dimanche ou de la Fête</label>
                  <input type="text" id="dimanche_ou_fete" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      placeholder="Ex: 1er Dimanche de l'Avent, Noël...">
              </div>
  
              <!-- Ancien Testament -->
              <div class="flex flex-col gap-1.5">
                  <label for="ancien_testament" class="text-sm font-semibold text-slate-700">Lecture de l'Ancien Testament</label>
                  <input type="text" id="ancien_testament" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      placeholder="Ex: Ésaïe 2:1-5">
              </div>
  
              <!-- Épître -->
              <div class="flex flex-col gap-1.5">
                  <label for="epitre" class="text-sm font-semibold text-slate-700">Lecture de l'Épître</label>
                  <input type="text" id="epitre_1" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      placeholder="Ex: Romains 13:11-14">
                  <input type="text" id="epitre_2" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      placeholder="Ex: Apokalypse 3:20-22">
                  <input type="text" id="epitre_3" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      placeholder="Ex: Jeremie 31: 31-34">
              </div>
  
              <!-- Évangile -->
              <div class="flex flex-col gap-1.5">
                  <label for="evangile" class="text-sm font-semibold text-slate-700">Lecture de l'Évangile</label>
                  <input type="text" id="evangile_1" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      placeholder="Ex: Matthieu 21:1-9">
                  <input type="text" id="evangile_2" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      placeholder="Ex: Jean 18:33-37">
                  <input type="text" id="evangile_3" required
                      class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      placeholder="Ex: Luc 4:16-22">
              </div>
  
              <!-- Bouton de soumission -->
              <div class="pt-2">
                  <button type="submit" id="btnSubmitPericope"
                      class="w-full px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow shadow-emerald-100">
                      <span>Enregistrer dans MongoDB</span>
                      <div id="pericopeLoader" class="hidden animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  </button>
              </div>
          </form>
      </div>
    `;
  }