export function confirmModal(message) {
    return new Promise((resolve) => {
        const modal      = document.getElementById('custom_modal');
        const messageEl  = document.getElementById('modal_message');
        const buttonsBox = document.getElementById('modal_buttons');

        messageEl.innerHTML = message;
        buttonsBox.innerHTML = `
            <button id="modal_confirm_btn">Confirmar</button>
            <button id="modal_cancel_btn">Cancelar</button>
        `;

        buttonsBox.querySelector('#modal_confirm_btn').onclick = () => {
            modal.classList.add('modal_hidden');
            resolve(true);
        };

        buttonsBox.querySelector('#modal_cancel_btn').onclick = () => {
            modal.classList.add('modal_hidden');
            resolve(false);
        };

        modal.classList.remove('modal_hidden');
    });
}
  
export function warningModal(message) {
    const modal = document.getElementById('custom_modal');
    const messageEl = document.getElementById('modal_message');
    const buttonsBox = document.getElementById('modal_buttons');

    messageEl.textContent = message;
    buttonsBox.innerHTML = `
        <button id="modal_confirm_btn">OK</button>
    `;

    buttonsBox.querySelector('#modal_confirm_btn').onclick = () => {
        modal.classList.add('modal_hidden');        
    };

    modal.classList.remove('modal_hidden');
}
  