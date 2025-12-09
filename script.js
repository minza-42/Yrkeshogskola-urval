document.addEventListener("DOMContentLoaded", () => {
  // ========================
  // Elementreferenser
  // ========================
  const filterButtonsContainer = document.getElementById("filterButtons");
  const animalContainer = document.getElementById("animalContainer");
  const modal = document.getElementById("infoModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDetails = document.getElementById("modalDetails");
  const closeModalBtn = document.getElementById("closeModal");
  const searchInput = document.getElementById("searchInput");
  const clearFiltersBtn = document.getElementById("clearFilters");
  const filterToggle = document.getElementById("filterToggle");
  const controls = document.querySelector(".controls");

  let lastFocusedBeforeModal = null;

  // ========================
  // Hjälpfunktioner
  // ========================
  function getAnimals() {
    return animalContainer ? Array.from(animalContainer.querySelectorAll(".animal")) : [];
  }

  function getActiveFilters() {
    if (!filterButtonsContainer) return [];
    const activeBtns = Array.from(filterButtonsContainer.querySelectorAll('button[data-filter].active'));
    const values = activeBtns.map(b => (b.dataset.filter || "").toLowerCase());
    if (values.includes("allt") && values.length === 1) return [];
    if (values.includes("allt") && values.length > 1) return values.filter(v => v !== "allt");
    return values;
  }

  function applyFiltersAndSearch() {
    const animals = getAnimals();
    const activeFilters = getActiveFilters();
    const query = (searchInput?.value || "").trim().toLowerCase();

    animals.forEach(animal => {
      const name = (animal.querySelector("h3")?.textContent || "").toLowerCase();
      const type = (animal.querySelector(".type")?.textContent || "").toLowerCase();
      const color = (animal.querySelector(".color")?.textContent || "").toLowerCase();
      const yearText = (animal.querySelector(".year")?.textContent || "").toLowerCase();
      const tags = (animal.dataset.tags || "").toLowerCase();
      const desc = (animal.querySelector(".desc")?.textContent || "").toLowerCase();
      const combined = `${name} ${type} ${color} ${yearText} ${tags} ${desc}`;

      const passesFilters = activeFilters.length === 0 || activeFilters.every(f => combined.includes(f));
      const passesSearch = query.length === 0 || combined.includes(query);

      animal.style.display = (passesFilters && passesSearch) ? "block" : "none";
    });
  }

  function toggleButtonState(btn) {
    if (!btn || !btn.hasAttribute("data-filter")) return;
    const filterVal = (btn.dataset.filter || "").toLowerCase();
    const isAllBtn = filterVal === "allt";

    if (isAllBtn) {
      filterButtonsContainer.querySelectorAll('button[data-filter]').forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      applyFiltersAndSearch();
      return;
    }

    btn.classList.toggle("active");
    btn.setAttribute("aria-pressed", btn.classList.contains("active") ? "true" : "false");

    const allBtn = filterButtonsContainer.querySelector('button[data-filter="allt"]');
    if (allBtn) {
      allBtn.classList.remove("active");
      allBtn.setAttribute("aria-pressed", "false");
    }

    const anyActive = Array.from(filterButtonsContainer.querySelectorAll('button[data-filter]'))
      .some(b => b.classList.contains("active") && (b.dataset.filter || "").toLowerCase() !== "allt");
    if (!anyActive && allBtn) {
      allBtn.classList.add("active");
      allBtn.setAttribute("aria-pressed", "true");
    }

    applyFiltersAndSearch();
  }

  function clearAllFilters() {
    if (filterButtonsContainer) {
      filterButtonsContainer.querySelectorAll('button[data-filter]').forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      const allBtn = filterButtonsContainer.querySelector('button[data-filter="allt"]');
      if (allBtn) {
        allBtn.classList.add("active");
        allBtn.setAttribute("aria-pressed", "true");
      }
    }
    if (searchInput) searchInput.value = "";
    getAnimals().forEach(animal => { animal.style.display = "block"; });
    if (searchInput) searchInput.focus();
  }

  // ========================
  // Eventlisteners för filter
  // ========================
  if (filterButtonsContainer) {
    filterButtonsContainer.querySelectorAll('button').forEach(btn => {
      if (!btn.hasAttribute("aria-pressed")) {
        btn.setAttribute("aria-pressed", btn.classList.contains("active") ? "true" : "false");
      }
      btn.setAttribute("tabindex", "0");
    });

    filterButtonsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.id === "clearFilters") {
        clearAllFilters();
        return;
      }
      if (btn.hasAttribute("data-filter")) toggleButtonState(btn);
    });

    filterButtonsContainer.addEventListener("keydown", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (btn.id === "clearFilters") {
          clearAllFilters();
          return;
        }
        if (btn.hasAttribute("data-filter")) toggleButtonState(btn);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFiltersAndSearch);
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        applyFiltersAndSearch();
      }
    });
  }

  // ========================
  // Modal-funktionalitet
  // ========================
  if (animalContainer) {
    animalContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".info-btn");
      if (!btn) return;
      showModal(btn.dataset.name, btn.dataset.type, btn.dataset.color, btn.dataset.year, btn.dataset.desc);
    });
  }

  function showModal(namn, typ, färg, år, beskrivning) {
    if (!modal) {
      alert(`${namn}\nTyp: ${typ}\nFärg: ${färg}\nÅr: ${år}\n\n${beskrivning}`);
      return;
    }

    modalTitle.textContent = namn;
    modalDetails.innerHTML = `<p><strong>Typ:</strong> ${typ}</p>
                              <p><strong>Färg:</strong> ${färg}</p>
                              <p><strong>Födelseår:</strong> ${år}</p>
                              <hr>
                              <p>${beskrivning}</p>`;

    lastFocusedBeforeModal = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    if (closeModalBtn) closeModalBtn.focus();
    document.documentElement.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === "function") {
      lastFocusedBeforeModal.focus();
    }
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });

  // ========================
  // Hamburger för filterpanel
  // ========================
  if (filterToggle && controls) {
    filterToggle.addEventListener("click", () => {
      const isActive = controls.classList.toggle("active");
      filterToggle.setAttribute("aria-expanded", isActive);

      // Sätt fokus på första knapp/input i panelen
      if (isActive) {
        const firstFocusable = controls.querySelector("button, input, [tabindex]:not([tabindex='-1'])");
        if (firstFocusable) firstFocusable.focus();
      }
    });

    // Stäng panelen med ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && controls.classList.contains("active")) {
        controls.classList.remove("active");
        filterToggle.setAttribute("aria-expanded", "false");
        filterToggle.focus();
      }
    });
  }

  // ========================
  // Initial rendering
  // ========================
  applyFiltersAndSearch();
});
