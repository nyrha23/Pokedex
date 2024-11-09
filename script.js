const themeToggleButton = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const cardContainer = document.getElementById("card-container");
const typeNav = document.getElementById("nav-type");
const menuToggle = document.getElementById("menu-toggle");
const menuIcon = document.getElementById("menu-icon");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const popup = document.getElementById("popup");

const totalPokemon = 1025;
const pokemonPerPage = 50;
let currentPage = 1;
let totalPages = Math.ceil(totalPokemon / pokemonPerPage);

// Cambia el tema
themeToggleButton.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");

  // Alterna los iconos y texto
  if (document.body.classList.contains("light-theme")) {
    themeIcon.classList.replace("fa-sun", "fa-moon");
    themeToggleButton.textContent = "Dark";
  } else {
    themeIcon.classList.replace("fa-moon", "fa-sun");
    themeToggleButton.textContent = "Light";
  }
  
  themeToggleButton.prepend(themeIcon);
});

menuToggle.addEventListener("click", () => {
  typeNav.classList.toggle("open");

  if (typeNav.classList.contains("open")) {
    menuIcon.classList.replace("fa-bars", "fa-xmark");
  } else {
    menuIcon.classList.replace("fa-xmark", "fa-bars");
  }
});

searchInput.addEventListener("input", () => {
  if (searchInput.value.trim() === "") {
    displayPokemon(currentPage);
  }
});

async function fetchPokemon(id) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();

    // Extracción de datos del Pokémon
    const idPokemon = data.id;
    const nombre = data.name;
    const imagen = data.sprites.front_default;
    const tipos = data.types.map(tipo => tipo.type.name);
    const hp = data.stats.find(stat => stat.stat.name === 'hp').base_stat;
    const ataque = data.stats.find(stat => stat.stat.name === 'attack').base_stat;
    const defensa = data.stats.find(stat => stat.stat.name === 'defense').base_stat;
    const peso = data.weight;
    const altura = data.height;
    const habilidades = data.abilities.map(habilidad => habilidad.ability.name);
    const movimientos = data.moves.slice(0, 5).map(move => move.move.name);
    const experiencia = data.base_experience;
    
    // Solicitar datos adicionales desde el endpoint de `pokemon-species`
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const speciesData = await speciesResponse.json();

    const generacion = speciesData.generation.name;
    const habitat = speciesData.habitat ? speciesData.habitat.name : 'Desconocido';
    const genero = speciesData.gender_rate === -1 ? 'Indefinido' : 'Definido';
    const description = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
    const descriptionText = description ? description.flavor_text : "Descripción no disponible";

    // Retornar un solo objeto con todos los datos necesarios
    return {
      id: idPokemon,
      nombre,
      imagen,
      tipos,
      hp,
      ataque,
      defensa,
      peso,
      altura,
      habilidades,
      movimientos,
      experiencia,
      generacion,
      habitat,
      genero,
      descriptionText
    };
  } catch (error) {
    console.error('Error al obtener los datos del Pokémon:', error);
  }
}

// Tarjetas pokemon
async function createCard(pokemon) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <p><i class="fa-regular fa-star"></i> ${pokemon.id}</p>
    <img src="${pokemon.imagen}" alt="${pokemon.nombre}">
    <h3>${pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
    <p>Tipos: ${pokemon.tipos.join(', ')}</p>
    <p>Descripción: ${pokemon.descriptionText}</p>
  `;

  // Asigna evento para mostrar el popup al hacer clic en la tarjeta
  card.addEventListener("click", () => showPopup(pokemon));
  cardContainer.appendChild(card);
}

// Muestra pokemon
async function displayPokemon(page = 1) {
  cardContainer.innerHTML = "";

  const start = (page - 1) * pokemonPerPage + 1;
  let end = page * pokemonPerPage;
  
  if (end > totalPokemon) end = totalPokemon;

  const heroContainer = document.querySelector(".hero-container");
  heroContainer.style.display = page === 1 ? "block" : "none";

  for (let i = start; i <= end; i++) {
    try {
      const pokemon = await fetchPokemon(i);
      createCard(pokemon);
    } catch (error) {
      console.error('Error al mostrar el Pokémon:', error);
      break;
    }
  }
  createPagination();
}

// Muestra pokemon segun tipos
async function displayPokemonByType(type) {
  cardContainer.innerHTML = '';

  const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
  const data = await response.json();

  for (let pokemonData of data.pokemon.slice(0, 50)) {
    const pokemon = await fetchPokemon(pokemonData.pokemon.name);
    createCard(pokemon);
  }
}

// Busca
searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    displayPokemon(currentPage);
    return;
  }

  cardContainer.innerHTML = '';
  try {
    const isNumber = !isNaN(query);
    const pokemon = await fetchPokemon(isNumber ? Number(query) : query);
    createCard(pokemon);
  } catch (error) {
    console.error("Error al buscar el Pokémon:", error);
    cardContainer.innerHTML = "<p>Pokémon no encontrado</p>";
  }
});

// Pop up
function showPopup(pokemon) {
  popup.style.display = "block";

  popup.innerHTML = `
    <div class="popupContent">
      <p><i class="fa-regular fa-star"></i> ${pokemon.id}</p>
      <h3>${pokemon.nombre}</h3>
      <img src="${pokemon.imagen}" alt="${pokemon.nombre}">
      <p>Tipo(s): ${pokemon.tipos.join(', ')}</p>
      <p>HP: ${pokemon.hp}</p>
      <p>Ataque: ${pokemon.ataque}</p>
      <p>Defensa: ${pokemon.defensa}</p>
      <p>Habilidades: ${pokemon.habilidades.join(', ')}</p>
      <p>Género: ${pokemon.genero}</p>
      <p>Generación: ${pokemon.generacion}</p>
      <p>Hábitat: ${pokemon.habitat}</p>
      <p>Peso: ${pokemon.peso / 10} kg</p>
      <p>Altura: ${pokemon.altura / 10} m</p>
      <button id="popupClose"><i class="fa-regular fa-circle-xmark"></i></button>
    </div>
  `;

  document.getElementById("popupClose").addEventListener("click", () => {
    popup.style.display = "none";
  });
}

// Páginas
function createPagination() {
  pagination.innerHTML = "";

  // Flecha izquierda
  if (currentPage > 1) {
    const prevButton = document.createElement("button");

    prevButton.textContent = "<";
    prevButton.addEventListener("click", () => changePage(currentPage - 1));
    pagination.appendChild(prevButton);
  }

  // Números de página
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");

    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pageButton.addEventListener("click", () => changePage(i));
    pagination.appendChild(pageButton);
  }

  // Flecha derecha
  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");

    nextButton.textContent = ">";
    nextButton.addEventListener("click", () => changePage(currentPage + 1));
    pagination.appendChild(nextButton);
  }
}

// Cambia página
function changePage(page) {
  currentPage = page;
  displayPokemon(page);
}

// Inicialización de páginas
function initializePagination() {
  totalPages = Math.ceil(totalPokemon / pokemonPerPage);
  createPagination();
  displayPokemon(currentPage);
}

// Tipos de pokemon en menu
async function loadTypes() {
  const typeList = document.createElement("ul");
  typeList.id = "typeList"
  typeNav.appendChild(typeList);
  
  const showAll = document.createElement("li");
  showAll.textContent = "Todos";
  showAll.addEventListener("click", () => {
    currentPage = 1;
    displayPokemon(currentPage);
    activateTypeButton(showAll);
  });
  typeList.appendChild(showAll);

  const response = await fetch("https://pokeapi.co/api/v2/type");
  const data = await response.json();
  const validTypes = data.results.filter(type => type.name !== "stellar" && type.name !== "unknown");
  
  validTypes.forEach(type => {
    const typeItem = document.createElement("li");
    typeItem.textContent = type.name;
    typeItem.addEventListener("click", () => {
      displayPokemonByType(type.name);
      activateType(typeItem);
    });
    typeList.appendChild(typeItem);
  });
}

loadTypes();
initializePagination();