import { create_window, close_window } from "../functions/menuFunctions.js";
import { FillUS } from "../functions/menuscreen.js";
import {confirmModal, warningModal} from '../messages/modalLOG.js'

export function setfunctions() {   
    document.getElementById('remove_user_btn').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.user_checkbox:checked');
        const idsSelecionados = Array.from(checkboxes).map(cb => cb.dataset.id);                    

        if (idsSelecionados.length === 0) {
            warningModal("Selecione ao menos um usuário para remover.");                            
            return;
        }
                
        const users = idsSelecionados.join(",");

        confirmModal(`Deseja Realmente deletar os IDs: ${users}`, users).then((confirmed) => {
            if (confirmed) {
                const grid = document.getElementById('user_grid_body');
                while (grid.firstChild) {
                    grid.removeChild(grid.firstChild);
                }  
                fetch('http://localhost:3000/delete_from_excel', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ids: idsSelecionados })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        warningModal("Registros deletados com sucesso!");                                                                                                                      
                    } else {
                        warningModal("Erro ao deletar: " + data.message);
                    }
                })
                .catch(err => {
                    warningModal("Erro ao deletar registros.");
                    console.error(err);
                });  
                FillUS();                             
            }
        });        
    });

    document.getElementById('add_user_btn').addEventListener('click', () => {
        const windowPF = document.getElementById('profile')        
        if(windowPF != null){
            close_window(windowPF);
        }
        window.openType.type = 2;
        create_window('profile', 'Novo Usuário', perfil_window_html); 
        
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
                        
            fetch('http://localhost:3000/add_to_excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newuser)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success){ 
                    warningModal(`Usuario ${UsernameInput.value} adicionado com sucesso!`);
                    close_window(document.getElementById('profile')); 
                }
                else 
                    warningModal('Erro ao adicionar no Excel!');                
            })
            .catch(err => {
                console.error(err);
                warningModal('Erro de conexão com o servidor.');
            });
        });

        fotter.appendChild(btn);
    });
}
  