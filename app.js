const products = [
  {
    id: "lamp-nour",
    name: "مصباح نور",
    category: "إضاءة",
    price: 289,
    oldPrice: 340,
    badge: "الأكثر طلباً",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=720&q=80",
    alt: "مصباح طاولة بتصميم بسيط",
  },
  {
    id: "vase-sabah",
    name: "مزهرية صباح",
    category: "ديكور",
    price: 145,
    badge: "وصل حديثاً",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=720&q=80",
    alt: "مزهرية سيراميك بلون طبيعي",
  },
  {
    id: "cushion-rimal",
    name: "وسادة رمال",
    category: "نسيج",
    price: 98,
    oldPrice: 120,
    badge: "قطعة محبوبة",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=720&q=80",
    alt: "وسادة قماشية بألوان ترابية",
  },
  {
    id: "table-sukun",
    name: "طاولة سكون",
    category: "أثاث",
    price: 420,
    badge: "",
    image: "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=720&q=80",
    alt: "طاولة جانبية خشبية",
  },
  {
    id: "candle-oud",
    name: "شمعة عود",
    category: "ديكور",
    price: 76,
    badge: "",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=720&q=80",
    alt: "شمعة عطرية في وعاء أنيق",
  },
  {
    id: "throw-warm",
    name: "غطاء دافئ",
    category: "نسيج",
    price: 185,
    badge: "اختيارنا",
    image: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=720&q=80",
    alt: "غطاء ناعم بلون كريمي",
  },
  {
    id: "lamp-hilal",
    name: "مصباح هلال",
    category: "إضاءة",
    price: 235,
    badge: "",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=720&q=80&sat=-20",
    alt: "إضاءة جانبية لغرفة هادئة",
  },
  {
    id: "bowl-turab",
    name: "وعاء تراب",
    category: "ديكور",
    price: 110,
    badge: "",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=720&q=80",
    alt: "قطعة خزفية يدوية",
  },
];

const numberFormat = new Intl.NumberFormat("ar-SA");
const grid = document.querySelector("#product-grid");
const noResults = document.querySelector("#no-results");
const searchInput = document.querySelector("#search-input");
const cartCount = document.querySelector("#cart-count");
const cartDrawer = document.querySelector("#cart-drawer");
const cartBackdrop = document.querySelector("#cart-backdrop");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const checkoutButton = document.querySelector("#checkout-button");
const toast = document.querySelector("#toast");
const cart = new Map();

let activeCategory = "الكل";
let toastTimeout;

function formatPrice(value) {
  return `${numberFormat.format(value)} ر.س`;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("ar");
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "الكل" || product.category === activeCategory;
    const matchesQuery = `${product.name} ${product.category}`.toLocaleLowerCase("ar").includes(query);
    return matchesCategory && matchesQuery;
  });

  grid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy" />
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <button class="add-to-cart" type="button" data-add="${product.id}" aria-label="أضف ${product.name} إلى السلة">+</button>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <div class="product-price">${formatPrice(product.price)}${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del>` : ""}</div>
      </div>
    </article>
  `).join("");

  noResults.hidden = visibleProducts.length > 0;
}

function renderCart() {
  const entries = [...cart.entries()];
  const itemCount = entries.reduce((total, [, quantity]) => total + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return sum + product.price * quantity;
  }, 0);

  cartCount.textContent = numberFormat.format(itemCount);
  cartTotal.textContent = formatPrice(total);
  checkoutButton.disabled = itemCount === 0;

  cartItems.innerHTML = entries.length
    ? entries.map(([id, quantity]) => {
      const product = products.find((item) => item.id === id);
      return `
        <div class="cart-line">
          <img src="${product.image}" alt="" />
          <div class="cart-line-info">
            <strong>${product.name}</strong>
            <small>${formatPrice(product.price)}</small>
            <div class="quantity-controls" aria-label="كمية ${product.name}">
              <button type="button" data-quantity="${id}" data-change="-1" aria-label="تقليل الكمية">−</button>
              <span>${numberFormat.format(quantity)}</span>
              <button type="button" data-quantity="${id}" data-change="1" aria-label="زيادة الكمية">+</button>
            </div>
          </div>
          <button class="remove-item" type="button" data-remove="${id}" aria-label="إزالة ${product.name}">×</button>
        </div>
      `;
    }).join("")
    : '<div class="cart-empty">سلتك تنتظر أول قطعة تحبّها ♡</div>';
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function openCart() {
  cartBackdrop.hidden = false;
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => cartBackdrop.classList.add("is-visible"));
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartBackdrop.classList.remove("is-visible");
  window.setTimeout(() => {
    if (!cartDrawer.classList.contains("is-open")) cartBackdrop.hidden = true;
  }, 250);
  document.querySelector("#open-cart").focus();
}

document.querySelector(".category-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;
  document.querySelectorAll(".category-tab").forEach((tab) => {
    const selected = tab === button;
    tab.classList.toggle("is-selected", selected);
    tab.setAttribute("aria-pressed", String(selected));
  });
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  const product = products.find((item) => item.id === button.dataset.add);
  cart.set(product.id, (cart.get(product.id) || 0) + 1);
  renderCart();
  showToast(`أُضيفت ${product.name} إلى سلتك`);
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    const id = quantityButton.dataset.quantity;
    const updatedQuantity = (cart.get(id) || 0) + Number(quantityButton.dataset.change);
    if (updatedQuantity > 0) cart.set(id, updatedQuantity);
    else cart.delete(id);
    renderCart();
  }

  if (removeButton) {
    cart.delete(removeButton.dataset.remove);
    renderCart();
  }
});

document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
});

checkoutButton.addEventListener("click", () => {
  if (cart.size) showToast("هذه تجربة للعرض فقط — لا يوجد دفع أو طلب حقيقي.");
});

const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  document.querySelector(".main-nav").classList.toggle("is-open", !isOpen);
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector(".main-nav").classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

renderProducts();
renderCart();
