const CMSPEAK = "https://cmspeak-production.up.railway.app";
const SLUG = "cala-renee";
const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const money = (value) => Number(String(value).replace(/[^0-9.]/g, "")) || 0;

async function loadContent() {
  const local = await fetch("/content/cala-renee.json", { cache: "no-store" }).then((r) => r.json());
  try {
    const remote = await fetch(`${CMSPEAK}/api/sites/${SLUG}/content`, {
      headers: { accept: "application/json" },
    });
    if (remote.ok) return await remote.json();
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
}

const content = await loadContent();
renderStylists(document.querySelector("[data-stylists]"), content.barbers);
renderServices(document.querySelector("[data-services]"), content);
renderProducts(document.querySelector("[data-products]"), content.products);
renderHours(document.querySelector("[data-hours]"), content.hours);
renderAmenities(document.querySelector("[data-amenities]"), content.amenities);
applySite(content);
bindCart(content.products);
bindChat(content);
