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
    `/api/carts/65164a5117540583371aebf8/products/${id}`,
    options
  );
  Swal.fire({
    toast: true,
    icon: "success",
    position: "top-right",
    html: `Producto ${id} agregado al carrito`,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}
