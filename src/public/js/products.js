const productsContainer = document.querySelector(".productsContainer");

async function addToCart(id) {
  const options = {
    method: "POST",
    body: "",
    headers: {
      "Content-Type": "application/json",
    },
  };
  await fetch(
    `http://localhost:8080/api/carts/647682104ff9d20c6191e50e/products/${id}`,
    options
  );
  Swal.fire({
    toast: true,
    icon: "success",
    position: "top-right",
    html: "Producto agregado al carrito",
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}
