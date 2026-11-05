(function () {
  const config = window.BRODSTAR_CONFIG;

  if (!config ||
      !config.supabaseUrl ||
      !config.supabaseKey) {
    console.error("Supabase configuration is missing.");
    return;
  }

  if (!window.supabase) {
    console.error("Supabase library did not load.");
    return;
  }

  window.brodstarDB = window.supabase.createClient(
    config.supabaseUrl,
    config.supabaseKey
  );

  window.brodstarShowMessage = function (text, isError) {
    const message = document.getElementById("message");

    if (!message) return;

    message.textContent = text;
    message.style.color = isError
      ? "#ff6677"
      : "#ffd447";
  };
})();
