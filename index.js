// Serveur de paiement Emt Academy (Cloudflare Worker).
// La clé KPrimePay est stockée dans le secret KPP_KEY : jamais visible par les visiteurs.
const PRODUITS = {
  bourse:    { nom: "Comment investir en bourse depuis l'Afrique", prix: 2000, fichier: "formation-investir-en-bourse.pdf" },
  ecommerce: { nom: "E-commerce en Afrique",                       prix: 1200, fichier: "formation-ecommerce-en-afrique.pdf" },
  business:  { nom: "Vendre des produits digitaux (version 2026)", prix: 800,  fichier: "formation-business-en-ligne.pdf" },
  youtube:   { nom: "YouTube & Automatisation",                    prix: 700,  fichier: "formation-youtube-automatisation.pdf" },
  trading:   { nom: "Trading Premium",                             prix: 3500, fichier: "formation-trading-premium.pdf" },
};
const API = "https://api.kprimepay.com/v2";
const METHODES = ["MIXX-YAS-TG", "MOOV-MONEY-TG", "CARD"]; // T-Money, Flooz, Visa/Mastercard
const ORDER = /^(bourse|ecommerce|trading|business|youtube)_[a-f0-9]{32}$/;

const cors = env => ({
  "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});
const json = (env, data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors(env) } });

const base64 = buf => {
  const b = new Uint8Array(buf); let s = "";
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
};

async function kpp(env, path, body, idem) {
  const headers = { Authorization: "Bearer " + env.KPP_KEY, "Content-Type": "application/json" };
  if (idem) headers["Idempotency-Key"] = idem;
  const r = await fetch(API + path, { method: "POST", headers, body: JSON.stringify(body) });
  return { http: r.status, body: await r.json().catch(() => ({})) };
}

// Vérifie le paiement auprès de KPrimePay (on ne fait jamais confiance au navigateur).
async function verifier(env, order) {
  if (!ORDER.test(order || "")) return { status: "invalid" };
  const p = PRODUITS[order.split("_")[0]];
  const r = await kpp(env, "/transactions/debit-status", { transaction_id: order });
  const d = r.body && r.body.data;
  if (!d) return { status: "pending", p };                       // pas encore de transaction
  if (d.status === "success" && Number(d.transaction_amount) >= p.prix) return { status: "success", p };
  return { status: d.status === "failed" ? "failed" : "pending", p };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });

    // 1) Création du paiement : le prix vient d'ici, jamais du navigateur
    if (url.pathname === "/api/checkout" && req.method === "POST") {
      const { slug } = await req.json().catch(() => ({}));
      const p = PRODUITS[slug];
      if (!p) return json(env, { error: "Formation inconnue" }, 400);
      const order = slug + "_" + crypto.randomUUID().replaceAll("-", "");
      const r = await kpp(env, "/checkout", {
        transaction_id: order, amount: p.prix, currency: "XOF",
        mode: Number(env.MODE), with_fees: Number(env.WITH_FEES),
        description: p.nom, locale: "fr", payment_methods: METHODES,
        return_url: env.SITE_URL + "/merci.html?order=" + order,
      }, "checkout-" + order);
      const link = r.body && r.body.data && r.body.data.checkout_url;
      if (!link) return json(env, { error: "Paiement indisponible" }, 502);
      return json(env, { checkout_url: link, order });
    }

    // 2) Statut du paiement
    if (url.pathname === "/api/status") {
      const v = await verifier(env, url.searchParams.get("order"));
      return json(env, { status: v.status, nom: v.p && v.p.nom });
    }

    // 3) Envoi du PDF par e-mail, seulement si le paiement est confirmé (3 envois max par commande)
    if (url.pathname === "/api/envoyer" && req.method === "POST") {
      const { order, email } = await req.json().catch(() => ({}));
      if (!/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(email || "")) return json(env, { error: "E-mail invalide" }, 400);
      const v = await verifier(env, order);
      if (v.status !== "success") return json(env, { error: "Paiement non confirmé" }, 403);
      const n = Number(await env.ORDERS.get(order)) || 0;
      if (n >= 3) return json(env, { error: "Limite d'envois atteinte. Écris-nous : " + env.MAIL_FROM }, 429);
      const f = await env.ASSETS.fetch(new Request(new URL("/" + v.p.fichier, url)));
      if (!f.ok) return json(env, { error: "Fichier introuvable" }, 500);
      const r = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": env.BREVO_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: env.MAIL_FROM_NAME, email: env.MAIL_FROM },
          to: [{ email }],
          subject: "Ta formation : " + v.p.nom,
          htmlContent: "<p>Bonjour,</p><p>Merci pour ton achat ! Tu trouveras ta formation <b>" + v.p.nom +
            "</b> en pièce jointe (PDF).</p><p>Une question ? Réponds à ce message ou écris à " + env.MAIL_FROM +
            ".</p><p>— Emt Academy</p>",
          attachment: [{ name: v.p.fichier, content: base64(await f.arrayBuffer()) }],
        }),
      });
      if (!r.ok) return json(env, { error: "Envoi impossible pour le moment" }, 502);
      await env.ORDERS.put(order, String(n + 1), { expirationTtl: 60 * 60 * 24 * 90 });
      return json(env, { ok: true });
    }
    return json(env, { error: "Not found" }, 404);
  },
};
