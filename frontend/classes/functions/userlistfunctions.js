import { close_window, create_window, getnextCode } from "../utils/HDL_Utils.js";
import {confirmModal, warningModal} from '../messages/modalLOG.js'
import { fillCompanys } from "./profileFunctions.js";

export function setfunctions() {   
    document.getElementById('remove_user_btn').addEventListener('click', (e) => {
        e.preventDefault();

        const checkboxes = document.querySelectorAll('.user_checkbox:checked');
        const idsSelecionados = Array.from(checkboxes).map(cb => cb.dataset.id);                    

        if (idsSelecionados.length === 0) {
            warningModal("Selecione ao menos um usuário para remover.");                            
            return;
        } 
        
        for (let i = 0; i < idsSelecionados.length; i++) {
            const _user = idsSelecionados[i];
            if(_user == window.currentUserData.user)
            {
                warningModal("Você não pode deletar seu próprio usuário!");                            
                return;
            }
        }
                
        const users = idsSelecionados.join(",");        

        confirmModal(`Deseja Realmente deletar os IDs: ${users}`, users).then((confirmed) => {
            if (confirmed) {                 
                const JsonBodyData = {tableid: 'users',type: 'delete',data:'',query: {user: users}}
                fetch('http://localhost:3000/table_States', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(JsonBodyData)
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success){ 
                        const grid = document.getElementById('user_grid_body');
                        while (grid.firstChild) {
                            grid.removeChild(grid.firstChild);
                        } 
                        warningModal(`Usuario(s) ${users} deletados com sucesso!`);
                        FillUS();                                                 
                    }
                    else 
                        warningModal('Erro ao adicionar no Excel!');                
                })
                .catch(err => {
                    console.error(err);
                    warningModal('Erro de conexão com o servidor.');
                });                                            
            }
        });        
    });

    document.getElementById('add_user_btn').addEventListener('click', async (e) => {
        e.preventDefault();

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
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const roleSelect        = document.getElementById('user_role');
            const company           = document.getElementById('select_Company');
            const descriptionInput  = document.getElementById('description');
            const serviceInput      = document.getElementById('function');
            const nameInput         = document.getElementById('user_name');
            const UsernameInput     = document.getElementById('user_id');
            const emailInput        = document.getElementById('user_email');
            const phoneInput        = document.getElementById('user_phone');
            const passwordInput     = document.getElementById('password');

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
                user:             UsernameInput.value,
                user_name:        nameInput.value,
                email:            emailInput.value,
                contact_phone:    phoneInput.value,
                acess_key:        passwordInput.value,
                function:         serviceInput.value || '', 
                companyId:        company.value      || '',
                register_type:    roleSelect.value,
                user_description: descriptionInput.value
            };

            const JsonBodyData = {tableid: 'users',type: 'insert',data: newuser}
                        
            fetch('http://localhost:3000/table_States', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(JsonBodyData)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success){ 
                    const grid = document.getElementById('user_grid_body');
                    while (grid.firstChild) {
                        grid.removeChild(grid.firstChild);
                    }  
                    window.openType.type = 1
                    warningModal(`Usuario ${UsernameInput.value} adicionado com sucesso!`);
                    close_window(document.getElementById('profile')); 
                    FillUS()
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

        document.getElementById('user_id').value = await getnextCode('users');
    });    

    document.getElementById('Filter_Input_US').addEventListener('input',() => {filter_Rows()})
}

function filter_Rows(){
    const filterValue = document.getElementById('Filter_Input_US').value.toLowerCase();
    const filterType  = document.getElementById('Filter_Type_US').value;
    const rows        = document.querySelectorAll('.user_grid_row');    
    
    rows.forEach(row => {
        const userId   = row.querySelector('.user_id').textContent.toLowerCase();
        const userName = row.querySelector('.user_name').textContent.toLowerCase();

        let matches = false;

        if(filterValue != "")
        {                                        
            if (filterType == 'id') 
                matches = userId.includes(filterValue);
            else if (filterType == 'name')
                matches = userName.includes(filterValue);
        }
        else
            matches = true

        row.style.display = matches ? '' : 'none';
    });
}

export function FillUS(){
    fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },   
        body: JSON.stringify({tableid: 'users'})     
    })    
    .then(response => response.json())
    .then(data => {
        const json = data.json                    

        const grid = document.getElementById('US_body');
        grid.innerHTML = '';

        json.forEach(user => {
            const row = document.createElement('div');
            row.id        = 'PF'
            row.className = 'user_grid_row';
            row.innerHTML = `
                <div><input type="checkbox" class="user_checkbox" data-id="${user.user}"></div>
                <div class="user_id" >${user.user}</div>
                <div class="user_name" >${user.user_name}</div>
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
                        const roleSelect        = document.getElementById('user_role');
                        const company           = document.getElementById('select_Company');
                        const descriptionInput  = document.getElementById('description');
                        const serviceInput      = document.getElementById('function');
                        const nameInput         = document.getElementById('user_name');
                        const UsernameInput     = document.getElementById('user_id');
                        const emailInput        = document.getElementById('user_email');
                        const phoneInput        = document.getElementById('user_phone');
                        const passwordInput     = document.getElementById('password');

                        if (!UsernameInput.value.trim() ||
                            !nameInput.value.trim()     ||
                            !emailInput.value.trim()    ||
                            !phoneInput.value.trim()    ||
                            !passwordInput.value.trim()) 
                        {
                            warningModal("Preencha todos os campos obrigatórios!");
                            return;
                        }          
                        
                        if(roleSelect.value == 'company')                        
                            serviceInput.value = '';

                        const editUser = {
                            user:             UsernameInput.value,
                            user_name:        nameInput.value,
                            email:            emailInput.value,
                            contact_phone:    phoneInput.value,
                            acess_key:        passwordInput.value,
                            function:         serviceInput.value || '', 
                            companyId:        company.value      || '',
                            register_type:    roleSelect.value,
                            user_description: descriptionInput.value
                        };
            
                        const JsonBodyData = {tableid: 'users',type: 'update',data: editUser,query: {user: window.edituserdata.user}}                                                 

                        fetch('http://localhost:3000/table_States', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(JsonBodyData)
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success){                                                              
                                warningModal(`Usuario ${UsernameInput.value} editado com sucesso!`);                                
                                FillUS()
                            }
                            else 
                                warningModal('Erro ao editar o Excel!');                
                        })
                        .catch(err => {
                            console.error(err);
                            warningModal('Erro de conexão com o servidor.');
                        });
                    });

                    fotter.appendChild(btn);
                }                                                                                                                    

                const roleSelect        = document.getElementById('user_role');
                const company           = document.getElementById('select_Company');
                const descriptionInput  = document.getElementById('description');
                const userfunction      = document.getElementById('function');
                const nameInput         = document.getElementById('user_name');
                const UsernameInput     = document.getElementById('user_id');
                const emailInput        = document.getElementById('user_email');
                const phoneInput        = document.getElementById('user_phone');
                const passwordInput     = document.getElementById('password');                                                                    
                
                if(user.register_type != 'company'){                    
                    userfunction.value = user.function
                } else {
                    document.getElementById('PF_Function').style.display = 'none';
                    document.getElementById('PF_Companys').style.display = 'block';

                    fillCompanys(user.companyId);                                                                        
                }                                                      

                roleSelect.value         = user.register_type;
                descriptionInput.value   = user.user_description || '';
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
}
  