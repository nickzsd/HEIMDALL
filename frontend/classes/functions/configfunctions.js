import {confirmModal, warningModal} from '../messages/modalLOG.js'

import { getnextRecid } from '../utils/HDL_Utils.js'

export function canCloseWindow() {    
    return new Promise((resolve) => {
        const sequenceUser        = document.getElementById('usercode');
        const sequenceTicket      = document.getElementById('ticketcode');
        const sequenceUserCount   = document.getElementById('usercount');
        const sequenceTicketCount = document.getElementById('ticketcount');

        if (!sequenceUser.value.trim()        ||
            !sequenceTicket.value.trim()      ||
            !sequenceUserCount.value.trim()   ||
            !sequenceTicketCount.value.trim()) 
        {
            resolve(false);
            return;
        } 
        
        const UpdateData = {
            UserSequence: sequenceUser.value,
            UserCode: sequenceUserCount.value.replace(/0/g, "#"),
            TicketSequence: sequenceTicket.value,
            TicketCode: sequenceTicketCount.value.replace(/0/g, "#")
        }

        const JsonBodyData = {tableid: 'parameters',type: 'update',data: UpdateData,query: {index: 0}}
                        
        fetch('http://localhost:3000/table_States', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(JsonBodyData)
        })

        resolve(true);
    });
}
  
export function FillConfigData(){
    fillSequences();
    fillCompanys();    
    fillprojects();
}

export function setconfigfunctions(){  
    const USCode  = document.getElementById('usercode')
    const USCount = document.getElementById('usercount')
    const TKCode  = document.getElementById('ticketcode')
    const TKCount = document.getElementById('ticketcount')              
    
    function checkNextCode(type) {
        const nextUser   = document.getElementById('nextuser')
        const nextTicket = document.getElementById('nextticket')

        let jsondata;
        
        if (type === 'user') {
            jsondata = {tableid: 'users',const: USCode.value ,code: USCount.value.replace(/0/g, "#")}
        } else if (type === 'ticket') {
            jsondata = {tableid: 'tickets',const: TKCode.value ,code: TKCount.value.replace(/0/g, "#")}
        }
        
        fetch('http://localhost:3000/get_nextnum', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsondata)
        })
        .then(res => res.json())
        .then(data => {               
            if (type === 'user') {
                nextUser.value = data.code;
            } else if (type === 'ticket') {
                nextTicket.value = data.code;
            }                 
        })        
    }

    USCode.addEventListener('change', () => checkNextCode('user'));
    USCount.addEventListener('change', () => checkNextCode('user'));
    TKCode.addEventListener('change', () => checkNextCode('ticket'));
    TKCount.addEventListener('change', () => checkNextCode('ticket'));

    document.querySelectorAll('.tab_button').forEach(button => {
        button.addEventListener('click', () => {
        document.querySelectorAll('.tab_button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab_panel').forEach(panel => panel.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
        });
    });      
    
    document.querySelectorAll('.digit_count').forEach(digitInput => {
        const DigitInputType = digitInput.id; 
    
        fetch('http://localhost:3000/find', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableid: 'parameters' })
        })
        .then(res => res.json())
        .then(data => {
            const configData = data.json[0];
    
            const counter_US = configData.UserCode.length;
            const counter_TK = configData.TicketCode.length;
    
            let counter = (DigitInputType === 'usercount') 
                        ? counter_US : counter_TK;                
    
            digitInput.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' || e.key == '0') {
                    if (counter === 6) return;
                    counter++;
                } else if (e.key === 'ArrowDown' || e.key == 'Backspace') {
                    if (counter <= 0) return;
                    counter--;
                }
    
                if (!['ArrowUp', 'ArrowDown','Backspace','0'].includes(e.key)) {
                    e.preventDefault();
                }
    
                updateValue();
            });
    
            digitInput.addEventListener('input', () => {
                if (digitInput.value.length > 1)
                    digitInput.value = digitInput.value.slice(0, 1);
    
                updateValue();
            });
    
            function updateValue() {
                digitInput.value = "0".repeat(counter);
                digitInput.dispatchEvent(new Event('change'));
            }
        });
    });  
    
    document.getElementById('add_company_btn').addEventListener('click', () => {  
        const mainRow = document.getElementById('company_rows')
        
        const row = document.createElement('div');        
        
        fetch('http://localhost:3000/get_nextRecid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },        
            body: JSON.stringify({tableid: 'company'})
        })
        .then(res => res.json())
        .then(data => {
            const next_id = data.nextRecid

            fetch('http://localhost:3000/table_states', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },        
                body: JSON.stringify({tableid: 'company',
                                    type: 'insert',
                                    data: {Recid: next_id,mainContact:"",companyId:""}})
            })
            .then(res => res.json())
            .then(data => {}) 

            row.id        = next_id
            row.className = 'Company_row';
            row.innerHTML = `
                <div><input type="checkbox" class="company_checkbox" id="${next_id}" data-id="${next_id}"></div>
                <div class="company_id" contenteditable="true"></div>
                <select id="Contact_Select" class="custom_select_CP">
                    <option value="null">Não atribuido</option>
                </select>
            `;        

            const selection_field = row.querySelector('.custom_select_CP')     

            fetch('http://localhost:3000/find', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },   
                body: JSON.stringify({tableid: 'users',query: {register_type: 'company'}})     
            })    
            .then(response => response.json())
            .then(data => {
                const json = data.json 

                json.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.user;
                    option.textContent = user.user_name;
                    selection_field.appendChild(option);
                });
            })

            row.addEventListener('click', () => {
                const checkbox = row.querySelector('.user_checkbox');
                if (checkbox) checkbox.checked = !checkbox.checked;
            });                   

            setLineUpdate(row)

            mainRow.appendChild(row)
        })                                         
    })    

    document.getElementById('remove_company_btn').addEventListener('click', () => {
        const checkboxes      = document.querySelectorAll('.company_checkbox');
        const idsSelecionados = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id);                 

        if (idsSelecionados.length === 0) {
            warningModal("Selecione ao menos uma empresa para remover.");                            
            return;            
        } 

        const companyids = idsSelecionados.join(',');         

        confirmModal(`Deseja realmente deletar?`).then((confirmed) => {
            if (confirmed) {                 
                const JsonBodyData = {tableid: 'company',type: 'delete',data:'',query: {Recid: parseInt(companyids)}}
                fetch('http://localhost:3000/table_States', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(JsonBodyData)
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success)
                        fillCompanys()                                                                    
                    else 
                        warningModal('Erro ao remover no Excel!');                
                })
                .catch(err => {
                    console.error(err);
                    warningModal('Erro de conexão com o servidor.');
                });                                            
            }
        });
    })

    document.getElementById('add_project').addEventListener('click', async () => {  
        const mainRow = document.getElementById('project_rows')
        
        const row = document.createElement('div');   
        
        const next_id = await getnextRecid('projects');                

        fetch('http://localhost:3000/table_states', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },        
            body: JSON.stringify({tableid: 'projects',
                                type: 'insert',
                                data: {Recid: next_id,projId:"",refCompany:""}})
        })
        .then(res => res.json())
        .then(data => {}) 
            row.id        = proj.Recid;         
            row.className = 'project_row';
            row.innerHTML = `
                <div><input type="checkbox" class="proj_checkbox" id="${next_id}" data-id="${next_id}"></div>
                <div class="projId" contenteditable="true"></div>
                <select id="company_select" class="custom_select_PJ">
                    <option value="null">Não atribuido</option>
                </select>
            `;        

            const selection_field = row.querySelector('.custom_select_PJ')    

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
    
                json.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company.companyId;
                    option.textContent = company.companyId;                    

                    selection_field.appendChild(option);
                });
            })

            row.addEventListener('click', () => {
                const checkbox = row.querySelector('.proj_checkbox');
                if (checkbox) checkbox.checked = !checkbox.checked;
            });

            setprojline(row)

            mainRow.appendChild(row)
        })                                             

    document.getElementById('remove_project').addEventListener('click', () => {
        const checkboxes      = document.querySelectorAll('.proj_checkbox');
        const idsSelecionados = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id);                 

        if (idsSelecionados.length === 0) {
            warningModal("Selecione ao menos um projeto para remover.");                            
            return;            
        } 

        const projs_ids = idsSelecionados.join(',');         

        confirmModal(`Deseja realmente deletar?`).then((confirmed) => {
            if (confirmed) {                 
                const JsonBodyData = {tableid: 'projects',type: 'delete',data:'',query: {Recid: parseInt(projs_ids)}}
                fetch('http://localhost:3000/table_States', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(JsonBodyData)
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success)
                        fillprojects()                                                       
                    else 
                        warningModal('Erro ao remover no Excel!');                
                })
                .catch(err => {
                    console.error(err);
                    warningModal('Erro de conexão com o servidor.');
                });                                            
            }
        });
    })
}

function setLineUpdate(row){    
    const companyIdDiv  = row.querySelector('.company_id');
    const selectContact = row.querySelector('.custom_select_CP');     

    function makeupdate(refid,name,selectValue){
        const JsonBodyData = {tableid: 'company',
                              type: 'update',
                              query:{Recid: refid},
                              data: {Recid: refid,companyId: name,mainContact: selectValue}}        
        
        fetch('http://localhost:3000/table_states', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },        
            body: JSON.stringify(JsonBodyData)
        })
        .then(res => res.json())
        .then(data => {})
    }    
    
    companyIdDiv.addEventListener('input', () => {
        clearTimeout(row._debounceTimer);
        row._debounceTimer = setTimeout(() => {  
            makeupdate(Number(row.id),companyIdDiv.textContent,selectContact.value)        
        }, 600);
      });   
    
    selectContact.addEventListener('change', () => {  
        makeupdate(Number(row.id),companyIdDiv.textContent,selectContact.value)
    });

}

function setprojline(row){
    const projIdDiv     = row.querySelector('.projId');
    const select_Company = row.querySelector('.custom_select_PJ');     

    function makeupdate(refid,name,selectValue){
        const JsonBodyData = {tableid: 'projects',
                            type: 'update',
                            query:{Recid: refid},
                            data: {Recid: refid,projId: name,refCompany: selectValue}}        
        
        fetch('http://localhost:3000/table_states', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },        
            body: JSON.stringify(JsonBodyData)
        })
        .then(res => res.json())
        .then(data => {})
    }    
    
    projIdDiv.addEventListener('input', () => {
        clearTimeout(row._debounceTimer);
        row._debounceTimer = setTimeout(() => {  
            makeupdate(Number(row.id),projIdDiv.textContent,select_Company.value)        
        }, 600);
    });   
    
    select_Company.addEventListener('change', () => {  
        makeupdate(Number(row.id),projIdDiv.textContent,select_Company.value)
    });
}

//preenchimento
function fillSequences(){
    //sequencias numericas
    fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({tableid: 'parameters'})
    })
    .then(res => res.json())
    .then(data => {
        const configData = data.json[0];                  

        document.getElementById('usercode').value  = configData.UserSequence;
        document.getElementById('usercount').value = configData.UserCode.replace(/#/g, "0");

        document.getElementById('ticketcode').value  = configData.TicketSequence;
        document.getElementById('ticketcount').value = configData.TicketCode.replace(/#/g, "0");

        fetch('http://localhost:3000/get_nextnum', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({tableid: 'users'})
        })
        .then(res => res.json())
        .then(data => {               
            document.getElementById('nextuser').value = data.code;             
        })

        fetch('http://localhost:3000/get_nextnum', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({tableid: 'tickets'})
        })
        .then(res => res.json())
        .then(data => {               
            document.getElementById('nextticket').value = data.code;                  
        })
    })
}

function fillCompanys(){
    //empresas
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

        const mainRow = document.getElementById('company_rows')
        mainRow.innerHTML = "";
        
        json.forEach(company => {                        
            const row = document.createElement('div');            
            row.className = 'Company_row';
            row.innerHTML = `
                <div><input type="checkbox" class="company_checkbox" id="${company.Recid}" data-id="${company.Recid}"></div>
                <div class="company_id" contenteditable="true">${company.companyId}</div>
                <select id="Contact_Select" class="custom_select_CP">
                    <option value="null">Não atribuido</option>
                </select>
            `;                                           

            const selection_field = row.querySelector('.custom_select_CP')    

            fetch('http://localhost:3000/find', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },   
                body: JSON.stringify({tableid: 'users',query: {register_type: 'company'}})     
            })    
            .then(response => response.json())
            .then(data => {
                const json = data.json 
    
                json.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.user;
                    option.textContent = user.user_name;

                    if (user.user === company.mainContact) 
                        option.selected = true;

                    selection_field.appendChild(option);
                });
            })

            row.addEventListener('click', () => {
                const checkbox = row.querySelector('.company_checkbox');
                if (checkbox) checkbox.checked = !checkbox.checked;
            });

            setLineUpdate(row)

            mainRow.appendChild(row)
        })    
    })
}

function fillprojects(){    
    //projetos
    fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },   
        body: JSON.stringify({tableid: 'projects'})
      })    
    .then(response => response.json())
    .then(data => {
        const json = data.json         

        const mainRow = document.getElementById('project_rows')
        mainRow.innerHTML = "";
        
        json.forEach(proj => {                        
            const row = document.createElement('div');   
            row.id        = proj.Recid;         
            row.className = 'project_row';
            row.innerHTML = `
                <div><input type="checkbox" class="proj_checkbox" id="${proj.Recid}" data-id="${proj.Recid}"></div>
                <div class="projId" contenteditable="true">${proj.projId }</div>
                <select id="company_select" class="custom_select_PJ">
                    <option value="null">Não atribuido</option>
                </select>
            `;                                           

            const selection_field = row.querySelector('.custom_select_PJ')    

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
    
                json.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company.companyId;
                    option.textContent = company.companyId;

                    if (proj.refCompany === company.companyId) 
                        option.selected = true;

                    selection_field.appendChild(option);
                });
            })

            row.addEventListener('click', () => {
                const checkbox = row.querySelector('.proj_checkbox');
                if (checkbox) checkbox.checked = !checkbox.checked;
            });

            setprojline(row)

            mainRow.appendChild(row)
        })    
    })
}

function fillprojects_tasks(){
    
}