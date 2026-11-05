const slider = document.querySelector(".features__slider");

const next = document.querySelector(".features-btn--active");
const prev = document.querySelector(".features-btn");

next.addEventListener("click", () => {
    slider.scrollBy({
        left: 300,
        behavior: "smooth"
    });
});

prev.addEventListener("click", () => {
    slider.scrollBy({
        left: -300,
        behavior: "smooth"
    });
});