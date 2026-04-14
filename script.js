const eyes = document.querySelectorAll(".eye");
const SUPPORTED_MEDIA_EXTENSIONS = ["jpg", "jpeg", "gif", "mp4"];

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

async function resolveProjectCover(folder) {
  for (const extension of SUPPORTED_MEDIA_EXTENSIONS) {
    for (const variant of extensionCandidates(extension)) {
      const url = `${folder}/cover.${variant}`;
      const type = extension === "mp4" ? "video" : "image";
      const exists = await probeMediaCandidate(url, type);

      if (exists) {
        return { url, type };
      }
    }
  }

  return null;
}

async function resolveProjectMedia(folder, maxItems = 30) {
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
  const count = document.querySelector("#project-count");

  if (!grid || !Array.isArray(window.PROJECTS || PROJECTS)) {
    return;
  }

  const projects = window.PROJECTS || PROJECTS;
  count.textContent = String(projects.length).padStart(2, "0");

  const cards = await Promise.all(
    projects.map(async (project) => {
      const cover = (await resolveProjectCover(project.folder)) || (await resolveProjectMedia(project.folder, 1))[0];
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
          <p class="project-card-subtitle">${escapeHtml(project.subtitle)}</p>
          ${coverMarkup}
        </a>
      `;
    })
  );

  grid.innerHTML = cards.join("");
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
  document.querySelector("#project-subtitle").textContent = project.subtitle;
  document.querySelector("#project-description").textContent = project.description;

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
renderWorkPage();
renderProjectDetailPage();
