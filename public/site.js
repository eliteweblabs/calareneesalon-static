const CMSPEAK = "https://cmspeak-production.up.railway.app";
const SLUG = "cala-renee";
const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const money = (value) => Number(String(value).replace(/[^0-9.]/g, "")) || 0;

function mergeContent(local, remote) {
  const reviews =
    Array.isArray(remote.reviews) && remote.reviews.some((row) => row.avatar) ? remote.reviews : local.reviews;
  const socials = Array.isArray(remote.socials) && remote.socials.length ? remote.socials : local.socials;
  return {
    ...local,
    ...remote,
    site: { ...local.site, ...remote.site },
    sections: { ...local.sections, ...remote.sections },
    reviews,
    socials,
  };
}

async function loadContent() {
  const local = await fetch("/content/cala-renee.json", { cache: "no-store" }).then((r) => r.json());
  try {
    const remote = await fetch(`${CMSPEAK}/api/sites/${SLUG}/content`, {
      headers: { accept: "application/json" },
    });
    if (remote.ok) return mergeContent(local, await remote.json());
  } catch {
    /* seed is enough */
  }
  return local;
}

function prettyTime(hhmm) {
  if (!hhmm) return "Closed";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")}${ampm}` : `${h12}${ampm}`;
}

function hoursLine(day) {
  return day ? `${prettyTime(day.open)} – ${prettyTime(day.close)}` : "Closed";
}

function renderStylists(root, people) {
  root.innerHTML = [...people]
    .sort((a, b) => a.order - b.order)
    .map(
      (person, index) => `
      <article class="card" data-edit-list="barbers" data-edit-index="${index}">
        <img src="${person.headshot}" alt="${person.name}" width="480" height="600" data-edit-path="barbers[${index}].headshot" />
        <div class="card-body">
          <p class="stamp role" data-edit-path="barbers[${index}].role">${person.role}</p>
          <h3 data-edit-path="barbers[${index}].name">${person.name}</h3>
          <p data-edit-path="barbers[${index}].style">${person.style}</p>
          <a class="text-link" href="tel:+19789277500">Book ${person.shortName}</a>
        </div>
      </article>`,
    )
    .join("");
}

function renderServices(root, content) {
  root.innerHTML = content.serviceGroups
    .map((group) => {
      const items = content.services.filter((item) => item.group === group.id);
      return `
        <h3 class="group-label">${group.label}</h3>
        <div class="svc-grid">
          ${items
            .map((item, index) => {
              const i = content.services.findIndex((row) => row.id === item.id);
              return `
              <article class="svc" data-edit-list="services" data-edit-index="${i}">
                <div class="svc-top">
                  <h3 data-edit-path="services[${i}].name">${item.name}</h3>
                  <p class="stamp" data-edit-path="services[${i}].duration">${item.duration}</p>
                </div>
                <p data-edit-path="services[${i}].blurb">${item.blurb}</p>
                <div class="svc-top">
                  <p class="price" data-edit-path="services[${i}].price">${item.price}</p>
                  <a class="btn btn-ink" href="tel:+19789277500">Book</a>
                </div>
              </article>`;
            })
            .join("")}
        </div>`;
    })
    .join("");
}

function renderProducts(root, products) {
  root.innerHTML = products
    .map(
      (item, index) => `
      <article class="card" data-edit-list="products" data-edit-index="${index}">
        <img src="${item.image}" alt="" />
        <div class="card-body">
          <h3 data-edit-path="products[${index}].name">${item.name}</h3>
          <p data-edit-path="products[${index}].blurb">${item.blurb}</p>
          <div class="svc-top">
            <p class="price" data-edit-path="products[${index}].price">${item.price}</p>
            <button class="btn btn-ink" type="button" data-add="${item.slug}">Add</button>
          </div>
        </div>
      </article>`,
    )
    .join("");
}

function renderHours(root, hours) {
  root.innerHTML = DAY_KEYS.map(
    (key, i) => `
    <div>
      <dt>${DAY_LABELS[i]}</dt>
      <dd>${hoursLine(hours.days[key])}</dd>
    </div>`,
  ).join("");
}

function renderAmenities(root, items) {
  root.innerHTML = items.map((item, i) => `<li data-edit-path="amenities[${i}]">${item}</li>`).join("");
}

const SOCIAL_ICONS = {
  instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.2 21v-7.3h2.5l.4-2.8h-2.9V9.1c0-.8.2-1.4 1.4-1.4h1.6V5.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H8.3v2.8h2.5V21h3.4z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8zM10 15.2V8.8L15.6 12z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.2 4h2.2c.2 1.8 1.4 3.2 3.3 3.5v2.3c-1.1.1-2.2-.2-3.2-.8v6.3a5.7 5.7 0 1 1-5.7-5.7c.2 0 .5 0 .7.1v2.5a3.2 3.2 0 1 0 2.7 3.2V4z"/></svg>`,
  pinterest: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.2A8.8 8.8 0 0 0 8.6 20c.1-.7.4-1.8.6-2.6l1.5-6.3s-.4-.8-.4-1.9c0-1.8 1-3.1 2.3-3.1 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.8-1.1 4.3-.3 1.3.6 2.4 1.9 2.4 2.3 0 3.8-2.9 3.8-6.4 0-2.6-1.8-4.6-5-4.6-3.7 0-5.9 2.7-5.9 5.8 0 1.1.3 1.8.8 2.4.2.2.2.3.1.6l-.3 1.2c-.1.3-.3.5-.6.3-1.7-.7-2.5-2.6-2.5-4.7 0-3.5 3-7.7 8.9-7.7 4.8 0 7.9 3.4 7.9 7.2 0 4.9-2.7 8.6-6.8 8.6-1.4 0-2.6-.7-3.1-1.6l-.8 3.2c-.3 1.1-1.1 2.4-1.7 3.3A8.8 8.8 0 1 0 12 3.2z"/></svg>`,
  google: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.3c0-.8-.1-1.3-.2-1.9H12v3.4h5.5c-.1 1-.8 2.4-2.2 3.4l-.02.1 3.2 2.4.2.1c2-1.8 3.1-4.5 3.1-7.5z"/><path fill="currentColor" d="M12 22c2.9 0 5.3-1 7-2.6l-3.4-2.6c-.9.6-2.1 1.1-3.6 1.1-2.8 0-5.1-1.8-6-4.3l-.1.01-3.3 2.5-.04.1C4.3 19.7 7.9 22 12 22z"/><path fill="currentColor" d="M6 13.6A6.3 6.3 0 0 1 5.7 12c0-.6.1-1.1.3-1.6l-.01-.1-3.3-2.6-.1.05A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.4l3-2.8z"/><path fill="currentColor" d="M12 5.5c2 0 3.4.9 4.1 1.6l3-2.9C17.3 2.4 14.9 1.4 12 1.4 7.9 1.4 4.3 3.7 2.6 7.3l3.4 2.6C6.9 7.4 9.2 5.5 12 5.5z"/></svg>`,
  yelp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.9 12.8 19 3.6h-3.2l-3.7 6.2L8.3 3.6H5.1l6.2 10.2V20h1.6v-7.2z"/></svg>`,
};

function renderSocials(roots, items = []) {
  if (!items.length) return;
  const html = items
    .map(
      (item, index) => `
      <a href="${item.url}" target="_blank" rel="noreferrer" aria-label="${item.label}" data-edit-path="socials[${index}].url">
        ${SOCIAL_ICONS[item.id] || item.label}
      </a>`,
    )
    .join("");
  roots.forEach((root) => {
    root.innerHTML = html;
  });
}

function renderReviews(root, reviews) {
  root.innerHTML = reviews
    .map(
      (review, index) => `
      <article class="review" data-edit-list="reviews" data-edit-index="${index}">
        <img class="review-avatar" src="${review.avatar}" alt="${review.avatarAlt || review.name}" width="160" height="160" data-edit-path="reviews[${index}].avatar" />
        <p class="review-stars" aria-label="${review.rating} out of 5 stars">${"★".repeat(review.rating || 5)}</p>
        <blockquote data-edit-path="reviews[${index}].quote">${review.quote}</blockquote>
        <p class="review-meta">
          <strong data-edit-path="reviews[${index}].name">${review.name}</strong>
          <span class="fine">${review.city || ""} · ${review.source || ""}</span>
        </p>
      </article>`,
    )
    .join("");
}

function cartState() {
  try {
    return JSON.parse(localStorage.getItem("crs-cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem("crs-cart", JSON.stringify(items));
}

function bindCart(products) {
  const count = document.querySelector("[data-cart-count]");
  const list = document.querySelector("[data-cart-list]");
  const total = document.querySelector("[data-cart-total]");
  const drawer = document.querySelector("[data-cart]");

  const paint = () => {
    const items = cartState();
    const qty = items.reduce((sum, row) => sum + row.qty, 0);
    count.hidden = qty === 0;
    count.textContent = String(qty);
    list.innerHTML = items.length
      ? items
          .map(
            (row) => `
          <div class="cart-row">
            <div>
              <strong>${row.name}</strong>
              <p class="fine">${row.qty} × ${row.price}</p>
            </div>
            <button type="button" data-remove="${row.slug}">Remove</button>
          </div>`,
          )
          .join("")
      : `<p class="fine">Nothing in the bag yet.</p>`;
    const sum = items.reduce((n, row) => n + money(row.price) * row.qty, 0);
    total.textContent = `$${sum.toFixed(0)}`;
  };

  document.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add]");
    const remove = event.target.closest("[data-remove]");
    if (add) {
      const product = products.find((item) => item.slug === add.dataset.add);
      if (!product) return;
      const items = cartState();
      const found = items.find((row) => row.slug === product.slug);
      if (found) found.qty += 1;
      else items.push({ slug: product.slug, name: product.name, price: product.price, qty: 1 });
      saveCart(items);
      paint();
    }
    if (remove) {
      saveCart(cartState().filter((row) => row.slug !== remove.dataset.remove));
      paint();
    }
    if (event.target.closest("[data-open-cart]")) drawer.hidden = false;
    if (event.target.closest("[data-close-cart]") || event.target === drawer) drawer.hidden = true;
  });
  paint();
}

function bindChat(content) {
  const form = document.querySelector("[data-chat]");
  const reply = document.querySelector("[data-chat-reply]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = new FormData(form).get("q").toString().toLowerCase();
    form.reset();
    let text = `Call ${content.site.phonePretty} to book, or get directions to ${content.site.address}.`;
    if (q.includes("hour") || q.includes("open")) text = "Tuesday 8–4, Wednesday 9–7, Thursday 8–7, Friday 8–5, Saturday 8–3. Closed Sunday and Monday.";
    else if (q.includes("direct") || q.includes("where") || q.includes("park")) text = `309 Rantoul St, Beverly. Street parking. Tap Directions in the bar.`;
    else if (q.includes("price") || q.includes("cost") || q.includes("how much")) text = "Curl by curl cuts start at $165. Color is quoted in the salon. The full menu is on this page.";
    else if (q.includes("cancel")) text = "We ask for 48 hours’ notice so we can offer your time to another guest.";
    reply.hidden = false;
    reply.textContent = text;
  });
}

function applySite(content) {
  document.querySelectorAll("[data-book]").forEach((el) => {
    el.href = `tel:+${content.site.phone}`;
    if (el.dataset.editPath !== undefined) return;
  });
  document.querySelectorAll("[data-directions]").forEach((el) => {
    el.href = content.site.mapsUrl;
  });
  document.querySelectorAll("[data-call]").forEach((el) => {
    if (el.childElementCount === 0) el.href = `tel:+${content.site.phone}`;
    else el.href = `tel:+${content.site.phone}`;
  });
  document.querySelector("[data-year]").textContent = String(new Date().getFullYear());
  document.querySelectorAll("[data-google-review]").forEach((el) => {
    el.href = content.site.googleReviewUrl;
  });
}

const content = await loadContent();
renderStylists(document.querySelector("[data-stylists]"), content.barbers);
renderServices(document.querySelector("[data-services]"), content);
renderProducts(document.querySelector("[data-products]"), content.products);
renderHours(document.querySelector("[data-hours]"), content.hours);
renderAmenities(document.querySelector("[data-amenities]"), content.amenities);
renderReviews(document.querySelector("[data-reviews]"), content.reviews);
renderSocials(document.querySelectorAll("[data-socials]"), content.socials);
applySite(content);
bindCart(content.products);
bindChat(content);
