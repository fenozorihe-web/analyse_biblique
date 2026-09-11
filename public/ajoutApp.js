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
