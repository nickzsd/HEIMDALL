window.currentUserData = {
    register_type: 'funcionario' //TEM QUE TIRAR ESSA BOSTA
}//para teste

const window_container = document.getElementById('window_container');
const minimized_dock = document.getElementById('minimized_windows_dock');
const menuToggle = document.getElementById('menu_toggle');
const sidebarMenu = document.getElementById('sidebar_menu');

let z_index_counter = 10;
let menu_open = false;
let hover_timeout = null;
let hideSidebarTimer; 

const apontamentos_html = `
<selection id="appointment_selections" class="appointment_selections"> 
    <div class="time_entry_grid">
        <h2 class = "main_title">Lançar Apontamento</h2>
        <form id="time_entry_form">
            <textarea id="description" placeholder="O que você está fazendo?"></textarea>
            <input id="project_input" type="text" placeholder="Projeto (obrigatório)" required>
            <input id="task_input" type="text" placeholder="Tarefa">
            <input id="contact_input" type="text" placeholder="Contato (obrigatório)" required>
            <input id="ticket_input" type="text" placeholder="Chamado (obrigatório)" required>

            <div class="time_controls">
            <div>
                <label>Total</label>
                <div id="total_time">0:00</div>
            </div>
            <div>
                <label>Início</label>
                <input type="time" id="start_time">
            </div>
            <div>
                <label>Fim</label>
                <input type="time" id="end_time">
            </div>
            <input type="date" id="date_picker">
            </div>

            <button type="button" id="start_timer_btn">ENVIAR</button>
        </form>
    </div>
    <div class="saved_entries_grid">
        <h3 class = "main_title">Registros Recentes</h3>
        <div class="entry_card">
            <div class="entry_header">
                <strong>Fulano da Silva</strong>
                <div class="entry_duration">2h 30m</div>
            </div>
            <p><strong>Projeto X</strong> (Cliente Y)</p>
            <p>🛠 Desenvolvimento · <span>Contato Z</span> · <span>00099</span></p>
            <p>Refatoração do módulo principal</p>
            <small>Criado há 10 minutos</small>
        </div>
        <div class="entry_card">
            <div class="entry_header">
                <strong>Fulano da Silva</strong>
                <div class="entry_duration">1h 15m</div>
            </div>
            <p><strong>Projeto Z</strong> (Cliente K)</p>
            <p>🧰 Suporte · <span>Contato J</span> · <span>00042</span></p>
            <p>Correção de bugs relatados</p>
            <small>Editado há 25 minutos</small>
        </div>
    </div>
</selection>
`;

const perfil_window_html = `
  <div class="form_container">
    <div class="left_column">
      <div class="user_icon">👤</div>
      <select class="role_selector" id="user_role">
        <option value="employee">Funcionário</option>
        <option value="company">Empresa</option>
      </select>
      <textarea class="service_type" id="service_type" placeholder="Tipo de Serviço"></textarea>
    </div>

    <div class="right_column">
      <input type="text" id="user_name" class="form_input" placeholder="Nome">
      <input type="email" id="user_email" class="form_input" placeholder="Email">
      <input type="tel" id="user_phone" class="form_input small" placeholder="Telefone">
    </div>
  </div>
`;

const ticketHTML = `
  <div id="ticket_module_container" class="ticket_module_container">
  <!-- Lista de tickets -->
  <div id="ticket_list" class="ticket_list_container">
    <!-- Ticket 1 -->
    <div class="ticket_item" onclick="openTicket(284)">
      <div class="ticket_status_tag" id="status_284">New</div>
      <div class="ticket_title" id="title_284">Configure new deposits for transfer between HQ and Branch #284</div>
      <div class="ticket_meta">
        <span class="ticket_user" id="user_284">Alex Turner (Blue Tech)</span> •
        <span class="ticket_time" id="time_284">Created 7 hours ago</span>
      </div>
      <div class="ticket_props">
        <span class="priority_tag high" id="priority_284">High</span>
        <span class="group_info" id="group_284">Blue Tech / --</span>
        <span class="status" id="status_label_284">Open</span>
      </div>
    </div>

    <!-- Ticket 2 -->
    <div class="ticket_item" onclick="openTicket(283)">
      <div class="ticket_title" id="title_283">Adjust daily summary and sales order profitability #283</div>
      <div class="ticket_meta">
        <span class="ticket_user" id="user_283">John Smith (Blue Tech)</span> •
        <span class="ticket_time" id="time_283">Replied 4 hours ago</span>
      </div>
      <div class="ticket_props">
        <span class="priority_tag medium" id="priority_283">Medium</span>
        <span class="group_info" id="group_283">Blue Tech / John</span>
        <span class="status" id="status_label_283">Open</span>
      </div>
    </div>
  </div>

  <!-- Detalhes do ticket -->
  <div id="ticket_details" class="ticket_details_container style="display: none;">
    <button class="back_button" onclick="goBackToList()">Back</button>
    <h2 class="ticket_title_view" id="ticket_title_view">Billing error on invoice 8887</h2>

    <div class="ticket_tags">
      <span class="browser_tag" id="browser_tag">Chrome 135.0.0.0</span>
      <span class="os_tag" id="os_tag">Windows 10</span>
      <span class="origin_tag" id="origin_tag">/support/tickets</span>
    </div>

    <div class="ticket_info_section">
      <p><strong id="reported_by">John Smith</strong> reported via portal<br><small id="report_time">1 day ago (Mon, Apr 14, 2025, 10:22 AM)</small></p>
      <p id="ticket_description">XML issue on Invoice OV306135, NFSe 8887.<br>Path: Accounts Receivable → Periodic Activities → NFSe Manager.</p>
      <p><em id="no_attachment">No attachment.</em></p>
      <div class="attached_file" id="attachment_section">
        <img src="ticket_nfse.png" alt="attachment" width="40" id="attachment_image"> ticket_nfse.png (27.75 KB)
      </div>
    </div>

    <div class="ticket_note_history">
      <p><strong id="note_author">John Smith</strong> added a public note<br><small id="note_time">1 day ago (Mon, Apr 14, 2025, 5:39 PM)</small></p>
      <p id="note_content">Ticket forwarded to NExpress developer. Problem confirmed not to be in AX.</p>
    </div>

    <div class="ticket_sidebar">
      <p>Status: <strong id="ticket_status">Closed</strong></p>
      <p>Tag: <strong id="ticket_tag">Important</strong></p>
      <p>Type: <strong id="ticket_type">Issue</strong></p>
      <p>Priority: <strong id="ticket_priority">Urgent</strong></p>
      <p>Group: <strong id="ticket_group">--</strong></p>
      <p>Agent: <strong id="ticket_agent">--</strong></p>
      <button onclick="updateTicket()">Update</button>
    </div>

    <!-- Adicionar anotação -->
    <div class="add_note_section">
      <textarea id="note_input" placeholder="Add a note, @mention someone..."></textarea>
      <div class="note_toolbar">
        <button><b>B</b></button>
        <button><i>I</i></button>
        <button><u>U</u></button>
        <button>📎</button>
        <button>📷</button>
        <button>📅</button>
        <button>{ }</button>
      </div>
      <div class="note_actions">
        <button onclick="sendReply()">Reply</button>
        <button onclick="addNote()">Add Note</button>
        <button onclick="forward()">Forward</button>
      </div>
    </div>
  </div>
</div>

`;

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

    const create_btn = (label, icon_class, type, content_html) => {
        const btn = document.createElement('a');
        btn.className = 'menu_btn';
        btn.innerHTML = `<i class="${icon_class}"></i> ${label}`;
        btn.addEventListener('click', () => create_window(type, label, content_html));
        sidebar.appendChild(btn);
    };
    
    create_btn('Perfil/Profile', 'fas fa-user', 'profile', perfil_window_html);
    create_btn('Chamados/Tickets', 'fas fa-ticket-alt', 'tickets', ticketHTML);
    
    if (window.currentUserData.register_type === 'funcionario') {
        create_btn('Apontamentos', 'fas fa-clipboard-list', 'records',apontamentos_html);
    }

    create_btn('Configurações', 'fas fa-cog', 'settings', '<p>Aqui vão as configurações do sistema.</p>');
    
    create_btn('Sair', 'fas fa-sign-out-alt', 'logout', '<p>Tem certeza que deseja sair?</p>');    
}  

function create_window(type, title, content_html) {
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

function close_window(win) {
    const minimized_icon = minimized_dock.querySelector(`.minimized_icon[data-type="${win.dataset.type}"]`);
    if (minimized_icon) minimized_icon.remove();

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