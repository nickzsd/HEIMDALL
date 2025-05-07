import { setfunctions } from "../frontend/userlistfunctions.js";
import {confirmModal, warningModal} from '../frontend/modalLOG.js'

const window_container = document.getElementById('window_container');
const minimized_dock = document.getElementById('minimized_windows_dock');

let z_index_counter = 10;

document.getElementById('menu_toggle').addEventListener('mouseover', () => {
    const sidebar = document.getElementById('sidebar_menu');
    const menuToggle = document.getElementById('menu_toggle');

    sidebar.classList.add('show');
    menuToggle.classList.add('hide'); 
});

document.getElementById('sidebar_menu').addEventListener('mouseleave', () => {
    const sidebar = document.getElementById('sidebar_menu');
    const menuToggle = document.getElementById('menu_toggle');

    sidebar.classList.remove('show');
    menuToggle.classList.remove('hide'); 
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
    const sidebar = document.getElementById('sidebar_menu');
    sidebar.innerHTML = '';

    const create_btn = (label, icon_class, type, content_html, id) => {
        const btn = document.createElement('a');
        btn.className = 'menu_btn';
        btn.id        = id;
        btn.innerHTML = `<i class="${icon_class}"></i> ${label}`;
        btn.addEventListener('click', () => create_window(type, label, content_html));
        sidebar.appendChild(btn);
    };
    
    create_btn('Perfil/Profile', 'fas fa-user', 'profile', perfil_window_html,'PF');
    create_btn('Chamados/Tickets', 'fas fa-ticket-alt', 'tickets', ticketHTML,'TK');
    
    if (window.currentUserData.register_type == 'funcionario') {
        create_btn('Apontamentos', 'fas fa-clipboard-list', 'records',apontamentos_html,'AP');
        create_btn('Lista de Usuários', 'fas fa-table', 'user_list', user_list_html, 'US');

    }

    create_btn('Configurações', 'fas fa-cog', 'settings', '<p>Aqui vão as configurações do sistema.</p>',"CF");
    create_btn('Sair', 'fas fa-sign-out-alt', 'logout', '<p>Tem certeza que deseja sair?</p>',"OUT");    
}  

export function create_window(type, title, content_html) {
	const existing = document.querySelector(`.window[data-type="${type}"]`);

	if (existing) {
		if (existing.classList.contains('minimized')) {
			const icon = document.getElementById(`icon_${type}`);
			restore_window(existing, icon);
		} else {
			bring_to_front(existing);
		}
		return;
	}

	const win = document.createElement('div');
    win.id = type;
	win.className = `window window_${type}`;
	win.dataset.type = type;
	win.innerHTML = `
		<div class="window_header">
			<span class="window_title">${title}</span>
			<div class="window_controls">
				<span class="minimize_btn">❏</span>
				<span class="close_btn">✕</span>
			</div>
		</div>
		<div class="window_content">${content_html}</div>
	`;

	win.style.left = `${(window.innerWidth - 400) / 2}px`;
	win.style.top = `${(window.innerHeight - 300) / 2}px`;

	add_drag(win);
	win.querySelector('.minimize_btn').addEventListener('click', () => minimize_window(win));
	win.querySelector('.close_btn').addEventListener('click', () => close_window(win));

	bring_to_front(win);
	window_container.appendChild(win);

    if(win.id == "user_list"){
        setfunctions();
    }
    else if(win.id == "profile"){
        const roleSelect = document.getElementById('PF_Function');
        roleSelect.style.display = (window.currentUserData.register_type == 'cliente')
                                    ? 'none' : 'block';        
    
        document.getElementById('user_role').addEventListener('change', function () {
            const selectedValue = this.value; // 'this' é o select
            const functionDiv = document.getElementById('PF_Function');
            
            functionDiv.style.display = (selectedValue === 'company')
                ? 'none'
                : 'block';
        });                                      
    }
	
	const init_func = window[`init_${type}_window`];
	if (typeof init_func === 'function') {
		init_func(win);
	}
}

function bring_to_front(win) {
    z_index_counter++;
    win.style.zIndex = z_index_counter;
}

function minimize_window(win) {
    win.classList.add('minimized'); 
    win.style.display = 'none'; 

    const icon = document.createElement('div');
    icon.className = 'minimized_icon';
    icon.id = win.dataset.type.charAt(0).toUpperCase();
    icon.innerText = win.dataset.type.charAt(0).toUpperCase();
    icon.dataset.type = win.dataset.type;
    icon.addEventListener('click', () => restore_window(win, icon)); 

    minimized_dock.appendChild(icon);
}

function restore_window(win, icon) {
    win.classList.remove('minimized'); 
    win.style.display = 'block'; 
    bring_to_front(win); 

    if (icon) 
        icon.remove(); 
}

export function close_window(win) {
    const minimized_icon = minimized_dock.querySelector(`.minimized_icon[data-type="${win.dataset.type}"]`);
    if (minimized_icon) minimized_icon.remove();

    if(win.id == "user_list")
        window.openType.type = 0;

    if(win.id == "profile" && window.openType.type == 2){        
        confirmModal("Deseja mesmo sair sem salvar??", () => {
            warningModal("Novo registro cancelado!", () => {
                console.log("Registro cancelado.");
                win.remove(); 
            });
        });
        return; 
    }

    win.remove();
}

function add_drag(win) {
    const header = win.querySelector('.window_header');
    let offset_x = 0, offset_y = 0, is_dragging = false;

    header.addEventListener('mousedown', (e) => {
        is_dragging = true;
        const rect = win.getBoundingClientRect();
        offset_x = e.clientX - rect.left;
        offset_y = e.clientY - rect.top;
        bring_to_front(win);
    });

    document.addEventListener('mousemove', (e) => {
        if (!is_dragging) return;
        const x = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - offset_x));
        const y = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - offset_y));
        win.style.left = `${x}px`;
        win.style.top = `${y}px`;
    });

    document.addEventListener('mouseup', () => {
        is_dragging = false;
    });
}

animateBackground();
renderMenu();