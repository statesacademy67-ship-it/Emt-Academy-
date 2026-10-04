const grille = document.getElementById("grille");
document.getElementById("annee").textContent = new Date().getFullYear();

function creerCarte(p) {
  const carte = document.createElement("article");
  carte.className = "carte";

  const img = document.createElement("img");
  img.src = p.affiche;
  img.alt = "Affiche de la formation " + p.nom;
  img.loading = "lazy";

  const corps = document.createElement("div");
  corps.className = "carte-corps";

  const titre = document.createElement("h2");
  titre.textContent = p.nom;
  const desc = document.createElement("p");
  desc.textContent = p.description;
  const prix = document.createElement("div");
  prix.className = "prix";
  prix.textContent = p.prix;
  const btn = document.createElement("a");
  btn.className = "btn";
  btn.href = p.lienAchat;
  btn.textContent = "Acheter";

  corps.append(titre, desc, prix, btn);
  carte.append(img, corps);
  return carte;
}

if (PRODUITS.length === 0) {
  grille.innerHTML = '<p class="vide">Les formations arrivent bientôt.</p>';
} else {
  PRODUITS.forEach(p => grille.appendChild(creerCarte(p)));
}
