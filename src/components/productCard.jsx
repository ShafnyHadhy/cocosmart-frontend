export default function ProductCard(props) {

    console.log(props)

  return (
    <div className="productCard">
        <h1>{props.name}</h1>
        <p>{props.price}</p>
        <img className="productImage" src="https://www.apple.com/assets-www/en_WW/ipad/product_tile/large/ipad_11th_gen_50cc0f42b.png"/>
        <button>Add to cart</button>
    </div>
  )
}
