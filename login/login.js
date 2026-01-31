import supabase from "../JavaScriptFiles/config.js";

// ================================================================   Login Page Functionality   ================================================================

//  ---------------   A: Get Input IDs   ---------------

let lEmail = document.getElementById("email");
let lPass = document.getElementById("password");
let lBtn = document.querySelector("#login-btn");



//  ---------------   B: Password toggle button   ---------------

const togglePass = document.querySelector(".toggle-password")

function toggleIcon() {
    if (!lPass) return;
    if (lPass.type === "password") {
        lPass.type = "text"
        togglePass.classList.remove("fa-eye-slash")
        togglePass.classList.add("fa-eye")
    } else {
        lPass.type = "password"
        togglePass.classList.remove("fa-eye")
        togglePass.classList.add("fa-eye-slash")
    }
}

togglePass && togglePass.addEventListener("click", toggleIcon)

//  ---------------   C: Form functionality   ---------------

async function login(e) {
    e.preventDefault();

    let email = lEmail.value.trim();
    let pass = lPass.value.trim();

    //   1: fields required functionality

    if (!email) {
        Swal.fire({
            title: "Please enter your email address.",
            icon: "warning",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "OK",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        });
        return;
    }

    //   2: Email functionality

    if (!email.includes("@") || !email.includes("gmail.com")) {
        Swal.fire({
            title: "Please enter a valid Gmail address.",
            text: "Example: yourname@gmail.com",
            icon: "warning",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "OK",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        }).then(() => {
            lEmail.value = "";
            lPass.value = "";
        })
        return;
    }

    //   3: Password functionality

    if (!pass) {
        Swal.fire({
            title: "Password field is empty.",
            text: "Please enter your password.",
            icon: "warning",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "OK",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        });
        return;
    }

    //   4: Password length functionality

    if (pass.length < 6) {
        Swal.fire({
            title: "Invalid password!",
            text: "Password must be at least 6 characters long.",
            icon: "warning",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "OK",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        }).then(() => {
            lPass.value = "";
        })
        return;
    }


    //   5: Try Catch Block functionality

    try {
        Swal.fire({
            title: 'Logging in...',
            didOpen: () => Swal.showLoading()
        });

        // 6: Save Input Value Auth Table

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: pass
        });

        if (authError) throw authError;

        // 7: Fetch Role From Supabase

        const { data: userData, error: dbError } = await supabase
            .from('FullStack-Users')
            .select('role')
            .eq('email', email)
            .single();

        console.log(userData);

        if (dbError) throw dbError;

        // 8: If role Equal to Admin Gona Dashboard

        if (userData.role === 'admin') {
            Swal.fire({
                title: "Welcome Admin!",
                text: "Redirecting to Dashboard...",
                icon: "success",
                confirmButtonColor: "#4f46e5"
            }).then(() => {
                location.href = "../dashboard.html";
            });

            // 9: else Gona Home

        } else {
            Swal.fire({
                title: "Login Success!",
                text: "Redirecting to Home...",
                icon: "success",
                confirmButtonColor: "#4f46e5"
            }).then(() => {
                location.href = "../UsersFiles/home.html";
            });
        }

        //  ---------------   D: System Error Swal   ---------------

    } catch (err) {
        console.error("Login Error:", err);
        Swal.fire({
            title: "Login Failed",
            text: err.message || "Invalid credentials",
            icon: "error",
            confirmButtonColor: "#4f46e5"
        });
    }
}

lBtn && lBtn.addEventListener("click", login);



//    FORGET PASSWORD FUNCINALITY


const resetBtn = document.getElementById("resetBtn");
const resEmail = document.getElementById("reset-email");


async function reset(e) {
    e.preventDefault();

    if (!resEmail.value) {
        console.log("Input is Empty!!");
        Swal.fire({
            title: "Email required!",
            text: "Please Enter your Email.",
            icon: "warning",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "OK",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        })
        return;
    }

    try {


        const { data, error } = await supabase.auth.resetPasswordForEmail(resEmail.value, {
            redirectTo: "https://azkaazeem.github.io/Login-page---Update-Password-page"

        });

        if (error) {
            console.log('supabase Error:' + ' ' + error.message);
            Swal.fire({
                title: "Error!",
                text: error.message,
                icon: "error",
                draggable: true,
                background: "#f9fbfc",
                color: "#4f46e5",
                confirmButtonColor: "#4f46e5",
                confirmButtonText: "OK",
                padding: "20px",
                borderRadius: "15px",
                customClass: {
                    popup: "glass-alert"
                }
            }).then(() => {
                resEmail.value = "";
            })


        } else {
            console.log('Reset link sent to you Email..')

            Swal.fire({
                title: "Success!",
                text: "Reset link sent to you Email..",
                icon: "success",
                draggable: true,
                // timer: 3000,
                showConfirmButton: false,
                background: "#f9fbfc",
                color: "#4f46e5",
                padding: "20px",
                borderRadius: "15px",
                customClass: {
                    popup: "glass-alert"
                }

            })
        }

    } catch (err) {
        console.log(err)
        Swal.fire({
            title: "System error!",
            html: `Something went wrong internally! <br></br> <b>${err.message || "Unknown error"}</b>`,
            icon: "error",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "Report issue",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        }).then(() => {
            resEmail.value = "";
        })
    }
}


resetBtn && resetBtn.addEventListener("click", reset)







//      UPDATE PASSWORD FUNCTIONALITY

let newPassInp = document.getElementById("newPass");
let conPassInp = document.getElementById("confirmPass");
let ubdBtn = document.getElementById("updatePassBtn");


async function newPass(e) {
    e.preventDefault();

    console.log("Button is clicked!!!!");

    if (!newPassInp.value && !conPassInp.value) {
        console.log("Input is Empty!!");
        Swal.fire({
            title: "Password fields required!",
            text: "Please Enter New password and Confirm password.",
            icon: "warning",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "OK",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        })

        return;
    }

    if (newPassInp.value !== conPassInp.value) {

        console.log("Passwords are not equal!!");

        Swal.fire({
            title: "Password Do Not Match",
            text: "The New Password and Confirm Password fields must be identical..",
            icon: "warning",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "OK",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        })

        return;
    }


    try {

        const { data, error } = await supabase.auth.updateUser({
            password: newPassInp.value
        });

        if (error) {
            console.log(error.message);
            Swal.fire({
                title: "Updation Failed!",
                text: error.message,
                icon: "error",
                draggable: true,
                background: "#f9fbfc",
                color: "#4f46e5",
                confirmButtonColor: "#4f46e5",
                confirmButtonText: "OK",
                padding: "20px",
                borderRadius: "15px",
                customClass: {
                    popup: "glass-alert"
                }
            }).then(() => {
                newPassInp.value = "";
                conPassInp.value = "";
            })


        } else {
            Swal.fire({
                title: "Success!",
                text: "Your password has been updated successfully. Redirecting to login.",
                icon: "success",
                draggable: true,
                timer: 3000,
                showConfirmButton: false,
                background: "#f9fbfc",
                color: "#4f46e5",
                padding: "20px",
                borderRadius: "15px",
                customClass: {
                    popup: "glass-alert"
                }

            })
                .then(() => {
                    location.href = 'https://azkaazeem.github.io/Login-page/';
                });
        }

    } catch (err) {
        console.log(err)
        Swal.fire({
            title: "System error!",
            html: `Something went wrong internally! <br></br> <b>${err.message || "Unknown error"}</b>`,
            icon: "error",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "Report issue",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        }).then(() => {
            newPassInp.value = "";
            conPassInp.value = "";

        })
    }
}

ubdBtn && ubdBtn.addEventListener("click", newPass)


// SHOW/HIDE PASSWORD TOGGLE  for update Password

let toggles = document.querySelectorAll(".toggle-password");

toggles && toggles.forEach(toggle => {

    function toggIcon() {
        let id = toggle.getAttribute("data-target");
        let input = document.getElementById(id);

        if (input.type === "password") {
            input.type = "text";
            toggle.classList.replace("fa-eye-slash", "fa-eye");
        } else {
            input.type = "password";
            toggle.classList.replace("fa-eye", "fa-eye-slash");
        }

        console.log("Cutie Eye Icon is clicked!!!!");


    }

    toggle && toggle.addEventListener("click", toggIcon)
}

)

// --- OAuth Functions ---

// async function signInWithGoogle() {
//     const { error } = await supabase.auth.signInWithOAuth({
//         provider: 'google',
//         options: {
//             redirectTo: window.location.origin + '/home.html',
//         },
//     });
//     if (error) console.error("Google Login Error:", error.message);
// }

// async function signInWithGithub() {
//     const { error } = await supabase.auth.signInWithOAuth({
//         provider: 'github',
//         options: {
//             redirectTo: window.location.origin + '/home.html',
//         },
//     });
//     if (error) console.error("Github Login Error:", error.message);
// }

// const googleLoginBtn = document.querySelector(".btn-social.google");
// const githubLoginBtn = document.querySelector(".btn-social.github");

// if (googleLoginBtn) {
//     googleLoginBtn.addEventListener("click", signInWithGoogle);
// }

// if (githubLoginBtn) {
//     githubLoginBtn.addEventListener("click", signInWithGithub);
// }