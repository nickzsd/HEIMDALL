const menuToggle   = document.getElementById("menuToggle");
const dropdownMenu = document.getElementById("dropdownMenu");

menuToggle.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
});

window.addEventListener('scroll', function () {
    if(document.body.classList.toggle("menu-open"))
        document.body.classList.toggle("menu-open");
});


const imagesContainer = document.getElementById('carouselImages');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = indicators.length;
let currentSlide = 0;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let isDragging = false;
let animationID;
let autoSlideInterval;
const AUTO_SLIDE_DELAY = 4000;


function updateSlide() {
    currentTranslate = -currentSlide * imagesContainer.clientWidth;
    imagesContainer.style.transition = 'transform 0.4s ease-in-out';
    imagesContainer.style.transform = `translateX(${currentTranslate}px)`;
    indicators.forEach((el, i) => el.classList.toggle('active', i === currentSlide));
}

function goToSlide(index) {
    currentSlide = index;
    updateSlide();
}

function autoSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlide();
}

function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlide();
        prevTranslate = -currentSlide * imagesContainer.clientWidth;
    }, AUTO_SLIDE_DELAY);
}


imagesContainer.addEventListener('mousedown', dragStart);
imagesContainer.addEventListener('touchstart', dragStart);

imagesContainer.addEventListener('mouseup', dragEnd);
imagesContainer.addEventListener('mouseleave', dragEnd);
imagesContainer.addEventListener('touchend', dragEnd);

imagesContainer.addEventListener('mousemove', dragMove);
imagesContainer.addEventListener('touchmove', dragMove);

function dragStart(e) {
    isDragging = true;
    startPos = getPositionX(e);
    animationID = requestAnimationFrame(animation);
    imagesContainer.style.transition = 'none';
}

function dragMove(e) {
    if (!isDragging) return;
    const currentPosition = getPositionX(e);
    const diff = currentPosition - startPos;
    currentTranslate = prevTranslate + diff;
}

function dragEnd() {
    cancelAnimationFrame(animationID);
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate;

    if (movedBy < -50) {
        currentSlide = (currentSlide + 1) % totalSlides;
    } else if (movedBy > 50) {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    }

    updateSlide();
    prevTranslate = -currentSlide * imagesContainer.clientWidth;
    startAutoSlide();
}


function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
}

function animation() {
    imagesContainer.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) requestAnimationFrame(animation);
}

startAutoSlide(); 