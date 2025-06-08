let currentUser = "cliente";

const canvas = document.getElementById("eyeCanvas");
const ctx = canvas.getContext("2d");
let isOpen = false;
let blinkInterval;
const eyeX = 20, eyeY = 20;
let pupilX = 20, pupilY = 20;
let mouseX = 20, mouseY = 20;

function switchUser() {
    const userType = document.getElementById("userType");
    const loginform = document.getElementById("loginContainer");
    const logoMain = document.getElementById("logoMain");

    setTimeout(() => {
        if (currentUser === "cliente") {
            currentUser = "funcionario";

            userType.textContent = "Funcionário";
            userType.className = "funcionario";

            loginform.classList.remove("cliente", "funcionario");
            loginform.classList.add("login_container", currentUser); 
            
            logoMain.src = "../icons/Heindall/heindall_white.png";
        } else {
            currentUser = "cliente";

            userType.textContent = "Cliente";
            userType.className = "cliente";

            loginform.classList.remove("cliente", "funcionario");
            loginform.classList.add("login_container", currentUser);
            
            logoMain.src = "../icons/Heindall/heindall_black.png";
        }
    }, 300);
}

function login() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    if (!email || !senha) {
        errorMsg.textContent = "Por favor, preencha todos os campos.";
        errorMsg.style.display = "block";
        return;
    }

    errorMsg.textContent = "";
    errorMsg.style.display = "none";

    const datafields = {email,senha,currentUser}    

    fetch('http://localhost:3000/get_existlogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datafields)
    })
    .then(response => response.json())
    .then(data => {        
        if (data.success) {
            window.location.replace('../html/menu.html');
            window.currentUserData = data.infolog;
        } else {
            errorMsg.textContent   = data.infolog;;
            errorMsg.style.display = "block";
        }
    })
    .catch(err => {
        errorMsg.textContent   = "Erro ao buscar login.";
        errorMsg.style.display = "block";          
    });     
}

function clearError() { 
    const errorMsg = document.getElementById("errorMsg");
    if (errorMsg.style.display === "block") {
        errorMsg.style.display = "none";
    }
}

function animateBackground() {
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stars = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.2
    }));

    function draw() {
        ctx.fillStyle = 'rgba(15, 10, 30, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 100,
            canvas.width / 2, canvas.height / 2, canvas.width / 1.2
        );
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fill();

            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(draw);
    }

    draw();
}

function drawEye(open) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";

    if (open) {
        const radius = 10;

        ctx.beginPath();
        ctx.arc(eyeX, eyeY, radius, Math.PI * 0.25, Math.PI * 0.75, false);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(eyeX, eyeY, radius, Math.PI * 1.25, Math.PI * 1.75, false);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pupilX, pupilY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(eyeX, eyeY + 2, 10, Math.PI * 0.25, Math.PI * 0.75, true);
        ctx.stroke();
    }
}

function toggleEye() {
    const senha = document.getElementById("senha");
    isOpen = !isOpen;
    senha.type = isOpen ? "text" : "password";
    drawEye(isOpen);
}

function startBlinking() {
    blinkInterval = setInterval(() => {
        drawEye(false);
        setTimeout(() => {
            if (isOpen) drawEye(true);
        }, 300);
    }, 2000);
}

function animate() {
    requestAnimationFrame(animate);
    if (isOpen) drawEye(true);
}

document.addEventListener('DOMContentLoaded', () => {
    const userType = document.getElementById("userType");  
    const loginform = document.getElementById("loginContainer");  
    const logoMain = document.getElementById("logoMain");

    currentUser = "cliente";

    userType.textContent = "Cliente";
    userType.className = "cliente";

    loginform.classList.remove("cliente", "funcionario");
    loginform.classList.add("login_container", currentUser);   
    
    logoMain.src = "../icons/Heindall/heindall_black.png";

    document.querySelector('.page_corner')?.addEventListener('click', switchUser);
    document.querySelector('button')?.addEventListener('click', login);
    document.getElementById('email')?.addEventListener('input', clearError);
    document.getElementById('senha')?.addEventListener('input', clearError);
    document.querySelector('.page_corner').addEventListener('click', function () {
        this.classList.toggle('rotated');
    });

    canvas.addEventListener("click", toggleEye);        

    document.addEventListener("mousemove", e => {
        const container = document.getElementById("loginContainer");
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        container.style.boxShadow = `${x}px ${y}px 40px #ffd700`;
    });

    document.addEventListener("mousemove", e => {
        const rect = canvas.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
    
        const dx = relX - eyeX;
        const dy = relY - eyeY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.min(5, Math.hypot(dx, dy));
    
        pupilX = eyeX + Math.cos(angle) * distance;
        pupilY = eyeY + Math.sin(angle) * distance;
    });

    animateBackground();
    drawEye(true);
    startBlinking();  
    animate();
});