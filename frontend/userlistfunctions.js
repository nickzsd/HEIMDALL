import { create_window, close_window } from "../frontend/menuFunctions.js";
import {confirmModal, warningModal} from '../frontend/modalLOG.js'

export function setfunctions() {   
    document.getElementById('remove_user_btn').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.user_checkbox:checked');
        const idsSelecionados = Array.from(checkboxes).map(cb => cb.dataset.id);
    
        if (idsSelecionados.length === 0) {
        alert("Selecione ao menos um usuário para remover.");
        return;
        }
        
        console.log("IDs a excluir:", idsSelecionados);
    });

    document.getElementById('add_user_btn').addEventListener('click', () => {
        const windowPF = document.getElementById('profile')        
        if(windowPF != null){
            close_window(windowPF);
        }
        window.openType.type = 2;
        create_window('profile', ('Novo Usuário'), perfil_window_html); 
        
        const fotter = document.querySelector('.profile_footer');
        const btn = document.createElement('button');
        btn.id = 'update_user_btn';
        btn.textContent = 'Salvar';
        btn.addEventListener('click', () => {
            const roleSelect    = document.getElementById('user_role');
            const serviceInput  = document.getElementById('service_type');
            const nameInput     = document.getElementById('user_name');
            const UsernameInput = document.getElementById('user_id');
            const emailInput    = document.getElementById('user_email');
            const phoneInput    = document.getElementById('user_phone');
            const passwordInput = document.getElementById('password');

            if (!UsernameInput.value.trim() ||
                !nameInput.value.trim()     ||
                !emailInput.value.trim()    ||
                !phoneInput.value.trim()    ||
                !passwordInput.value.trim()) 
            {
                warningModal("Preencha todos os campos obrigatórios!");
                return;
            }            

            const newuser = {
                user: UsernameInput.value,
                user_name: nameInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
                password: passwordInput.value,
                service_type: serviceInput.value || '', 
                role: roleSelect.value
            };
                        
            fetch('/add-to-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newuser)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    successModal(data.message);
                } else {
                    warningModal('Erro ao adicionar no Excel!');
                }
            })
            .catch(err => {
                console.error(err);
                warningModal('Erro de conexão com o servidor.');
            });
        });

        fotter.appendChild(btn);
    });
}
  