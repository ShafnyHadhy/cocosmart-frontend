export function loadCart(){
    let cartString = localStorage.getItem("cart") // "[item1, item2, item..]"

    if(cartString == null){
        localStorage.setItem("cart", "[]")  //id null setting to null
        cartString = "[]"
    }

    const cart = JSON.parse(cartString)  //converting string to an array

    return cart //returning cart items
}

export function addToCart(product, quantity){
    let cart = loadCart()

    const existingItemIndex = cart.findIndex(
        (item)=>{
            return item.productID == product.productID
        }
    )

    if(existingItemIndex == -1){
        //item not in cart

        if(quantity < 1){
            console.log("Quantity must be at least 1")
            return 
        }

        const cartItem = {
            productID: product.productID,
            name: product.name,
            price: product.price,
            labelledPrice: product.labelledPrice,
            quantity: quantity,
            image: product.images[0]
        }

        cart.push(cartItem) //adding to array

    }else{
        // Item already in cart
        const existingItem = cart[existingItemIndex]

        const newQuantity = existingItem.quantity + quantity

        if(newQuantity < 1){
            cart = cart.filter(
                (item)=>{
                    return item.productID != product.productID
                }
            )
        }else{
           cart[existingItemIndex].quantity = newQuantity
        }
    }

    localStorage.setItem("cart", JSON.stringify(cart))
}

export default function getTotal(){
   
    const cart = loadCart();

    let total = 0;

    cart.forEach(
        (item)=>{
            total += item.price*item.quantity;
        }
    )
    return total
}