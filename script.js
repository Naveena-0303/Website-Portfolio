const eyes = document.querySelectorAll(".eye");
const SUPPORTED_MEDIA_EXTENSIONS = ["jpg", "jpeg", "gif", "mp4"];
const WORK_FILTERS = {
  all: [],
  "case-studies": [
    "Awara",
    "Koo App Revamp",
    "Recreation to Relaxation",
    "Mira - Travel System for the Elderly",
  ],
  "experience-design": [
    "Mira - Travel System for the Elderly",
    "Recreation to Relaxation",
  ],
  "visual-design": ["Badaga", "Wrapped Realities"],
};

function markActiveNav() {
  const currentPage = document.body.dataset.page;
  const navLinks = document.querySelectorAll(".site-nav a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const isActive =
      (currentPage === "home" && href === "index.html") ||
      (currentPage === "work" && href === "work.html") ||
      (currentPage === "profile" && href === "profile.html") ||
      (currentPage === "feedback" && href === "feedback.html");

    if (isActive) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function movePupils(event) {
  eyes.forEach((eye) => {
    const pupil = eye.querySelector(".pupil");
    const rect = eye.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;
    const deltaX = event.clientX - eyeCenterX;
    const deltaY = event.clientY - eyeCenterY;
    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.min(rect.width * 0.2, 4);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  });
}

function resetPupils() {
  document.querySelectorAll(".pupil").forEach((pupil) => {
    pupil.style.transform = "translate(-50%, -50%)";
  });
}

function initTopProjectsSwipe() {
  const stack = document.querySelector(".top-projects-stack");
  const prevButton = document.querySelector(".top-projects-arrow-prev");
  const nextButton = document.querySelector(".top-projects-arrow-next");
  const dots = Array.from(document.querySelectorAll(".top-projects-dot"));

  if (!stack) {
    return;
  }

  const cards = Array.from(stack.querySelectorAll(".top-project-card"));

  if (cards.length < 3) {
    return;
  }

  const findByPosition = (positionClass) =>
    cards.findIndex((card) => card.classList.contains(`top-project-card-${positionClass}`));

  const leftIndex = findByPosition("left");
  const centerIndex = findByPosition("center");
  const rightIndex = findByPosition("right");

  if (leftIndex < 0 || centerIndex < 0 || rightIndex < 0) {
    return;
  }

  let order = [leftIndex, centerIndex, rightIndex];
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let didSwipe = false;

  const updateDots = () => {
    if (!dots.length) {
      return;
    }

    dots.forEach((dot, index) => {
      const isActive = order[1] === index;
      dot.classList.toggle("is-active", isActive);
      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  const applyOrder = () => {
    cards.forEach((card) => {
      card.classList.remove(
        "top-project-card-left",
        "top-project-card-center",
        "top-project-card-right"
      );
    });

    cards[order[0]].classList.add("top-project-card-left");
    cards[order[1]].classList.add("top-project-card-center");
    cards[order[2]].classList.add("top-project-card-right");
    updateDots();
  };

  const goNext = () => {
    order = [order[1], order[2], order[0]];
    applyOrder();
  };

  const goPrev = () => {
    order = [order[2], order[0], order[1]];
    applyOrder();
  };

  stack.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    tracking = true;
    didSwipe = false;
    startX = event.clientX;
    startY = event.clientY;
  });

  stack.addEventListener("pointerup", (event) => {
    if (!tracking) {
      return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const horizontalSwipe = Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY);

    if (horizontalSwipe) {
      didSwipe = true;
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    tracking = false;
  });

  stack.addEventListener("pointercancel", () => {
    tracking = false;
  });

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      goPrev();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      goNext();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.dataset.cardIndex);

      if (Number.isNaN(targetIndex) || targetIndex === order[1]) {
        return;
      }

      if (targetIndex === order[2]) {
        goNext();
      } else if (targetIndex === order[0]) {
        goPrev();
      }
    });
  });

  // Prevent accidental navigation clicks right after a swipe gesture.
  stack.addEventListener(
    "click",
    (event) => {
      if (didSwipe) {
        event.preventDefault();
        event.stopPropagation();
        didSwipe = false;
      }
    },
    true
  );

  updateDots();
}

function animateSkillsBarsOnScroll() {
  const skillsPanel = document.querySelector(".skills-panel");

  if (!skillsPanel) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    skillsPanel.classList.add("is-loaded");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          skillsPanel.classList.add("is-loaded");
          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.35,
    }
  );

  observer.observe(skillsPanel);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createProjectPlaceholder(project) {
  const initials = project.title
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();

  return `
    <div class="project-cover project-cover-placeholder" aria-hidden="true">
      <span>${escapeHtml(initials)}</span>
    </div>
  `;
}

function probeMediaCandidate(url, type) {
  return new Promise((resolve) => {
    if (type === "video") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadeddata = () => resolve(true);
      video.onerror = () => resolve(false);
      video.src = url;
      return;
    }

    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
}

function extensionCandidates(extension) {
  return Array.from(new Set([extension, extension.toUpperCase()]));
}

function normalizeProjectTitle(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function resolveProjectCover(folder) {
  const coverBaseNames = ["cover", "Cover"];

  for (const extension of SUPPORTED_MEDIA_EXTENSIONS) {
    for (const variant of extensionCandidates(extension)) {
      for (const baseName of coverBaseNames) {
        const url = `${folder}/${baseName}.${variant}`;
        const type = extension === "mp4" ? "video" : "image";
        const exists = await probeMediaCandidate(url, type);

        if (exists) {
          return { url, type };
        }
      }
    }
  }

  return null;
}

async function resolveProjectMedia(folder, maxItems = 60) {
  const media = [];

  for (let index = 1; index <= maxItems; index += 1) {
    const padded = String(index).padStart(2, "0");
    let found = false;

    for (const extension of SUPPORTED_MEDIA_EXTENSIONS) {
      for (const variant of extensionCandidates(extension)) {
        const url = `${folder}/${padded}.${variant}`;
        const type = extension === "mp4" ? "video" : "image";
        const exists = await probeMediaCandidate(url, type);

        if (exists) {
          media.push({ url, type });
          found = true;
          break;
        }
      }

      if (found) {
        break;
      }
    }

    if (!found && index > 3) {
      break;
    }
  }

  return media;
}

async function renderWorkPage() {
  const grid = document.querySelector("#work-grid");
  const filtersContainer = document.querySelector("#work-filters");

  if (!grid || !Array.isArray(window.PROJECTS || PROJECTS)) {
    return;
  }

  const projects = window.PROJECTS || PROJECTS;
  let activeFilter = "all";

  const renderProjects = async (filterKey) => {
    const allowedTitles = WORK_FILTERS[filterKey] || [];
    const allowedTitleSet = new Set(allowedTitles.map((title) => normalizeProjectTitle(title)));
    const filteredProjects =
      filterKey === "all"
        ? projects
        : projects.filter((project) => allowedTitleSet.has(normalizeProjectTitle(project.title)));

    if (!filteredProjects.length) {
      grid.innerHTML = "";
      return;
    }

    const cards = await Promise.all(
      filteredProjects.map(async (project) => {
        const cover =
          (await resolveProjectCover(project.folder)) || (await resolveProjectMedia(project.folder, 1))[0];
        const coverMarkup = cover
          ? cover.type === "video"
            ? `
            <div class="project-cover">
              <video class="project-cover-media" src="${cover.url}" autoplay muted loop playsinline></video>
            </div>
          `
            : `
            <div class="project-cover">
              <img class="project-cover-media" src="${cover.url}" alt="${escapeHtml(project.title)} cover image" />
            </div>
          `
          : createProjectPlaceholder(project);

        return `
        <a class="project-card" href="project.html?slug=${encodeURIComponent(project.slug)}">
          <div class="project-card-topline">${escapeHtml(project.category)}</div>
          <h2 class="project-card-title">${escapeHtml(project.title)}</h2>
          ${coverMarkup}
        </a>
      `;
      })
    );

    grid.innerHTML = cards.join("");
  };

  if (filtersContainer) {
    const filterButtons = Array.from(filtersContainer.querySelectorAll(".work-filter-button"));

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filterKey = button.dataset.filter;

        if (!filterKey || filterKey === activeFilter) {
          return;
        }

        activeFilter = filterKey;
        filterButtons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        renderProjects(activeFilter);
      });
    });
  }

  await renderProjects(activeFilter);
}

async function renderProjectDetailPage() {
  const stream = document.querySelector("#project-media-stream");
  if (!stream) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const projects = window.PROJECTS || PROJECTS;
  const project = projects.find((item) => item.slug === slug) || projects[0];

  document.title = `Naveena Sivakumar | ${project.title}`;
  document.querySelector("#project-category").textContent = project.category;
  document.querySelector("#project-title").textContent = project.title;
  if (project.description) {
    document.querySelector("#project-description").textContent = project.description;
  } else {
    document.querySelector("#project-description").textContent = "";
  }

  const media = await resolveProjectMedia(project.folder);

  if (!media.length) {
    stream.innerHTML = `
      <div class="project-empty-state">
        Add files like <code>01.jpg</code>, <code>02.jpeg</code>, <code>03.gif</code>, or <code>04.mp4</code>
        inside <code>${escapeHtml(project.folder)}</code> and they will appear here automatically.
      </div>
    `;
    return;
  }

  stream.innerHTML = media
    .map((item) => {
      if (item.type === "video") {
        return `
          <figure class="project-media-frame">
            <video class="project-media" src="${item.url}" controls autoplay muted loop playsinline></video>
          </figure>
        `;
      }

      return `
        <figure class="project-media-frame">
          <img class="project-media" src="${item.url}" alt="" />
        </figure>
      `;
    })
    .join("");
}

markActiveNav();
window.addEventListener("pointermove", movePupils);
window.addEventListener("pointerleave", resetPupils);
animateSkillsBarsOnScroll();
initTopProjectsSwipe();
renderWorkPage();
renderProjectDetailPage();
