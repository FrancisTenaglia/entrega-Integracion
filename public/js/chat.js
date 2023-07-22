const socket = io();
const inputMessage = document.getElementById("inputMessage");
const log = document.getElementById("log");

Swal.fire({
  title: "Identificación personal",
  input: "email",
  text: "Ingrese e-mail",
  inputValidator: (value) => {
    return !value && "Es requerido el ingreso de un e-mail";
  },
  allowOutsideClick: false,
  allowEscapeKey: false,
}).then((result) => {
  user = result.value;
  socket.emit("userAuth");
});

socket.on("newUser", (data) => {
  Swal.fire({
    toast: true,
    icon: "info",
    position: "top-right",
    html: "Nuevo usuario activo",
    timer: 3000,
    timerProgressBar: true,
    willClose: () => {
      clearInterval(timerInterval);
    },
    showConfirmButton: false,
  });
});

inputMessage.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && inputMessage.value.trim().length > 0) {
    socket.emit("message", {
      user,
      message: inputMessage.value,
      time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
    });
    inputMessage.value = "";
  }
});

socket.on("log", (data) => {
  let logs = "";
  data.logs.forEach((log) => {
    logs += `<div class="messageContainer"><span class="message">${log.user}: ${log.message}</span><span class="time">${log.time}</span></div>`;
  });
  log.innerHTML = logs;
});
