import { catalog } from "../data/catalog.js"

const productsListElement = document.querySelector('[data-js-products]')
const cartDialogElement = document.querySelector('[data-js-cart]')
const cartListElement = document.querySelector('[data-js-cart-body]')
const totalPriceElement = document.querySelector('[data-js-total-price]')
const sortSelectElement = document.querySelector('[data-js-select]')
const openCartButtonElement = document.querySelector('[data-js-open-cart]')

const getProductsFromLocalStorage = () => {
    const products = localStorage.getItem('cart')

    if (products !== null) {
        return JSON.parse(products)
    }

    return []
}

const saveProductsToLocalStorage = (products) => {
    localStorage.setItem('cart', JSON.stringify(products))
}

const addProductToCart = (productId) => {
    const products = getProductsFromLocalStorage()

    if (products.includes(productId)) return

    products.push(productId)

    saveProductsToLocalStorage(products)
}

const removeProductFromCart = (productId) => {
    const products = getProductsFromLocalStorage()

    const updatedProducts = products.filter(id => id !== productId)

    saveProductsToLocalStorage(updatedProducts)
}

const getCartProducts = () => {
    const cartProductIds = getProductsFromLocalStorage()

    return catalog.filter(product => cartProductIds.includes(product.id))
}

const sortCatalog = (value) => {
    switch (value) {
        case 'cheap':
            return [...catalog].sort((a, b) => a.price - b.price)
        case 'expensive':
            return [...catalog].sort((a, b) => b.price - a.price)
        default:
            return catalog
    }
}

const formatPrice = (price) => `${price} USD`

const renderCart = () => {
    const cartProducts = getCartProducts()
    
    if (cartProducts.length === 0) {
        cartListElement.innerHTML = `
        <li class="cart__empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="currentColor" class="bi bi-cart2" viewBox="0 0 16 16">
                <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l1.25 5h8.22l1.25-5zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0"/>
            </svg>
            <span class="cart__empty-title">Корзина пуста</span>
            <p class="cart__empty-text">Добавьте товары, чтобы они появились здесь</p>
        </li>
        `
        totalPriceElement.textContent = formatPrice(0)
        return
    }
    
    let markup = ''
    
    cartProducts.forEach(({ id, name, img, price }) => {
        markup += `
            <li class="cart__item">
                <img
                    class="cart__item-image"
                    src="${img}"
                    alt="${name}"
                    width="65" height="65"
                >
                <div class="cart__item-details">
                    <p class="cart__item-title">${name}</p>
                    <span class="cart__item-price">${formatPrice(price)}</span>
                </div>
                <button
                    class="cart__item-button-remove x-button"
                    type="button"
                    data-id="${id}"
                    aria-label="Удалить ${name} из корзины"
                >
                </button>
            </li>
        `
    })
    
    const totalPrice = cartProducts.reduce((acc, product) => acc + product.price, 0)
    
    cartListElement.innerHTML = markup
    
    totalPriceElement.textContent = formatPrice(totalPrice)
}

const renderProducts = () => {
    let markup = ''

    const cartProductIds = getProductsFromLocalStorage()
    const sortedCatalog = sortCatalog(sortSelectElement.value)
    
    sortedCatalog.forEach(({ id, name, img, price }) => {
        const isInCart = cartProductIds.includes(id)

        const buttonText = isInCart ? 'Удалить из корзины' : 'В корзину'
        const buttonClass = isInCart
            ? 'products__button button in-cart'
            : 'products__button button'
        
        markup += `
            <li class="products__item">
                <img
                    class="products__image"
                    src="${img}"
                    alt="${name}"
                >
                <p class="products__name">${name}</p>
                <span class="products__price">${formatPrice(price)}</span>
                <button
                    class="${buttonClass}"
                    type="button"
                    data-id="${id}"
                    >
                    ${buttonText}
                </button>
            </li>       
        `
    })
    
    productsListElement.innerHTML = markup
}

const updateUI = () => {
    renderProducts()
    renderCart()   
}

openCartButtonElement.addEventListener('click', () => {
    cartDialogElement.show()
})

sortSelectElement.addEventListener('change', renderProducts)

productsListElement.addEventListener('click', (event) => {
    const button = event.target.closest('.products__button')

    if (!button) return

    const productId = button.dataset.id

    if (button.classList.contains('in-cart')) {
        removeProductFromCart(productId)
    } else {
        addProductToCart(productId)
    }

    updateUI()
})

cartListElement.addEventListener('click', (event) => {
    const button = event.target.closest('.cart__item-button-remove')
    
    if (!button) return

    const productId = button.dataset.id

    removeProductFromCart(productId)
    updateUI()
})

updateUI()