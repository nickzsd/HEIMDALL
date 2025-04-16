function openTicket(ticketId) {
    const ticketList = document.getElementById('ticket_list');
    const ticketDetails = document.getElementById('ticket_details');
      
    ticketList.style.display = 'none';
    ticketDetails.style.display = 'flex';
      
    const ticketTitle = document.querySelector('.ticket_title_view');
    const ticketContent = document.querySelector('.ticket_info_section');
    ticketTitle.textContent = `Detalhes do Ticket #${ticketId}`;
    ticketContent.innerHTML = `
      <p><strong>Informações:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque convallis libero sit amet.</p>
      <p><strong>Descrição:</strong> Vestibulum ut magna ac enim volutpat tincidunt a ac velit. Fusce feugiat, nisl id vulputate.</p>
    `;
      
    document.querySelector('.add_note_section').style.display = 'block';
  }
    
  function goBackToList() {
    const ticketList = document.getElementById('ticket_list');
    const ticketDetails = document.getElementById('ticket_details');
    
    ticketList.style.display = 'block';
    ticketDetails.style.display = 'none';
  }
    
  document.querySelector('.back_button').addEventListener('click', goBackToList);
  