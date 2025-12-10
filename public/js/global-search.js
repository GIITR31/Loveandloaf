function setupGlobalSearch() {
  const input = document.getElementById("global-search");
  if (!input) return;

  const go = () => {
    const q = input.value.trim();
    const url = q ? `/cakes.html?q=${encodeURIComponent(q)}` : "/cakes.html";
    window.location.href = url;
  };

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") go();
  });
}

document.addEventListener("DOMContentLoaded", setupGlobalSearch);
