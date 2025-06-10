import { ISO2Date,Date2ISO } from "../utils/HDL_Utils.js";

let initDate = new Date();
let endDate = new Date();
endDate.setDate(endDate.getDate() - 7);

export async function basicDashboard() {
  const ctx1 = document.getElementById('tickets_chart');
  const ctx2 = document.getElementById('hours_chart');
  
  const openTickets   = await getOpenTickets();
  const closedTickets = await getClosedTickets();
  const totalHours    = await getTotalProjTime(); 

  const totalTickets  = openTickets + closedTickets;

  const openPercent   = totalTickets > 0 ? ((openTickets / totalTickets) * 100).toFixed(0) : 0;
  const closedPercent = totalTickets > 0 ? ((closedTickets / totalTickets) * 100).toFixed(0) : 0;
    
  const openVariation   = +15;  // exemplo positivo
  const closedVariation = -10; // exemplo negativo
  const hoursVariation  = +5;  // exemplo positivo

  function getDateFilter() {
    const diff = document.getElementById('period_filter').value;

    const today = new Date();
    const priorDate = new Date();

    if (diff !== 'all') {
      priorDate.setDate(today.getDate() - parseInt(diff));
    }

    const minDate = diff === 'all' ? null : priorDate.toISOString().split('T')[0];
    const maxDate = today.toISOString().split('T')[0];

    return { minDate, maxDate };
  }

  function fillValues() {
    document.getElementById('open_tickets').innerHTML = `${openTickets} <span class="percent">(${openPercent}%)</span>`;

    const openVarEl = document.getElementById('open_tickets_variation');
    openVarEl.textContent = `${openVariation > 0 ? '↑' : '↓'} ${Math.abs(openVariation)}% vs último período`;
    openVarEl.className = `variation ${openVariation > 0 ? 'up' : 'down'}`;

    document.getElementById('closed_tickets').innerHTML = `${closedTickets} <span class="percent">(${closedPercent}%)</span>`;

    const closedVarEl = document.getElementById('closed_tickets_variation');
    closedVarEl.textContent = `${closedVariation > 0 ? '↑' : '↓'} ${Math.abs(closedVariation)}% vs último período`;
    closedVarEl.className = `variation ${closedVariation > 0 ? 'up' : 'down'}`;

    document.getElementById('total_hours').innerHTML = `${totalHours} <span class="percent"></span>`;

    const hoursVarEl = document.getElementById('total_hours_variation');
    hoursVarEl.textContent = `${hoursVariation > 0 ? '↑' : '↓'} ${Math.abs(hoursVariation)}% vs último período`;
    hoursVarEl.className = `variation ${hoursVariation > 0 ? 'up' : 'down'}`;
  }

  function generateCharts() {
    new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Abertos', 'Concluídos'],
        datasets: [{
          data: [openTickets, closedTickets],
          backgroundColor: [
            'rgba(54, 99, 235, 0.7)',    
            'rgba(255, 205, 86, 0.7)'   
          ],
          borderColor: ['rgba(54, 99, 235, 1)', 'rgba(255, 205, 86, 1)'],
          borderWidth: 2,
          hoverOffset: 20
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#444',
              font: { size: 14, weight: '600' }
            }
          },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#3641eb',
            bodyColor: '#222',
            borderColor: '#3641eb',
            borderWidth: 1,
            padding: 8,
            cornerRadius: 4,
            boxShadow: '0 2px 6px rgba(54, 99, 235, 0.15)'
          },
          title: { display: false }
        },
        animation: {
          duration: 900,
          easing: 'easeOutCubic'
        }
      }
    });
    
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Projeto A', 'Projeto B', 'Projeto C'],
        datasets: [{
          label: 'Horas',
          data: [40, 60, 46],
          backgroundColor: 'rgba(54, 99, 235, 0.8)',
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: { color: '#444', font: { size: 14, weight: '600' } },
            grid: { display: false },
            border: { display: false }
          },
          y: {
            ticks: {
              color: '#444',
              font: { size: 14, weight: '600' },
              callback: val => val + 'h'
            },
            grid: {
              color: 'rgba(0,0,0,0.05)',
              borderDash: [4, 6]
            },
            beginAtZero: true
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#3641eb',
            bodyColor: '#222',
            borderColor: '#3641eb',
            borderWidth: 1,
            padding: 8,
            cornerRadius: 4,
            boxShadow: '0 2px 6px rgba(54, 99, 235, 0.15)'
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutCubic'
        }
      }
    });
  }

  document.getElementById('period_filter').onchange = () => {
    const { minDate, maxDate } = getDateFilter();
    initDate = new Date(minDate);
    endDate  = new Date(maxDate);

    console.log('entra');    

    basicDashboard(); 
  };

  fillValues();
  generateCharts();
}

async function getOpenTickets() {
  let count = 0;
  let queryvalue = {};  

  if (window.currentUserData.register_type === 'company')
    queryvalue = { ticket_company: window.currentUserData.companyId };

  const response = await fetch('http://localhost:3000/find', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableid: 'tickets', query: queryvalue })
  });

  const data = await response.json();
  const records = data.json || [];

  for (const record of records) {
    const createdDate = new Date(Date2ISO(record.createdDate)) || null;
    const updateDate  = new Date(Date2ISO(record.updateDate))  || null;
    const closedDate  = record.ClosedDate;    

    const isInPeriod = (
      (createdDate && createdDate >= initDate && createdDate <= endDate) ||
      (updateDate && updateDate >= initDate && updateDate <= endDate)
    );

    if (isInPeriod && !closedDate) {
      count++;
    }
  }

  return count;
}

async function getClosedTickets() {
  let count = 0;
  let queryvalue = {};

  if (window.currentUserData.register_type === 'company')
    queryvalue = { ticket_company: window.currentUserData.companyId };

  const response = await fetch('http://localhost:3000/find', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableid: 'tickets', query: queryvalue })
  });

  const data = await response.json();
  const records = data.json || [];

  for (const record of records) {    
    const closedDate = new Date(Date2ISO(record.closedDate))  || null;

    if (closedDate && closedDate >= initDate && closedDate <= endDate) {
      count++;
    }
  }

  return count;
}

async function getTotalProjTime() {
    let totalMinutes = 0;
    let queryvalue = {};

    if (window.currentUserData.register_type === 'company')
        queryvalue = { project_company: window.currentUserData.companyId };

    const response = await fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableid: 'projects', query: queryvalue })
    });

    const Proj_data = await response.json();
    const projects = Proj_data.json || [];

    for (const proj of projects) {
    const response = await fetch('http://localhost:3000/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableid: 'records', query: {projid: proj.projId}})
      });
    
      const record_data = await response.json();
      const records = record_data.json || [];

      for (const ref_record of records) {
        if (ref_record.total) {
          const total = ref_record.total;
      
          if (typeof total === 'string' && total.includes(':')) {            
            const parts = total.split(':');
            const h = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            if (!isNaN(h) && !isNaN(m)) {
              totalMinutes += h * 60 + m;
            } else {
              console.warn('Erro ao converter tempo (hh:mm):', total);
            }
          } else if (!isNaN(parseFloat(total))) {            
            const decimal = parseFloat(total);
            totalMinutes += Math.round(decimal * 60);
          } else {
            console.warn('Formato desconhecido de tempo:', total);
          }
        }
      }      
    }   

    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);

    const hh = String(hours).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');

    return `${hh}:${mm}`;  
}
