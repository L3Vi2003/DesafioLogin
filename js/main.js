// --- CONFIGURACIÓN DE VALIDACIONES (REGEX) ---
// Estas son las reglas que pide el profesor
var expCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
var expNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;
var expPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
var expCelular = /^[0-9]{7,12}$/;

// --- FUNCIONES DE NAVEGACIÓN ---
function irA(idPantalla) {
    // Ocultamos todas
    document.getElementById('pantalla-login').style.display = 'none';
    document.getElementById('pantalla-registro').style.display = 'none';
    document.getElementById('pantalla-recuperar').style.display = 'none';
    
    // Mostramos la que queremos
    document.getElementById(idPantalla).style.display = 'block';
    
    // Limpiamos mensajes de error
    document.getElementById('mensajeLogin').innerText = "";
    document.getElementById('mensajeRegistro').innerText = "";
    document.getElementById('mensajeRecuperar').innerText = "";
}

function mostrarOcultar(idInput) {
    var input = document.getElementById(idInput);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

// --- 1. FUNCIÓN DE REGISTRO ---
function hacerRegistro() {
    // 1. Obtener valores
    var nombre = document.getElementById('regNombre').value;
    var email = document.getElementById('regEmail').value;
    var cel = document.getElementById('regCelular').value;
    var pass = document.getElementById('regPass').value;
    var mensaje = document.getElementById('mensajeRegistro');

    // 2. Validar con Regex (Si falla, detiene la función)
    if (expNombre.test(nombre) == false) {
        mensaje.innerText = "El nombre solo debe tener letras.";
        return;
    }
    if (expCorreo.test(email) == false) {
        mensaje.innerText = "El correo no es válido.";
        return;
    }
    if (expCelular.test(cel) == false) {
        mensaje.innerText = "El celular debe tener entre 7 y 12 números.";
        return;
    }
    if (expPass.test(pass) == false) {
        mensaje.innerText = "La contraseña es muy débil (Falta Mayus, numero o símbolo).";
        return;
    }

    // 3. Guardar datos en el navegador (Sin JSON)
    localStorage.setItem("usuario_nombre", nombre);
    localStorage.setItem("usuario_email", email);
    localStorage.setItem("usuario_pass", pass);
    localStorage.setItem("intentos_fallidos", "0"); // Iniciamos contador en 0

    // 4. Éxito
    alert("¡Cuenta creada con éxito!");
    irA('pantalla-login');
}

// --- 2. FUNCIÓN DE LOGIN ---
function hacerLogin() {
    var emailIngresado = document.getElementById('loginEmail').value;
    var passIngresado = document.getElementById('loginPass').value;
    var mensaje = document.getElementById('mensajeLogin');
    var linkRecuperar = document.getElementById('linkRecuperar');

    // Recuperamos los datos guardados
    var emailGuardado = localStorage.getItem("usuario_email");
    var passGuardada = localStorage.getItem("usuario_pass");
    var intentos = parseInt(localStorage.getItem("intentos_fallidos")); // Convertir texto a numero

    // Verificar si existe usuario
    if (!emailGuardado) {
        mensaje.innerText = "No hay ningún usuario registrado.";
        return;
    }

    // Verificar bloqueo
    if (intentos >= 3) {
        mensaje.innerText = "Cuenta BLOQUEADA por intentos fallidos.";
        linkRecuperar.style.display = "block"; // Mostrar botón de recuperar
        return;
    }

    // Verificar credenciales
    if (emailIngresado == emailGuardado && passIngresado == passGuardada) {
        // Éxito
        localStorage.setItem("intentos_fallidos", "0"); // Resetear intentos
        mensaje.style.color = "green";
        mensaje.innerText = "¡Bienvenido " + localStorage.getItem("usuario_nombre") + "!";
        linkRecuperar.style.display = "none";
    } else {
        // Error
        intentos = intentos + 1; // Sumar 1 intento
        localStorage.setItem("intentos_fallidos", intentos); // Guardar nuevo numero
        
        if (intentos >= 3) {
            mensaje.innerText = "Cuenta BLOQUEADA. Usa 'Recuperar contraseña'.";
            linkRecuperar.style.display = "block";
        } else {
            mensaje.innerText = "Contraseña incorrecta. Intentos: " + intentos + "/3";
        }
    }
}

// --- 3. FUNCIÓN DE RECUPERAR CONTRASEÑA ---
function hacerRecuperacion() {
    var emailIngresado = document.getElementById('recEmail').value;
    var nuevaPass = document.getElementById('recPass').value;
    var mensaje = document.getElementById('mensajeRecuperar');

    var emailGuardado = localStorage.getItem("usuario_email");

    // Validar que el email coincida con el registrado
    if (emailIngresado != emailGuardado) {
        mensaje.innerText = "Ese correo no coincide con el registrado.";
        return;
    }

    // Validar la nueva contraseña con Regex
    if (expPass.test(nuevaPass) == false) {
        mensaje.innerText = "La nueva contraseña no cumple los requisitos de seguridad.";
        return;
    }

    // Actualizar contraseña y desbloquear
    localStorage.setItem("usuario_pass", nuevaPass);
    localStorage.setItem("intentos_fallidos", "0"); // Desbloqueamos

    alert("Contraseña actualizada. Ya puedes entrar.");
    irA('pantalla-login');
}