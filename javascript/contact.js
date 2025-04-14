const modal = document.getElementById("contactModal");
const closeBtn = document.getElementById("closeContactModal");

document.querySelectorAll(".btn_contact, .btn_bt, .btn_ph").forEach(btn => {
    btn.addEventListener("click", function(e) {
        e.preventDefault();
        modal.style.display = "flex";
    });
});

closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
});

window.addEventListener("click", function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});