import { today, close_window } from "../utils/HDL_Utils.js";

let intervalId = null

const Status = Object.freeze({
    0: 'fa-solid fa-comment',
    1: 'fa-solid fa-circle-exclamation',
    2: 'fa-solid fa-triangle-exclamation',
    3: 'fa-solid fa-skull-crossbones'
});

const Status_Colors = Object.freeze({
    0: "rgb(255, 255, 255)",
    1: "rgb(3, 92, 181)",
    2: "rgb(190, 166, 13)",
    3: "rgb(181, 3, 3)"
});

function defaultForms(_FormId){
    let button;

    switch(_FormId)
    {
        case 'tickets':
            button = document.getElementById('TK')            
            break;
        case 'user_list':                       
            button = document.getElementById('US')
            break;
        case 'records':
            button = document.getElementById('AP')
            break;   
    }

    button.click()
}

export function fillusernotifications(){
    const parms = {tableid: 'notifications',query: {toUsers: window.currentUserData.user,read: 0}}
    fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },   
        body: JSON.stringify(parms)   
    })
    .then(res => res.json())
    .then(data => {
        const json = data.json;

        const body = document.getElementById('NF_Functions');
        const rows = body.querySelectorAll('.user_grid_row_NF');
        rows.forEach(row => row.remove());

        function addNotification(date, message,From, code,path,id,fulldata) {                          
            const row = document.createElement('div');
            row.className = `user_grid_row_NF`;
            row.refid     = id;
            row.fulldata  = fulldata;
            row.addEventListener("click", (e) => {
                const refPath = JSON.parse(path)

                e.preventDefault()  
                
                console.log(refPath);                                            
                                
                const refForm   = refPath.form
                const reference = refPath.reference                                
                
                const ref_window = document.getElementById(refForm)                
                if(ref_window != null){
                    close_window(ref_window);
                }                

                defaultForms(refForm);
            })
            row.addEventListener("dblclick", (e) => {
                e.preventDefault();
                
                row.classList.add('removeline-animation');

                setTimeout(() => {
                    row.remove(); 
                    clearNotifications(row)                    
                }, 1100);
            })                
          
            const icon = document.createElement('div');
            icon.innerHTML = `<i class="fas ${Status[code]}" style="color: ${Status_Colors[code]}"></i>`;
          
            const dateDiv = document.createElement('div');
            dateDiv.textContent = date;
            
            const CreatorDiv = document.createElement('div');
            const parms = {tableid: 'users',query: {user: From}}
            fetch('http://localhost:3000/find', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },   
                body: JSON.stringify(parms)   
            })
            .then(res => res.json())
            .then(data => {                                
                const name = data.json[0].user_name;
                
                CreatorDiv.textContent = name ? name : From;
            })
            
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message;
          
            row.appendChild(icon);
            row.appendChild(dateDiv);
            row.appendChild(CreatorDiv)
            row.appendChild(messageDiv);
          
            document.getElementById('NF_Functions').appendChild(row);

            makeRowDraggable(row);
        }                        

        json.forEach(NF_Log => {             
            const completedata = {NF_Date: NF_Log.NF_Date,Recid: NF_Log.Recid,level: NF_Log.level,msg: NF_Log.msg,
                                  fromuser: NF_Log.fromuser,toUsers: NF_Log.toUsers,read: 1,refFilter: NF_Log.refFilter} 
            addNotification(NF_Log.NF_Date, NF_Log.msg,NF_Log.fromuser, NF_Log.level,NF_Log.refFilter,NF_Log.Recid,completedata);
        });                
    });
}

export function clearNotifications(Recids){       
    const JsonBodyData = {tableid: 'notifications',
                          type: 'update',
                          data: Recids.fulldata,
                          query: {Recid: Recids.refid}}
             
    console.log(JsonBodyData);
    

    fetch('http://localhost:3000/table_States', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(JsonBodyData)
    })    

    checknotifications()
}

export function checknotifications(refuser = null){
    const NF_Button = document.getElementById("NF")    
    let   warningLevel = 0; 

    if (intervalId != null) {
        clearInterval(intervalId);
    }

    const parms = {tableid: 'notifications',
                   query: refuser != null ? {refuser,read: 0} 
                                          : {toUsers: window.currentUserData.user,read: 0}}

    fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parms)
    })
    .then(res => res.json())
    .then(data => {
        const json = data.json;             

        json.forEach(LOG => {                      
            warningLevel = (LOG.level > warningLevel) ? LOG.level : warningLevel            
        });                      

        switch(warningLevel)
        {
            case 0:
                NF_Button.style.color = Status_Colors[0];
                NF_Button.classList.remove("pulsando");

                toggleMenuNotification(false);
                break;
            case 1:
                NF_Button.style.color = Status_Colors[1];
                NF_Button.classList.add("pulsando");

                toggleMenuNotification(true);
                break;
            case 2:                
                NF_Button.style.color = Status_Colors[2];
                NF_Button.classList.add("pulsando");

                toggleMenuNotification(true)
                break;
            case 3:
                NF_Button.style.color = Status_Colors[3];
                NF_Button.classList.add("pulsando");

                toggleMenuNotification(true)
                break;
        }
    });
    
    intervalId = setInterval(checknotifications, 60000);
}

export function toggleMenuNotification(show) {
    const dot = document.getElementById('menu_notification_dot');
    if (!dot) return;
    dot.style.display = show ? 'block' : 'none';
    dot.style.backgroundColor = document.getElementById("NF").style.color;

    if(show)
        dot.classList.add("pulsando"); 
    else
        dot.classList.remove("pulsando"); 
}

export function newNotification(_msg,_to,_level,form = "",reference = ""){
    fetch('http://localhost:3000/get_nextRecid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },        
        body: JSON.stringify({tableid: 'notifications'})
    })
    .then(res => res.json())
    .then(data => {   
        
        const fulldata = {Recid: data.nextRecid,
                          read: 0,
                          fromuser: window.currentUserData.user,
                          msg: _msg, level: _level, toUsers: _to,
                          NF_Date: today(),
                          refFilter: `{'form:' ${form},'reference': ${reference}}`}                    
        const JsonBodyData = {tableid: 'notifications',
                              type: 'insert',
                              data: fulldata}

        console.log(fulldata);
        console.log(JsonBodyData);        

        fetch('http://localhost:3000/table_states', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },        
            body: JSON.stringify(JsonBodyData)
        })
        .then(res => res.json())
        .then(data => {})                  
    }) 
}

function makeRowDraggable(rowElement) {
    let isDragging = false;
    let startX;
    let currentX = 0;

    rowElement.style.transition = 'transform 0.3s';

    rowElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - currentX;
        rowElement.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentX = e.clientX - startX;
        rowElement.style.transform = `translateX(${currentX}px)`;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;

        const limit = 150; 

        if (Math.abs(currentX) > limit) {
            rowElement.style.transition = 'transform 0.3s, opacity 0.3s';
            rowElement.style.transform = `translateX(${currentX > 0 ? 500 : -500}px)`;
            rowElement.style.opacity = '0';

            setTimeout(() => {
                rowElement.remove();  
                clearNotifications(rowElement)                 
            }, 300);
        } else {
            rowElement.style.transition = 'transform 0.3s';
            rowElement.style.transform = 'translateX(0)';
            currentX = 0;
        }
    });
}
