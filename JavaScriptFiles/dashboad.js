import supabase from "./config.js";


// ================================================================   Logout Button Functionality   ================================================================

// A: Logout Functionality

const LogoutBtn = document.getElementById("LogoutBtn");
// console.log(LogoutBtn);

async function logout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      Swal.fire({
        title: "Successfully logged out!",
        icon: "success",
        background: "#f9fbfc",
        color: "rgb(132, 0, 255)",
        confirmButtonColor: "rgb(132, 0, 255)",
        confirmButtonText: "Go to Login page",
        padding: "20px",
      }).then(() => {
        location.href = "./login/login.html";
      });
    }
  } catch (err) {
    console.log(err)
  }
}
LogoutBtn && LogoutBtn.addEventListener("click", logout)

// B: Is User Authenticated Or not?

async function protectDashboard() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    if (!window.location.href.includes("login.html")) {
      window.location.href = "../login/login.html";
    }
    return;
  }

  const { data: userData } = await supabase
    .from('FullStack-Users')
    .select('role')
    .eq('email', user.email)
    .single();

  if (!userData) return;

  const isDashboardPage = window.location.href.includes("dashboard.html");

  if (userData.role !== 'admin' && isDashboardPage) {
    window.location.href = "./UsersFiles/home.html";
  }
}

protectDashboard();


// ================================================================   DashBoard Page Functionality   ================================================================

// ----------------------------------------------   A: UPLOAD FILE   ----------------------------------------------

const fileInput = document.getElementById("prodImg");
const uploadBtn = document.getElementById("publishBtn");
const title = document.getElementById("prodTitle");
const Description = document.getElementById("prodDesc");

// console.log(fileInput);
// console.log(uploadBtn);
// console.log(title);
// console.log(Description);

function displayName(e) {
  // e.preventDefault();

  if (fileInput.click) {
    fileInput.style.visibility = "visible";
    fileInput.style.color = "gray";
    console.log("Styling Update");

  }
}

fileInput && fileInput.addEventListener("click", displayName)

async function UploadFile(e) {
  e.preventDefault()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Swal.fire("Error", "Please login first!", "error");
  }

  const file = fileInput.files[0];
  const prodTitle = document.getElementById("prodTitle").value;
  // console.log(prodTitle);

  const prodDesc = document.getElementById("prodDesc").value;
  // console.log(prodDesc);

  const prodPrice = document.getElementById("prodPrice").value;
  // console.log(prodPrice);


  const colorInputs = document.querySelectorAll(".color-input-field");
  const selectedColors = Array.from(colorInputs).map(input => input.value);
  // console.log(selectedColors);

  const selectedStatus = document.querySelector(
    'input[name="prodStatus"]:checked'
  ).value;

  // console.log(selectedStatus);


  if (!file || !prodTitle || !prodDesc || selectedColors.length === 0) {
    return Swal.fire({
      title: "Fields Required",
      text: "Please fill all fields: Image, Title, Description, at least one Color, and Product Status.",
      icon: "warning",
      confirmButtonColor: "#4f46e5"
    });
  }

  const { data: { dbuser } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("FullStack-Users")
    .select("role")
    .eq("email", user.email)
    .single();

  if (error) {
    console.error(error.message);
  }


  console.log(dbuser);


  if (!data || data.role !== "admin") {
    return Swal.fire("Error", "Login required", "error");
  }
  if (error) {
    console.error("Database error:", error);
  }
  Swal.fire({
    title: 'Publishing...',
    didOpen: () => Swal.showLoading()
  });

  try {
    const fileName = `${Date.now()}_${file.name}`;
    console.log(fileName);
    console.log(file);


    const { error: uploadErr } = await supabase.storage
      .from("FullStackImages")
      .upload(fileName, file);

    if (uploadErr) throw uploadErr;

    const { data: pubData } = supabase.storage.from("FullStackImages").getPublicUrl(fileName);
    const isNewArrival = document.getElementById("arrival-check").checked;

    const { error: dbErr } = await supabase.from("FullStack-Images").insert({
      image_url: pubData.publicUrl,
      image_name: file.name,
      product_title: prodTitle,
      product_description: prodDesc,
      product_colors: selectedColors,
      user_id: user.id,
      status: selectedStatus,
      Arrival: isNewArrival,
      product_price: prodPrice
    });

    if (dbErr) {
      console.error("Insert Error:", dbErr.message);
      Swal.fire("Error", dbErr.message, "error");
    } else {
      Swal.fire("Success", "Product added to Luxora!", "success");
      fetchFile();
      fileInput.value = "";
      title.value = "";
      Description.value = "";
      colorContainer.querySelectorAll(".color-item-wrapper").forEach(el => el.remove());
      document.getElementById("arrival-check").checked = false;
    }


  } catch (err) {
    Swal.fire("Error", err.message, "error");

    fetchFile()
  }
}


// if (uploadBtn) {
//   uploadBtn.addEventListener("click", UploadFile);
// }


// ----------------------------------------------   B: PRODUCT COLOR   ----------------------------------------------

const addColorBtn = document.getElementById("addColorBtn");
const colorContainer = document.getElementById("colorContainer");

function AddColorBtn() {

  const deleteBtn = document.createElement("i");
  deleteBtn.className = "fa-solid fa-circle-xmark delete-color-icon";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.color = "#ff4d4d";

  deleteBtn.addEventListener("click", () => {
    wrapper.remove();
  })

  const wrapper = document.createElement("div");
  wrapper.className = "color-item-wrapper";

  const newColorInput = document.createElement("input");
  newColorInput.type = "color";
  newColorInput.className = "color-input-field";

  wrapper.appendChild(newColorInput);
  wrapper.appendChild(deleteBtn);

  colorContainer.insertBefore(wrapper, addColorBtn);
}

addColorBtn && addColorBtn.addEventListener("click", AddColorBtn)


// ----------------------------------------------   C: FETCH FILE   ----------------------------------------------

async function fetchFile() {
  const cardContainer = document.getElementById('product-card-container');
  if (!cardContainer) return;

  cardContainer.innerHTML = "Loading...";

  const { data: { user } } = await supabase.auth.getUser();
  let userRole = "";

  if (user) {
    const { data: profile } = await supabase
      .from('FullStack-Users')
      .select('role')
      .eq('email', user.email)
      .single();
    if (profile) userRole = profile.role;
  }

  const isDashboard = window.location.href.includes("dashboard.html");

  const { data, error } = await supabase.from('FullStack-Images').select('*');

  if (error) return console.error(error);

  cardContainer.innerHTML = "";

  data.forEach(item => {

    let tagText = item.Arrival ? "New Arrival" : "Archive";
    let tagClass = item.Arrival ? "tag-new" : "tag-archive";

    let adminButtons = "";
    if (userRole === "admin" && isDashboard) {
      adminButtons = `
        <div class="p-admin-tools">
          <button class="edit-tool" onclick='startEdit(${item.id}, ${JSON.stringify(item)})'><i class="fas fa-edit"></i></button>
          <button class="del-tool" onclick="deleteImage(${item.id}, '${item.image_url}')"><i class="fas fa-trash"></i></button>
        </div>`;
    }

    cardContainer.innerHTML += `
      <div class="col-6 col-md-3 col-lg-2 align-items-stretch"> 
        <div class="product-preview-card">
          <div class="p-visual">
            <div class="img-wrapper">
                <img src="${item.image_url}" alt="${item.image_name}">
            </div>
            ${adminButtons} </div>
          
          <div class="p-details">
            <span class="p-tag ${tagClass}">${tagText}</span>
            <h4>${item.product_title}</h4>
            <p>${item.product_description}</p>
            <div style="text-align: right; color: red; font-weight: bold;">
                Rs: ${Number(item.product_price)} </div>
            <div class="p-footer-status">
                Status: <b class="${item.status === 'Active' ? 'active' : 'inactive'}">${item.status}</b>
            </div>
            <button class="View-btn" onclick="window.location.href='../UsersFiles/detail.html?id=${item.id}'">
    View Details
</button>

          </div>
        </div>
      </div>`;
  });
}

if (uploadBtn) {
  uploadBtn.addEventListener("click", UploadFile);
}

window.onload = fetchFile;

// ----------------------------------------------   D: DELETE FILE   ----------------------------------------------

let currentOldUrl = null;

window.deleteImage = async (id, imageUrl) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This action will permanently delete the image.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    try {
      const fileName = imageUrl.split('/').pop();
      await supabase.storage.from('FullStackImages').remove([fileName]);

      const { error } = await supabase.from('FullStack-Images').delete().eq('id', id);

      if (error) throw error;

      Swal.fire('Deleted!', 'The image has been removed successfully.', 'success');
      fetchFile();
    } catch (err) {
      Swal.fire('Error', 'Failed to delete image: ' + err.message, 'error');
    }
  }
};

// // ----------------------------------------------   D: EDIT FILE   ----------------------------------------------
let currentEditId = null;

window.startEdit = async (id, oldData) => {
  currentEditId = id;

  const { value: formData } = await Swal.fire({
    title: "Edit Product",
    width: 700,
    showCancelButton: true,
    confirmButtonText: "Update Product",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "edit-popup",
      confirmButton: "btn-confirm",
      cancelButton: "btn-cancel"
    },
    html: `
<div class="edit-form">

  <div class="field">
    <label>Product Image</label>
    <input type="file" id="swal-file" class="file-input">
  </div>

  <div class="field checkbox-field">
    <label class="arrival-label">
      <input type="checkbox" id="swal-arrival">
      <span>Mark as New Arrival</span>
    </label>
  </div>

  <div class="field">
    <label>Product Title</label>
    <input type="text" id="swal-title" value="${oldData.product_title}">
  </div>

  <div class="field">
    <label>Description</label>
    <textarea id="swal-desc">${oldData.product_description}</textarea>
  </div>

  <div class="field">
    <label>Product Status</label>
    <div class="status-wrap">
      <label class="status-box">
        <input type="radio" name="swalStatus" value="Active" ${oldData.status === "Active" ? "checked" : ""}>
        <span>Active</span>
      </label>
      <label class="status-box">
        <input type="radio" name="swalStatus" value="Inactive" ${oldData.status === "Inactive" ? "checked" : ""}>
        <span>Inactive</span>
      </label>
    </div>
  </div>

</div>
`,

    preConfirm: () => {
      return {
        title: document.getElementById("swal-title").value.trim(),
        desc: document.getElementById("swal-desc").value.trim(),
        file: document.getElementById("swal-file").files[0],
        arrival: document.getElementById("swal-arrival").checked,
        status: document.querySelector('input[name="swalStatus"]:checked').value
      };
    }
  });

  if (!formData) return;

  Swal.fire({ title: "Updating...", didOpen: () => Swal.showLoading() });

  try {
    let imageUrl = oldData.image_url;
    let imageName = oldData.image_name;

    if (formData.file) {
      const fileName = `${Date.now()}_${formData.file.name}`;
      await supabase.storage.from("FullStackImages").upload(fileName, formData.file);
      const { data } = supabase.storage.from("FullStackImages").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
      imageName = formData.file.name;
    }

    await supabase.from("FullStack-Images").update({
      product_title: formData.title,
      product_description: formData.desc,
      image_url: imageUrl,
      image_name: imageName,
      Arrival: formData.arrival,
      status: formData.status
    }).eq("id", currentEditId);

    Swal.fire("Updated!", "Product updated successfully", "success");
    fetchFile();

  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
};
