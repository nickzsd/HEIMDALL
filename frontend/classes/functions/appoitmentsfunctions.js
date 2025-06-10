import { getuserName, dateName, getprojName, Date2ISO, ISO2Date, getnextRecid } from "../utils/HDL_Utils.js"
import {confirmModal, warningModal} from '../messages/modalLOG.js'

//principais
export function setAppointmentsFunctions(){
    document.querySelectorAll('.tab_btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab_btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab_content').forEach(tab => tab.classList.remove('active'));
    
            btn.classList.add('active');
            const tabId = btn.dataset.tab;

            if(window.appointment.ap_type == 1){
                window.appointment.ap_type = 0

                clear_inputs();

                document.getElementById('save_record').textContent = "salvar";
                document.getElementById('new_ap_tab').textContent  = "Novo Apontamento";
                document.getElementById('ap_title').textContent    = "Novo de Apontamento";
            }

            if(window.appointment.admin_view == 1){
                window.appointment.admin_view = 0
                window.appointment.workerid   = ''
                                                
                document.getElementById('history_title').textContent = "Registros Recentes";
            }

            if(tabId == 'history_tab')
                fillhistory();      
            else if(tabId == 'staff_history_tab')
                fillWorkers();            

            if(tabId != 'history_tab')
                document.getElementById('filter_date').value = ''; 

            document.getElementById(tabId).classList.add('active');
        });
    });

    function timeFunction() {
        const startInput   = document.getElementById('start_time');
        const endInput     = document.getElementById('end_time');
        const totalDisplay = document.getElementById('total_time');
    
        function autoFormatTime(input) {
            let value = input.value.trim();
                
            if (/^\d{1,2}$/.test(value)) {
                value = value.padStart(2, '0') + ':00';
            }
                
            else if (/^\d{3,4}$/.test(value)) {
                value = value.padStart(4, '0');
                value = value.slice(0, 2) + ':' + value.slice(2);
            }
            
            else if (!/^\d{1,2}:\d{2}$/.test(value)) {
                return; 
            }
    
            input.value = value;
        }
    
        function updateTotalTime() {
            const start = startInput.value;
            const end   = endInput.value;

            if (start && end && /^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end)) {
                const [startH, startM] = start.split(":").map(Number);
                const [endH, endM]     = end.split(":").map(Number);
                
                const isValidTime = (h, m) => h >= 0 && h <= 23 && m >= 0 && m <= 59;
                if (!isValidTime(startH, startM) || !isValidTime(endH, endM)) {
                    totalDisplay.textContent = 'Hora inválida';
                    return;
                }

                let totalMins = (endH * 60 + endM) - (startH * 60 + startM);
                if (totalMins < 0) totalMins += 24 * 60;

                const hours = Math.floor(totalMins / 60);
                const mins  = totalMins % 60;
                totalDisplay.textContent = `${hours}h ${mins}m`;
            } else {
                totalDisplay.textContent = '0:00';
            }
        }     
    
        function getCurrentTimeString() {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            return `${h}:${m}`;
        }
    
        startInput.addEventListener('blur', () => {
            autoFormatTime(startInput);
            if (!endInput.value) {
                endInput.value = getCurrentTimeString();
                autoFormatTime(endInput);
            }
            updateTotalTime();
        });
    
        endInput.addEventListener('blur', () => {
            autoFormatTime(endInput);
            updateTotalTime();
        });
    
        startInput.addEventListener('input', updateTotalTime);
        endInput.addEventListener('input', updateTotalTime);
    }
        
    function dateFunction() {
        const input = document.getElementById("execution_date");
    
        const today = new Date();
        const priorDate = new Date();
        priorDate.setDate(today.getDate() - 30);
    
        const formatDate = (d) => d.toISOString().split("T")[0];
    
        const maxDateStr = formatDate(today);
        const minDateStr = formatDate(priorDate);
    
        input.max = maxDateStr;      
        input.min = minDateStr;
    
        input.addEventListener("blur", () => {
            const value = input.value;
            if (value) {
                if (value < minDateStr) input.value = minDateStr;
                if (value > maxDateStr) input.value = maxDateStr;
            }
        });
    }
              
    fillUtils();
    timeFunction()
    dateFunction()

    document.getElementById('save_record').onclick = () => { saveOrEdit() };
}

async function fillhistory(date = null,userid = window.currentUserData.user) {
    const mainRow = document.getElementById('main_history');
    mainRow.innerHTML = "";

    const response = await fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tableid: 'records', query: { userid: userid } })
    });

    const data = await response.json();
    let json = data.json;
        
    json.sort((a, b) => new Date(b.refdate) - new Date(a.refdate));    

    const filtered = date != null && date != '' ? json.filter(r => r.refdate === date) : json;        

    const cards = await Promise.all(filtered.map(record => history_format(record,(userid != window.currentUserData.user))));
    cards.forEach(card => mainRow.appendChild(card));

    document.getElementById('filter_date').onchange = () => { filter_history() };    
}

async function saveOrEdit(ref_recid = "") {
    const description = document.getElementById("description").value;    
    const contact     = document.getElementById("contact_input").value;  
    const Total       = document.getElementById("total_time").textContent;  
    const start       = document.getElementById("start_time").value;
    const end         = document.getElementById("end_time").value;
    const date        = document.getElementById("execution_date").value;

    const projects    = document.getElementById('project_input').value;
    const task        = document.getElementById('task_input').value;
    const ticket      = document.getElementById('ticket_input').value;  
    
    function checkvalues(){
        return new Promise((resolve) => {                   
            if(!description.trim()){
                warningModal("necessário informar uma descrição");
                return resolve(false);
            } else if(!contact.trim()){
                warningModal("necessário informar o contato");
                return resolve(false);
            } else if(!Total.trim() || Total.trim() == "0:00"){
                warningModal("o total não pode ser 0");
                return resolve(false);
            } else if(!start.trim() || !end.trim()){
                warningModal("informe os horários corretamente");
                return resolve(false);
            } else if(!date.trim()){
                warningModal("necessário informar a data do apontamento");
                return resolve(false);
            } else if(projects == 'null'){
                warningModal("necessário informar um projeto");
                return resolve(false);
            } else if(task == 'null'){
                warningModal("necessário informar a tarefa");
                return resolve(false);
            } else if(ticket == 'null'){
                warningModal("necessário informar o respectivo ticket");
                return resolve(false);
            }            

            resolve(true);
        });
    }

    async function makeData(){
        let data = {};
        if(window.appointment.ap_type == 0){ //save
            data = {Recid: await getnextRecid('records'),
                    userid: window.currentUserData.user,
                    refdate: ISO2Date(date),
                    total: Total,
                    endTime: end,
                    initTime: start,
                    ticketId: ticket,
                    contact: contact,
                    taskid: task,
                    projid: projects,
                    description: description}
        } else if(window.appointment.ap_type == 1){ //edit
            data = {refdate: ISO2Date(date),
                    total: Total,
                    endTime: end,
                    initTime: start,
                    ticketId: ticket,
                    contact: contact,
                    taskid: task,
                    projid: projects,
                    description: description}
        }

        return data
    }    

    const canProceed = await checkvalues();
    if(!canProceed) return;

    const refdata = await makeData()     

    let jsonData
    if(window.appointment.ap_type == 0){
        jsonData = {
            tableid: "records",
            type: 'insert',                                                       
            data: refdata
        };        
    } else if(window.appointment.ap_type == 1){
        jsonData = {
            tableid: "records",
            type: 'update',                           
            query: { Recid: ref_recid },
            data: refdata
        };
        
    }
    fetch('http://localhost:3000/table_States', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    });

    clear_inputs();
}

async function fillWorkers() {
    const mainRow = document.getElementById('workers_history');
    mainRow.innerHTML = "";

    const response = await fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({tableid: 'users',query: {register_type: 'employee'}})   
    });

    const data = await response.json();
    let json = data.json;        

    const cards = await Promise.all(json.map(record => workers_format(record)));
    cards.forEach(card => mainRow.appendChild(card));    
}

async function selectworker(workerId){    
    const workername = await getuserName(workerId);

    document.getElementById('history_title').textContent = `Registros\n${workername}`;

    window.appointment.admin_view = 1
    window.appointment.workerid   = workerId
    
    document.querySelectorAll('.tab_btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab_content').forEach(tab => tab.classList.remove('active'));

    document.getElementById('ap_history').classList.add('active');
    document.getElementById('history_tab').classList.add('active');    

    fillhistory('',workerId)        
}

function filter_history(){
    const date = document.getElementById('filter_date').value;                      
    const ref_date = date != null && date != ''? ISO2Date(date) : null
    
    fillhistory(ref_date,window.appointment.workerid != '' ? window.appointment.workerid 
                                                           : window.currentUserData.user);
}

function edtitappointment(record){
    const save_button       = document.getElementById('save_record')
    save_button.textContent = 'atualizar';

    document.getElementById('new_ap_tab').textContent = "edição de Apontamento";
    document.getElementById('ap_title').textContent   = "edição de Apontamento";

    window.appointment.ap_type = 1

    function fillAPInfo(){
        document.querySelectorAll('.tab_btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab_content').forEach(tab => tab.classList.remove('active'));

        document.getElementById('new_ap_tab').classList.add('active');
        document.getElementById('new_entry_tab').classList.add('active');

        //valores
        document.getElementById("description").value      = record.description;
        document.getElementById("contact_input").value    = record.contact;
        document.getElementById("total_time").textContent = record.total;
        document.getElementById("start_time").value       = record.initTime;
        document.getElementById("end_time").value         = record.endTime;
        document.getElementById("execution_date").value   = Date2ISO(record.refdate);                                

        fillUtils(record.projid,record.taskid ,record.ticketId);
    }
    
    fillAPInfo();   
    
    save_button.onclick = () => { saveOrEdit(record.Recid) };
}

function deleteappointment(record){
    confirmModal(`Deseja realmente deletar este apontamento?`).then((confirmed) => {
        if (confirmed) {    
            const jsonData = {tableid: "records",type: 'delete',data: "", query: {Recid: record.Recid}}
            fetch('http://localhost:3000/table_States', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            });

            fillhistory();
        }
    })    
}

// Auxiliares
function fillUtils(ref_proj = "",ref_task = "",ref_ticket = ""){
    const projects = document.getElementById('project_input');
    const task     = document.getElementById('task_input');
    const ticket   = document.getElementById('ticket_input');        

    function basicOption(ref_select,text = ""){
        const nullOption       = document.createElement('option');
        nullOption.value       = 'null';
        nullOption.textContent = text;
        ref_select.appendChild(nullOption);
    }

    function newOption(ref_select,id,type,text = ''){
        const newOption       = document.createElement('option');
        newOption.value       = id;
        newOption.textContent = text != '' ? text : id;

        switch(type){
            case 'TK':
                if(id == ref_ticket){
                    newOption.selected = true;
                }
                break;
            case 'PJ':
                if(id == ref_proj){
                    newOption.selected = true;
                }
                break;
            case 'TS':
                if(id == ref_task){
                    newOption.selected = true;
                }
                break;
        }

        ref_select.appendChild(newOption);
    }

    function projfunctions(){
        projects.addEventListener('change', () => {            
            if(projects.value == 'null')
                task.disabled = true
            else{
                task.disabled = false                

                fetch('http://localhost:3000/find', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },   
                    body: JSON.stringify({tableid: 'projects_tasks', query: {projId: projects.value}})     
                })    
                .then(response => response.json())
                .then(data => {                    
                    const json = data.json 

                    task.innerHTML = ''
                    basicOption(task,'(obrigatorio)')

                    json.forEach(taskInfo => {
                        newOption(task,taskInfo.taskname,'TS');                        
                    });
                })
            }            
        })
    }

    projects.innerHTML = '';    
    ticket.innerHTML   = '';
    task.innerHTML     = '';

    basicOption(task,'(obrigatorio)')
    basicOption(projects)    
    basicOption(ticket,'(obrigatorio)')

    projfunctions()

    //tickets
    fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },   
        body: JSON.stringify({tableid: 'tickets'})     
    })    
    .then(response => response.json())
    .then(data => {
        const json = data.json 

        json.forEach(ticketInfo => {
            newOption(ticket,ticketInfo.ticketId,'TK');            
        });
    })

    //projetos e tarefas
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

        json.forEach(projs => {
            newOption(projects,projs.projId,'PJ');                           
        });

        if(projects.value != 'null')
            projects.dispatchEvent(new Event('change'));
    })
}

function clear_inputs(){
    document.getElementById("description").value      = "";    
    document.getElementById("contact_input").value    = "";  
    document.getElementById("total_time").textContent = "0:00";  
    document.getElementById("start_time").value       = "";
    document.getElementById("end_time").value         = "";
    document.getElementById("execution_date").value   = "";
    
    fillUtils()
    document.getElementById('project_input').dispatchEvent(new Event('change'));    
}

async function history_format(record, adminView = false) {
    const icon_id   = '<i class="fa-regular fa-id-card"></i>';
    const icon_task = '<i class="fa-regular fa-flag"></i>';
    const icon_proj = '<i class="fa-solid fa-diagram-project"></i>';

    const userName = await getuserName(record.userid);
    const projname = await getprojName(record.projId);

    const background_card     = document.createElement('div');
    background_card.refdate   = record.refdate
    background_card.className = 'background_card';
    background_card.innerHTML = `
        <div class="header_card_history">                
            <span style="color: gold;">${dateName(record.refdate)}</span>
            ${adminView ? "" : `<div style="display: flex; gap: 15px">
                                    <div class="edit_record"><i class="fa-solid fa-pen-ruler"></i></div>
                                    <div class="delete_record"><i class="fa-solid fa-trash"></i></div>
                                </div>`}
            
        </div>
    `

    if(!adminView){
        background_card.querySelector(".edit_record").addEventListener('click', () => edtitappointment(record));
        background_card.querySelector(".delete_record").addEventListener('click', () => deleteappointment(record));
    }

    const div = document.createElement('div');
    div.className = 'entry_card';

    div.innerHTML = `        
        <div class="entry_header">
            <div class="ap_basic_div">
                ${icon_id}<strong>${userName}</strong>
            </div>
            <div>
                <div class="entry_duration">${record.total}</div>
                <span class="entry_period">(${record.initTime} à ${record.endTime})</span>
            </div>
        </div>
        <div>                        
            <div class="ap_basic_div">
                ${icon_proj}<p><strong>${projname}</strong></p>
            </div>
            <div class="ap_basic_div">
                ${icon_task}<p>${record.taskid} · ${record.contact} · #${record.ticketId}</p>        
            </div>
        </div>     
        <p style="font-size: 1.3rem;margin-top: 5px;">${record.description}</p>
    `;

    background_card.appendChild(div);

    return background_card;
}

async function workers_format(worker) {
    const icon_id       = '<i class="fa-regular fa-id-card"></i>';    
    const icon_total    = '<i class="fa-solid fa-clock"></i>';
    const icon_function = '<i class="fa-solid fa-gear"></i>'

    const userName = await getuserName(worker.user);  
    
    function formated_date(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
    }

    const background_card     = document.createElement('div');    
    background_card.className = 'background_card';
    background_card.innerHTML = `
        <div class="header_card_history">                
            <span style="color: gold;">${icon_id}       ${userName}</span>
        </div>
    `    

    background_card.addEventListener('dblclick', () => {
        selectworker(worker.user);
    })

    const totaltime = await gettotaltime(worker.user)

    const today     = new Date();
    const priorDate = new Date();
    priorDate.setDate(today.getDate() - 30);

    const div = document.createElement('div');
    div.className = 'entry_card';
    div.innerHTML = `        
        <div class="entry_header">
            <div class="ap_basic_div">
                ${icon_total}<strong>horas totais</strong>
            </div>
            <div>
                <div class="entry_duration">${totaltime}</div>
                <span class="entry_period">(${formated_date(priorDate)} à ${formated_date(today)})</span>
            </div>
        </div>
        <div>                        
            <div class="ap_basic_div">
                ${icon_function}<p><strong>${worker.function}</strong></p>
            </div>
        </div>             
    `;    

    background_card.appendChild(div);

    return background_card;
}

async function gettotaltime(userid) {
    const today = new Date();
    const priorDate = new Date();
    priorDate.setDate(today.getDate() - 30);

    const response = await fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tableid: 'records',
            query: { userid }
        })
    });

    const data = await response.json();
    const records = data.json || [];

    let totalMinutes = 0;

    for (const record of records) {
        const refDateParts = record.refdate?.split('/');
        if (!refDateParts || refDateParts.length !== 3) continue;

        const [day, month, year] = refDateParts.map(Number);
        const refDate = new Date(year, month - 1, day);

        if (refDate < priorDate || refDate > today) continue;

        const totalStr = record.total;

        let minutes = 0;

        if (typeof totalStr === 'string') {
            // Caso "5h 0m"
            const match = totalStr.match(/(\d+)\s*h\s*(\d+)?\s*m?/i);
            if (match) {
                const hours = parseInt(match[1]) || 0;
                const mins = parseInt(match[2]) || 0;
                minutes = hours * 60 + mins;
            } else {
                // Caso "0,25" ou "0.25"
                const num = parseFloat(totalStr.replace(',', '.'));
                if (!isNaN(num)) {
                    minutes = num * 60;
                }
            }
        } else if (typeof totalStr === 'number') {
            minutes = totalStr * 60;
        }

        totalMinutes += minutes;
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);

    const hh = String(hours).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');

    return `${hh}:${mm}`;    
}