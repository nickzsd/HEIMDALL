document.querySelectorAll('.product_logo').forEach((logo) => {
    const modal = logo.closest('.product_card').querySelector('.product_modal');
    const closeBtn = modal.querySelector('.close_modal');

    logo.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });
});

