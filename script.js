const SUPABASE_URL = "https://caqfpahfforgonprcxhd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcWZwYWhmZm9yZ29ucHJjeGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTA0NjQsImV4cCI6MjA5NzA4NjQ2NH0.jJLjEm2l6YDsSZTxC8c0qdRVqF68leOwoG7ayNvQ2VI";

const isAdminPage = document.body.classList.contains("admin-page");

function clearStoredAuth() {
  [localStorage, sessionStorage].forEach((storage) => {
    Object.keys(storage)
      .filter((key) => key.startsWith("sb-") || key.includes("supabase.auth"))
      .forEach((key) => storage.removeItem(key));
  });
}

if (isAdminPage) clearStoredAuth();

const db = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
  },
});

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
const contactVerificationPanel = document.querySelector("#contactVerificationPanel");
const contactSubmitButton = document.querySelector("#contactSubmitButton");
const applicationForm = document.querySelector("#applicationForm");
const teamGrid = document.querySelector("[data-editable-team]");
const videoGrid = document.querySelector("[data-video-grid]");
const promotionImageGrid = document.querySelector("[data-promotion-image-grid]");
const propertyGrids = document.querySelectorAll("[data-property-grid]");
const adminLogin = document.querySelector("#adminLogin");
const adminLoginForm = document.querySelector("#adminLoginForm");
const contentEditorForm = document.querySelector("#contentEditorForm");
const adminTeamList = document.querySelector("#adminTeamList");
const teamEditorForm = document.querySelector("#teamEditorForm");
const adminVideoList = document.querySelector("#adminVideoList");
const videoEditorForm = document.querySelector("#videoEditorForm");
const adminPromotionImageList = document.querySelector("#adminPromotionImageList");
const promotionImageEditorForm = document.querySelector("#promotionImageEditorForm");
const adminPropertyList = document.querySelector("#adminPropertyList");
const propertyEditorForm = document.querySelector("#propertyEditorForm");
const adminLeadsList = document.querySelector("#adminLeadsList");
const adminEnquiriesList = document.querySelector("#adminEnquiriesList");
const adminAnalyticsList = document.querySelector("#adminAnalyticsList");
const adminApplicationsList = document.querySelector("#adminApplicationsList");
const adminPrivateSections = document.querySelectorAll("[data-admin-private]");

const recipients = "rachel@premiummg.com.au,edwin@premiummg.com.au";
const fixedPromoCode = "6MONTHSFREE";
let pendingContactPayload = null;

const defaultContent = {
  heroEyebrow: "Boutique property management for premium investments",
  heroTitle: "Managing Assets. Maximising Value.",
  heroSubtitle: "Professional Property Management Designed Around Exceptional Service.",
  videoSectionTitle: "Agency Promotion Videos",
  imageSectionTitle: "Agency Promotion Images",
  promoTitle: "Unlock Premium Benefits",
  promoBody: "Mention this ad and receive up to 6 months free management.*",
  promoFinePrint: "For new managements only. Conditions apply.",
  contactIntro: "Tell us about your property and include any promotion code in the message box.",
};

const fallbackTeam = [
  {
    id: "fallback-rachel",
    name: "Rachel Han",
    title: "Senior Property Manager",
    phone: "0435 567 780",
    email: "rachel@premiummg.com.au",
    photo_url: "assets/rachel-han-office.png",
    bio:
      "For more than 12 years, Rachel Han has worked with property owners across Sydney, helping them manage and maintain investment properties with confidence.\n\nThroughout her career, Rachel has managed various sizes of property portfolios across Sydney, working with a wide range of investors both residential and commercial properties. Her experience has given her a strong understanding of the day-to-day responsibilities of property management, as well as the importance of communication, organisation and consistency in achieving long-term results.\n\nRachel is known for her approachable nature, attention to detail and practical approach to problem solving. She believes that successful property management comes from understanding each client's expectations, responding promptly and maintaining strong relationships with both landlords and tenants.\n\nAs Senior Property Manager at Premium Management Group, Rachel works closely with every client to ensure their property is managed with professionalism, care and attention to detail, giving owners confidence that their investment is in experienced hands.",
  },
  {
    id: "fallback-edwin",
    name: "Edwin Lee",
    title: "Principal",
    phone: "0414 322 388",
    email: "edwin@premiummg.com.au",
    photo_url: "assets/edwin-lee.png",
    bio:
      "With over 30 years of experience in the real estate industry, Edwin Lee has built a career spanning residential property sales, commercial property management, and investment property advice.\n\nEdwin's introduction to real estate came through the family business, where he worked alongside his father and developed a practical understanding of the industry early in his career. Over the years, he has worked with homeowners, investors and commercial property owners across a wide range of transactions, earning a reputation for honest advice and long term relationships.\n\nToday, Edwin is the Founder and Managing Director of Premium Management Group, specialising in Property Sales, Residential and Commercial Property Management. His broad industry experience allows him to understand not only the transaction itself, but also the long-term goals behind every property decision.\n\nClients value Edwin for his straightforward approach, clear communication and ability to navigate both straightforward and complex property matters with confidence. Whether representing a property sale or overseeing a commercial asset, his focus remains the same to provide reliable advice, strong representation, and a level of service clients can rely on.",
  },
  {
    id: "fallback-james",
    name: "James Mitchell",
    title: "Office Support",
    phone: "",
    email: "info@premiummg.com.au",
    photo_url: "",
    bio:
      "James joined Premium Management Group (PMG) bringing several years of administrative and customer service experience across the property and real estate sector. He plays a key role in keeping the agency's day-to-day operations running smoothly - coordinating documentation, liaising with landlords, tenants and external agencies, and ensuring nothing falls through the cracks during busy periods. Known for his organisational skills and calm, professional manner, James is a trusted point of contact for clients seeking timely and accurate support. Outside of his administrative role, he has a strong interest in process improvement and is always looking for ways to make the client experience simpler and more efficient.",
  },
];

const fallbackVideos = [
  {
    id: "fallback-video",
    title: "Agency Promotion Video",
    description: "Premium Management Group agency promotion.",
    video_url: "assets/agency-promotion.mp4",
  },
];

const fallbackPromotionImages = [
  {
    id: "fallback-promotion-image-01",
    title: "Premium Outdoor Campaign",
    description: "PMG street-level promotion across high-traffic Sydney locations.",
    image_url: "assets/promotion-ad-street-01.jpeg",
    link_url: "",
  },
  {
    id: "fallback-promotion-image-02",
    title: "Premium Brand Visibility",
    description: "Luxury property management advertising designed for landlord confidence.",
    image_url: "assets/promotion-ad-street-02.jpeg",
    link_url: "",
  },
];

const propertyStatusLabels = {
  "for lease": "For Lease",
  "for sale": "For Sale",
  sold: "Sold",
  "under application": "Under Application",
  "deposit taken": "Deposit Taken",
};

function escapeText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function teamPhotoUrl(member) {
  if (String(member.name || "").toLowerCase().includes("rachel han")) return "assets/rachel-han-office.png";
  if (member.photo_url) return member.photo_url;
  if (String(member.name || "").toLowerCase().includes("edwin lee")) return "assets/edwin-lee.png";
  return "";
}

function teamPhotoClass(member) {
  const name = String(member.name || "").toLowerCase();
  if (name.includes("edwin lee")) return "team-photo is-edwin";
  if (name.includes("rachel han")) return "team-photo is-rachel";
  return "team-photo";
}

function teamBio(member) {
  const name = String(member.name || "").toLowerCase();
  const fallback = fallbackTeam.find((item) => item.name.toLowerCase() === name);
  return member.bio || fallback?.bio || "";
}

function teamTitle(member) {
  const name = String(member.name || "").toLowerCase();
  if (name.includes("rachel han")) return "Senior Property Manager";
  if (name.includes("edwin lee")) return "Principal";
  return member.title || "";
}

function bioParagraphs(value) {
  return String(value || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeText(paragraph)}</p>`)
    .join("");
}

function setHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

async function getSiteContent() {
  if (!db) return defaultContent;
  const { data, error } = await db.from("site_content").select("key,value");
  if (error || !data) return defaultContent;
  return {
    ...defaultContent,
    ...Object.fromEntries(data.map((row) => [row.key, row.value])),
  };
}

async function getTeamMembers(includeInactive = false) {
  if (!db) return fallbackTeam;
  let query = db.from("team_members").select("*").order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error || !data || !data.length) return fallbackTeam;
  if (includeInactive) return data;
  const existingNames = new Set(data.map((member) => String(member.name || "").toLowerCase()));
  const missingFallbackMembers = fallbackTeam.filter((member) => !existingNames.has(member.name.toLowerCase()));
  return [...data, ...missingFallbackMembers];
}

async function getVideos(includeInactive = false) {
  if (!db) return fallbackVideos;
  let query = db.from("videos").select("*").order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (includeInactive) return error || !data ? [] : data;
  if (error || !data) return fallbackVideos;
  return data;
}

async function getPromotionImages(includeInactive = false) {
  if (!db) return includeInactive ? [] : fallbackPromotionImages;
  let query = db.from("promotion_images").select("*").order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (includeInactive) return error || !data ? [] : data;
  if (error || !data || !data.length) return fallbackPromotionImages;
  return data;
}

async function getProperties(includeInactive = false) {
  if (!db) return [];
  let query = db.from("properties").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  return error || !data ? [] : data;
}

function renderContent(content) {
  document.querySelectorAll("[data-content-field]").forEach((element) => {
    const key = element.dataset.contentField;
    if (content[key]) element.textContent = content[key];
  });
}

async function renderPublicContent() {
  renderContent(await getSiteContent());
}

async function renderPublicTeam() {
  if (!teamGrid) return;
  const team = await getTeamMembers(false);
  teamGrid.innerHTML = team
    .map(
      (member) => `
        <article class="team-card${teamPhotoUrl(member) ? "" : " no-photo"} reveal is-visible">
          ${
            teamPhotoUrl(member)
              ? `<div class="${teamPhotoClass(member)}"><img src="${teamPhotoUrl(member)}" alt="${escapeText(member.name)}" /></div>`
              : ""
          }
          <div>
            <p class="team-role">${escapeText(teamTitle(member))}</p>
            <h3>${escapeText(member.name)}</h3>
            ${teamBio(member) ? `<div class="team-bio">${bioParagraphs(teamBio(member))}</div>` : ""}
            ${member.phone ? `<a href="tel:${String(member.phone || "").replace(/\s/g, "")}">${escapeText(member.phone)}</a>` : ""}
            ${member.email ? `<a href="mailto:${member.email}?subject=PMG%20Property%20Management%20Enquiry">${escapeText(member.email)}</a>` : ""}
          </div>
        </article>
      `
    )
    .join("");
}

async function renderPublicVideos() {
  if (!videoGrid) return;
  const videos = await getVideos(false);
  if (!videos.length) {
    videoGrid.innerHTML = "";
    return;
  }
  videoGrid.innerHTML = videos
    .map(
      (video, index) => `
        <article class="video-card reveal is-visible">
          <video src="${video.video_url}" controls playsinline preload="metadata"></video>
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

async function renderPublicPromotionImages() {
  if (!promotionImageGrid) return;
  const images = await getPromotionImages(false);
  if (!images.length) {
    promotionImageGrid.innerHTML = "";
    return;
  }
  promotionImageGrid.innerHTML = images
    .map((image, index) => {
      const imageMarkup = `
        <img src="${image.image_url}" alt="${escapeText(image.title || "PMG promotion image")}" loading="lazy" />
        <div class="promotion-image-card-content">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeText(image.title || "PMG Promotion Image")}</h3>
          <p>${escapeText(image.description || "")}</p>
        </div>
      `;
      return `
        <article class="promotion-image-card reveal is-visible">
          ${
            image.link_url
              ? `<a href="${escapeText(image.link_url)}" target="_blank" rel="noopener">${imageMarkup}</a>`
              : imageMarkup
          }
        </article>
      `;
    })
    .join("");
}

function propertyPhoto(property) {
  const photos = Array.isArray(property.photo_urls) ? property.photo_urls : [];
  return photos[0] || "";
}

function propertyStatusText(status) {
  return propertyStatusLabels[String(status || "").toLowerCase()] || status || "Available";
}

async function renderPublicProperties() {
  if (!propertyGrids.length) return;
  const properties = await getProperties(false);
  propertyGrids.forEach((grid) => {
    const listingType = grid.dataset.propertyGrid;
    const items = properties.filter((property) => property.listing_type === listingType);
    grid.innerHTML = items.length
      ? items
          .map((property) => {
            const photo = propertyPhoto(property);
            return `
              <article class="property-card reveal is-visible">
                <div class="property-media">
                  ${photo ? `<img src="${photo}" alt="${escapeText(property.address)}" loading="lazy" />` : ""}
                  <span class="property-status">${escapeText(propertyStatusText(property.status))}</span>
                </div>
                <div class="property-content">
                  <h3>${escapeText(property.address)}</h3>
                  ${property.price ? `<p class="property-price">${escapeText(property.price)}</p>` : ""}
                  ${property.description ? `<p>${escapeText(property.description)}</p>` : ""}
                  ${
                    property.floorplan_url
                      ? `<div class="property-actions"><a class="property-floorplan-link" href="${property.floorplan_url}" target="_blank" rel="noopener">View Floorplan</a></div>`
                      : ""
                  }
                </div>
              </article>
            `;
          })
          .join("")
      : `<article class="property-empty reveal is-visible"><p>Current ${listingType === "for_lease" ? "leasing" : "sales"} opportunities will be updated soon.</p></article>`;
  });
}

function lockAdmin() {
  if (!adminLogin) return;
  document.body.classList.add("admin-locked");
  adminLogin.hidden = false;
  adminPrivateSections.forEach((section) => {
    section.hidden = true;
    section.inert = true;
    section.querySelectorAll("input, textarea, select, button").forEach((control) => {
      control.disabled = true;
    });
  });
}

async function unlockAdmin() {
  if (!adminLogin) return;
  document.body.classList.remove("admin-locked");
  adminLogin.hidden = true;
  adminPrivateSections.forEach((section) => {
    section.hidden = false;
    section.inert = false;
    section.querySelectorAll("input, textarea, select, button").forEach((control) => {
      control.disabled = false;
    });
  });
  await renderAdminDashboard();
  await renderContentEditor();
  await renderAdminTeam();
  await renderAdminProperties();
  await renderAdminVideos();
  await renderAdminPromotionImages();
  await renderAdminLeads();
  await renderAdminEnquiries();
  await renderAdminAnalytics();
  await renderAdminApplications();
}

async function renderAdminDashboard() {
  const team = await getTeamMembers(true);
  const videos = await getVideos(true);
  const images = await getPromotionImages(true);
  const properties = await getProperties(true);
  const leads = await getPromotionLeads();
  const enquiries = await getEnquiries();
  const pageViews = await getPageViews();
  const applications = await getApplications();
  document.querySelector("#teamCount") && (document.querySelector("#teamCount").textContent = String(team.length));
  document.querySelector("#videoCount") && (document.querySelector("#videoCount").textContent = String(videos.length));
  document.querySelector("#imageCount") && (document.querySelector("#imageCount").textContent = String(images.length));
  document.querySelector("#propertyCount") && (document.querySelector("#propertyCount").textContent = String(properties.length));
  document.querySelector("#leadCount") && (document.querySelector("#leadCount").textContent = String(leads.length));
  document.querySelector("#enquiryCount") && (document.querySelector("#enquiryCount").textContent = String(enquiries.length));
  document.querySelector("#viewCount") && (document.querySelector("#viewCount").textContent = String(pageViews.length));
  document.querySelector("#applicationCount") && (document.querySelector("#applicationCount").textContent = String(applications.length));
}

async function renderContentEditor() {
  if (!contentEditorForm) return;
  const content = await getSiteContent();
  Object.entries(content).forEach(([key, value]) => {
    if (contentEditorForm.elements[key]) contentEditorForm.elements[key].value = value;
  });
}

async function renderAdminTeam() {
  if (!adminTeamList) return;
  const team = await getTeamMembers(true);
  adminTeamList.innerHTML = team
    .map(
      (member) => `
        <article class="admin-card">
          <div class="${teamPhotoClass(member)}">
            ${
              teamPhotoUrl(member)
                ? `<img src="${teamPhotoUrl(member)}" alt="${escapeText(member.name)}" />`
                : `<div class="team-photo-placeholder">${initials(member.name)}</div>`
            }
          </div>
          <h3>${escapeText(member.name)}</h3>
          <p class="team-role">${escapeText(teamTitle(member))}</p>
          ${teamBio(member) ? `<div class="team-bio admin-team-bio">${bioParagraphs(teamBio(member))}</div>` : ""}
          <p class="admin-muted">${escapeText(member.phone)}<br />${escapeText(member.email)}</p>
          <div class="admin-actions">
            <button class="button secondary" type="button" data-edit-team="${member.id}">Edit</button>
            <button class="button secondary" type="button" data-delete-team="${member.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");
}

async function renderAdminVideos() {
  if (!adminVideoList) return;
  const videos = await getVideos(true);
  adminVideoList.innerHTML = videos.length
    ? videos
        .map(
          (video) => `
            <article class="admin-card">
              <video src="${video.video_url}" controls playsinline preload="metadata"></video>
              <h3>${escapeText(video.title || "PMG Promotion Video")}</h3>
              <p class="admin-muted">${escapeText(video.description || "")}</p>
              <div class="admin-actions">
                <button class="button secondary" type="button" data-edit-video="${video.id}">Edit</button>
                <button class="button secondary" type="button" data-delete-video="${video.id}">Delete</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="admin-muted">No videos uploaded yet.</p>`;
}

async function renderAdminPromotionImages() {
  if (!adminPromotionImageList) return;
  const images = await getPromotionImages(true);
  adminPromotionImageList.innerHTML = images.length
    ? images
        .map(
          (image) => `
            <article class="admin-card">
              <img src="${image.image_url}" alt="${escapeText(image.title || "PMG Promotion Image")}" />
              <h3>${escapeText(image.title || "PMG Promotion Image")}</h3>
              <p class="admin-muted">${escapeText(image.description || "")}</p>
              ${image.link_url ? `<p class="admin-muted">${escapeText(image.link_url)}</p>` : ""}
              <div class="admin-actions">
                <button class="button secondary" type="button" data-edit-promotion-image="${image.id}">Edit</button>
                <button class="button secondary" type="button" data-delete-promotion-image="${image.id}">Delete</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="admin-muted">No promotion images uploaded yet.</p>`;
}

async function renderAdminProperties() {
  if (!adminPropertyList) return;
  const properties = await getProperties(true);
  adminPropertyList.innerHTML = properties.length
    ? properties
        .map(
          (property) => `
            <article class="admin-card">
              ${propertyPhoto(property) ? `<img src="${propertyPhoto(property)}" alt="${escapeText(property.address)}" />` : ""}
              <h3>${escapeText(property.address || "Property Listing")}</h3>
              <p class="team-role">${escapeText(propertyStatusText(property.status))}</p>
              <p class="admin-muted">
                ${escapeText(property.listing_type === "for_sale" ? "For Sale" : "For Lease")}<br />
                ${escapeText(property.price || "")}
              </p>
              <div class="admin-actions">
                <button class="button secondary" type="button" data-edit-property="${property.id}">Edit</button>
                <button class="button secondary" type="button" data-delete-property="${property.id}">Delete</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="admin-muted">No properties added yet.</p>`;
}

async function getPromotionLeads() {
  if (!db) return [];
  const { data, error } = await db.from("promotion_leads").select("*").order("created_at", { ascending: false });
  return error || !data ? [] : data;
}

async function getEnquiries() {
  if (!db) return [];
  const { data, error } = await db.from("enquiries").select("*").order("created_at", { ascending: false });
  return error || !data ? [] : data;
}

async function getPageViews() {
  if (!db) return [];
  const { data, error } = await db.from("page_views").select("*").order("created_at", { ascending: false }).limit(500);
  return error || !data ? [] : data;
}

async function getApplications() {
  if (!db) return [];
  const { data, error } = await db.from("tenant_applications").select("*").order("created_at", { ascending: false });
  return error || !data ? [] : data;
}

async function renderAdminLeads() {
  if (!adminLeadsList) return;
  const leads = await getPromotionLeads();
  adminLeadsList.innerHTML = leads.length
    ? `
      <div class="admin-table">
        <div class="admin-table-row admin-table-head">
          <span>Name</span><span>Email</span><span>Phone</span><span>Code</span><span>Date</span>
        </div>
        ${leads
          .map(
            (lead) => `
              <div class="admin-table-row">
                <span>${escapeText(lead.name)}</span>
                <span>${escapeText(lead.email)}</span>
                <span>${escapeText(lead.phone)}</span>
                <span>${escapeText(lead.code)}</span>
                <span>${escapeText(new Date(lead.created_at).toLocaleString())}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `
    : `<p class="admin-muted">No promotion leads recorded yet.</p>`;
}

async function renderAdminEnquiries() {
  if (!adminEnquiriesList) return;
  const enquiries = await getEnquiries();
  adminEnquiriesList.innerHTML = enquiries.length
    ? `
      <div class="admin-table">
        <div class="admin-table-row admin-table-head">
          <span>Date</span><span>Name</span><span>Email</span><span>Phone</span><span>Location</span><span>IP Ref</span><span>Action</span>
        </div>
        ${enquiries
          .map(
            (item) => `
              <div class="admin-table-row">
                <span>${escapeText(new Date(item.created_at).toLocaleString())}</span>
                <span>${escapeText(item.name)}</span>
                <span>${escapeText(item.email)}</span>
                <span>${escapeText(item.phone)}</span>
                <span>${escapeText([item.city, item.region, item.country].filter(Boolean).join(", ") || "Unknown")}</span>
                <span>${escapeText(String(item.ip_hash || "").slice(0, 10) || "N/A")}</span>
                <span><button class="button secondary compact" type="button" data-delete-enquiry="${item.id}">Delete</button></span>
              </div>
            `
          )
          .join("")}
      </div>
    `
    : `<p class="admin-muted">No website enquiries recorded yet.</p>`;
}

function groupCounts(items, keyFn) {
  return [...items.reduce((map, item) => {
    const key = keyFn(item) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map())].sort((a, b) => b[1] - a[1]);
}

async function renderAdminAnalytics() {
  if (!adminAnalyticsList) return;
  const views = await getPageViews();
  const topLocations = groupCounts(views, (item) => [item.city, item.region, item.country].filter(Boolean).join(", ")).slice(0, 8);
  const topPages = groupCounts(views, (item) => item.path).slice(0, 8);
  adminAnalyticsList.innerHTML = views.length
    ? `
      <div class="admin-analytics-grid">
        <article class="admin-card">
          <h3>Top Locations</h3>
          ${topLocations.map(([label, count]) => `<p class="admin-muted">${escapeText(label)}: ${count}</p>`).join("")}
        </article>
        <article class="admin-card">
          <h3>Top Pages</h3>
          ${topPages.map(([label, count]) => `<p class="admin-muted">${escapeText(label)}: ${count}</p>`).join("")}
        </article>
      </div>
      <div class="admin-table">
        <div class="admin-table-row admin-table-head admin-analytics-row">
          <span>Date</span><span>Page</span><span>Location</span><span>IP Ref</span><span>Referrer</span><span>Action</span>
        </div>
        ${views
          .slice(0, 120)
          .map(
            (item) => `
              <div class="admin-table-row admin-analytics-row">
                <span>${escapeText(new Date(item.created_at).toLocaleString())}</span>
                <span>${escapeText(item.path)}</span>
                <span>${escapeText([item.city, item.region, item.country].filter(Boolean).join(", ") || "Unknown")}</span>
                <span>${escapeText(String(item.ip_hash || "").slice(0, 10) || "N/A")}</span>
                <span>${escapeText(item.referrer || "")}</span>
                <span><button class="button secondary compact" type="button" data-delete-page-view="${item.id}">Delete</button></span>
              </div>
            `
          )
          .join("")}
      </div>
    `
    : `<p class="admin-muted">No page views recorded yet. Analytics will appear after the live website receives traffic.</p>`;
}

async function renderAdminApplications() {
  if (!adminApplicationsList) return;
  const applications = await getApplications();
  adminApplicationsList.innerHTML = applications.length
    ? `
      <div class="admin-table">
        <div class="admin-table-row admin-table-head">
          <span>Name</span><span>Email</span><span>Phone</span><span>Address</span><span>Action</span>
        </div>
        ${applications
          .map(
            (item) => `
              <div class="admin-table-row">
                <span>${escapeText(item.applicant_name)}</span>
                <span>${escapeText(item.email)}</span>
                <span>${escapeText(item.phone)}</span>
                <span>${escapeText(item.property_address)}</span>
                <span><button class="button secondary compact" type="button" data-delete-application="${item.id}">Delete</button></span>
              </div>
            `
          )
          .join("")}
      </div>
    `
    : `<p class="admin-muted">No tenant applications recorded yet.</p>`;
}

async function uploadPublicFile(bucket, file) {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  let { error } = await db.storage.from(bucket).upload(path, file, { upsert: true });
  let targetBucket = bucket;
  if (error && bucket === "team-photos") {
    targetBucket = "Team Photos";
    ({ error } = await db.storage.from(targetBucket).upload(path, file, { upsert: true }));
  }
  if (error) throw error;
  return db.storage.from(targetBucket).getPublicUrl(path).data.publicUrl;
}

async function postEmailApi(body) {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    let message = text || "Email notification failed.";
    try {
      const result = JSON.parse(text);
      message = result.error || result.message || JSON.stringify(result);
    } catch {
      if ((response.status === 404 || response.status === 405 || response.status === 501) && location.hostname === "127.0.0.1") {
        message = "Email verification needs the Vercel API and cannot run from the local Python preview. Please test this form on the live Vercel site after deployment.";
      }
    }
    throw new Error(message);
  }
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : { ok: true };
  } catch {
    return { ok: true };
  }
}

async function sendEmailNotification(type, payload, options = {}) {
  return postEmailApi({ type, payload, ...options });
}

async function requestEnquiryVerification(payload) {
  return postEmailApi({ action: "request-enquiry-verification", payload });
}

function trackPageView() {
  if (isAdminPage || location.hostname === "127.0.0.1") return;
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      path: `${location.pathname}${location.search}${location.hash}`,
      referrer: document.referrer,
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      language: navigator.language,
    }),
  }).catch(() => {});
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
promoModal?.addEventListener("click", (event) => event.target === promoModal && closePromoModal());
document.addEventListener("keydown", (event) => event.key === "Escape" && closePromoModal());

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = formValues(contactForm);
  const payload = {
    Name: values.name,
    Phone: values.phone,
    Email: values.email,
    "Property Address": values.property,
    Message: values.message,
    website: values.website,
    _page_path: `${location.pathname}${location.search}${location.hash}`,
    _referrer: document.referrer,
  };

  try {
    if (!pendingContactPayload) {
      if (contactSubmitButton) contactSubmitButton.disabled = true;
      await requestEnquiryVerification(payload);
      pendingContactPayload = payload;
      if (contactVerificationPanel) contactVerificationPanel.hidden = false;
      if (contactSubmitButton) {
        contactSubmitButton.textContent = "Verify & Submit Enquiry";
        contactSubmitButton.disabled = false;
      }
      alert("A verification code has been sent to your email. Please enter the code to submit your enquiry.");
      return;
    }

    if (!values.verification_code) {
      alert("Please enter the verification code sent to your email.");
      return;
    }

    await sendEmailNotification("enquiry", pendingContactPayload, { code: values.verification_code });
    alert("Thank you. Your enquiry has been submitted.");
    pendingContactPayload = null;
    contactForm.reset();
    if (contactVerificationPanel) contactVerificationPanel.hidden = true;
    if (contactSubmitButton) contactSubmitButton.textContent = "Send Verification Code";
    await renderAdminDashboard();
    await renderAdminEnquiries();
  } catch (error) {
    if (contactSubmitButton) contactSubmitButton.disabled = false;
    alert(`Your enquiry could not be sent automatically. Please try again or contact PMG directly. ${error.message}`);
  }
});

promoLeadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = formValues(promoLeadForm);
  if (db) {
    await db.from("promotion_leads").insert({
      name: values.name,
      email: values.email,
      phone: values.phone,
      code: fixedPromoCode,
    });
  }
  try {
    await sendEmailNotification("promotion", {
      Name: values.name,
      Email: values.email,
      Phone: values.phone,
      Code: fixedPromoCode,
    });
  } catch (error) {
    console.warn("Promotion email notification failed", error);
  }
  generatedCode.textContent = fixedPromoCode;
  promoLeadForm.hidden = true;
  promoLeadForm.reset();
  if (promoCodePanel) promoCodePanel.hidden = false;
  await renderAdminDashboard();
  await renderAdminLeads();
});

applicationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = formValues(applicationForm);
  if (db) {
    await db.from("tenant_applications").insert({
      applicant_name: values.name,
      phone: values.phone,
      email: values.email,
      property_address: values.property,
      data: values,
    });
    try {
      await sendEmailNotification("application", {
        Name: values.name,
        Phone: values.phone,
        Email: values.email,
        "Property Address": values.property,
        "Preferred Move-in Date": values.moveDate,
        Occupants: values.occupants,
        Message: values.message,
      });
    } catch (error) {
      console.warn("Application email notification failed", error);
    }
    alert("Thank you. Your application enquiry has been submitted.");
    applicationForm.reset();
    await renderAdminDashboard();
    await renderAdminApplications();
    return;
  }
  alert("Your application could not be submitted automatically. Please try again or contact PMG directly.");
});

adminLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!db) {
    alert("Supabase client is unavailable.");
    return;
  }
  const values = formValues(adminLoginForm);
  const { error } = await db.auth.signInWithPassword({ email: values.email, password: values.password });
  if (error) {
    alert(error.message);
    return;
  }
  await unlockAdmin();
});

document.querySelector("#adminLogout")?.addEventListener("click", async () => {
  if (db) await db.auth.signOut();
  clearStoredAuth();
  adminLoginForm?.reset();
  lockAdmin();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

contentEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = formValues(contentEditorForm);
  const rows = Object.entries({ ...defaultContent, ...values }).map(([key, value]) => ({ key, value }));
  const { error } = await db.from("site_content").upsert(rows, { onConflict: "key" });
  if (error) {
    alert(error.message);
    return;
  }
  alert("Website content saved.");
  await renderPublicContent();
});

document.querySelector("#resetContent")?.addEventListener("click", async () => {
  const rows = Object.entries(defaultContent).map(([key, value]) => ({ key, value }));
  await db.from("site_content").upsert(rows, { onConflict: "key" });
  await renderContentEditor();
  await renderPublicContent();
});

adminTeamList?.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-team]");
  const deleteButton = event.target.closest("[data-delete-team]");
  if (editButton && teamEditorForm) {
    const team = await getTeamMembers(true);
    const member = team.find((item) => item.id === editButton.dataset.editTeam);
    if (!member) return;
    teamEditorForm.elements.index.value = member.id;
    teamEditorForm.elements.name.value = member.name;
    teamEditorForm.elements.title.value = member.title;
    teamEditorForm.elements.phone.value = member.phone || "";
    teamEditorForm.elements.email.value = member.email || "";
    teamEditorForm.elements.bio.value = teamBio(member);
  }
  if (deleteButton) {
    await db.from("team_members").delete().eq("id", deleteButton.dataset.deleteTeam);
    await renderAdminTeam();
    await renderAdminDashboard();
    await renderPublicTeam();
  }
});

teamEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = formValues(teamEditorForm);
  const id = values.index;
  let photoUrl = "";
  const file = teamEditorForm.elements.photo.files[0];
  if (file) photoUrl = await uploadPublicFile("team-photos", file);
  const row = {
    name: values.name,
    title: values.title,
    phone: values.phone,
    email: values.email,
    bio: values.bio,
    is_active: true,
  };
  if (photoUrl) row.photo_url = photoUrl;
  if (id) {
    await db.from("team_members").update(row).eq("id", id);
  } else {
    row.sort_order = (await getTeamMembers(true)).length + 1;
    await db.from("team_members").insert(row);
  }
  teamEditorForm.reset();
  teamEditorForm.elements.index.value = "";
  await renderAdminTeam();
  await renderAdminDashboard();
  await renderPublicTeam();
});

document.querySelector("#newTeamMember")?.addEventListener("click", () => {
  teamEditorForm?.reset();
  if (teamEditorForm) teamEditorForm.elements.index.value = "";
});

document.querySelector("#resetTeam")?.addEventListener("click", async () => {
  alert("Default team reset is disabled for the live database. Please edit members directly.");
});

adminVideoList?.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-video]");
  const deleteButton = event.target.closest("[data-delete-video]");
  if (editButton && videoEditorForm) {
    const videos = await getVideos(true);
    const video = videos.find((item) => item.id === editButton.dataset.editVideo);
    if (!video) return;
    videoEditorForm.elements.index.value = video.id;
    videoEditorForm.elements.title.value = video.title;
    videoEditorForm.elements.description.value = video.description || "";
  }
  if (deleteButton) {
    const { error } = await db.from("videos").delete().eq("id", deleteButton.dataset.deleteVideo);
    if (error) {
      alert(`Video could not be deleted: ${error.message}`);
      return;
    }
    await renderAdminVideos();
    await renderAdminDashboard();
    await renderPublicVideos();
  }
});

videoEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const values = formValues(videoEditorForm);
    const id = values.index;
    let videoUrl = "";
    const file = videoEditorForm.elements.video.files[0];
    if (file && file.size > 50 * 1024 * 1024) {
      alert("This video is larger than the current Supabase upload limit of 50 MB. Please compress it or upload a smaller file.");
      return;
    }
    if (file) videoUrl = await uploadPublicFile("promotion-videos", file);
    const row = {
      title: values.title,
      description: values.description,
      is_active: true,
    };
    if (videoUrl) row.video_url = videoUrl;
    if (id) {
      const { error } = await db.from("videos").update(row).eq("id", id);
      if (error) throw error;
    } else {
      if (!videoUrl) {
        alert("Please upload a video file.");
        return;
      }
      row.sort_order = (await getVideos(true)).length + 1;
      const { error } = await db.from("videos").insert(row);
      if (error) throw error;
    }
    videoEditorForm.reset();
    videoEditorForm.elements.index.value = "";
    await renderAdminVideos();
    await renderAdminDashboard();
    await renderPublicVideos();
    alert("Video saved.");
  } catch (error) {
    alert(`Video could not be saved: ${error.message || error}`);
  }
});

document.querySelector("#newVideo")?.addEventListener("click", () => {
  videoEditorForm?.reset();
  if (videoEditorForm) videoEditorForm.elements.index.value = "";
});

document.querySelector("#clearVideos")?.addEventListener("click", async () => {
  const { error } = await db.from("videos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    alert(`Videos could not be cleared: ${error.message}`);
    return;
  }
  await renderAdminVideos();
  await renderAdminDashboard();
  await renderPublicVideos();
});

adminPromotionImageList?.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-promotion-image]");
  const deleteButton = event.target.closest("[data-delete-promotion-image]");
  if (editButton && promotionImageEditorForm) {
    const images = await getPromotionImages(true);
    const image = images.find((item) => item.id === editButton.dataset.editPromotionImage);
    if (!image) return;
    promotionImageEditorForm.elements.index.value = image.id;
    promotionImageEditorForm.elements.title.value = image.title;
    promotionImageEditorForm.elements.description.value = image.description || "";
    promotionImageEditorForm.elements.link_url.value = image.link_url || "";
  }
  if (deleteButton) {
    const { error } = await db.from("promotion_images").delete().eq("id", deleteButton.dataset.deletePromotionImage);
    if (error) {
      alert(`Promotion image could not be deleted: ${error.message}`);
      return;
    }
    await renderAdminPromotionImages();
    await renderAdminDashboard();
    await renderPublicPromotionImages();
  }
});

promotionImageEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const values = formValues(promotionImageEditorForm);
    const id = values.index;
    let imageUrl = "";
    const file = promotionImageEditorForm.elements.image.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      alert("This image is larger than 10 MB. Please compress it or upload a smaller image.");
      return;
    }
    if (file) imageUrl = await uploadPublicFile("promotion-images", file);
    const row = {
      title: values.title,
      description: values.description,
      link_url: values.link_url || null,
      is_active: true,
    };
    if (imageUrl) row.image_url = imageUrl;
    if (id) {
      const { error } = await db.from("promotion_images").update(row).eq("id", id);
      if (error) throw error;
    } else {
      if (!imageUrl) {
        alert("Please upload an image file.");
        return;
      }
      row.sort_order = (await getPromotionImages(true)).length + 1;
      const { error } = await db.from("promotion_images").insert(row);
      if (error) throw error;
    }
    promotionImageEditorForm.reset();
    promotionImageEditorForm.elements.index.value = "";
    await renderAdminPromotionImages();
    await renderAdminDashboard();
    await renderPublicPromotionImages();
    alert("Promotion image saved.");
  } catch (error) {
    alert(`Promotion image could not be saved: ${error.message || error}`);
  }
});

document.querySelector("#newPromotionImage")?.addEventListener("click", () => {
  promotionImageEditorForm?.reset();
  if (promotionImageEditorForm) promotionImageEditorForm.elements.index.value = "";
});

document.querySelector("#clearPromotionImages")?.addEventListener("click", async () => {
  if (!confirm("Delete all promotion images? This cannot be undone.")) return;
  const { error } = await db.from("promotion_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    alert(`Promotion images could not be cleared: ${error.message}`);
    return;
  }
  await renderAdminPromotionImages();
  await renderAdminDashboard();
  await renderPublicPromotionImages();
});

adminPropertyList?.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-property]");
  const deleteButton = event.target.closest("[data-delete-property]");
  if (editButton && propertyEditorForm) {
    const properties = await getProperties(true);
    const property = properties.find((item) => item.id === editButton.dataset.editProperty);
    if (!property) return;
    propertyEditorForm.elements.index.value = property.id;
    propertyEditorForm.elements.listing_type.value = property.listing_type || "for_lease";
    propertyEditorForm.elements.status.value = property.status || "for lease";
    propertyEditorForm.elements.address.value = property.address || "";
    propertyEditorForm.elements.price.value = property.price || "";
    propertyEditorForm.elements.sort_order.value = property.sort_order ?? "";
    propertyEditorForm.elements.description.value = property.description || "";
    propertyEditorForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (deleteButton) {
    if (!confirm("Delete this property listing?")) return;
    const { error } = await db.from("properties").delete().eq("id", deleteButton.dataset.deleteProperty);
    if (error) {
      alert(`Property could not be deleted: ${error.message}`);
      return;
    }
    await renderAdminProperties();
    await renderAdminDashboard();
    await renderPublicProperties();
  }
});

propertyEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const values = formValues(propertyEditorForm);
    const id = values.index;
    const existing = id ? (await getProperties(true)).find((item) => item.id === id) : null;
    let photoUrls = existing?.photo_urls || [];
    let floorplanUrl = existing?.floorplan_url || "";
    const photoFiles = Array.from(propertyEditorForm.elements.photos.files || []);
    const floorplanFile = propertyEditorForm.elements.floorplan.files[0];

    for (const file of photoFiles) {
      if (file.size > 10 * 1024 * 1024) {
        alert("One of the property photos is larger than 10 MB. Please compress it or upload a smaller image.");
        return;
      }
    }
    if (floorplanFile && floorplanFile.size > 10 * 1024 * 1024) {
      alert("The floorplan file is larger than 10 MB. Please compress it or upload a smaller file.");
      return;
    }

    if (photoFiles.length) photoUrls = await Promise.all(photoFiles.map((file) => uploadPublicFile("property-media", file)));
    if (floorplanFile) floorplanUrl = await uploadPublicFile("property-media", floorplanFile);

    const row = {
      listing_type: values.listing_type,
      status: values.status,
      address: values.address,
      price: values.price || null,
      description: values.description || null,
      photo_urls: photoUrls,
      floorplan_url: floorplanUrl || null,
      sort_order: values.sort_order ? Number(values.sort_order) : (await getProperties(true)).length + 1,
      is_active: true,
    };

    if (id) {
      const { error } = await db.from("properties").update(row).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await db.from("properties").insert(row);
      if (error) throw error;
    }

    propertyEditorForm.reset();
    propertyEditorForm.elements.index.value = "";
    await renderAdminProperties();
    await renderAdminDashboard();
    await renderPublicProperties();
    alert("Property saved.");
  } catch (error) {
    alert(`Property could not be saved: ${error.message || error}`);
  }
});

document.querySelector("#newProperty")?.addEventListener("click", () => {
  propertyEditorForm?.reset();
  if (propertyEditorForm) propertyEditorForm.elements.index.value = "";
});

document.querySelector("#clearProperties")?.addEventListener("click", async () => {
  if (!confirm("Delete all property listings? This cannot be undone.")) return;
  const { error } = await db.from("properties").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    alert(`Properties could not be cleared: ${error.message}`);
    return;
  }
  await renderAdminProperties();
  await renderAdminDashboard();
  await renderPublicProperties();
});

document.querySelector("#clearLeads")?.addEventListener("click", async () => {
  alert("Lead deletion requires an additional delete policy. Export leads before deleting.");
});

adminEnquiriesList?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-enquiry]");
  if (!button) return;
  if (!confirm("Delete this website enquiry record?")) return;
  const { error } = await db.from("enquiries").delete().eq("id", button.dataset.deleteEnquiry);
  if (error) {
    alert(`Enquiry could not be deleted: ${error.message}`);
    return;
  }
  await renderAdminEnquiries();
  await renderAdminDashboard();
});

document.querySelector("#clearEnquiries")?.addEventListener("click", async () => {
  if (!confirm("Delete all website enquiry records? This cannot be undone.")) return;
  const { error } = await db.from("enquiries").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    alert(`Enquiries could not be cleared: ${error.message}`);
    return;
  }
  await renderAdminEnquiries();
  await renderAdminDashboard();
});

document.querySelector("#clearPageViews")?.addEventListener("click", async () => {
  if (!confirm("Delete all page view records? This cannot be undone.")) return;
  const { error } = await db.from("page_views").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    alert(`Page views could not be cleared: ${error.message}`);
    return;
  }
  await renderAdminAnalytics();
  await renderAdminDashboard();
});

adminAnalyticsList?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-page-view]");
  if (!button) return;
  if (!confirm("Delete this page view record?")) return;
  const { error } = await db.from("page_views").delete().eq("id", button.dataset.deletePageView);
  if (error) {
    alert(`Page view could not be deleted: ${error.message}`);
    return;
  }
  await renderAdminAnalytics();
  await renderAdminDashboard();
});

adminApplicationsList?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-application]");
  if (!button) return;
  if (!confirm("Delete this tenant application record?")) return;
  const { error } = await db.from("tenant_applications").delete().eq("id", button.dataset.deleteApplication);
  if (error) {
    alert(`Application could not be deleted: ${error.message}`);
    return;
  }
  await renderAdminApplications();
  await renderAdminDashboard();
});

document.querySelector("#clearApplications")?.addEventListener("click", async () => {
  if (!confirm("Delete all tenant application records? This cannot be undone.")) return;
  const { error } = await db.from("tenant_applications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    alert(`Applications could not be cleared: ${error.message}`);
    return;
  }
  await renderAdminApplications();
  await renderAdminDashboard();
});

document.querySelector("#exportLeads")?.addEventListener("click", async () => {
  const leads = await getPromotionLeads();
  const rows = [["Name", "Email", "Phone", "Code", "Date"], ...leads.map((lead) => [lead.name, lead.email, lead.phone, lead.code, lead.created_at])];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
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

(async function init() {
  await renderPublicContent();
  await renderPublicTeam();
  await renderPublicProperties();
  await renderPublicVideos();
  await renderPublicPromotionImages();
  trackPageView();
  lockAdmin();
  if (db) {
    const { data } = await db.auth.getSession();
    if (data.session) await unlockAdmin();
  }
  if (window.location.hash === "#promotion" || new URLSearchParams(window.location.search).get("promo") === "scan") {
    setTimeout(openPromoModal, 450);
  }
})();
