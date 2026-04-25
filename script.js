const eyes = document.querySelectorAll(".eye");
const SUPPORTED_MEDIA_EXTENSIONS = ["jpg", "jpeg", "gif", "mp4"];
const MEDIA_PROBE_CACHE = new Map();
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
  "graphic-design": ["Graphic Design"],
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

function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (!toggle || !nav) {
    return;
  }

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };

  const openMenu = () => {
    document.body.classList.add("menu-open");
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  };

  toggle.addEventListener("click", () => {
    if (document.body.classList.contains("menu-open")) {
      closeMenu();
      return;
    }

    openMenu();
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMenu();
    }
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
  if (MEDIA_PROBE_CACHE.has(url)) {
    return MEDIA_PROBE_CACHE.get(url);
  }

  const probePromise = new Promise((resolve) => {
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

  MEDIA_PROBE_CACHE.set(url, probePromise);
  return probePromise;
}

function normalizeProjectTitle(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getMediaTypeFromUrl(url) {
  return url.toLowerCase().endsWith(".mp4") ? "video" : "image";
}

// Optimized: Check multiple extensions in parallel for faster detection
async function checkMediaVariants(folder, baseName) {
  const variants = [
    { ext: "jpg", type: "image" },
    { ext: "mp4", type: "video" },
    { ext: "gif", type: "image" },
    { ext: "jpeg", type: "image" },
    { ext: "JPG", type: "image" },
    { ext: "MP4", type: "video" },
  ];

  const probes = variants.map(({ ext, type }) => {
    const url = `${folder}/${baseName}.${ext}`;
    return probeMediaCandidate(url, type)
      .then((exists) => (exists ? { url, type } : null));
  });

  const results = await Promise.all(probes);
  return results.find((r) => r !== null);
}

async function resolveProjectCover(folder) {
  const coverBaseNames = ["cover", "Cover"];

  for (const baseName of coverBaseNames) {
    const result = await checkMediaVariants(folder, baseName);
    if (result) {
      return result;
    }
  }

  return null;
}

async function resolveProjectMedia(project, maxItems = 25) {
  // Fast path: use media list from projects-data.js if available
  if (project.media && Array.isArray(project.media) && project.media.length > 0) {
    return project.media.map((url) => ({
      url,
      type: getMediaTypeFromUrl(url),
    }));
  }

  // Fallback: probe for media files (slower)
  const folder = project.folder;
  const media = [];
  let consecutiveMisses = 0;
  const maxConsecutiveMisses = 2;

  for (let index = 1; index <= maxItems; index += 1) {
    const padded = String(index).padStart(2, "0");
    const result = await checkMediaVariants(folder, padded);

    if (result) {
      media.push(result);
      consecutiveMisses = 0;
    } else {
      consecutiveMisses += 1;
      if (consecutiveMisses >= maxConsecutiveMisses) {
        break;
      }
    }
  }

  return media;
}

// Limit concurrent async operations to avoid network flooding
async function promiseQueue(items, asyncFn, concurrency = 3) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const promise = Promise.resolve().then(() => asyncFn(item)).then((result) => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
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
    grid.classList.remove("work-grid-gallery");

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

    if (filterKey === "graphic-design") {
      grid.classList.add("work-grid-gallery");

      const galleryItems = filteredProjects.flatMap((project) =>
        (project.media || []).map((url) => ({
          title: project.title,
          url,
          type: getMediaTypeFromUrl(url),
          slug: project.slug,
        }))
      );

      if (!galleryItems.length) {
        grid.innerHTML = "";
        return;
      }

      grid.innerHTML = galleryItems
        .map((item) => {
          if (item.type === "video") {
            return `
              <a class="work-gallery-item" href="project.html?slug=${encodeURIComponent(item.slug)}" aria-label="Open ${escapeHtml(item.title)}">
                <video class="work-gallery-media" src="${item.url}" muted playsinline preload="metadata"></video>
              </a>
            `;
          }

          return `
            <a class="work-gallery-item" href="project.html?slug=${encodeURIComponent(item.slug)}" aria-label="Open ${escapeHtml(item.title)}">
              <img class="work-gallery-media" src="${item.url}" alt="${escapeHtml(item.title)} artwork" loading="lazy" decoding="async" />
            </a>
          `;
        })
        .join("");

      return;
    }

    // Limit concurrent cover resolution to avoid network flooding
    const cards = await promiseQueue(
      filteredProjects,
      async (project) => {
        const cover = project.cover
          ? { url: project.cover, type: getMediaTypeFromUrl(project.cover) }
          : await resolveProjectCover(project.folder);
        const coverMarkup = cover
          ? cover.type === "video"
            ? `
            <div class="project-cover">
              <video class="project-cover-media" src="${cover.url}" muted playsinline preload="metadata"></video>
            </div>
          `
            : `
            <div class="project-cover">
              <img class="project-cover-media" src="${cover.url}" alt="${escapeHtml(project.title)} cover image" loading="lazy" decoding="async" />
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
      },
      3
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

  stream.classList.remove("project-media-stream-gallery");

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

  // Show loading state while resolving media
  stream.innerHTML = '<div class="project-loading">Loading project...</div>';

  const media = await resolveProjectMedia(project);

  if (project.slug === "graphic-design") {
    stream.classList.add("project-media-stream-gallery");
  }

  if (!media.length) {
    stream.innerHTML = `
      <div class="project-empty-state">
        Add media files to the <code>media</code> array in <code>projects-data.js</code> for instant loading, or add files like <code>01.jpg</code>, <code>02.jpeg</code>, <code>03.gif</code>, or <code>04.mp4</code>
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
            <video class="project-media" src="${item.url}" controls playsinline preload="metadata"></video>
          </figure>
        `;
      }

      return `
        <figure class="project-media-frame">
          <img class="project-media" src="${item.url}" alt="" decoding="async" />
        </figure>
      `;
    })
    .join("");
}

markActiveNav();
initMobileMenu();
window.addEventListener("pointermove", movePupils);
window.addEventListener("pointerleave", resetPupils);
animateSkillsBarsOnScroll();
initTopProjectsSwipe();
renderWorkPage();
renderProjectDetailPage();
