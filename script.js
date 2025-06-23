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
    // Si no diste clic en un <a>, se despliega el menú
    if (!e.target.closest("a")) {
      e.preventDefault(); // evita que haga scroll por error
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
      // Añade clase para fijar nav y ajusta el padding superior del body
      if (!nav.classList.contains("fixed-nav")) {
        nav.classList.add("fixed-nav");
        document.body.style.paddingTop = nav.offsetHeight + "px";
      }
    } else {
      // Si estás arriba de todo, quita el nav fijo
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

  // Ejecutar función al hacer scroll
  window.addEventListener("scroll", manejarScroll);

  // ✅ Botón para volver arriba con scroll suave
  btnTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // ✅ Animación tipo máquina de escribir
  const texts = ["Yazmin Moreno", "minxy"]; // Textos a mostrar
  let currentTextIndex = 0; // Índice del texto actual
  let currentCharIndex = 0; // Cuántas letras han aparecido
  let isDeleting = false;   // ¿Está borrando?
  const element = document.getElementById("typewriter");
  const typingSpeed = 100;  // Velocidad al escribir
  const deletingSpeed = 50; // Velocidad al borrar
  const pauseBetween = 1500; // Pausa entre un texto y otro

  function type() {
    const text = texts[currentTextIndex]; // Texto actual

    if (isDeleting) {
      currentCharIndex--; // Borrando letras
      element.textContent = text.substring(0, currentCharIndex);
      if (currentCharIndex === 0) {
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % texts.length; // Cambia al siguiente texto
        setTimeout(type, typingSpeed);
        return;
      }
    } else {
      currentCharIndex++; // Escribiendo letras
      element.textContent = text.substring(0, currentCharIndex);
      if (currentCharIndex === text.length) {
        isDeleting = true; // Comienza a borrar después de completar
        setTimeout(type, pauseBetween);
        return;
      }
    }

    // Llama a la función de nuevo con velocidad variable
    setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
  }

  type(); // Inicia la animación de escritura

  // ✅ Efecto de resaltado al hacer clic en una sección del menú
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function () {
      const targetId = this.getAttribute('href').substring(1); // Quita el "#"
      const targetElement = document.getElementById(targetId); // Busca el elemento

      if (targetElement) {
        // Reinicia la animación si ya tenía la clase
        targetElement.classList.remove('highlight');
        void targetElement.offsetWidth; // Forzar reflujo
        targetElement.classList.add('highlight');
      }
    });
  });
});
