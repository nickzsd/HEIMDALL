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
    
            if (id === 'PF') {
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
                const emailInput    = document.getElementById('user_email');
                const phoneInput    = document.getElementById('user_phone');
                
                console.log(window.currentUserData)

                if (roleSelect)
                    roleSelect.selectedIndex = (window.currentUserData.register_type == 'cliente') ? 1 : 0;
            
                if (serviceInput)
                    serviceInput.value = window.currentUserData.user_description;
            
                if (nameInput)
                    nameInput.value = window.currentUserData.user;
            
                if (emailInput)
                    emailInput.value = window.currentUserData.email;
            
                if (phoneInput)
                    phoneInput.value = window.currentUserData.contact_phone;
            }
        }
    });
});