const CART_KEY = "mm2-cart";

function getCart() {
	try {
		return JSON.parse(localStorage.getItem(CART_KEY)) || [];
	} catch (error) {
		return [];
	}
}

function saveCart(cart) {
	localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCounter() {
	const cartLink = document.querySelector('a[href="bascet.html"]');
	if (!cartLink) return;

	const count = getCart().reduce((total, item) => total + item.quantity, 0);
	cartLink.textContent = count ? `Cart (${count})` : "Cart";
}

function addToCart(button) {
	const cart = getCart();
	const product = cart.find((item) => item.id === button.dataset.id);

	if (product) {
		product.quantity += 1;
	} else {
		cart.push({
			id: button.dataset.id,
			name: button.dataset.name,
			price: Number(button.dataset.price),
			quantity: 1
		});
	}

	saveCart(cart);
	updateCartCounter();
	button.textContent = "Додано";
	setTimeout(() => {
		button.textContent = "Додати в кошик";
	}, 900);
}

function renderCart() {
	const cartItems = document.querySelector("#cart-items");
	const cartTotal = document.querySelector("#cart-total");
	const orderButton = document.querySelector("#order-btn");
	if (!cartItems || !cartTotal) return;

	const cart = getCart();
	cartItems.innerHTML = "";

	if (!cart.length) {
		cartItems.innerHTML = '<p class="empty-cart">Кошик порожній. Додайте товар у магазині.</p>';
		cartTotal.textContent = "$0";
		if (orderButton) orderButton.disabled = true;
		return;
	}

	let total = 0;
	cart.forEach((item) => {
		total += item.price * item.quantity;

		const row = document.createElement("article");
		row.className = "cart-item";
		row.innerHTML = `
			<div>
				<h3>${item.name}</h3>
				<p>$${item.price} за штуку</p>
			</div>
			<div class="quantity-controls">
				<button type="button" class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
				<input type="number" min="1" value="${item.quantity}" data-action="quantity" data-id="${item.id}" aria-label="Кількість ${item.name}">
				<button type="button" class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
			</div>
			<strong>$${item.price * item.quantity}</strong>
			<button type="button" class="remove-btn" data-action="remove" data-id="${item.id}">Видалити</button>
		`;
		cartItems.appendChild(row);
	});

	cartTotal.textContent = `$${total}`;
	if (orderButton) orderButton.disabled = false;
}

document.querySelectorAll(".buy-btn").forEach((button) => {
	button.addEventListener("click", () => addToCart(button));
});

document.querySelector("#cart-items")?.addEventListener("click", (event) => {
	const control = event.target.closest("[data-action]");
	if (!control) return;

	const cart = getCart();
	const item = cart.find((cartItem) => cartItem.id === control.dataset.id);
	if (!item) return;

	if (control.dataset.action === "increase") item.quantity += 1;
	if (control.dataset.action === "decrease") item.quantity -= 1;
	if (control.dataset.action === "remove" || item.quantity < 1) {
		cart.splice(cart.indexOf(item), 1);
	}

	saveCart(cart);
	renderCart();
	updateCartCounter();
});

document.querySelector("#cart-items")?.addEventListener("change", (event) => {
	if (event.target.dataset.action !== "quantity") return;

	const cart = getCart();
	const item = cart.find((cartItem) => cartItem.id === event.target.dataset.id);
	if (!item) return;

	item.quantity = Math.max(1, Number(event.target.value) || 1);
	saveCart(cart);
	renderCart();
	updateCartCounter();
});

document.querySelector("#order-btn")?.addEventListener("click", () => {
	const orderForm = document.querySelector("#order-form");
	orderForm.hidden = false;
	orderForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#order-form")?.addEventListener("submit", (event) => {
	event.preventDefault();
	localStorage.removeItem(CART_KEY);
	renderCart();
	updateCartCounter();
	event.target.reset();
	document.querySelector("#order-message").textContent = "Дякуємо! Ваше замовлення прийнято.";
});

renderCart();
updateCartCounter();