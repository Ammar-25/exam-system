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

function showPass() {
  var x = document.getElementById("password");
  var img = document.getElementById("eye");

  if (x.type === "password") {
    x.type = "text";
    img.src = "assets/hidden.png";
  } else {
    x.type = "password";
    img.src = "assets/visible.png";
  }
}
