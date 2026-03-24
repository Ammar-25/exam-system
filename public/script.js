async function apiFetch(url, options = {}) {
  const fetchOptions = { ...options, credentials: "include" };

  let response = await fetch(url, fetchOptions);

  if (response.status === 401) {
    console.log("Token expired, attempting refresh...");

    const refreshRes = await fetch("/refresh", {
      method: "GET",
      credentials: "include",
    });

    if (refreshRes.status === 200) {
      response = await fetch(url, fetchOptions);
    } else {
      window.location.href = "/login";
      throw new Error("Token refresh failed");
    }
  }
  return response;
}
function show_password() {
  const passwordInput = document.getElementById("password");
  const toggle_password = document.getElementById("toggle-password");
  const passwordType = passwordInput.getAttribute("type");

  if (passwordType === "password") {
    passwordInput.setAttribute("type", "text");
    toggle_password.textContent = "Hide";
  } else {
    passwordInput.setAttribute("type", "password");
    toggle_password.textContent = "Show";
  }
}

function toggleNotif() {
  const dropdown = document.getElementById("notif-dropdown");
  dropdown.classList.toggle("hidden");
}

function markAllRead() {
  // TODO: clear notifications from div and update db
  document.querySelectorAll(".notif-item.unread").forEach((item) => {
    item.classList.remove("unread", "bg-indigo-500/5");
    item
      .querySelector(".rounded-full.bg-indigo-400")
      ?.classList.replace("bg-indigo-400", "bg-transparent");
  });
  const badge = document.getElementById("notif-badge");
  badge.classList.add("hidden");
}

// Close dropdown when clicking outside
document.addEventListener("click", function (e) {
  const wrapper = document.getElementById("notif-wrapper");
  if (!wrapper.contains(e.target)) {
    document.getElementById("notif-dropdown").classList.add("hidden");
  }
});

async function logout() {
  try {
    const response = await fetch("/logout", {
      method: "POST",
    });
    if (response.ok) {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Logout failed:", error);
    window.location.href = "/login";
  }
}

// if there is toast
function closeToast() {
  const toast = document.getElementById("toast-message");
  if (toast) {
    toast.classList.remove("translate-x-0", "opacity-100");
    toast.classList.add("translate-x-full", "opacity-0");

    setTimeout(() => {
      toast.remove();
    }, 500);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const toast = document.getElementById("toast-message");
  if (toast) {
    setTimeout(() => {
      closeToast();
    }, 4000);
  }
});
