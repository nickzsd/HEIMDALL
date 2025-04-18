import { create_window, close_window } from "../frontend/menuFunctions.js";

if(document.querySelector('.window_profile')){
    const windowProfile = document.querySelector('.window_profile');

    const form = document.querySelector('.form_container');
    console.log(form);

    windowProfile.addEventListener('resize', () => {
        const width    = windowProfile.offsetWidth;
        const interbox = document.querySelector('.form_container');

        if (width > 615) {    
            interbox.style.maxHeight      = '100%';
            windowProfile.style.maxHeight = '620px;';  
        } else {
            interbox.style.maxHeight      = '550px';
            windowProfile.style.maxHeight = '100%';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sidebar_menu')?.addEventListener('click', function(event) {
        const target = event.target.closest('.menu_btn'); 
    
        if (target) {
            const id = target.id;
            
            switch(id)
            {
                case 'PF':
                    const form = document.querySelector('.form_container');
                    
                    if(window.currentUserData.function != 'gestor'){
                        if (form) {
                            form.querySelectorAll('input, textarea, select').forE0ach(field => {
                                field.disabled = true;
                            });
                        }
                    }
                    
                    const roleSelect    = document.getElementById('user_role');
                    const serviceInput  = document.getElementById('service_type');
                    const nameInput     = document.getElementById('user_name');
                    const UsernameInput = document.getElementById('user_id');
                    const emailInput    = document.getElementById('user_email');
                    const phoneInput    = document.getElementById('user_phone');
                    const passwordInput = document.getElementById('password');
                    
                    roleSelect.selectedIndex = (window.currentUserData.register_type === 'cliente') ? 1 : 0;
                    serviceInput.value       = window.currentUserData.user_description  || '';
                    nameInput.value          = window.currentUserData.user_name         || '';
                    UsernameInput.value      = window.currentUserData.user              || '';
                    emailInput.value         = window.currentUserData.email             || '';
                    phoneInput.value         = window.currentUserData.contact_phone     || '';
                    passwordInput.value      = window.currentUserData.acess_key         || '';
                    break;
                case 'US':
                    fetch('../data/register.xlsx')
                        .then(res => res.arrayBuffer())
                        .then(buffer => {
                            const workbook = XLSX.read(buffer, { type: 'array' });
                            const sheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[sheetName];
                            const json = XLSX.utils.sheet_to_json(worksheet);                                                        

                            const grid = document.getElementById('user_grid_body');
                            grid.innerHTML = '';

                            json.forEach(user => {
                                const row = document.createElement('div');
                                row.id        = 'PF'
                                row.className = 'user_grid_row';
                                row.innerHTML = `
                                    <div><input type="checkbox" class="user_checkbox" data-id="${user.user}"></div>
                                    <div>${user.user}</div>
                                    <div>${user.user_name}</div>
                                `;
 
                                row.addEventListener('dblclick', () => {
                                    window.openType.type = 1;
                                    const windowPF = document.getElementById('profile')
                                    if(windowPF != null){
                                        close_window(windowPF);
                                    }
                                    window.edituserdata = user;
                                    create_window('profile', ('usuario: ' + user.user), perfil_window_html);
                                    
                                    if(window.currentUserData.user != window.edituserdata.user){
                                        const fotter = document.querySelector('.profile_footer');

                                        const btn = document.createElement('button');
                                        btn.id = 'update_user_btn';
                                        btn.textContent = 'Atualizar';
                                        btn.addEventListener('click', () => {
                                            console.log("Atualizando usuário:", window.edituserdata.user);                                            
                                        });

                                        fotter.appendChild(btn);
                                    }                                                                                                                    
                
                                    const roleSelect    = document.getElementById('user_role');
                                    const userfunction  = document.getElementById('function');
                                    const serviceInput  = document.getElementById('service_type');
                                    const nameInput     = document.getElementById('user_name');
                                    const UsernameInput = document.getElementById('user_id');
                                    const emailInput    = document.getElementById('user_email');
                                    const phoneInput    = document.getElementById('user_phone');
                                    const passwordInput = document.getElementById('password');                                                                    
                                    
                                    if(user.register_type != 'cliente')
                                        userfunction.selectedIndex = (user.function === 'gestor')        ? 0 : 
                                                                     (user.function === 'Desenvolvedor') ? 1 : 2;    
                                    else
                                        userfunction.style.display = 'none';

                                    roleSelect.selectedIndex = (user.register_type === 'cliente') ? 1 : 0;
                                    serviceInput.value       = user.user_description || '';
                                    nameInput.value          = user.user_name        || '';
                                    UsernameInput.value      = user.user             || '';
                                    emailInput.value         = user.email            || '';
                                    phoneInput.value         = user.contact_phone    || '';
                                    passwordInput.value      = user.acess_key        || '';
                                });

                                row.addEventListener('click', () => {
                                    const checkbox = row.querySelector('.user_checkbox');
                                    if (checkbox) checkbox.checked = !checkbox.checked;
                                  });

                                grid.appendChild(row);
                            });
                        })
                        .catch(err => {
                            console.error("Erro ao ler o Excel:", err);                            
                        });
                    break;
            }
        }
    });
});