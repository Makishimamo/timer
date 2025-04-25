// Stockage des catégories
let categories = [];

/**
 * Charge les catégories depuis le localStorage
 */
function loadCategories() {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
        displayCategories();
    }
}

/**
 * Affiche les catégories dans le tableau
 */
function displayCategories() {
    const tbody = document.querySelector('#categories-table tbody');
    tbody.innerHTML = '';

    categories.forEach((category, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(category.name)}</td>
            <td>${category.minAge}</td>
            <td>${category.maxAge}</td>
            <td>
                <button onclick="deleteCategory(${index})" style="background-color: #e74c3c; padding: 5px 10px;">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Ajoute une nouvelle catégorie
 */
function addCategory() {
    const name = document.getElementById('category-name').value.trim();
    const minAge = parseInt(document.getElementById('min-age').value);
    const maxAge = parseInt(document.getElementById('max-age').value);

    // Validation des entrées
    if (!name || isNaN(minAge) || isNaN(maxAge)) {
        alert('Veuillez remplir tous les champs correctement');
        return;
    }

    if (minAge < 0 || maxAge < 0) {
        alert('Les âges ne peuvent pas être négatifs');
        return;
    }

    if (minAge >= maxAge) {
        alert('L\'âge minimum doit être inférieur à l\'âge maximum');
        return;
    }

    // Vérification des doublons
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        alert('Cette catégorie existe déjà');
        return;
    }

    try {
        categories.push({
            name: name,
            minAge: minAge,
            maxAge: maxAge
        });

        // Sauvegarde dans le localStorage
        localStorage.setItem('categories', JSON.stringify(categories));

        // Réinitialisation des champs
        document.getElementById('category-name').value = '';
        document.getElementById('min-age').value = '';
        document.getElementById('max-age').value = '';

        // Mise à jour de l'affichage
        displayCategories();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde :', error);
        alert('Une erreur est survenue lors de la sauvegarde');
    }
}

/**
 * Supprime une catégorie
 */
function deleteCategory(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
        categories.splice(index, 1);
        localStorage.setItem('categories', JSON.stringify(categories));
        displayCategories();
    }
}

// Fonction utilitaire pour échapper le HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    document.getElementById('add-category-btn').addEventListener('click', addCategory);
}); 