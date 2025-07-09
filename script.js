document.addEventListener("DOMContentLoaded", function () {
  // ✅ Al cargar la página, si no hay ancla (#), fuerza el scroll al tope
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  // Referencias a elementos importantes
  const portafolioDiv = document.getElementById("portafolio-link");
  const submenu = document.getElementById("submenu");
  const nav = document.querySelector("nav");
  const btnTop = document.getElementById("btn-top");

  // ✅ Mostrar/ocultar el submenú al hacer clic en "Portafolio"
  portafolioDiv.addEventListener("click", function (e) {
    if (!e.target.closest("a")) {
      e.preventDefault();
      submenu.style.display = submenu.style.display === "flex" ? "none" : "flex";
    }
  });

  // ✅ Ocultar el submenú si haces clic fuera de él
  document.addEventListener("click", function (event) {
    if (!portafolioDiv.contains(event.target)) {
      submenu.style.display = "none";
    }
  });

  // ✅ Cuando haces clic en una opción del submenú, lo oculta
  document.querySelectorAll('#submenu a').forEach(link => {
    link.addEventListener('click', () => {
      submenu.style.display = "none";
    });
  });

  // ✅ Fija la barra de navegación al hacer scroll
  function manejarScroll() {
    if (window.scrollY >= 0) {
      if (!nav.classList.contains("fixed-nav")) {
        nav.classList.add("fixed-nav");
        document.body.style.paddingTop = nav.offsetHeight + "px";
      }
    } else {
      if (nav.classList.contains("fixed-nav")) {
        nav.classList.remove("fixed-nav");
        document.body.style.paddingTop = "0";
        submenu.style.display = "none";
      }
    }

    // ✅ Mostrar botón "↑" solo si haces scroll hacia abajo
    if (window.scrollY > 100) {
      btnTop.style.display = "block";
    } else {
      btnTop.style.display = "none";
    }
  }

  window.addEventListener("scroll", manejarScroll);

  // ✅ Botón para volver arriba
  btnTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // ✅ Animación tipo máquina de escribir
  const texts = ["Yazmin Moreno", "minxy"];
  let currentTextIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  const element = document.getElementById("typewriter");
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseBetween = 1500;

  function type() {
    const text = texts[currentTextIndex];

    if (isDeleting) {
      currentCharIndex--;
      element.textContent = text.substring(0, currentCharIndex);
      if (currentCharIndex === 0) {
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % texts.length;
        setTimeout(type, typingSpeed);
        return;
      }
    } else {
      currentCharIndex++;
      element.textContent = text.substring(0, currentCharIndex);
      if (currentCharIndex === text.length) {
        isDeleting = true;
        setTimeout(type, pauseBetween);
        return;
      }
    }

    setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
  }

  type();

  // ✅ Efecto de resaltado al hacer clic en una sección del menú
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function () {
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.classList.remove('highlight');
        void targetElement.offsetWidth;
        targetElement.classList.add('highlight');
      }
    });
  });

  // ✅ Carrusel de fotos (Fotografía y edición)
  const items = document.querySelectorAll('.item');
  let index = 0;

  function showItem(i) {
    items.forEach((item, idx) => {
      item.style.display = idx === i ? 'block' : 'none';
    });
  }

  showItem(index);

  document.getElementById('prev').onclick = () => {
    index = (index - 1 + items.length) % items.length;
    showItem(index);
  };

  document.getElementById('next').onclick = () => {
    index = (index + 1) % items.length;
    showItem(index);
  };

  setInterval(() => {
    index = (index + 1) % items.length;
    showItem(index);
  }, 4000);

  // ✅ Carrusel de modelado 3D (Modelado en Maya)
  const items3d = document.querySelectorAll('.item3d');
  let index3d = 0;

  function showItem3d(i) {
    items3d.forEach((item, idx) => {
      item.style.display = idx === i ? 'block' : 'none';
    });
  }

  showItem3d(index3d);

  document.getElementById('prev3d').onclick = () => {
    index3d = (index3d - 1 + items3d.length) % items3d.length;
    showItem3d(index3d);
  };

  document.getElementById('next3d').onclick = () => {
    index3d = (index3d + 1) % items3d.length;
    showItem3d(index3d);
  };
});
