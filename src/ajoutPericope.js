import Pericope from "./models/Pericope.js";

/**
 * Génère le formulaire HTML d'ajout de péricope
 * @returns {string} Code HTML avec styles Tailwind
 */
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
                <input type="text" id="epitre" required
                    class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    placeholder="Ex: Romains 13:11-14">
            </div>

            <!-- Évangile -->
            <div class="flex flex-col gap-1.5">
                <label for="evangile" class="text-sm font-semibold text-slate-700">Lecture de l'Évangile</label>
                <input type="text" id="evangile" required
                    class="w-full border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    placeholder="Ex: Matthieu 24:36-44">
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

/**
 * Insère une péricope liturgique dans MongoDB Atlas
 * @param {Object} data - Objet contenant les lectures
 */
export async function insertPericope(data) {
  try {
    const { dimanche_ou_fete, ancien_testament, epitre, evangile } = data;

    // Découpage automatique des références pour en faire des mots-clés de recherche
    const mots_cles = [
      dimanche_ou_fete.toLowerCase(),
      ancien_testament.split(" ")[0].toLowerCase(),
      epitre.split(" ")[0].toLowerCase(),
      evangile.split(" ")[0].toLowerCase()
    ];

    const nouvellePericope = new Pericope({
      dimanche_ou_fete,
      ancien_testament,
      epitre,
      evangile,
      mots_cles
    });

    await nouvellePericope.save();
    return { success: true, message: "Péricope enregistrée avec succès !" };
  } catch (error) {
    console.error("Erreur lors de l'insertion Mongoose :", error);
    throw error;
  }
}