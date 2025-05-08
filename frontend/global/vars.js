window.currentUserData = {
  user: 'empresa1',
  user_name: 'Empresa 1',
  acess_key: 12345,
  email: 'empresa1@email.com.br',
  contact_phone: '(41)0000-0000',
  register_type: 'funcionario',
  function: "gestor",
  user_description: 'teste de descrição'
}

window.openType = {
    type: 0
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
      <div class="user_icon">👤</div>
    </div>  
    <select class="role_selector" id="user_role">
      <option value="employee">Funcionário</option>
      <option value="company">Cliente</option>
    </select>
    <div id="PF_Function" class="profile_function" style="display: none;">
      <p class="profile_label">Função</p>
      <select class="role_selector" id="function">
        <option value="gestor">Gestor</option>
        <option value="dev">Desenvolvedor</option>
        <option value="Tecnico">Tecnico</option>      
      </select>
    </div>
    <p class="profile_label">descrição</p>
    <div class="service_wrapper">
      <textarea class="service_type" id="service_type" placeholder="Descrição / Observações"></textarea>
    </div>
  </div>
  <div class="right_column">
    <p class="profile_label">Id do Usuario</p>
    <input type="text" id="user_id" class="form_input" placeholder="userId">
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

const ticketHTML = `
<div id="ticket_module_container" class="ticket_module_container">
  <div id="ticket_list" class="ticket_list_container">
    <div id="ticket" class="ticket_item">
      <div class="ticket_status_tag">New</div>
      <div class="ticket_title" id="title_284">Configure new deposits for transfer between HQ and Branch #284</div>
      <div class="ticket_meta">
        <span class="ticket_user" id="user_284">Alex Turner (Blue Tech)</span> •
        <span class="ticket_time" id="time_284">Created 7 hours ago</span>
      </div>
      <div class="ticket_props">
        <span class="priority_tag high" id="priority_284">High</span>
        <span class="group_info" id="group_284">Blue Tech / --</span>
        <span class="status" id="status_label_284">Open</span>
      </div>
    </div>
  </div>
  <div id="ticket_details" class="ticket_details_container">
    <button class="back_button">Back</button>
    <h2 class="ticket_title_view" id="ticket_title_view">Billing error on invoice 8887</h2>
    <div class="ticket_tags">
      <span class="browser_tag" id="browser_tag">Chrome 135.0.0.0</span>
      <span class="os_tag" id="os_tag">Windows 10</span>
      <span class="origin_tag" id="origin_tag">/support/tickets</span>
    </div>
    <div class="ticket_info_section">
      <p><strong id="reported_by">John Smith</strong> reported via portal<br><small id="report_time">1 day ago (Mon, Apr 14, 2025, 10:22 AM)</small></p>
      <p id="ticket_description">XML issue on Invoice OV306135, NFSe 8887.<br>Path: Accounts Receivable → Periodic Activities → NFSe Manager.</p>
      <p><em id="no_attachment">No attachment.</em></p>
      <div class="attached_file" id="attachment_section">
        <img src="ticket_nfse.png" alt="attachment" width="40" id="attachment_image"> ticket_nfse.png (27.75 KB)
      </div>
    </div>
    <div class="ticket_note_history">
      <p><strong id="note_author">John Smith</strong> added a public note<br><small id="note_time">1 day ago (Mon, Apr 14, 2025, 5:39 PM)</small></p>
      <p id="note_content">Ticket forwarded to NExpress developer. Problem confirmed not to be in AX.</p>
    </div>
    <div class="ticket_sidebar">
      <p>Status: <strong id="ticket_status">Closed</strong></p>
      <p>Tag: <strong id="ticket_tag">Important</strong></p>
      <p>Type: <strong id="ticket_type">Issue</strong></p>
      <p>Priority: <strong id="ticket_priority">Urgent</strong></p>
      <p>Group: <strong id="ticket_group">--</strong></p>
      <p>Agent: <strong id="ticket_agent">--</strong></p>
      <button onclick="updateTicket()">Update</button>
    </div>
    <div class="add_note_section">
      <textarea id="note_input" placeholder="Add a note, @mention someone..."></textarea>
      <div class="note_toolbar">
        <button><b>B</b></button>
        <button><i>I</i></button>
        <button><u>U</u></button>
        <button>📎</button>
        <button>📷</button>
        <button>📅</button>
        <button>{ }</button>
      </div>
      <div class="note_actions">
        <button onclick="sendReply()">Reply</button>
        <button onclick="addNote()">Add Note</button>
        <button onclick="forward()">Forward</button>
      </div>
    </div>
  </div>
</div>
`

const user_list_html = `
  <div class="user_grid_container">
    <h2 class="section_title">Lista de Usuários</h2>
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
    <div id="user_grid_body" class="user_grid_body">      
    </div>
  </div>
`;