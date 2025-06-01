const API_BASE = '/api';

// --- Auth ---
function getToken() {
  return localStorage.getItem('adminToken');
}
function setToken(token) {
  localStorage.setItem('adminToken', token);
}
function clearToken() {
  localStorage.removeItem('adminToken');
}
function isLoggedIn() {
  return !!getToken();
}
function requireAuth() {
  if (!isLoggedIn()) window.location.href = 'login.html';
}

// --- Login Page ---
if (document.getElementById('adminLoginForm')) {
  document.getElementById('adminLoginForm').onsubmit = async function(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminLoginError');
    errorDiv.textContent = '';
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        window.location.href = 'index.html';
      } else {
        errorDiv.textContent = data.error || 'Login failed';
      }
    } catch (err) {
      errorDiv.textContent = 'Network error';
    }
  };
}

// --- Dashboard Page ---
if (document.getElementById('mainContent')) {
  requireAuth();
  // Sidebar navigation
  document.querySelectorAll('.sidebar nav ul li a[data-page]').forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      document.querySelectorAll('.sidebar nav ul li a').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      loadPage(this.getAttribute('data-page'));
    };
  });
  document.getElementById('adminLogout').onclick = function(e) {
    e.preventDefault();
    clearToken();
    window.location.href = 'login.html';
  };
  // Initial load
  loadPage('courses');
}

// --- Dynamic Page Loaders ---
async function loadPage(page) {
  if (page === 'courses') return loadCourses();
  if (page === 'growth') return loadGrowth();
  if (page === 'library') return loadLibrary();
  if (page === 'jobs') return loadJobs();
  if (page === 'mentors') return loadMentors();
  if (page === 'skills') return loadSkills();
}

// --- Helper: Fetch with Auth ---
async function apiFetch(url, options = {}) {
  options.headers = options.headers || {};
  options.headers['Authorization'] = 'Bearer ' + getToken();
  return fetch(url, options);
}

// --- Academic (Courses) ---
async function loadCourses() {
  const main = document.getElementById('mainContent');
  main.innerHTML = '<h2>Academic (Courses)</h2><button onclick="showCourseForm()">Add Course</button><div id="coursesTable"></div><div id="courseFormModal"></div>';
  const res = await apiFetch(`${API_BASE}/admin/courses`);
  const courses = await res.json();
  renderCoursesTable(courses);
}
function renderCoursesTable(courses) {
  const tableDiv = document.getElementById('coursesTable');
  let html = '<table class="admin-table"><tr><th>Name</th><th>Description</th><th>Picture</th><th>Actions</th></tr>';
  for (const c of courses) {
    html += `<tr><td>${c.name}</td><td>${c.description||''}</td><td>${c.picture?`<img src="${c.picture}" width="40">`:''}</td><td><button onclick="editCourse('${c._id}')">Edit</button> <button onclick="deleteCourse('${c._id}')">Delete</button></td></tr>`;
  }
  html += '</table>';
  tableDiv.innerHTML = html;
}
function showCourseForm(id) {
  const modal = document.getElementById('courseFormModal');
  let course = { name: '', description: '', picture: '' };
  let isEdit = false;
  if (id) {
    isEdit = true;
    apiFetch(`${API_BASE}/admin/courses`).then(res => res.json()).then(courses => {
      course = courses.find(c => c._id === id) || course;
      renderCourseForm(course, isEdit);
    });
  } else {
    renderCourseForm(course, isEdit);
  }
}
function renderCourseForm(course, isEdit) {
  const modal = document.getElementById('courseFormModal');
  modal.innerHTML = `<form class="admin-form" id="courseForm">
    <h3>${isEdit ? 'Edit' : 'Add'} Course</h3>
    <label>Name</label>
    <input type="text" name="name" value="${course.name||''}" required />
    <label>Description</label>
    <textarea name="description">${course.description||''}</textarea>
    <label>Picture (upload or URL)</label>
    <input type="file" name="picture" accept="image/*" />
    <input type="text" name="pictureUrl" placeholder="Or paste image URL" value="${course.picture||''}" />
    <button type="submit">${isEdit ? 'Update' : 'Add'}</button>
    <button type="button" class="cancel" onclick="closeCourseForm()">Cancel</button>
  </form>`;
  document.getElementById('courseForm').onsubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    let url = `${API_BASE}/admin/courses`;
    let method = 'POST';
    if (isEdit) {
      url += `/${course._id}`;
      method = 'PUT';
    }
    const res = await apiFetch(url, { method, body: formData });
    if (res.ok) {
      closeCourseForm();
      loadCourses();
    } else {
      alert('Error saving course');
    }
  };
}
function closeCourseForm() {
  document.getElementById('courseFormModal').innerHTML = '';
}
async function editCourse(id) {
  showCourseForm(id);
}
async function deleteCourse(id) {
  if (!confirm('Delete this course?')) return;
  const res = await apiFetch(`${API_BASE}/admin/courses/${id}`, { method: 'DELETE' });
  if (res.ok) loadCourses();
}

// --- Skills CRUD ---
async function loadSkills() {
  const main = document.getElementById('mainContent');
  main.innerHTML = '<h2>Skills</h2><button onclick="showSkillForm()">Add Skill</button><div id="skillsTable"></div><div id="skillFormModal"></div>';
  const res = await apiFetch(`${API_BASE}/admin/skills`);
  const skills = await res.json();
  renderSkillsTable(skills);
}
function renderSkillsTable(skills) {
  const tableDiv = document.getElementById('skillsTable');
  let html = '<table class="admin-table"><tr><th>Title</th><th>Description</th><th>Image</th><th>Actions</th></tr>';
  for (const s of skills) {
    html += `<tr><td>${s.title}</td><td>${s.description||''}</td><td>${s.image?`<img src="${s.image}" width="40">`:''}</td><td><button onclick="editSkill('${s._id}')">Edit</button> <button onclick="deleteSkill('${s._id}')">Delete</button></td></tr>`;
  }
  html += '</table>';
  tableDiv.innerHTML = html;
}
function showSkillForm(id) {
  const modal = document.getElementById('skillFormModal');
  let skill = { title: '', description: '', image: '' };
  let isEdit = false;
  if (id) {
    isEdit = true;
    apiFetch(`${API_BASE}/admin/skills`).then(res => res.json()).then(skills => {
      skill = skills.find(s => s._id === id) || skill;
      renderSkillForm(skill, isEdit);
    });
  } else {
    renderSkillForm(skill, isEdit);
  }
}
function renderSkillForm(skill, isEdit) {
  const modal = document.getElementById('skillFormModal');
  modal.innerHTML = `<form class="admin-form" id="skillForm">
    <h3>${isEdit ? 'Edit' : 'Add'} Skill</h3>
    <label>Title</label>
    <input type="text" name="title" value="${skill.title||''}" required />
    <label>Description</label>
    <textarea name="description">${skill.description||''}</textarea>
    <label>Image (upload or URL)</label>
    <input type="file" name="image" accept="image/*" />
    <input type="text" name="imageUrl" placeholder="Or paste image URL" value="${skill.image||''}" />
    <button type="submit">${isEdit ? 'Update' : 'Add'}</button>
    <button type="button" class="cancel" onclick="closeSkillForm()">Cancel</button>
  </form>`;
  document.getElementById('skillForm').onsubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    let url = `${API_BASE}/admin/skills`;
    let method = 'POST';
    if (isEdit) {
      url += `/${skill._id}`;
      method = 'PUT';
    }
    const res = await apiFetch(url, { method, body: formData });
    if (res.ok) {
      closeSkillForm();
      loadSkills();
    } else {
      alert('Error saving skill');
    }
  };
}
function closeSkillForm() {
  document.getElementById('skillFormModal').innerHTML = '';
}
async function editSkill(id) {
  showSkillForm(id);
}
async function deleteSkill(id) {
  if (!confirm('Delete this skill?')) return;
  const res = await apiFetch(`${API_BASE}/admin/skills/${id}`, { method: 'DELETE' });
  if (res.ok) loadSkills();
}

// --- Add similar CRUD logic for Growth, Library, Jobs, Mentors below ---
// (For brevity, only Academic/Courses is fully shown. You can copy this pattern for other sections.) 