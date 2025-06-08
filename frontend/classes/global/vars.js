window.currentUserData = {
  user: 'gestor1',
  user_name: 'gerente 1',
  acess_key: 12345,
  email: 'Heindall@email.com.br',
  contact_phone: '(41)0000-0000',
  register_type: 'employee', //'company', //'employee'
  function: "gestor",
  companyId: '', //'empresa teste 1'
  user_description: 'teste de descrição'
}

window.edituserdata = {
}

window.openType = {
  type: 0
}

window.TKType = {
  type: 0,
  TicketId: '', 
  TicketUser:'' 
}

const apontamentos_html = `
<selection id="appointment_selections" class="appointment_selections"> 
  <div class="time_entry_grid">
      <h2 class = "main_title">Lançar Apontamento</h2>
      <form id="time_entry_form">
          <textarea id="description" placeholder="O que você está fazendo?"></textarea>
          <input id="project_input" type="text" placeholder="Projeto (obrigatório)" required>
          <input id="task_input" type="text" placeholder="Tarefa">
          <input id="contact_input" type="text" placeholder="Contato (obrigatório)" required>
          <input id="ticket_input" type="text" placeholder="Chamado (obrigatório)" required>

          <div class="time_controls">
          <div>
              <label>Total</label>
              <div id="total_time">0:00</div>
          </div>
          <div>
              <label>Início</label>
              <input type="time" id="start_time">
          </div>
          <div>
              <label>Fim</label>
              <input type="time" id="end_time">
          </div>
          <input type="date" id="date_picker">
          </div>

          <button type="button" id="start_timer_btn">ENVIAR</button>
      </form>
  </div>
  <div class="saved_entries_grid">
      <h3 class = "main_title">Registros Recentes</h3>
      <div class="entry_card">
          <div class="entry_header">
              <strong>Fulano da Silva</strong>
              <div class="entry_duration">2h 30m</div>
          </div>
          <p><strong>Projeto X</strong> (Cliente Y)</p>
          <p>🛠 Desenvolvimento · <span>Contato Z</span> · <span>00099</span></p>
          <p>Refatoração do módulo principal</p>
          <small>Criado há 10 minutos</small>
      </div>
      <div class="entry_card">
          <div class="entry_header">
              <strong>Fulano da Silva</strong>
              <div class="entry_duration">1h 15m</div>
          </div>
          <p><strong>Projeto Z</strong> (Cliente K)</p>
          <p>🧰 Suporte · <span>Contato J</span> · <span>00042</span></p>
          <p>Correção de bugs relatados</p>
          <small>Editado há 25 minutos</small>
      </div>
  </div>
</selection>
`;

const perfil_window_html = `
<div class="form_container">
  <div class="left_column">
    <div class="profile_image">
      <div class="user_icon"><i class="fa-solid fa-circle-user"></i></div>
    </div>  
    <select class="role_selector" id="user_role">
      <option value="employee">Funcionário</option>
      <option value="company">Cliente</option>
    </select>
    <div id="PF_Function" class="profile_function" style="display: none;">
      <p class="profile_label">Função</p>
      <select class="role_selector" id="function">
        <option value="gestor">Gestor</option>
        <option value="Desenvolvedor">Desenvolvedor</option>
        <option value="Tecnico">Tecnico</option>      
      </select>
    </div>
    <div id="PF_Companys" class="profile_function" style="display: none;">
      <p class="profile_label">empresa alocada</p>
      <select class="role_selector" id="select_Company"></select>
    </div>
    <p class="profile_label">descrição</p>
    <div class="service_wrapper">
      <textarea class="service_type" id="description" placeholder="Descrição / Observações"></textarea>
    </div>
  </div>
  <div class="right_column">
    <p class="profile_label">Id do Usuario</p>
    <input type="text" id="user_id" class="form_input" placeholder="userId" readonly>
    <p class="profile_label">Senha</p>
    <input type="text" id="password" class="form_input" placeholder="password">
    <p class="profile_label">nome</p>
    <input type="text" id="user_name" class="form_input" placeholder="Nome">
    <p class="profile_label">email</p>
    <input type="email" id="user_email" class="form_input" placeholder="Email">
    <p class="profile_label">Telefone</p>    
    <div class="profile_footer">
      <input type="tel" id="user_phone" class="form_input small" placeholder="Telefone">
    </div>
  </div>
</div>
`;

const user_list_html = `
  <div class="user_grid_container">
    <h2 class="section_title">Lista de Usuários</h2>    
    <div class="filter_body">
      <span>Filtro:</span>
      <select class="Filter_Input" id="Filter_Type_US">
        <option value="id">ID</option>
        <option value="name">Nome</option>
      </select>
      <input id="Filter_Input_US" class="Filter_Input" type="text" placeholder="Digite para filtrar..." autocomplete="off" required>
      <i id="search_ico_US" class="fa-solid fa-magnifying-glass"></i>
    </div>
    <div class="action_pane_users">
        <button class="user_grid_button" id="add_user_btn">
            <i class="fas fa-user-plus"></i>
            <span>Novo Usuário</span>
        </button>
        <button class="user_grid_button" id="remove_user_btn">
            <i class="fas fa-user-minus"></i>
            <span>Remover Usuário</span>
        </button>
    </div>
    <div class="user_grid_header">
        <div></div>
        <div>ID</div>
        <div>Nome</div>
    </div>
    <div id="US_body" class="user_grid_body">      
    </div>
  </div>
`;

const config_html = `
  <div class="tabs_container">
    <div class="tabs_sidebar">
      <div class="tab_button active" data-tab="geral">
        <i class="fa-solid fa-gears"></i>
        <span>Geral</span>
      </div>
      <div class="tab_button" data-tab="Sequence">
        <i class="fa-solid fa-list-ol"></i>
        <span>Sequencias Numericas</span>
      </div>
    </div>
    <div class="tabs_content">
      <div class="tab_panel active" id="geral">
        <h2 class="section_title">Parâmetros Gerais</h2>
        <div class="companys">
          <span class="sequence_title">Cadastro de empresas</span>
          <div class="action_pane_company">
            <button class="company_button" id="add_company_btn">
              <i class="fa-solid fa-person-circle-plus"></i>
              <span>Nova empresa</span>
            </button>
            <button class="company_button" id="remove_company_btn">
              <i class="fa-solid fa-person-circle-minus"></i>
              <span>Remover empresa</span>
            </button>
          </div>
          <div class="group_company">
            <div class="Company_header">    
              <div></div>          
              <div>Empresa</div>
              <div>Usuario principal</div>
            </div>
            <div id="company_rows" class="Company_rows"></div>
          </div>
        </div>        
      </div>
      <div class="tab_panel" id="Sequence">
        <h2 class="section_title">Parâmetros de Sequencia Numerica</h2>
        <div class="sequence_container">
          <span class="sequence_title">Sequência de Usuários</span>
          <div class="sequence_item">
            <input type="text" id="usercode" class="sequence_input id" placeholder="Código">
            <input type="text" id="usercount" class="sequence_input digit_count" placeholder="Quantidade de dígitos" min="1" max="6">
          </div>
          <span class="sequence_title">Próximo ID de Usuário</span>
          <div class="sequence_item">
            <input id='nextuser' type="text" class="sequence_input nextid" placeholder="Próximo código" readonly>
          </div>
        </div>
        <div class="sequence_container">
          <span class="sequence_title">Sequência de Tickets/Chamados</span>
          <div class="sequence_item">
            <input type="text"  id="ticketcode" class="sequence_input id" placeholder="Código">
            <input type="text" id="ticketcount" class="sequence_input digit_count" placeholder="Quantidade de dígitos" min="1" max="6">
          </div>        
          <span class="sequence_title">Próximo ID de Tickets/Chamados</span>
          <div class="sequence_item">
            <input id='nextticket' type="text" class="sequence_input nextid" placeholder="Próximo código" readonly>
          </div>
        </div>    
      </div>      
    </div>
  </div>
`;

const notification_html = `
<div class="user_grid_container">
  <h2 class="section_title">Notificações</h2>

  <div class="action_pane_users">
    <button id="clear_all" class="user_grid_button">
      <i class="fas fa-bell-slash"></i>
      <span>Marcar todas como lidas</span>
    </button>
  </div>

  <div id="NF_Functions" class="user_grid_body">
    <div class="user_grid_header_NF">
      <div></div>
      <div>Data</div>
      <div>por</div>
      <div>Mensagem</div>
    </div>    
    
  </div>
</div>
`

// Tickets
const newTicket_html = `
<div class="ticket_form_container">
  <h2 class="ticket_form_title">Criar Novo Ticket</h2>
  <div class="ticket_form_group">
    <label>Título</label>
    <input id='Title_NewTK' type="text" class="ticket_form_input" placeholder="Digite o título do ticket" autocomplete='off'>
  </div>
  <div class="ticket_form_group">
    <label>Descrição</label>
    <textarea id='Description_NewTK' class="ticket_form_textarea" rows="4" placeholder="Descreva o problema ou serviço..."></textarea>
  </div>
  <div class='Ticket_Auto_Info'>
    <div class="ticket_form_group">
      <label>ID do Ticket</label>
      <input id='NewTK_Id' type="text" class="ticket_form_input" disabled readonly value="">
    </div>

    <div class="ticket_form_row">
      <div class="ticket_form_group">
        <label>Data de Criação</label>
        <input id='NewTK_Date' type="text" class="ticket_form_input" disabled readonly value="">
      </div>

      <div class="ticket_form_group">
        <label>Criado Por</label>
        <input id='NewTK_CreatedBy' type="text" class="ticket_form_input" disabled readonly value="">
      </div>
    </div>
  </div>    
  <div class="ticket_form_row">
    <div class="ticket_form_group">
      <label>Empresa Referente</label>
      <select id='RefCompany_NewTK' class="ticket_form_select">
        <option value='blank'></option>
      </select>
    </div>
    <div class="ticket_form_group">
      <label>Funcionário Referente</label>
      <select id='refWoker_NewTK' class="ticket_form_select">
      <option value='blank'></option>    
      </select>
    </div>
    <div class="ticket_form_group">
      <label>Prioridade</label>
      <select id='refPriority' class="ticket_form_select">
        <option value="0">Baixa</option>
        <option value="1">Média</option>
        <option value="2">Alta</option>      
      </select>
    </div>
  </div>  
</div>
`

const ticketHTML = `
<div id="AP_TK" class="action_pane_tickets">
  <div class="AP_NewDelete">
    <div class="buttons_tickets add_ticketMain" id="add_ticket">
      <i class="fa-solid fa-file-circle-plus"></i>
      <span class="add_ticket">novo ticket</span>
    </div>     
    ${window.currentUserData.register_type == 'employee' 
    ? `<div class="buttons_tickets add_ticketMain" id="Request_ticket">
        <i class="fa-solid fa-hand"></i>
        <span class="Request_ticket">Requisitar serviço</span>
      </div>`
    : "" 
    }
  </div>
  <div class="buttons_tickets" id="open_filter">
    <i class="fa-solid fa-filter"></i>
    <span>Filtros</span>
  </div> 
</div>

<div id="ticket_module_container" class="ticket_module_container">  
  <div class="main_sidebar" id="sidebar">
    <div class="Filter_sidebar">
      <div style="display: flex; justify-content: flex-end;">
        <div class="Clear_button" id="Clear_Filter">
          <i class="fa-solid fa-xmark"></i>
          <span>Limpar Filtro</span>
        </div>
      </div>
      <div class="Sidebar_Filters" id="search_ticket">
        <div class="filter_title">Buscar Ticket:</div>
        <div class="input_group">
          <i id="search_ico_TK" class="fa-solid fa-magnifying-glass"></i>
          <input id="Filter_Input_TK" class="Filter_Input" type="text" placeholder="Digite para filtrar..." autocomplete="off">
        </div>
      </div>
      <div class="Sidebar_Filters" id="workers_ticket">
        <div class="filter_title">funcionario alocado:</div>
        <div class="input_group">
          <i id="workers_ico_TK" class="fa-solid fa-user-tie"></i>
          <select id="workers" class="custom_select">              
          </select>          
        </div>
      </div>
      <div class="Sidebar_Filters" id="company_ticket">
        <div class="filter_title">Empresas:</div>
        <div class="input_group">
          <i id="companys_ico_TK" class="fa-solid fa-building"></i>
          <select id="companys" class="custom_select">               
          </select>          
        </div>
      </div>
      <div class="Sidebar_Filters" id="status_ticket">
        <div class="filter_title">Status:</div>
        <div class="input_group">
          <i id="status_ico_TK" class="fa-solid fa-chart-simple"></i>
          <select id="status_TK" class="custom_select">
            <option value="all">todos</option>
            <option value="0">aberto</option>
            <option value="1">pendente</option>
            <option value="2">fechado</option>
          </select>          
        </div>
      </div>
      <div class="Sidebar_Filters" id="priority_ticket">
        <div class="filter_title">Prioridade:</div>
        <div class="input_group">
          <i id="priority_Ico_TK" class="fa-solid fa-triangle-exclamation"></i>          
          <select id="priority_TK" class="custom_select">
            <option value="all">todos</option>
            <option value="0">Baixa</option>
            <option value="1">Media</option>
            <option value="2">Alta</option>
          </select>          
        </div>
      </div>      
    </div>
  </div>
  <div id="ticket_list" class="ticket_list_container"></div>
</div>
`

const TicketsDetais_html = `
<div id="AP_TK" class="action_pane_tickets">
  <div class="AP_NewDelete">    
    <div class="buttons_tickets" id="Back_TK_List">
      <i class="fa-solid fa-arrow-rotate-left"></i>
      <span id="Back_TK_List">Voltar</span>
    </div>
    <div class="buttons_tickets" id="Delete_TK">
      <i class="fa-solid fa-trash"></i>
      <span id="Delete_TK">Deletar</span>
    </div>     
  </div>
  <div class="buttons_tickets" id="open_Properties">
    <i class="fa-solid fa-bars-progress"></i>
    <span>Propriedades</span>
  </div> 
</div>
<div id="ticket_module_container" class="ticket_module_container">
  <div id="ticket_details" class="ticket_details_container">  
    <div id='ticketHeader' class="ticket_info_section"></div>
    <div id='MainDetails'></div>    
    <div class="add_note_section">
      <div class="note_actions">  
        <div style="display: flex; justify-content: flex-end;">      
          <div class="buttons_tickets details" id="Save_TK_Note">
            <i class="fa-solid fa-floppy-disk"></i>
            <span id="Save_TK_Note">Salvar</span>
          </div>  
        </div>
      </div>      
      <textarea id="my_editor"></textarea>
    </div>
  </div>
</div>
`