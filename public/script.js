async function apiFetch(url, options = {}) {
  options.credentials = "include";
  let response = await fetch(url, options);

  if (response.status === 401) {
    console.log("Token expired, attempting refresh...");

    const refreshRes = await fetch("/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.status === 200) {
      response = await fetch(url, options);
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
