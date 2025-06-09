export function setAppointmentsFunctions(){
    document.querySelectorAll('.tab_btn').forEach(btn => {
        btn.addEventListener('click', () => {
        document.querySelectorAll('.tab_btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab_content').forEach(tab => tab.classList.remove('active'));
    
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
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
        
                if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return;
        
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

function fillhistory(){

}

// Auxiliares
function fillUtils(){
    const projects = document.getElementById('project_input');
    const task     = document.getElementById('task_input');
    const ticket   = document.getElementById('ticket_input');

    function basicOption(ref_select){
        const nullOption       = document.createElement('option');
        nullOption.value       = 'null';
        nullOption.textContent = '';
        ref_select.appendChild(nullOption);
    }

    function newOption(ref_select,id,text = ''){
        const newOption       = document.createElement('option');
        newOption.value       = id;
        newOption.textContent = text != '' ? text : id;
        ref_select.appendChild(newOption);
    }

    projects.innerHTML = '';
    task.innerHTML = '';
    ticket.innerHTML = '';

    basicOption(projects)
    basicOption(task)
    basicOption(ticket)

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
}