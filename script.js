const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const header = document.querySelector("[data-elevate]");
const promoModal = document.querySelector("#promoModal");
const generatedCode = document.querySelector("#generatedCode");
const promoLeadForm = document.querySelector("#promoLeadForm");
const promoCodePanel = document.querySelector("#promoCodePanel");
const promoButtons = document.querySelectorAll("[data-open-promo]");
const closePromoButtons = document.querySelectorAll("[data-close-promo]");
const contactForm = document.querySelector("#contactForm");
const applicationForm = document.querySelector("#applicationForm");
const teamGrid = document.querySelector("[data-editable-team]");
const videoGrid = document.querySelector("[data-video-grid]");
const adminLogin = document.querySelector("#adminLogin");
const adminDashboard = document.querySelector("#adminDashboard");
const adminSettings = document.querySelector("#adminSettings");
const adminContent = document.querySelector("#adminContent");
const adminVideos = document.querySelector("#adminVideos");
const adminLeads = document.querySelector("#adminLeads");
const adminLoginForm = document.querySelector("#adminLoginForm");
const contentEditorForm = document.querySelector("#contentEditorForm");
const adminTeamList = document.querySelector("#adminTeamList");
const teamEditorForm = document.querySelector("#teamEditorForm");
const adminVideoList = document.querySelector("#adminVideoList");
const videoEditorForm = document.querySelector("#videoEditorForm");
const adminLeadsList = document.querySelector("#adminLeadsList");
const adminPrivateSections = document.querySelectorAll("[data-admin-private]");

const recipients = "rachel@premiummg.com.au,edwin@premiummg.com.au";
const contentKey = "pmgSiteContent";
const teamKey = "pmgTeamMembers";
const videoKey = "pmgPromotionVideos";
const leadsKey = "pmgPromotionLeads";
const adminPasscode = "PMG2026";
const rachelPhoto = "assets/rachel-han.png";
const fixedPromoCode = "6MONTHSFREE";

const defaultTeam = [
  {
    name: "Rachel Han",
    title: "Property Manager",
    phone: "0435 567 780",
    email: "rachel@premiummg.com.au",
    photo: rachelPhoto,
  },
  {
    name: "Edwin Lee",
    title: "Principal",
    phone: "0414 322 388",
    email: "edwin@premiummg.com.au",
    photo: "",
  },
];

const defaultContent = {
  heroEyebrow: "Boutique property management for premium investments",
  heroTitle: "Managing Assets. Maximising Value.",
  heroSubtitle: "Professional Property Management Designed Around Exceptional Service.",
  videoSectionTitle: "Agency Promotion Videos",
  promoTitle: "Unlock Premium Benefits",
  promoBody: "Mention this ad and receive up to 6 months free management.*",
  promoFinePrint: "For new managements only. Conditions apply.",
  contactIntro: "Tell us about your property and include any promotion code in the message box.",
};

const defaultVideos = [
  {
    title: "Agency Promotion Video",
    description: "Premium Management Group agency promotion.",
    src: "assets/agency-promotion.mp4",
  },
];

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function siteContent() {
  return { ...defaultContent, ...readJson(contentKey, {}) };
}

function migrateRachelPhoto() {
  const saved = localStorage.getItem(teamKey);
  if (!saved) return;
  const team = readJson(teamKey, defaultTeam);
  const rachel = team.find((member) => member.name === "Rachel Han");
  if (rachel) {
    rachel.photo = rachelPhoto;
    writeJson(teamKey, team);
  }
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderPublicTeam() {
  if (!teamGrid) return;
  const team = readJson(teamKey, defaultTeam);
  teamGrid.innerHTML = team
    .map(
      (member) => `
        <article class="team-card reveal is-visible">
          <div class="team-photo">
            ${
              member.photo
                ? `<img src="${member.photo}" alt="${escapeText(member.name)}" />`
                : `<div class="team-photo-placeholder" aria-label="${escapeText(member.name)} photo placeholder">${initials(member.name)}</div>`
            }
          </div>
          <div>
            <p class="team-role">${escapeText(member.title)}</p>
            <h3>${escapeText(member.name)}</h3>
            <a href="tel:${member.phone.replace(/\\s/g, "")}">${escapeText(member.phone)}</a>
            <a href="mailto:${member.email}?subject=PMG%20Property%20Management%20Enquiry">${escapeText(member.email)}</a>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPublicContent() {
  const content = siteContent();
  document.querySelectorAll("[data-content-field]").forEach((element) => {
    const key = element.dataset.contentField;
    if (content[key]) element.textContent = content[key];
  });
}

function renderPublicVideos() {
  if (!videoGrid) return;
  const videos = readJson(videoKey, defaultVideos);
  if (!videos.length) return;
  videoGrid.innerHTML = videos
    .map(
      (video, index) => `
        <article class="video-card reveal is-visible">
          <video src="${video.src}" controls playsinline preload="metadata"></video>
          <div class="video-card-content">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeText(video.title || "PMG Promotion Video")}</h3>
            <p>${escapeText(video.description || "Premium Management Group agency promotion.")}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function escapeText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function unlockAdmin() {
  if (!adminLogin || !adminContent || !adminVideos) return;
  adminLogin.hidden = true;
  adminPrivateSections.forEach((section) => {
    section.hidden = false;
    section.inert = false;
    section.querySelectorAll("input, textarea, select, button").forEach((control) => {
      control.disabled = false;
    });
  });
  sessionStorage.setItem("pmgAdminUnlocked", "true");
  renderAdminDashboard();
  renderContentEditor();
  renderAdminTeam();
  renderAdminVideos();
  renderAdminLeads();
}

function lockAdmin() {
  if (!adminLogin) return;
  adminLogin.hidden = false;
  adminPrivateSections.forEach((section) => {
    section.hidden = true;
    section.inert = true;
    section.querySelectorAll("input, textarea, select, button").forEach((control) => {
      control.disabled = true;
    });
  });
  sessionStorage.removeItem("pmgAdminUnlocked");
}

function renderAdminDashboard() {
  const team = readJson(teamKey, defaultTeam);
  const videos = readJson(videoKey, []);
  const leads = readJson(leadsKey, []);
  const teamCount = document.querySelector("#teamCount");
  const videoCount = document.querySelector("#videoCount");
  const leadCount = document.querySelector("#leadCount");
  if (teamCount) teamCount.textContent = String(team.length);
  if (videoCount) videoCount.textContent = String(videos.length);
  if (leadCount) leadCount.textContent = String(leads.length);
}

function renderContentEditor() {
  if (!contentEditorForm) return;
  const content = siteContent();
  Object.entries(content).forEach(([key, value]) => {
    if (contentEditorForm.elements[key]) contentEditorForm.elements[key].value = value;
  });
}

function renderAdminTeam() {
  if (!adminTeamList) return;
  const team = readJson(teamKey, defaultTeam);
  adminTeamList.innerHTML = team
    .map(
      (member, index) => `
        <article class="admin-card">
          <div class="team-photo">
            ${
              member.photo
                ? `<img src="${member.photo}" alt="${escapeText(member.name)}" />`
                : `<div class="team-photo-placeholder">${initials(member.name)}</div>`
            }
          </div>
          <h3>${escapeText(member.name)}</h3>
          <p class="team-role">${escapeText(member.title)}</p>
          <p class="admin-muted">${escapeText(member.phone)}<br />${escapeText(member.email)}</p>
          <div class="admin-actions">
            <button class="button secondary" type="button" data-edit-team="${index}">Edit</button>
            <button class="button secondary" type="button" data-delete-team="${index}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAdminVideos() {
  if (!adminVideoList) return;
  const videos = readJson(videoKey, []);
  adminVideoList.innerHTML = videos.length
    ? videos
        .map(
          (video, index) => `
            <article class="admin-card">
              <video src="${video.src}" controls playsinline preload="metadata"></video>
              <h3>${escapeText(video.title || "PMG Promotion Video")}</h3>
              <p class="admin-muted">${escapeText(video.description || "")}</p>
              <div class="admin-actions">
                <button class="button secondary" type="button" data-edit-video="${index}">Edit</button>
                <button class="button secondary" type="button" data-delete-video="${index}">Delete</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="admin-muted">No videos uploaded yet.</p>`;
}

function renderAdminLeads() {
  if (!adminLeadsList) return;
  const leads = readJson(leadsKey, []);
  adminLeadsList.innerHTML = leads.length
    ? `
      <div class="admin-table">
        <div class="admin-table-row admin-table-head">
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Code</span>
          <span>Date</span>
        </div>
        ${leads
          .map(
            (lead) => `
              <div class="admin-table-row">
                <span>${escapeText(lead.name)}</span>
                <span>${escapeText(lead.email)}</span>
                <span>${escapeText(lead.phone)}</span>
                <span>${escapeText(lead.code)}</span>
                <span>${escapeText(lead.createdAt)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `
    : `<p class="admin-muted">No promotion leads recorded yet.</p>`;
}

function setHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function openPromoModal() {
  if (!promoModal || !generatedCode) return;
  generatedCode.textContent = "";
  if (promoLeadForm) promoLeadForm.hidden = false;
  if (promoCodePanel) promoCodePanel.hidden = true;
  promoModal.classList.add("is-open");
  promoModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closePromoModal() {
  if (!promoModal) return;
  promoModal.classList.remove("is-open");
  promoModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function composeMail(subject, fields) {
  const body = Object.entries(fields)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  window.location.href = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.classList.toggle("is-open");
  mobileNav?.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.classList.remove("is-open");
    mobileNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

promoButtons.forEach((button) => button.addEventListener("click", openPromoModal));
closePromoButtons.forEach((button) => button.addEventListener("click", closePromoModal));

promoModal?.addEventListener("click", (event) => {
  if (event.target === promoModal) closePromoModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePromoModal();
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = formValues(contactForm);
  composeMail("PMG Property Management Enquiry", {
    Name: values.name,
    Phone: values.phone,
    Email: values.email,
    "Property Address": values.property,
    Message: values.message,
  });
});

promoLeadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = formValues(promoLeadForm);
  const leads = readJson(leadsKey, []);
  leads.unshift({
    name: values.name,
    email: values.email,
    phone: values.phone,
    code: fixedPromoCode,
    createdAt: new Date().toLocaleString(),
  });
  writeJson(leadsKey, leads);
  generatedCode.textContent = fixedPromoCode;
  promoLeadForm.hidden = true;
  if (promoCodePanel) promoCodePanel.hidden = false;
  renderAdminDashboard();
  renderAdminLeads();
});

applicationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = formValues(applicationForm);
  composeMail("PMG Tenant Application Enquiry", {
    Name: values.name,
    Phone: values.phone,
    Email: values.email,
    "Property Address": values.property,
    "Preferred Move-in Date": values.moveDate,
    "Number of Occupants": values.occupants,
    Message: values.message,
  });
});

migrateRachelPhoto();
renderPublicContent();
renderPublicTeam();
renderPublicVideos();

lockAdmin();

if (sessionStorage.getItem("pmgAdminUnlocked") === "true") {
  unlockAdmin();
}

adminLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = formValues(adminLoginForm);
  if (values.passcode === adminPasscode) {
    unlockAdmin();
  } else {
    alert("Incorrect admin passcode.");
  }
});

contentEditorForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = formValues(contentEditorForm);
  writeJson(contentKey, { ...defaultContent, ...values });
  renderContentEditor();
  alert("Website content saved.");
});

document.querySelector("#resetContent")?.addEventListener("click", () => {
  writeJson(contentKey, defaultContent);
  renderContentEditor();
});

adminTeamList?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-team]");
  const deleteButton = event.target.closest("[data-delete-team]");
  const team = readJson(teamKey, defaultTeam);

  if (editButton && teamEditorForm) {
    const member = team[Number(editButton.dataset.editTeam)];
    teamEditorForm.elements.index.value = editButton.dataset.editTeam;
    teamEditorForm.elements.name.value = member.name;
    teamEditorForm.elements.title.value = member.title;
    teamEditorForm.elements.phone.value = member.phone;
    teamEditorForm.elements.email.value = member.email;
  }

  if (deleteButton) {
    team.splice(Number(deleteButton.dataset.deleteTeam), 1);
    writeJson(teamKey, team);
    renderAdminTeam();
    renderAdminDashboard();
    renderPublicTeam();
  }
});

teamEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = formValues(teamEditorForm);
  const team = readJson(teamKey, defaultTeam);
  const existing = values.index !== "" ? team[Number(values.index)] : {};
  const photo = await fileToDataUrl(teamEditorForm.elements.photo.files[0]);
  const member = {
    name: values.name,
    title: values.title,
    phone: values.phone,
    email: values.email,
    photo: photo || existing.photo || "",
  };

  if (values.index !== "") {
    team[Number(values.index)] = member;
  } else {
    team.push(member);
  }

  writeJson(teamKey, team);
  teamEditorForm.reset();
  teamEditorForm.elements.index.value = "";
  renderAdminTeam();
  renderAdminDashboard();
  renderPublicTeam();
});

document.querySelector("#newTeamMember")?.addEventListener("click", () => {
  teamEditorForm?.reset();
  if (teamEditorForm) teamEditorForm.elements.index.value = "";
});

document.querySelector("#adminLogout")?.addEventListener("click", () => {
  lockAdmin();
});

document.querySelector("#resetTeam")?.addEventListener("click", () => {
  writeJson(teamKey, defaultTeam);
  renderAdminTeam();
  renderAdminDashboard();
  renderPublicTeam();
  teamEditorForm?.reset();
});

adminVideoList?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-video]");
  const deleteButton = event.target.closest("[data-delete-video]");
  const videos = readJson(videoKey, []);

  if (editButton && videoEditorForm) {
    const video = videos[Number(editButton.dataset.editVideo)];
    videoEditorForm.elements.index.value = editButton.dataset.editVideo;
    videoEditorForm.elements.title.value = video.title;
    videoEditorForm.elements.description.value = video.description;
  }

  if (deleteButton) {
    videos.splice(Number(deleteButton.dataset.deleteVideo), 1);
    writeJson(videoKey, videos);
    renderAdminVideos();
    renderAdminDashboard();
  }
});

videoEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = formValues(videoEditorForm);
  const videos = readJson(videoKey, []);
  const existing = values.index !== "" ? videos[Number(values.index)] : {};
  const src = await fileToDataUrl(videoEditorForm.elements.video.files[0]);

  if (!src && !existing.src) {
    alert("Please upload a video file.");
    return;
  }

  const video = {
    title: values.title,
    description: values.description,
    src: src || existing.src,
  };

  if (values.index !== "") {
    videos[Number(values.index)] = video;
  } else {
    videos.push(video);
  }

  writeJson(videoKey, videos);
  videoEditorForm.reset();
  videoEditorForm.elements.index.value = "";
  renderAdminVideos();
  renderAdminDashboard();
});

document.querySelector("#newVideo")?.addEventListener("click", () => {
  videoEditorForm?.reset();
  if (videoEditorForm) videoEditorForm.elements.index.value = "";
});

document.querySelector("#clearVideos")?.addEventListener("click", () => {
  writeJson(videoKey, []);
  renderAdminVideos();
  renderAdminDashboard();
  videoEditorForm?.reset();
});

document.querySelector("#clearLeads")?.addEventListener("click", () => {
  writeJson(leadsKey, []);
  renderAdminLeads();
  renderAdminDashboard();
});

document.querySelector("#exportLeads")?.addEventListener("click", () => {
  const leads = readJson(leadsKey, []);
  const rows = [["Name", "Email", "Phone", "Code", "Date"], ...leads.map((lead) => [lead.name, lead.email, lead.phone, lead.code, lead.createdAt])];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pmg-promotion-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

if (window.location.hash === "#promotion" || new URLSearchParams(window.location.search).get("promo") === "scan") {
  setTimeout(openPromoModal, 450);
}
