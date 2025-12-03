/* SISTEMA DE GESTIÓN DE USUARIOS
    Usa localStorage para simular una base de datos.
*/

// --- EXPRESIONES REGULARES (REGEX) ---
const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexName = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;
const regexMobile = /^[0-9]{7,12}$/;
// Contraseña: min 6 caracteres, 1 minúscula, 1 mayúscula, 1 número, 1 especial
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

// --- UTILIDADES ---

// Función para mostrar/ocultar contraseña
function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    input.type = input.type === "password" ? "text" : "password";
}

// Función para cambiar entre Login, Registro y Recuperación
function showSection(sectionId) {
    document.querySelectorAll('.form-container').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    // Limpiar mensajes al cambiar
    document.querySelectorAll('.message').forEach(el => el.textContent = '');
}

// Función para obtener usuarios del LocalStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Función para guardar usuarios en LocalStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// --- MÓDULO 1: REGISTRO ---
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const mobile = document.getElementById('regMobile').value;
    const password = document.getElementById('regPassword').value;
    const message = document.getElementById('regMessage');

    // Validaciones
    if (!regexName.test(name)) return showMsg(message, "Nombre inválido (solo letras).", "error");
    if (!regexEmail.test(email)) return showMsg(message, "Correo inválido.", "error");
    if (!regexMobile.test(mobile)) return showMsg(message, "Celular inválido (7-12 números).", "error");
    if (!regexPassword.test(password)) return showMsg(message, "La contraseña no cumple los requisitos de seguridad.", "error");

    let users = getUsers();
    
    // Verificar si ya existe
    if (users.find(user => user.email === email)) {
        return showMsg(message, "El correo ya está registrado.", "error");
    }

    // Crear usuario
    users.push({
        name: name,
        email: email,
        mobile: mobile,
        password: password, // En un sistema real, esto debería ir encriptado (hash)
        failedAttempts: 0,
        isLocked: false
    });

    saveUsers(users);
    showMsg(message, "¡Registro exitoso! Ahora inicia sesión.", "success");
    document.getElementById('registerForm').reset();
});

// --- MÓDULO 2: LOGIN ---
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');
    const recoveryLink = document.getElementById('recoveryLink');

    let users = getUsers();
    let userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        return showMsg(message, "Usuario o contraseña incorrectos.", "error");
    }

    let user = users[userIndex];

    // Verificar si está bloqueado
    if (user.isLocked) {
        recoveryLink.style.display = 'block';
        return showMsg(message, "Cuenta bloqueada por intentos fallidos.", "error");
    }

    // Validar contraseña
    if (user.password === password) {
        // Éxito: Resetear intentos
        user.failedAttempts = 0;
        saveUsers(users);
        showMsg(message, `Bienvenido al sistema, ${user.name}`, "success");
        recoveryLink.style.display = 'none';
    } else {
        // Fallo: Aumentar contador
        user.failedAttempts++;
        if (user.failedAttempts >= 3) {
            user.isLocked = true;
            recoveryLink.style.display = 'block';
            showMsg(message, "Cuenta bloqueada por intentos fallidos.", "error");
        } else {
            showMsg(message, `Contraseña incorrecta. Intentos restantes: ${3 - user.failedAttempts}`, "error");
        }
        saveUsers(users);
    }
});

// --- MÓDULO 3: RECUPERACIÓN ---
document.getElementById('recoveryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('recEmail').value;
    const newPassword = document.getElementById('recPassword').value;
    const message = document.getElementById('recMessage');

    // Validar seguridad de la nueva contraseña
    if (!regexPassword.test(newPassword)) {
        return showMsg(message, "La contraseña no cumple los requisitos de seguridad.", "error");
    }

    let users = getUsers();
    let userIndex = users.findIndex(u => u.email === email);

    if (userIndex !== -1) {
        // Actualizar datos
        users[userIndex].password = newPassword;
        users[userIndex].failedAttempts = 0; // Reiniciar intentos
        users[userIndex].isLocked = false;   // Desbloquear cuenta
        
        saveUsers(users);
        showMsg(message, "Contraseña actualizada. Cuenta desbloqueada.", "success");
        document.getElementById('recoveryForm').reset();
        
        // Opcional: Redirigir al login después de unos segundos
        setTimeout(() => showSection('login-section'), 2000);
    } else {
        showMsg(message, "Correo no encontrado.", "error");
    }
});

// Helper para mensajes
function showMsg(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
}