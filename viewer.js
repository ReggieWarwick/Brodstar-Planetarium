(function () {
  "use strict";

  const db = window.brodstarDB;
  const form = document.getElementById("form");
  const qtab = document.getElementById("qtab");
  const rtab = document.getElementById("rtab");
  const questionFields = document.getElementById("questionFields");
  const rosterFields = document.getElementById("rosterFields");
  const formtitle = document.getElementById("formtitle");
  const submitButton = document.getElementById("submit");

  let mode = "question";

  function field(id) {
    return document.getElementById(id).value.trim();
  }

  function showMessage(text, isError) {
    const message = document.getElementById("message");
    message.textContent = text;
    message.style.color = isError ? "#ff6677" : "#ffd447";
  }

  function showMode(nextMode) {
    mode = nextMode;
    const isRoster = mode === "roster";

    qtab.classList.toggle("active", !isRoster);
    rtab.classList.toggle("active", isRoster);

    questionFields.classList.toggle("hidden", isRoster);
    rosterFields.classList.toggle("hidden", !isRoster);

    formtitle.textContent = isRoster
      ? "Submit your fantasy football roster"
      : "Ask a fantasy football question";

    submitButton.textContent = isRoster
      ? "Submit My Roster"
      : "Send to LIVE Queue";

    showMessage("", false);
  }

  qtab.addEventListener("click", function () {
    showMode("question");
  });

  rtab.addEventListener("click", function () {
    showMode("roster");
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!db) {
      showMessage("Database connection unavailable.", true);
      return;
    }

    const username = field("username");
    const league = field("league");

    if (!username) {
      showMessage("Enter your TikTok username.", true);
      return;
    }

    const payload = {
      username: username,
      question_type: mode === "roster"
        ? "Rate My Team"
        : "Start/Sit",
      question: "",
      league_format: league,
      league_size: mode === "roster" ? Number(field("leaguesize")) : null
    };

    if (mode === "question") {
      const question = field("question");

      if (!question) {
        showMessage("Enter your question.", true);
        return;
      }

      payload.question = question;
    } else {
      const roster = {
        QB: field("qb"),
        RB: field("rb"),
        WR: field("wr"),
        TE: field("te"),
        FLEX: field("flex"),
        BENCH: field("bench")
      };

      if (!Object.values(roster).some(Boolean)) {
        showMessage("Enter at least one player.", true);
        return;
      }

      payload.roster = roster;
      payload.question =
        field("rosterQuestion") || "General roster review";
    }

    submitButton.disabled = true;
    showMessage("Submitting...", false);

    try {
      const { error } = await db
        .from("questions")
        .insert(payload);

      if (error) throw error;

      form.reset();
      showMode(mode);

      showMessage(
        "Submitted! Watch the LIVE for your review.",
        false
      );
    } catch (error) {
      console.error("Supabase submission error:", error);

      showMessage(
        "Submission failed: " +
        (error.message || "Unknown error"),
        true
      );
    } finally {
      submitButton.disabled = false;
    }
  });

  showMode("question");
})();
