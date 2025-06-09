import { getuserName } from "../utils/HDL_Utils.js"

export function setAppointmentsFunctions(){
    document.querySelectorAll('.tab_btn').forEach(btn => {
        btn.addEventListener('click', () => {
        document.querySelectorAll('.tab_btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab_content').forEach(tab => tab.classList.remove('active'));
    
        btn.classList.add('active');
            const tabId = btn.dataset.tab;

            if(tabId == 'history_tab')
                fillhistory();            

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
}

async function fillhistory() {
    const mainRow = document.getElementById('main_history');
    mainRow.innerHTML = "";

    const response = await fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tableid: 'records', query: { userid: window.currentUserData.user } })
    });

    const data = await response.json();
    const json = data.json;

    console.log(json);

    const cards = await Promise.all(json.map(record => history_format(record)));
    cards.forEach(card => mainRow.appendChild(card));
}


// Auxiliares
function fillUtils(){
    const projects = document.getElementById('project_input');
    const task     = document.getElementById('task_input');
    const ticket   = document.getElementById('ticket_input');

    function basicOption(ref_select,text = ""){
        const nullOption       = document.createElement('option');
        nullOption.value       = 'null';
        nullOption.textContent = text;
        ref_select.appendChild(nullOption);
    }

    function newOption(ref_select,id,text = ''){
        const newOption       = document.createElement('option');
        newOption.value       = id;
        newOption.textContent = text != '' ? text : id;
        ref_select.appendChild(newOption);
    }

    function projfunctions(){
        projects.addEventListener('change', () => {
            task.innerHTML = ''
            basicOption(task,'(obrigatorio)')

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

                    json.forEach(taskInfo => {
                        newOption(task,taskInfo.taskname);
                    });
                })
            }            
        })
    }

    projects.innerHTML = '';    
    ticket.innerHTML   = '';
    task.innerHTML = ''

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
            newOption(ticket,ticketInfo.ticketId);
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
            newOption(projects,projs.projId);
        });
    })
}

async function history_format(record) {
    const icon_id   = '<i class="fa-regular fa-id-card"></i>';
    const icon_task = '<i class="fa-regular fa-flag"></i>';
    const icon_proj = '<i class="fa-solid fa-diagram-project"></i>';

    const userName = await getuserName(record.userId);

    const div = document.createElement('div');
    div.className = 'entry_card';

    div.innerHTML = `
        <div class="entry_header">
            <div style="display: flex; gap: 5px; align-items: center;">
                ${icon_id}<strong>${userName}</strong>
            </div>
            <div class="entry_duration">${record.total}</div>
        </div>
        <div style="display: flex; gap: 5px; align-items: center;">
            ${icon_proj}<p><strong>${record.projid}</strong></p>
        </div>
        <p>${icon_task} ${record.taskid} · <span>${record.contact}</span> · <span>#${record.ticketId}</span></p>
        <p>${record.description}</p>
    `;

    return div;
}
