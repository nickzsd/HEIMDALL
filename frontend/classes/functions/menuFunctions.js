import { create_btn,minimized_windows } from "../utils/HDL_Utils.js";
import { checknotifications } from "./notificationsfunctions.js";

const Out_menuToggle      = document.getElementById('menu_toggle');
const Out_sidebarMenu     = document.getElementById('sidebar_menu');
const Out_menuToggleHist  = document.getElementById('menu_toggle_hist');
const Out_sidebarMenuHist = document.getElementById('sidebar_menu_hist');

Out_menuToggle?.addEventListener('mouseover', () => {
    if (minimized_windows.length !== 0) {
        Out_menuToggleHist?.classList.add('hide');
    }

    Out_sidebarMenu?.classList.add('show');
    Out_menuToggle?.classList.add('hide');
});

Out_sidebarMenu?.addEventListener('mouseleave', () => {
    if (minimized_windows.length !== 0 && Out_menuToggleHist?.classList.contains('hide')) {
        Out_menuToggleHist.classList.remove('hide');
    }

    Out_sidebarMenu?.classList.remove('show');
    Out_menuToggle?.classList.remove('hide');
});

Out_menuToggleHist?.addEventListener('mouseover', () => {
    if (minimized_windows.length === 0) return;

    Out_sidebarMenuHist?.classList.add('show');
    Out_menuToggleHist?.classList.add('hide');
});

Out_sidebarMenuHist?.addEventListener('mouseleave', () => {
    if (minimized_windows.length === 0) return;

    Out_sidebarMenuHist?.classList.remove('show');
    Out_menuToggleHist?.classList.remove('hide');
});

function animateBackground() {
    const canvas = document.getElementById('background_canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.2
    }));

    function draw() {
        ctx.fillStyle = 'rgba(15, 10, 30, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 100,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.8
        );
        gradient.addColorStop(0, 'rgba(72, 61, 139, 0.3)');
        gradient.addColorStop(0.7, 'rgba(25, 25, 112, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
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

function renderMenu() {
    document.getElementById('menu_toggle_hist').classList.add('hide');
    const sidebar = document.getElementById('sidebar_menu');
    sidebar.innerHTML = '';    

    create_btn('Notificações/Notification', "fa-solid fa-bell", 'Notification', notification_html,'NF');

    if (window.currentUserData.function == 'gestor' || window.currentUserData.register_type == 'cliente')        
        create_btn('Dashboard', 'fa-solid fa-chart-pie', 'dashboard', "dashboard",'DB');

    create_btn('Perfil/Profile', 'fas fa-user', 'profile', perfil_window_html,'PF');
    create_btn('Chamados/Tickets', 'fas fa-ticket-alt', 'tickets', ticketHTML,'TK');
    
    if (window.currentUserData.register_type == 'employee') {
        create_btn('Apontamentos', 'fa-solid fa-id-badge', 'records',appointments_html,'AP');

        if(window.currentUserData.function == 'gestor') {
            create_btn('Lista de Usuários', 'fas fa-table', 'user_list', user_list_html, 'US');
            create_btn('Configurações', 'fas fa-cog', 'settings', config_html ,"CF");
        }
    }

    create_btn('Sair', 'fas fa-sign-out-alt', 'logout', "","OUT");    
}  

animateBackground();
renderMenu();
checknotifications();