import { fillTickets, canCloseNewTicket, setFunctionsTK_Details } from "../functions/ticketsfunctions.js";
import { confirmModal, warningModal} from '../messages/modalLOG.js'
import { canCloseWindow } from "../functions/configfunctions.js";
import { setfunctions } from "../functions/userlistfunctions.js";
import { setProfileFunctions } from "../functions/profileFunctions.js";

const window_container = document.getElementById('window_container');
export const minimized_windows = [];

let z_index_counter = 10;

//UTILIDADES
export async function getuserName(_UserName) {
    const response = await fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },   
        body: JSON.stringify({tableid: 'users',query: {user: _UserName}})     
      })        
    const data = await response.json();    
    
    const name = data.json[0] != null ? data.json[0].user_name : '--';
    
    return name;
}

export async function getprojName(projid) {
    const response = await fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },   
        body: JSON.stringify({tableid: 'projects',query: {projId: projid}})     
      })        
    const data = await response.json();    
    
    let name;

    if(data.json[0] != null)
        name = `${data.json[0].projId} (${data.json[0].refCompany})`
    else
        name = '--';
    
    return name;
}

export async function getnextRecid(tableid) {
    const response = await fetch('http://localhost:3000/get_nextRecid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },        
                body: JSON.stringify({tableid: tableid})
            })        
    const data = await response.json();    
    
    return data.nextRecid;
}

export async function getParmCode(refCode) {
    const response = await fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },   
        body: JSON.stringify({tableid: 'parameters'})     
      }) 
    const data = await response.json();    
    
    return refCode == 'TK' ? [data.json[0].TicketSequence,data.json[0].TicketCode]
                           : [data.json[0].UserSequence,data.json[0].UserCode];
}

export async function getnextCode(Type) {
    const tableid = Type == 'TK' ? 'tickets' : 'users';
    const refInfo = await getParmCode(Type)    

    const jsondata = {tableid: tableid, const: refInfo[0] ,code: refInfo[1]}

    const response = await fetch('http://localhost:3000/get_nextnum', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsondata)
                })    

    const data = await response.json();     
    
    return data.code;
}

export function today(){
    const today  = new Date();
    const year   = today.getFullYear();
    const month  = String(today.getMonth() + 1).padStart(2, '0'); 
    const day    = String(today.getDate()).padStart(2, '0');    

    return `${day}/${month}/${year}`;
}

export function timeNow(){
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const actualTime = `${horas}:${minutos}`;

    return actualTime;
}

export function dateName(dateStr) {    
    let date;
    if (typeof dateStr === 'string') {
        const [dia, mes, ano] = dateStr.split('/');
        date = new Date(`${ano}-${mes}-${dia}T00:00:00`);
    } else {
        date = dateStr;
    }

    const meses = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const diasSemana = [
        'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
        'quinta-feira', 'sexta-feira', 'sábado'
    ];

    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const ano = date.getFullYear();
    const diaSemana = diasSemana[date.getDay()];

    return `${dia} de ${mes} de ${ano} (${diaSemana})`;
}

export function Date2ISO(dateStr) {      
    if(dateStr == null || dateStr == undefined) return null    

    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}

export function ISO2Date(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

//NECESSIDADES
export function close_window(win) {
    const index = minimized_windows.indexOf(win);
    if (index > -1)
        minimized_windows.splice(index, 1);        

    if(win.id == "user_list")
        window.openType.type = 0;

    if(win.id == "profile" && window.openType.type == 2){        
        confirmModal("Deseja mesmo sair sem salvar??").then((confirmed) => {
            if (confirmed) {
                warningModal("Novo registro cancelado!");
                win.remove();
            }
        });        
        return; 
    } else if(win.id == "settings") {
        canCloseWindow().then((confirmed) => {
            if (confirmed) {
                win.remove();
            } else {
                confirmModal("Dados obrigatorios faltando..<br>Deseja desfazer as alterações")
                .then((confirmed) => {
                    if (confirmed) {
                        warningModal("Alterações desfeitas!");
                        win.remove();
                    }
                });
            }            
        });
        return; 
    } else if(win.id == 'NewTicket') {                        
        canCloseNewTicket().then((confirmed) => {
            if(window.TKType.type == 1){
                window.TKType.type = 0
                return
            }

            if (!confirmed) 
                confirmModal("Dados obrigatorios faltando..<br>Deseja Cancelar a Criação?").then((confirmed) => {
                    if (confirmed){             
                        tinymce.remove(`#Description_NewTK`);
                        win.remove()
                    }
                });
            else{ 
                fillTickets()    
                tinymce.remove(`#Description_NewTK`);                            
                win.remove()
            }
        })
        return 
    } else if (win.id == 'ticket_details') {
        window.TKType.ticketId = '';
        window.TKType.TicketUser = ''; 
        tinymce.remove(`#my_editor`);
        tinymce.remove(`#DescriptionIn_TK`);

        const refDetails = document.getElementById('MainDetails');        
        if (refDetails) {
            const noteTextareas = refDetails.querySelectorAll('textarea[id^="note_"]');
            noteTextareas.forEach((textarea) => {
                tinymce.remove(`#${textarea.id}`);
            });
        }

        fillTickets()   
    }

    win.remove();
}

export function create_btn (label, icon_class, type, content_html, id) {
    const sidebar = document.getElementById('sidebar_menu');
    const btn = document.createElement('a');
    btn.className = 'menu_btn';
    btn.id        = id;
    btn.innerHTML = `<i class="${icon_class}"></i> ${label}`;
    btn.addEventListener('click', () => id != 'OUT' 
                                     ? create_window(type, label, content_html,icon_class)
                                     : outworkzone());
    sidebar.appendChild(btn);
};

export function create_window(type, title, content_html, icon_class) {
	const existing = document.querySelector(`.window[data-type="${type}"]`);    
    
	if (existing) {
		if (existing.classList.contains('minimized')) {			
			restore_window(existing);
		} else {
			bring_to_front(existing);
		}
		return;
	}    

	const win = document.createElement('div');
    win.id = type;
	win.className = `window window_${type}`;
	win.dataset.type = type;
    win.dataset.title = title;
    win.dataset.icon = icon_class;
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

	win.style.left = `${(window.innerWidth - 500) / 2}px`;
	win.style.top = `${(window.innerHeight - 700) / 2}px`;

	add_drag(win);
	win.querySelector('.minimize_btn').addEventListener('click', () => minimize_window(win));
	win.querySelector('.close_btn').addEventListener('click', () => close_window(win));

	bring_to_front(win);
	window_container.appendChild(win);

    if(win.id == "user_list"){
        setfunctions();
    } else if(win.id == "profile"){
        setProfileFunctions();              
    } else if (win.id == 'ticket_details'){
        setFunctionsTK_Details();        
    }
	
	const init_func = window[`init_${type}_window`];
	if (typeof init_func === 'function') {
		init_func(win);
	}
}

export function add_drag(win) {
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

function renderHistory() {
    const sidebar = document.getElementById('sidebar_menu_hist');
    sidebar.innerHTML = '';

    const create_btn = (label, icon_class, id) => {
        const btn = document.createElement('a');
        btn.className = 'menu_btn';
        btn.id        = id;
        btn.innerHTML = `<i class="${icon_class}"></i> ${label}`;
        btn.addEventListener('click', () => restore_window(id));
        sidebar.appendChild(btn);
    };

    minimized_windows.forEach(win => {        
        const label = win.dataset.title;
        create_btn(label, win.dataset.icon, win);
    });
}

function outworkzone(){
    confirmModal("Realmente deseja sair?").then((confirmed) => {
        if (confirmed) {
            window.location.replace('../html/login.html');
        }
    });
}

function bring_to_front(win) {
    z_index_counter++;
    win.style.zIndex = z_index_counter;
}

function minimize_window(win) {
    document.getElementById('menu_toggle_hist').classList.remove('hide');
    win.classList.add('minimized'); 
    win.style.visibility = 'hidden';
    win.style.pointerEvents = 'none';
    win.style.opacity = '0';
 
    
    if (!minimized_windows.includes(win)) {
        minimized_windows.push(win);
    }
    
    renderHistory();
}

function restore_window(win) {
    document.getElementById('sidebar_menu_hist').classList.remove('show');

    win.classList.remove('minimized');
    win.style.visibility = 'visible';
    win.style.pointerEvents = 'auto';
    win.style.opacity = '1';

    const index = minimized_windows.indexOf(win);
    if (index > -1) 
        minimized_windows.splice(index, 1); 

    if(minimized_windows.length == 0)
        document.getElementById('menu_toggle_hist').classList.add('hide');  
    
    const type = win.dataset.type;
    if (!win.classList.contains(`window_${type}`)) {
        win.classList.add(`window_${type}`);
    }

    bring_to_front(win);
    renderHistory();
}