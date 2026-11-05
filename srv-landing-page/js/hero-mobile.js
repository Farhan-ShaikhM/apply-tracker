document.addEventListener("DOMContentLoaded", () => {

    const gallery = document.getElementById("heroGallery");

    if (!gallery) return;

    function buildMobileGallery() {

        if (window.innerWidth > 768) return;

        if (gallery.querySelector(".gallery-mobile")) return;

        const wrapper = document.createElement("div");

        wrapper.className = "gallery-mobile";

        gallery.querySelectorAll(".gallery-item").forEach(item => {

            wrapper.appendChild(item.cloneNode(true));

        });

        gallery.innerHTML = "";

        gallery.appendChild(wrapper);

    }

    buildMobileGallery();

    window.addEventListener("resize", buildMobileGallery);

});
