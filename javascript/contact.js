const modal = document.getElementById("contactModal");
const closeBtn = document.getElementById("closeContactModal");

document.querySelectorAll(".btn_contact, .btn_bt, .btn_ph, .contact").forEach(btn => {    
    btn.addEventListener("click", function(e) {
        e.preventDefault();

        if(document.body.classList.toggle("menu-open"))
            document.body.classList.toggle("menu-open");

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