export function fillProfile(){ 
    const form = document.querySelector('.form_container');                                        
                        
    const roleSelect       = document.getElementById('user_role');
    const company          = document.getElementById('select_Company');
    const serviceInput     = document.getElementById('function');
    const nameInput        = document.getElementById('user_name');
    const UsernameInput    = document.getElementById('user_id');
    const emailInput       = document.getElementById('user_email');
    const phoneInput       = document.getElementById('user_phone');
    const passwordInput    = document.getElementById('password');
    const descriptionInput = document.getElementById('description');

    if(window.currentUserData.function != 'gestor'){
        if (form) {
            form.querySelectorAll('input, textarea, select').forEach(field => {
                field.disabled = true;
            });
        }
    } else {
        document.getElementById('user_id').disabled = true

        const fotter = document.querySelector('.profile_footer');

        const btn = document.createElement('button');
        btn.id = 'update_user_btn';
        btn.textContent = 'Atualizar';
        btn.addEventListener('click', () => {    

            if (!UsernameInput.value.trim() ||
                !nameInput.value.trim()     ||
                !emailInput.value.trim()    ||
                !phoneInput.value.trim()    ||
                !passwordInput.value.trim()) 
            {
                warningModal("Preencha todos os campos obrigatórios!");
                return;
            }            

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

            const JsonBodyData = {tableid: 'users',type: 'update',data: editUser,query: {user: window.currentUserData.user}}                                                 

            confirmModal('atualizar seu cadastro pode afetar seu proximo login, deseja continuar?').then((result) => {
                if(result){
                    fetch('http://localhost:3000/table_States', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(JsonBodyData)
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success)                     
                            warningModal(`Usuario ${UsernameInput.value} editado com sucesso!`);                                                                                            
                        else 
                            warningModal('Erro ao editar os dados!');                
                    })
                    .catch(err => {
                        console.error(err);
                        warningModal('Erro de conexão com o servidor.');
                    });
                }
            });
        });

        fotter.appendChild(btn);                
    }                                        

    roleSelect.value           = window.currentUserData.register_type
    company.value              = window.currentUserData.companyId;        
    serviceInput.selectedIndex = window.currentUserData.function
    descriptionInput.value     = window.currentUserData.user_description  || '';    
    nameInput.value            = window.currentUserData.user_name         || '';
    UsernameInput.value        = window.currentUserData.user              || '';
    emailInput.value           = window.currentUserData.email             || '';
    phoneInput.value           = window.currentUserData.contact_phone     || '';
    passwordInput.value        = window.currentUserData.acess_key         || '';
}

export function setProfileFunctions(){
    const roleSelect = document.getElementById('PF_Function');
    const companyDIV = document.getElementById('PF_Companys');
    const companyPF  = document.getElementById('select_Company');

    roleSelect.style.display = (window.currentUserData.register_type == 'company')  ? 'none' : 'block';   
    companyDIV.style.display = (window.currentUserData.register_type == 'employee') ? 'none' : 'block';       

    document.getElementById('user_role').addEventListener('change', function () {
        const selectedValue = this.value;         
        
        if(selectedValue === 'company'){
            roleSelect.style.display = 'none'
            companyDIV.style.display  = 'block'

            fillCompanys();
        } else {
            companyDIV.style.display = 'none';
            roleSelect.style.display = 'block';              
            companyPF.innerHTML      = '';             
        }        
    });
}

export function fillCompanys(ref_company = ''){
    const companyPF = document.getElementById('select_Company');
    companyPF.innerHTML = '';

    const InitOption       = document.createElement('option');
    InitOption.value       = 'blank';
    InitOption.textContent = 'nenhuma';

    companyPF.appendChild(InitOption);

    fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },   
        body: JSON.stringify({tableid: 'company'})     
        })    
    .then(response => response.json())
    .then(data => {
        const json = data.json 
        
        json.forEach(user => {
            const option       = document.createElement('option');
            option.value       = user.companyId;
            option.textContent = user.companyId;
            
            companyPF.appendChild(option);
        })   
        
        if(ref_company != '')
            companyPF.value = ref_company;
    })    
}