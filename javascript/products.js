document.querySelectorAll('.product_logo').forEach((logo) => {
    const modal = logo.closest('.product_card').querySelector('.product_modal');
    const closeBtn = modal.querySelector('.close_modal');

    logo.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
