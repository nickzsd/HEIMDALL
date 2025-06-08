import {confirmModal, warningModal} from '../messages/modalLOG.js'

import { fillusernotifications, clearNotifications } from "./notificationsfunctions.js";
import { setfunctions_TK,fillTickets_Filters,fillTickets } from './ticketsfunctions.js';
import { FillConfigData, setconfigfunctions } from "./configfunctions.js";
import { fillProfile } from "./profileFunctions.js";
import { FillUS } from "./userlistfunctions.js";

if(document.querySelector('.window_profile')){
    const windowProfile = document.querySelector('.window_profile');            

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
                    fillProfile();
                    break;
                case 'US':
                    FillUS();
                    break;
                case 'CF':                    
                    FillConfigData();                                                            
                    setconfigfunctions(); 
                    break;
                case 'NF':
                    fillusernotifications();

                    document.getElementById('clear_all').addEventListener('click', function() {
                        const body = document.getElementById('user_grid_body');
                        const rows = body.querySelectorAll('.user_grid_row');
                        rows.forEach(row => {
                            row.classList.add('removeline-animation')
                            clearNotifications(row)
                        });                                                                        
                    })
                    break;
                case 'TK':
                    setfunctions_TK();
                    fillTickets_Filters();    
                    fillTickets();                
                    break;
            }
        }
    });
});