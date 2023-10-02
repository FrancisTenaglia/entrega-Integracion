const cartDelete = document.querySelector(".deletecartproducts");

async function deleteCartProducts() {
  const options = {
    method: "DELETE",
    body: "",
    headers: {
      "Content-Type": "application/json",
    },
  };
  await fetch(
    `/api/carts/65164a5117540583371aebf8`,
    options
  );
  Swal.fire({
    toast: true,
    icon: "success",
    position: "top-right",
    html: 'Se eliminaron todos los productos',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

async function crearTicket() {
    const options = {
      method: "POST",
      body: "",
      headers: {
        "Content-Type": "application/json",
      },
    };
    await fetch(
      `/api/carts/65164a5117540583371aebf8/purchase`,
      options
    );
    Swal.fire({
      toast: true,
      icon: "success",
      position: "top-right",
      html: 'Compra realizada',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }