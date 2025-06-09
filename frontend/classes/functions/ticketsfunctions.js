import { getuserName, create_window, today, getnextCode, getnextRecid, close_window } from '../utils/HDL_Utils.js'
import {newNotification, checknotifications} from './notificationsfunctions.js'
import {confirmModal, warningModal} from '../messages/modalLOG.js'


const Priority_Colors = Object.freeze({  
  '0': "rgb(3, 92, 181)",
  '1': "rgb(190, 166, 13)",
  '2': "rgb(181, 3, 3)"
});

const Priority_BKColors = Object.freeze({  
  '0': "rgb(182, 215, 249)",
  '1': "rgb(244, 236, 180)",
  '2': "rgb(253, 176, 176)"
});

const Priority_Names = Object.freeze({  
  '0': "Baixa",
  '1': "Media",
  '2': "Alta"
}); 

const status_Names = Object.freeze({  
  '0': "aberto",
  '1': "pendente",
  '2': "fechado"
});

const status_Icons = Object.freeze({
  '0': "fa-solid fa-lock-open",
  '1': "fa-solid fa-lock-open", 
  '2': "fa-solid fa-lock" 
})

export function setfunctions_TK(){
  const sidebar = document.getElementById('sidebar');
  const openBtn = document.getElementById('open_filter');  
  
  openBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    sidebar.classList.toggle('active');    
  });

  sidebar.addEventListener('mouseleave', () => {        
    if(sidebar.classList.contains('active')) 
      sidebar.classList.remove('active');
  })

  document.getElementById('ticket_module_container').addEventListener('click',(e) => { remove_filterbar(e)})
  document.getElementById('AP_TK').addEventListener('click', (e) => { remove_filterbar(e)})

  function remove_filterbar(e){
    if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && !openBtn.contains(e.target)) {
        sidebar.classList.remove('active');
      }   
  }

  document.getElementById('add_ticket').addEventListener('click',(newTicket));

  if(window.currentUserData.register_type == 'employee') {
    document.getElementById('Request_ticket').addEventListener('click',() => {
      fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },   
        body: JSON.stringify({tableid: 'tickets', query: {assigned_worker: 'blank'}})     
      })    
      .then(response => response.json())
      .then(data => {
        const json = data.json 
        
        const TK_Count = 0;

        json.forEach(ticket => {
          TK_Count++;          
        });

        if(TK_Count == 0)
          warningModal('nenhum ticket disponivel para alocação no momento')
        else{
          warningModal('Foi enviado uma notificação para o gestor');
          newNotification('solicitação de alocação de serviço', 'gestor1',1,'tickets') //ADM principal
        }        
      })
    })
  }
}

export function setFunctionsTK_Details(){
  tinymce.init({
    selector: '#my_editor',
    placeholder: 'Digite sua anotação aqui...',
    height: 300,
    menubar: false,
    plugins: 'lists link image table code help wordcount',
    toolbar: 'undo redo | bold italic underline | bullist numlist | link | code | help',
  });  

  document.getElementById('open_Properties').addEventListener('click', () => {   
    const propertiesBar = document.querySelector('.Properties_sidebar');
    
    if(!propertiesBar.classList.contains('active'))
      propertiesBar.classList.add('active');

    propertiesBar.addEventListener('mouseleave', () => {        
      if(propertiesBar.classList.contains('active')) 
        propertiesBar.classList.remove('active');
    })
  });

  document.getElementById('Back_TK_List').addEventListener('click', () => {
    const window_Details = document.getElementById('ticket_details');
    close_window(window_Details);

    window.TKType.ticketId   = '';
    window.TKType.TicketUser = '';
  });

  document.getElementById('Delete_TK').addEventListener('click', async () => {
    const confirmed = await confirmModal("Tem certeza que deseja excluir este ticket?");
    if (!confirmed) return;

    const ticketId = window.TKType.ticketId;    
    
    fetch('http://localhost:3000/table_states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableid: 'tickets_details', type: 'delete', query: {ticketId: ticketId}})
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {    
        warningModal('Erro ao excluir as anotações do ticket.');
      }
    });
    
    fetch('http://localhost:3000/table_states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableid: 'tickets', type: 'delete', query: {ticketId: ticketId}})
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        warningModal('Erro ao excluir o ticket.');                        
      }      
    });    
    
    close_window(document.getElementById('ticket_details'));
    fillTickets();

    newNotification(`o Ticket #${ticketId} foi excluido`, 'gestor1',0) //ADM principal

    checknotifications();
  })

  document.getElementById('Save_TK_Note').addEventListener('click', async () => {
    const ticketId = window.TKType.ticketId;
    const noteContent = tinymce.get('my_editor').getContent({ format: 'code' }).trim();

    if (noteContent === '') {
      warningModal('O campo de anotação não pode estar vazio.');
      return;
    }

    const noteData = {
      Recid: await getnextRecid('tickets_details'),
      ticketId: ticketId,
      createdBy: window.currentUserData.user,
      createdDate: today(),
      details: noteContent
    };    
    
    fetch('http://localhost:3000/table_states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableid: 'tickets_details', type: 'insert', data: noteData })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {        
        tinymce.get('my_editor').setContent('');
        fillTickets_Details(ticketId, {title: document.getElementById('ticket_title_view').textContent,
                                       createdBy: document.getElementById('reported_by').textContent,
                                       createdDate: document.getElementById('report_time').textContent,
                                       description: document.getElementById('ticket_description').textContent});
      } else {
        warningModal('Erro ao salvar a anotação.');
      }
    });   
    
    const JsonBodyData = {tableid: 'tickets',
                        type: 'update',
                        query:{ticketId: ticketId},
                        data: {updateDate: today(), }}        

    fetch('http://localhost:3000/table_states', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },        
    body: JSON.stringify(JsonBodyData)
    })
    .then(res => res.json())
    .then(data => {})

    newNotification(`Nova anotação no Ticket #${ticketId}`,
                    window.TKType.TicketUser,2,'tickets',ticketId)
  })    
}

export function fillTickets_Filters(){
  const workers_select  = document.getElementById('workers');   // funcionários
  const companys_select = document.getElementById('companys');  // empresas

  workers_select.innerHTML  = '';
  companys_select.innerHTML = '';

  const standartOptionWorkers       = document.createElement('option');
  standartOptionWorkers.value       = 'all';
  standartOptionWorkers.textContent = 'Todos(as)';
  workers_select.appendChild(standartOptionWorkers);

  const standartOptionCompanys       = document.createElement('option');
  standartOptionCompanys.value       = 'all';
  standartOptionCompanys.textContent = 'Todos(as)';
  companys_select.appendChild(standartOptionCompanys);

  fetch('http://localhost:3000/find', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },   
    body: JSON.stringify({tableid: 'users',query: {register_type: 'employee'}})     
  })    
  .then(response => response.json())
  .then(data => {
    const json = data.json 
    
    json.forEach(user => {
      const option       = document.createElement('option');
      option.value       = user.user;
      option.textContent = user.user_name;
      
      workers_select.appendChild(option);
    })    

    if(window.currentUserData.register_type == 'employee')
      workers_select.value = window.currentUserData.user;          
  })

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
      
      companys_select.appendChild(option);
    })        

    if(window.currentUserData.register_type == 'company'){
      companys_select.value    = window.currentUserData.companyId;   
      companys_select.disabled = true
    }
  })

  //Atribui as funções de filtragem nos campos
  document.getElementById('Filter_Input_TK').addEventListener('input', applyFilters);  
  document.getElementById('companys').addEventListener('change', applyFilters);
  document.getElementById('status_TK').addEventListener('change', applyFilters);
  document.getElementById('priority_TK').addEventListener('change', applyFilters);  

  workers_select.addEventListener('change', applyFilters);      

  if(workers_select.value != 'all' || companys_select.value != 'all')
    applyFilters();        
  
  document.getElementById('Clear_Filter').addEventListener('click', () => {
    document.getElementById('workers').value     = 'all';
    document.getElementById('companys').value    = 'all';
    document.getElementById('status_TK').value   = 'all';
    document.getElementById('priority_TK').value = 'all';
    
    const textInput = document.getElementById('Filter_Input_TK');
    textInput.value = '';

    applyFilters()
  })  
}

export function fillTickets(){
  document.getElementById('ticket_list').innerHTML = "";

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

    json.forEach(ticket => {
      createTicketRow(ticket);
    });
  })
}

export function fillTickets_Details(ticketId){ 
  document.getElementById('ticketHeader').innerHTML = `
    <div class="Properties_sidebar" id=""Properties_sidebar">
      <div class="TK_Properties">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap;">
          <h2 style="margin: 0;">Propriedades</h2>        
          <div class="buttons_tickets" id="save_Properties" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <h3>Salvar</h3>
            <i class="fa-solid fa-floppy-disk"></i>
          </div>        
        </div>     
        <div class="Property_Item">          
          <i class="fa-solid fa-ticket-simple"></i>
          <span class="Property_Label">Ticket:</span>          
          <span class="Property_Value" id="prop_ticket_id">${ticketId.ticketId}</span>
        </div>
        <div class="Property_Item">          
          <i class="fa-solid fa-user-tie"></i>
          <span class="Property_Label">Funcionário Alocado:</span>
          ${ticketId.assigned_worker != "" && ticketId.assigned_worker != 'blank' && ticketId.assigned_worker != null
                                           ? `<span class="Property_Value" id="Properties_worker">${ticketId.assigned_worker}</span>`
                                           : `<select id="Properties_worker" class="custom_select_v2"><option value'blank'></option></select>`}                            
        </div>
        <div class="Property_Item">        
          <i class="fa-solid fa-building"></i>  
          <span class="Property_Label">Empresa:</span>
          <span class="Property_Value" id="prop_company">${ticketId.ticket_company}</span>
        </div>
        <div class="Property_Item">     
          <i class="fa-solid fa-chart-simple"></i>     
          <span class="Property_Label">Status:</span>
          <select id="properties_Status" class="custom_select_v2">            
            ${parseInt(ticketId.ticket_status) == 0 ? `<option value="0">aberto</option>` : ''}
            <option value="1">pendente</option>
            <option value="2">fechado</option>
          </select>
        </div>
        <div class="Property_Item">  
          <i class="fa-solid fa-triangle-exclamation"></i>                  
          <span class="Property_Label">Prioridade:</span>
          <select id='properties_Priority' class="custom_select_v2">
            <option value="0">Baixa</option>
            <option value="1">Média</option>
            <option value="2">Alta</option>      
          </select>
        </div>
      </div>           
    </div>

    <h1 class="ticket_title_view" id="ticket_title_view">${ticketId.ticket_title} - #${ticketId.ticketId}</h1>  
    <div class="ticket_info_section">
      <h2>
        <strong id="reported_by">Criado por: ${ticketId.createdBy}</strong>
        <br>        
        <small id="report_time">Criado: ${ticketId.createdDate}</small>
      </h2>
      <h2>Descrição Relatada:</h2>
      <textarea id='DescriptionIn_TK' class="ticket_form_textarea" rows="4" placeholder="Descreva o problema ou serviço..."></textarea>          
    </div>`  
  
  SetCorrectValues('DescriptionIn_TK',ticketId.ticket_description);

  document.getElementById('properties_Priority').value = ticketId.ticket_priority;
  document.getElementById('properties_Status').value   = ticketId.ticket_status;

  document.getElementById('save_Properties').addEventListener('click', async () => {
    const PriorityId  = document.getElementById('properties_Priority').value;
    const WorkerId    = document.getElementById('Properties_worker').value;
    const StatusId    = document.getElementById('properties_Status').value;

    fetch('http://localhost:3000/table_states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },        
      body: JSON.stringify({tableid: 'tickets',
                            type: 'update',
                            query: {ticketId: ticketId.ticketId},
                            data:  {assigned_worker: WorkerId,
                                    ticket_status:   StatusId,
                                    ticket_priority: PriorityId,
                                    updateDate:      today(),
                                    ClosedDate:      StatusId == '2' ? today() : null}})
    })
    .then(res => res.json())
    .then(data => {
      if(data.success){
        fillTickets_Details(ticketId)
      }
    }) 
  });

  if(ticketId.assigned_worker == "" || ticketId.assigned_worker == 'blank' || ticketId.assigned_worker == null){
    const workerSelect = document.getElementById('Properties_worker')

    fetch('http://localhost:3000/find', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },   
      body: JSON.stringify({tableid: 'users',query: {register_type: 'employee'}})     
    })    
    .then(response => response.json())
    .then(data => {
      const json = data.json 
      
      json.forEach(user => {
        const option       = document.createElement('option');
        option.value       = user.user;
        option.textContent = user.user_name;
        
        workerSelect.appendChild(option);
      })    
    })
  }

  document.getElementById('MainDetails').innerHTML = "";
  
  fetch('http://localhost:3000/find', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },   
    body: JSON.stringify({tableid: 'tickets_details', query: {ticketId: ticketId.ticketId}})     
  })    
  .then(response => response.json())
  .then(data => {
    const json = data.json                 

    json.forEach(ticket => {            
      createNoteRow(ticket.createdBy,ticket.createdDate,ticket.details,ticket.Recid,
                   window.currentUserData.user == ticket.createdBy ? true : false);
    });
  })
}

export function canCloseNewTicket(){
  return new Promise(async (resolve) => {
    const title       = document.getElementById('Title_NewTK');
    const Description = tinymce.get('Description_NewTK').getContent({ format: 'code' }).trim()
    const WorkerId    = document.getElementById('refWoker_NewTK');
    const CompanyId   = document.getElementById('RefCompany_NewTK');
    const PriorityId  = document.getElementById('refPriority');
    const ticketId    = document.getElementById('NewTK_Id');                                  

    if (CompanyId.value == 'blank' || Description == '' || title.value.trim() == '') {
      resolve(false);
      return;
    }    
        
    const userCheck = await getUserRet(WorkerId.value.trim());    
    
    if (!userCheck) {
      window.TKType.type = 1
      resolve(false);
      return;
    }        

   const fulldata = {
          //Automaticos
          Recid: parseInt(ticketId.refRecid),
          ticketId: ticketId.value,
          createdBy: window.currentUserData.user,
          createdDate: today(),
          ticket_status: 0,
          //Pelo usuario
          ticket_title: title.value.trim(),
          ticket_description: Description,
          ticket_priority: parseInt(PriorityId.value),
          ticket_company: CompanyId.value,
          assigned_worker: WorkerId.value}    

    const JsonBodyData = {
              tableid: 'tickets',
              type: 'insert',
              data: fulldata}       

    try
    {
      fetch('http://localhost:3000/table_states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },        
        body: JSON.stringify(JsonBodyData)
      })
      .then(res => res.json())
      .then(data => {}) 

      resolve(true)
    }
    catch(Error){
      warningModal('erro durante salvamento do Arquivo<br>Tente novamente por favor')
      resolve(false)      
    }

    const NotificationLevel = PriorityId.value == '2'
                            ? '3' //alta
                            : PriorityId.value == '1'
                            ? '2' //media 
                            : '1'; //baixa

    newNotification(`Novo Ticket #${ticketId.value} criado`,
                    WorkerId.value != 'blank' || WorkerId.value != null ? WorkerId.value : 'gestor1',// ADM principal
                    NotificationLevel,'tickets',ticketId.value)

    checknotifications();

    resolve(true);
  })
}

async function newTicket(){
  create_window('NewTicket','Criação de Chamado/Ticket',newTicket_html,'');      

  document.getElementById('NewTK_Id').value        = `${await getnextCode('TK')}`;
  document.getElementById('NewTK_Id').refRecid     = `${await getnextRecid('tickets')}`
  document.getElementById('NewTK_Date').value      = `${today()}`;
  document.getElementById('NewTK_CreatedBy').value = `${window.currentUserData.user_name}`;

  tinymce.init({
    selector: '#Description_NewTK',
    placeholder: 'Digite sua situação aqui...',
    height: 200,
    menubar: false,
    plugins: 'lists link image table code help wordcount',
    toolbar: 'undo redo | bold italic underline | bullist numlist | link | code | help',
  });

  fetch('http://localhost:3000/find', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },   
    body: JSON.stringify({tableid: 'users',query: {register_type: 'employee'}})     
  })    
  .then(response => response.json())
  .then(data => {
    const json    = data.json 
    const workers = document.getElementById('refWoker_NewTK')
    
    json.forEach(user => {
      const option       = document.createElement('option');
      option.value       = user.user;
      option.textContent = user.user_name;
      
      workers.appendChild(option);
    })    
  })

  fetch('http://localhost:3000/find', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },   
    body: JSON.stringify({tableid: 'company'})     
  })    
  .then(response => response.json())
  .then(data => {
    const json    = data.json 
    const company = document.getElementById('RefCompany_NewTK')
    
    json.forEach(user => {
      const option       = document.createElement('option');
      option.value       = user.companyId;
      option.textContent = user.companyId;
      
      company.appendChild(option);
    })    
  })
}

async function createTicketRow(ticket) {
  const ticketRow         = document.createElement('div');
  ticketRow.className     = 'ticket_row';
  ticketRow.style.opacity = ticket.ticket_status == '2' ? '0.35' : '1'

  const name = await getuserName(ticket.createdBy)

  ticketRow.addEventListener('click', () => {
    create_window('ticket_details', `Detalhes do Ticket #${ticket.ticketId}`, TicketsDetais_html, ''); 
    window.TKType.ticketId   = ticket.ticketId;  
    window.TKType.TicketUser = ticket.createdBy; 
    
    fillTickets_Details(ticket);
  });

  const ticketItem        = document.createElement('div');
  ticketItem.className    = 'ticket_item';
  ticketItem.id           = 'ticket';
  
  const titleDiv          = document.createElement('div');
  titleDiv.className      = 'ticket_title';
  titleDiv.id             = `title_${ticket.ticketId}`;
  titleDiv.textContent    = `${ticket.ticket_title} - #${ticket.ticketId}`;
  
  const metaDiv           = document.createElement('div');
  metaDiv.className       = 'ticket_meta';

  const userSpan          = document.createElement('span');  
  userSpan.className      = 'ticket_user';
  userSpan.id             = `user_${ticket.ticketId}`;  
  userSpan.textContent    = name;    

  const separator         = document.createTextNode(' • ');

  const timeSpan          = document.createElement('span');
  timeSpan.className      = 'ticket_time';
  timeSpan.id             = `time_${ticket.ticketId}`;
  timeSpan.textContent    = ticket.ClosedDate != null
                          ? `Fechado ${ticket.ClosedDate}`
                          : ticket.updateDate != null 
                          ? `atualizado ${ticket.updateDate}` 
                          : `Criado ${ticket.createdDate}`;

  metaDiv.appendChild(userSpan);
  metaDiv.appendChild(separator);
  metaDiv.appendChild(timeSpan);
  
  const propsDiv     = document.createElement('div');
  propsDiv.className = 'ticket_props';

  const prioritySpan                 = document.createElement('span');
  prioritySpan.className             = `priority_tag`;  
  prioritySpan.id                    = `priority_${ticket.ticketId}`;
  prioritySpan.PriorityId            = ticket.ticket_priority;
  prioritySpan.style.backgroundColor = Priority_BKColors[ticket.ticket_priority];
  prioritySpan.style.color           = Priority_Colors[ticket.ticket_priority];
  prioritySpan.textContent           = Priority_Names[ticket.ticket_priority];

  const groupSpan       = document.createElement('span');
  groupSpan.className   = 'group_info';
  groupSpan.id          = `group_${ticket.ticketId}`;  
  groupSpan.refCompany  = ticket.ticket_company;  
  groupSpan.refWorker   = ticket.assigned_worker;
  groupSpan.textContent = `${ticket.ticket_company} / ${await getuserName(ticket.assigned_worker)}`;  

  const statusIcon = document.createElement('i');
  statusIcon.className = status_Icons[ticket.ticket_status];
  statusIcon.style.color = '#000';
  statusIcon.style.marginLeft = '5px';

  const statusSpan = document.createElement('span');
  statusSpan.className = 'status';
  statusSpan.statusId  = ticket.ticket_status
  statusSpan.id = `status_label_${ticket.ticketId}`;
  statusSpan.textContent = status_Names[ticket.ticket_status];

  const statusWrapper = document.createElement('div');
  statusWrapper.className = 'status_wrapper';
  
  statusWrapper.appendChild(statusSpan);  
  statusWrapper.appendChild(statusIcon);

  propsDiv.appendChild(prioritySpan);
  propsDiv.appendChild(groupSpan);  
  propsDiv.appendChild(statusWrapper);
  
  ticketItem.appendChild(titleDiv);
  ticketItem.appendChild(metaDiv);
  ticketItem.appendChild(propsDiv);
  
  ticketRow.appendChild(ticketItem);
  
  document.getElementById('ticket_list').appendChild(ticketRow);
}

async function createNoteRow(author, time, content, Id, by_user) {  
  const main = document.getElementById('MainDetails');    

  const ticketItem = document.createElement('div');
  ticketItem.className = 'add_note_section';
  ticketItem.id = 'history_Notes';
  ticketItem.refRecid = Id;

  main.appendChild(ticketItem);

  const noteWrapper = document.createElement('div');
  noteWrapper.id = Id;
  noteWrapper.className = 'ticket_note_history';

  noteWrapper.innerHTML = `
    <div class="note_text">
      <div style="display: ${by_user ? 'flex' : 'none'}; justify-content: flex-end;">
        <div class="buttons_tickets details" id="Edit_note_${Id}">
          <i class="fa-solid fa-pen"></i>
          <span>Editar</span>
        </div>
        <div class="buttons_tickets details" id="Delete_note_${Id}">
          <i class="fa-solid fa-trash"></i>
          <span>Excluir</span>
        </div>
      </div>
      <div class="note_icon">${author.charAt(0).toUpperCase()}</div>
      <p>
        <strong>${await getuserName(author)}</strong> fez uma anotação<br>
        <small>Feito no dia: ${time}</small>
      </p>
      <textarea id="note_${Id}" readonly></textarea>
      <div class="note_editor">
        <div id="editorFunctions_${Id}" style="display: none; justify-content: flex-end;">
          <div class="buttons_tickets details Edit" id="Cancel_Note_${Id}">
            <i class="fa-solid fa-ban"></i>
            <span>Cancelar</span>
          </div>
          <div class="buttons_tickets details Edit" id="Save_Note_${Id}">
            <i class="fa-solid fa-floppy-disk"></i>
            <span>Salvar</span>
          </div>
        </div>
      </div>
    </div>
  `;  

  ticketItem.appendChild(noteWrapper);

  SetCorrectValues(`note_${Id}`, content);
  
  const editBtn = noteWrapper.querySelector(`#Edit_note_${Id}`);
  const deleteBtn = noteWrapper.querySelector(`#Delete_note_${Id}`);
  const cancelBtn = noteWrapper.querySelector(`#Cancel_Note_${Id}`);
  const saveBtn = noteWrapper.querySelector(`#Save_Note_${Id}`);
  const editorFunctions = noteWrapper.querySelector(`#editorFunctions_${Id}`);

  function toggleEditor(show) {
    editorFunctions.style.display = show ? 'flex' : 'none';
  }

  editBtn?.addEventListener('click', () => {    
    const editor = tinymce.get(`note_${Id}`);
    editor.readonly = false;
    editor.getContainer().querySelector('.tox-toolbar__primary').style.display = 'flex';

    if (!editor) {
      tinymce.init({
        selector: `#note_${Id}`,        
        height: 300,
        menubar: false,
        plugins: 'lists link image table code help wordcount',
        toolbar: 'undo redo | bold italic underline | bullist numlist | link | code | help',
      });
    }

    toggleEditor(true);
  });

  cancelBtn?.addEventListener('click', () => {
    const editor = tinymce.get(`note_${Id}`) 
    editor.getContainer().querySelector('.tox-toolbar__primary').style.display = 'none';   

    editor.setContent(content);
    editor.readonly = true;
    toggleEditor(false);
  })

  saveBtn?.addEventListener('click', async () => {
    const editor = tinymce.get(`note_${Id}`);
    let newContent = editor.value;

    if (editor) {
      newContent = editor.getContent({ format: 'text' });      
    }

    editor.getContainer().querySelector('.tox-toolbar__primary').style.display = 'none';

    editor.setContent(newContent);
    editor.readOnly = true;
    toggleEditor(false);

    const JsonBodyData = {tableid: 'tickets_details',
                        type: 'update',
                        query:{Recid: Id},
                        data: {details: editor.getContent({ format: 'code' })}}        

    fetch('http://localhost:3000/table_states', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },        
    body: JSON.stringify(JsonBodyData)
    })
    .then(res => res.json())
    .then(data => {})
  });

  deleteBtn?.addEventListener('click', async () => {
    const confirmed = await confirmModal('Tem certeza que deseja excluir esta nota do ticket?');
    if (!confirmed) return;

    const res = await fetch('http://localhost:3000/table_states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableid: 'tickets_details', type: 'delete', query: { Recid: Id } })
    });

    const data = await res.json();
    if (data.success) {
      ticketItem.remove();
    } else {
      warningModal('Erro ao excluir a anotação.');
    }
  });
}

async function Checkuser(value) {
  if (value == 'blank' || value == null) {
    const confirmed = await confirmModal("Não foi atribuído um funcionário referente.<br>Deseja prosseguir?");
    return confirmed;
  } else {
    return true;
  }
}

async function getUserRet(value) {
  return await Checkuser(value);
}

function applyFilters() {
  const filterText   = document.getElementById('Filter_Input_TK').value.toLowerCase();
  const refWorker    = document.getElementById('workers').value;
  const refCompany   = document.getElementById('companys').value;
  const refStatus    = document.getElementById('status_TK').value;
  const refPriority  = document.getElementById('priority_TK').value;

  const tickets = document.querySelectorAll('.ticket_row');

  tickets.forEach(ticket => {
    const title       = ticket.querySelector('.ticket_title').textContent.toLowerCase();
    const group_info  = ticket.querySelector('.group_info');
    const status      = ticket.querySelector('.status');
    const priorityTag = ticket.querySelector('.priority_tag');

    const matchesText      = title.includes(filterText);
    const matchesWorker    = (refWorker === 'all'   || group_info.refWorker == refWorker);
    const matchesCompany   = (refCompany === 'all'  || group_info.refCompany == refCompany);
    const matchesStatus    = (refStatus === 'all'   || status.statusId == refStatus);
    const matchesPriority  = (refPriority === 'all' || priorityTag.PriorityId == refPriority);

    const isVisible = matchesText && matchesWorker && matchesCompany && matchesStatus && matchesPriority;

    ticket.style.display = isVisible ? '' : 'none';
  });
}

function SetCorrectValues(RefId, Html_Content) {  
  tinymce.init({
    selector: `#${RefId}`,  
    readonly: true,      
    height: 300,
    menubar: false,
    plugins: 'lists link image table code help wordcount',
    toolbar: 'undo redo | bold italic underline | bullist numlist | link | code | help',      
    setup: function (editor) {;            
      editor.on('init', function () {        
        editor.setContent(`${Html_Content}`)                             
        editor.getContainer().querySelector('.tox-toolbar__primary').style.display = 'none'
      });
    }
  });    
}