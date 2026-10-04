const SITE = location.href.replace(/[^/]*([?#].*)?$/, "");   // dossier du site, déduit automatiquement
const lienFormation = p => SITE + "formation-" + p.slug + ".html";

document.getElementById("annee").textContent = new Date().getFullYear();

function copier(texte, bouton) {
  const ok = () => { const t = bouton.textContent; bouton.textContent = "Lien copié ✓"; setTimeout(() => bouton.textContent = t, 2000); };
  if (navigator.clipboard) navigator.clipboard.writeText(texte).then(ok, () => prompt("Copie ce lien :", texte));
  else prompt("Copie ce lien :", texte);
}

function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }

async function payer(p, btn) {
  const t = btn.textContent; btn.textContent = "Redirection…";
  try {
    const r = await fetch(API_URL + "/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: p.slug }) });
    const d = await r.json();
    if (!d.checkout_url) throw new Error();
    try { localStorage.setItem("emt_order", d.order); } catch (_) {}
    location.href = d.checkout_url;
  } catch (_) {
    btn.textContent = t;
    alert("Paiement momentanément indisponible. Écris-nous : emtacademy@protonmail.com");
  }
}

function boutons(p, avecVoir) {
  const zone = el("div", "actions");
  const acheter = el("a", "btn", "Acheter"); acheter.href = p.lienAchat;
  acheter.onclick = e => { if (!API_URL) return; e.preventDefault(); payer(p, acheter); };
  zone.append(acheter);
  if (avecVoir) { const voir = el("a", "btn btn-clair", "Voir la formation"); voir.href = lienFormation(p); zone.append(voir); }
  const partage = el("button", "btn btn-clair", "Copier le lien à partager");
  partage.type = "button";
  partage.onclick = () => copier(lienFormation(p), partage);
  zone.append(partage);
  return zone;
}

function creerCarte(p) {
  const carte = el("article", "carte");
  const lien = el("a"); lien.href = lienFormation(p);
  const img = el("img"); img.src = p.affiche; img.alt = "Affiche de la formation " + p.nom; img.loading = "lazy";
  lien.append(img);
  const corps = el("div", "carte-corps");
  corps.append(el("h2", "", p.nom), el("p", "", p.description), el("div", "prix", p.prix), boutons(p, true));
  carte.append(lien, corps);
  return carte;
}

const grille = document.getElementById("grille");
// Tri automatique : du moins cher au plus cher
PRODUITS.sort((a, b) => parseInt(a.prix.replace(/\D/g, "")) - parseInt(b.prix.replace(/\D/g, "")));
if (grille) {
  if (PRODUITS.length === 0) grille.innerHTML = '<p class="vide">Les formations arrivent bientôt.</p>';
  else PRODUITS.forEach(p => grille.appendChild(creerCarte(p)));
}

const detail = document.getElementById("detail");
if (detail) {
  const p = PRODUITS.find(x => x.slug === detail.dataset.slug);
  if (p) {
    const img = el("img", "detail-img"); img.src = p.affiche; img.alt = "Affiche de la formation " + p.nom;
    const txt = el("div", "detail-txt");
    txt.append(el("h1", "", p.nom), el("p", "", p.description), el("div", "prix", p.prix), boutons(p, false));
    detail.append(img, txt);
  }
}

const paiements = document.getElementById("paiements");
if (paiements) {
  paiements.append(el("h2", "", "Moyens de paiement acceptés"));
  const liste = el("div", "pay-liste");
  [["pay-flooz.jpg", "Flooz"], ["pay-tmoney.jpg", "T-Money"], ["pay-cartes.jpg", "Visa / Mastercard"]].forEach(([f, n]) => {
    const b = el("div", "pay"); const i = el("img"); i.src = f; i.alt = n;
    b.append(i, el("span", "", n)); liste.append(b);
  });
  paiements.append(liste);
}
