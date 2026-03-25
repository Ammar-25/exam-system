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
async function markAllRead() {
  const button = document.getElementById("mark-all-read");
  button.disabled = true;

  const badge = document.getElementById("notif-badge");
  const container = document.getElementById("notif-list");

  loadingMarkAsRead(true);

  try {
    const res = await apiFetch("/student/mark-all-read", {
      method: "POST",
    });
    if (res.ok) {
      if (badge) {
        badge.classList.add("hidden");
      }
      container.innerHTML = `
        <li class="px-4 py-6 text-center text-sm text-gray-500">
          You have no unread notifications.
        </li>
      `;
      showToast("All notifications marked as read");
    } else {
      const resData = await res.json();
      console.log(resData.message);
      showToast("Something went wrong", true);
    }
  } catch (error) {
    console.error(error);
    showToast("Network error occurred", true);
  } finally {
    loadingMarkAsRead(false);
    button.disabled = false;
  }
}

async function markOneRead(id) {
  loadingMarkAsRead(false);

  try {
    const res = await apiFetch(`/student/mark-one-read/${id}`, {
      method: "POST",
    });

    if (res.ok) {
      const listItem = document.getElementById(`notif-item-${id}`);
      if (listItem) {
        listItem.remove();
      }

      const badge = document.getElementById("notif-badge");
      if (badge) {
        let cnt = parseInt(badge.textContent);
        badge.textContent = cnt - 1;

        if (cnt - 1 <= 0) {
          badge.classList.add("hidden");

          const notifList = document.getElementById("notif-list");
          if (
            notifList &&
            notifList.querySelectorAll(".notif-item").length === 0
          ) {
            notifList.innerHTML = `
              <li class="px-4 py-6 text-center text-sm text-gray-500">
                You have no unread notifications.
              </li>
            `;
          }
        }
      }

      showToast("Notification marked as read");
    } else {
      const resData = await res.json();
      console.log(resData.message);
      showToast("Something went wrong", true);
    }
  } catch (error) {
    console.error(error);
    showToast("Network error occurred", true);
  } finally {
    loadingMarkAsRead(false);
  }
}

function showToast(msg, isError = false) {
  let toastTimer;
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-msg");
  const toastIcon = document.getElementById("toast-icon");
  toastMsg.textContent = msg;

  if (isError) {
    toastIcon.className =
      "flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400 flex-shrink-0";
    toastIcon.innerHTML =
      '<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>';
  } else {
    toastIcon.className =
      "flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0";
    toastIcon.innerHTML =
      '<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>';
  }

  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 3000);
}

function loadingMarkAsRead(loading = true) {
  const overlay = document.getElementById("notif-loading-overlay");
  const list = document.getElementById("notif-list");

  if (!overlay || !list) return;

  if (loading) {
    overlay.classList.remove("opacity-0", "pointer-events-none");
    overlay.classList.add("opacity-100", "pointer-events-auto");

    list.classList.add("pointer-events-none", "animate-pulse");
  } else {
    overlay.classList.remove("opacity-100", "pointer-events-auto");
    overlay.classList.add("opacity-0", "pointer-events-none");

    list.classList.remove("pointer-events-none", "animate-pulse");
  }
}
