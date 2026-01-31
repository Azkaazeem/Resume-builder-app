import supabase from './config.js';

// ================= 1. AUTHENTICATION (Same as before) =================
async function checkUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        window.location.href = '../login/login.html';
    } else {
        const userDisplay = document.getElementById('userNameDisplay');
        if (userDisplay) {
            const name = user.email.split('@')[0];
            userDisplay.innerText = `Hi, ${name.toUpperCase()}`;
        }
        loadResumes(); 
    }
}
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '../login/login.html';
});
checkUser();


// ================= 2. DYNAMIC FIELDS LOGIC (New) =================

// Add Education Field
window.addEducationField = function(data = {}) {
    const container = document.getElementById('educationInputs');
    const id = Date.now();
    const div = document.createElement('div');
    div.className = "card p-3 mb-2 bg-light border-0 edu-entry";
    div.setAttribute('data-id', id);
    
    div.innerHTML = `
        <input type="text" class="form-control form-control-sm mb-1 edu-degree" placeholder="Degree (e.g. BS CS)" value="${data.degree || ''}">
        <input type="text" class="form-control form-control-sm mb-1 edu-school" placeholder="School/Uni" value="${data.school || ''}">
        <input type="text" class="form-control form-control-sm mb-2 edu-year" placeholder="Year (e.g. 2020-2024)" value="${data.year || ''}">
        <button class="btn btn-sm btn-danger w-100 py-0" onclick="removeField(this)">Remove</button>
    `;
    container.appendChild(div);
    attachLiveListeners(); // Update preview logic
}

// Add Experience Field
window.addExperienceField = function(data = {}) {
    const container = document.getElementById('experienceInputs');
    const id = Date.now();
    const div = document.createElement('div');
    div.className = "card p-3 mb-2 bg-light border-0 exp-entry";
    
    div.innerHTML = `
        <input type="text" class="form-control form-control-sm mb-1 exp-role" placeholder="Job Role" value="${data.role || ''}">
        <input type="text" class="form-control form-control-sm mb-1 exp-company" placeholder="Company" value="${data.company || ''}">
        <textarea class="form-control form-control-sm mb-2 exp-desc" rows="2" placeholder="Description">${data.desc || ''}</textarea>
        <button class="btn btn-sm btn-danger w-100 py-0" onclick="removeField(this)">Remove</button>
    `;
    container.appendChild(div);
    attachLiveListeners();
}

window.removeField = function(btn) {
    btn.parentElement.remove();
    updatePreviewLists(); // Refresh preview
}

// ================= 3. PREVIEW & SAVE LOGIC =================

// Live Update for Lists
function attachLiveListeners() {
    document.querySelectorAll('.edu-entry input, .exp-entry input, .exp-entry textarea').forEach(input => {
        input.addEventListener('input', updatePreviewLists);
    });
}

function updatePreviewLists() {
    // Skills
    const skills = document.getElementById('skillsInp').value.split(',');
    const skillsContainer = document.getElementById('prevSkills');
    skillsContainer.innerHTML = '';
    skills.forEach(skill => {
        if(skill.trim()) {
            skillsContainer.innerHTML += `<span class="badge bg-dark me-1">${skill.trim()}</span>`;
        }
    });

    // Education
    const eduContainer = document.getElementById('prevEducationList');
    eduContainer.innerHTML = '';
    document.querySelectorAll('.edu-entry').forEach(div => {
        const degree = div.querySelector('.edu-degree').value;
        const school = div.querySelector('.edu-school').value;
        const year = div.querySelector('.edu-year').value;
        if(degree || school) {
            eduContainer.innerHTML += `
                <div class="mb-2">
                    <strong>${degree}</strong> 
                    <span class="float-end small text-muted">${year}</span><br>
                    <span class="text-muted small">${school}</span>
                </div>
            `;
        }
    });

    // Experience
    const expContainer = document.getElementById('prevExperienceList');
    expContainer.innerHTML = '';
    document.querySelectorAll('.exp-entry').forEach(div => {
        const role = div.querySelector('.exp-role').value;
        const company = div.querySelector('.exp-company').value;
        const desc = div.querySelector('.exp-desc').value;
        if(role || company) {
            expContainer.innerHTML += `
                <div class="mb-3">
                    <strong>${role}</strong> at <em>${company}</em>
                    <p class="small text-secondary mb-0">${desc}</p>
                </div>
            `;
        }
    });
}

// Basic Inputs Listener
const inputs = ['name', 'title', 'email', 'phone', 'address', 'summary', 'skills'];
inputs.forEach(id => {
    document.getElementById(id + 'Inp')?.addEventListener('input', (e) => {
        if(id === 'skills') updatePreviewLists();
        else {
            const prevEl = document.getElementById('prev' + id.charAt(0).toUpperCase() + id.slice(1));
            if(prevEl) prevEl.innerText = e.target.value;
        }
    });
});

// Image Upload
document.getElementById('imgInp')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) { document.getElementById('previewImg').src = evt.target.result; };
        reader.readAsDataURL(file);
    }
});


// ================= 4. SAVE & LOAD SYSTEM =================

let currentResumeId = null;

window.showEditor = function(mode = 'new', id = null) {
    document.getElementById('dashboardSection').classList.add('d-none');
    document.getElementById('editorSection').classList.remove('d-none');
    if (mode === 'new') {
        currentResumeId = null;
        clearForm();
    } else {
        currentResumeId = id;
        loadResumeDataToEdit(id);
    }
}

window.showDashboard = function() {
    document.getElementById('editorSection').classList.add('d-none');
    document.getElementById('dashboardSection').classList.remove('d-none');
    loadResumes();
}

// SAVE FUNCTION
document.getElementById('saveResumeBtn')?.addEventListener('click', function() {
    // Collect Education Data
    const eduData = [];
    document.querySelectorAll('.edu-entry').forEach(div => {
        eduData.push({
            degree: div.querySelector('.edu-degree').value,
            school: div.querySelector('.edu-school').value,
            year: div.querySelector('.edu-year').value
        });
    });

    // Collect Experience Data
    const expData = [];
    document.querySelectorAll('.exp-entry').forEach(div => {
        expData.push({
            role: div.querySelector('.exp-role').value,
            company: div.querySelector('.exp-company').value,
            desc: div.querySelector('.exp-desc').value
        });
    });

    const resumeData = {
        id: currentResumeId || Date.now(),
        name: document.getElementById('nameInp').value,
        title: document.getElementById('titleInp').value,
        email: document.getElementById('emailInp').value,
        phone: document.getElementById('phoneInp').value,
        address: document.getElementById('addressInp').value,
        summary: document.getElementById('summaryInp').value,
        skills: document.getElementById('skillsInp').value,
        image: document.getElementById('previewImg').src,
        education: eduData,
        experience: expData,
        lastUpdated: new Date().toLocaleDateString()
    };

    let resumes = JSON.parse(localStorage.getItem('myResumes')) || [];
    if (currentResumeId) {
        const index = resumes.findIndex(r => r.id === currentResumeId);
        if(index !== -1) resumes[index] = resumeData;
    } else {
        resumes.push(resumeData);
    }
    localStorage.setItem('myResumes', JSON.stringify(resumes));
    alert("Resume Saved!");
    showDashboard();
});

// LOAD DATA INTO FORM
function loadResumeDataToEdit(id) {
    const resumes = JSON.parse(localStorage.getItem('myResumes')) || [];
    const resume = resumes.find(r => r.id === id);
    if (resume) {
        document.getElementById('nameInp').value = resume.name;
        document.getElementById('titleInp').value = resume.title;
        document.getElementById('emailInp').value = resume.email;
        document.getElementById('phoneInp').value = resume.phone;
        document.getElementById('addressInp').value = resume.address;
        document.getElementById('summaryInp').value = resume.summary;
        document.getElementById('skillsInp').value = resume.skills || '';
        document.getElementById('previewImg').src = resume.image || "https://via.placeholder.com/150";
        
        // Load Lists
        document.getElementById('educationInputs').innerHTML = '';
        resume.education?.forEach(edu => addEducationField(edu));
        
        document.getElementById('experienceInputs').innerHTML = '';
        resume.experience?.forEach(exp => addExperienceField(exp));

        // Update Text Preview
        document.getElementById('prevName').innerText = resume.name;
        document.getElementById('prevTitle').innerText = resume.title;
        updatePreviewLists();
    }
}

function clearForm() {
    document.querySelectorAll('input, textarea').forEach(i => i.value = '');
    document.getElementById('educationInputs').innerHTML = '';
    document.getElementById('experienceInputs').innerHTML = '';
    document.getElementById('prevName').innerText = "YOUR NAME";
    document.getElementById('previewImg').src = "https://via.placeholder.com/150";
    updatePreviewLists();
}

function loadResumes() {
    const grid = document.getElementById('resumeGrid');
    const resumes = JSON.parse(localStorage.getItem('myResumes')) || [];
    grid.innerHTML = "";
    if (resumes.length === 0) {
        document.getElementById('emptyState').classList.remove('d-none');
    } else {
        document.getElementById('emptyState').classList.add('d-none');
        resumes.forEach(resume => {
            grid.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card resume-card p-4 h-100 text-center">
                        <div class="icon-circle mx-auto mb-3"><i class="fas fa-file-invoice"></i></div>
                        <h5 class="fw-bold">${resume.title || 'Untitled'}</h5>
                        <p class="text-muted small">${resume.name}</p>
                        <div class="mt-3">
                            <button class="btn btn-outline-primary btn-sm rounded-pill" onclick="showEditor('edit', ${resume.id})">Edit</button>
                            <button class="btn btn-outline-danger btn-sm rounded-pill" onclick="deleteResume(${resume.id})">Delete</button>
                        </div>
                    </div>
                </div>`;
        });
    }
}

window.deleteResume = function(id) {
    if(confirm("Delete this resume?")) {
        let resumes = JSON.parse(localStorage.getItem('myResumes')) || [];
        resumes = resumes.filter(r => r.id !== id);
        localStorage.setItem('myResumes', JSON.stringify(resumes));
        loadResumes();
    }
}

// PDF Download
document.getElementById('downloadPdfBtn')?.addEventListener('click', () => {
    const element = document.getElementById('resumePreview');
    const opt = {
        margin: 0,
        filename: 'My-Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
});