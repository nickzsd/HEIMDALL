export function confirmModal(message, onConfirm, onCancel = () => {}) {
    const modal = document.getElementById('custom_modal');
    const messageEl = document.getElementById('modal_message');
    const confirmBtn = document.getElementById('modal_confirm_btn');
    const cancelBtn = document.getElementById('modal_cancel_btn');
    const buttonsBox = document.getElementById('modal_buttons');
    
    confirmBtn.onclick = () => {};
    cancelBtn.onclick = () => {};

    messageEl.textContent = message;
    buttonsBox.innerHTML = `
        <button id="modal_confirm_btn">Confirmar</button>
        <button id="modal_cancel_btn">Cancelar</button>
    `;

    buttonsBox.querySelector('#modal_confirm_btn').onclick = () => {
        modal.classList.add('modal_hidden');
        onConfirm();
    };

    buttonsBox.querySelector('#modal_cancel_btn').onclick = () => {
        modal.classList.add('modal_hidden');
        onCancel();
    };

    modal.classList.remove('modal_hidden');
}
  
export function warningModal(message, onClose = () => {}) {
    const modal = document.getElementById('custom_modal');
    const messageEl = document.getElementById('modal_message');
    const buttonsBox = document.getElementById('modal_buttons');

    messageEl.textContent = message;
    buttonsBox.innerHTML = `
        <button id="modal_confirm_btn">OK</button>
    `;

    buttonsBox.querySelector('#modal_confirm_btn').onclick = () => {
        modal.classList.add('modal_hidden');
        onClose();
    };

    modal.classList.remove('modal_hidden');
}
  