const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('open');
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const profileDialog = document.querySelector('.profile-dialog');
const profileForm = document.querySelector('#profile-form');
const profileKeys = ['name', 'city', 'email', 'linkedin', 'github', 'college', 'graduationYear', 'certificates'];
const defaultProfile = {
  name: 'Mybalan S',
  city: 'Coimbatore',
  email: 's.mybalansadhasivam@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mybalan-sadhasivam-7591ba293',
  github: 'https://github.com/mybala12',
  college: 'Nandha Engineering College',
  graduationYear: '2026',
  certificates: 'Data Science Intern | Gradtwin Pvt. Ltd. | 2026\nAI Tools & Claude Workshop | Be10x | 2026\nDatabase Management System | Great Learning | 2025',
};
const profileStorageKey = 'personalPortfolioDetails-v3';
const saveNote = document.querySelector('.save-note');
const resumeInput = profileForm.elements.namedItem('resumeFile');
const resumeFileName = document.querySelector('#resume-file-name');
const resumeDownload = document.querySelector('#resume-download');
const resumePending = document.querySelector('#resume-pending');
let resumeObjectUrl = '';

function openResumeDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('portfolioLocalFiles', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveResumeFile(file) {
  const database = await openResumeDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction('files', 'readwrite');
    transaction.objectStore('files').put(file, 'resume');
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

async function loadResumeFile() {
  const database = await openResumeDatabase();
  const file = await new Promise((resolve, reject) => {
    const request = database.transaction('files', 'readonly').objectStore('files').get('resume');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return file;
}

function showResumeFile(file) {
  if (resumeObjectUrl) URL.revokeObjectURL(resumeObjectUrl);
  resumeObjectUrl = URL.createObjectURL(file);
  resumeDownload.href = resumeObjectUrl;
  resumeDownload.hidden = false;
  resumePending.hidden = true;
}

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(profileStorageKey) || '{}');
  } catch {
    return {};
  }
}

function renderProfessionalEntries(element, value) {
  const items = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const fragment = document.createDocumentFragment();
  items.forEach((line) => {
    const parts = line.split('|').map((part) => part.trim());
    const hasOrganizationAndYear = parts.length >= 3;
    const hasOrganization = parts.length === 2 && !/^\d{4}$/.test(parts[1]);
    const titleText = hasOrganizationAndYear ? parts.slice(0, -2).join(' | ') : parts[0];
    const organizationText = hasOrganizationAndYear ? parts[parts.length - 2] : (hasOrganization ? parts[1] : '');
    const yearText = hasOrganizationAndYear ? parts[parts.length - 1] : (parts.length === 2 && /^\d{4}$/.test(parts[1]) ? parts[1] : '');
    const item = document.createElement('li');
    const main = document.createElement('span');
    main.className = 'credential-main';
    const title = document.createElement('strong');
    title.textContent = titleText;
    main.append(title);
    if (organizationText) {
      const organization = document.createElement('small');
      organization.textContent = organizationText;
      main.append(organization);
    }
    item.append(main);
    if (yearText) {
      const year = document.createElement('time');
      year.textContent = yearText;
      item.append(year);
    }
    fragment.append(item);
  });
  element.replaceChildren(fragment);
}

function applyProfile(profile) {
  profileKeys.forEach((key) => {
    const value = (profile[key] || '').trim();
    if (!value) return;
    document.querySelectorAll(`[data-profile="${key}"]`).forEach((element) => {
      if (key === 'certificates') renderProfessionalEntries(element, value);
      else if (key === 'name' && element.firstChild) element.firstChild.textContent = value;
      else element.textContent = value;
    });
    if (key === 'name') {
      document.querySelectorAll('.mark').forEach((mark) => { mark.textContent = value.charAt(0).toUpperCase(); });
      document.querySelector('.site-header .wordmark').setAttribute('aria-label', `${value}, home`);
    }
    const input = profileForm.elements.namedItem(key);
    if (input) input.value = value;
    if (key === 'email') {
      document.querySelectorAll('[data-profile-link="email"]').forEach((link) => { link.href = `mailto:${value}`; });
    }
    if (key === 'linkedin' || key === 'github') {
      document.querySelector(`[data-profile-link="${key}"]`).href = value;
    }
  });
}

applyProfile({ ...defaultProfile, ...readProfile() });
loadResumeFile().then((file) => {
  if (file) {
    showResumeFile(file);
    resumeFileName.textContent = `Saved PDF: ${file.name || 'resume.pdf'}`;
  }
}).catch(() => {
  resumeFileName.textContent = 'PDF upload is unavailable in this browser.';
});

resumeInput.addEventListener('change', () => {
  const file = resumeInput.files[0];
  resumeFileName.textContent = file ? `Selected: ${file.name}` : 'No PDF selected. Maximum file size: 15 MB.';
});

document.querySelectorAll('[data-open-editor]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.site-nav').classList.remove('open');
    const menuButton = document.querySelector('.menu-toggle');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    profileDialog.showModal();
  });
});

document.querySelectorAll('[data-close-editor]').forEach((button) => {
  button.addEventListener('click', () => profileDialog.close());
});

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const profile = Object.fromEntries(new FormData(profileForm).entries());
  const selectedFile = profile.resumeFile;
  const resumeFile = selectedFile && selectedFile.name ? selectedFile : null;
  delete profile.resumeFile;
  if (resumeFile && resumeFile.size > 15 * 1024 * 1024) {
    saveNote.textContent = 'That PDF is over 15 MB. Please choose a smaller file.';
    return;
  }
  if (resumeFile && resumeFile.type && resumeFile.type !== 'application/pdf' && !resumeFile.name.toLowerCase().endsWith('.pdf')) {
    saveNote.textContent = 'Please choose a PDF file.';
    return;
  }
  ['linkedin', 'github'].forEach((key) => {
    const link = (profile[key] || '').trim();
    if (link && !/^[a-z][a-z\d+.-]*:\/\//i.test(link)) profile[key] = `https://${link}`;
    else profile[key] = link;
  });
  applyProfile(profile);
  try {
    localStorage.setItem(profileStorageKey, JSON.stringify({ ...readProfile(), ...profile }));
    saveNote.textContent = 'Details saved on this browser.';
  } catch {
    saveNote.textContent = 'Updated for now. Browser storage is unavailable.';
  }
  if (resumeFile) {
    try {
      await saveResumeFile(resumeFile);
      showResumeFile(resumeFile);
      resumeFileName.textContent = `Saved PDF: ${resumeFile.name}`;
      saveNote.textContent = 'Details and PDF saved on this browser.';
    } catch {
      saveNote.textContent = 'Details saved, but this browser could not save the PDF.';
      return;
    }
  }
  window.setTimeout(() => profileDialog.close(), 900);
});

const slideLinks = [...document.querySelectorAll('.slide-nav a')];
const slideSections = slideLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const slideObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle('slide-active', entry.isIntersecting);
    if (!entry.isIntersecting) return;
    const activeLink = slideLinks.find((link) => link.getAttribute('href') === `#${entry.target.id}`);
    if (activeLink) {
      slideLinks.forEach((link) => link.removeAttribute('aria-current'));
      activeLink.setAttribute('aria-current', 'step');
    }
  });
}, { threshold: 0.35 });

slideSections.forEach((section) => {
  section.classList.add('slide-panel');
  const content = section.querySelectorAll(':scope > .section-wrap, :scope > .hero-copy, :scope > .hero-art, :scope > .scroll-cue');
  content.forEach((element) => element.classList.add('slide-content'));
  slideObserver.observe(section);
});
