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

    window.brodstarShowMessage("", false);
  }

  qtab.addEventListener("click", function () {
    showMode("question");
  });

  rtab.addEventListener("click", function () {
    showMode("roster");
  });

  function field(id) {
    return document.getElementById(id).value.trim();
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!db) {
      window.brodstarShowMessage(
        "Database connection unavailable. Try again later.",
        true
      );
      return;
    }

    const username = field("username");
    const league = field("league");

    if (!username) {
      window.brodstarShowMessage(
        "Please enter your TikTok username.",
        true
      );
      return;
    }

    let payload;

    if (mode === "question") {
      const question = field("question");

      if (!question) {
        window.brodstarShowMessage(
          "Please enter a question.",
          true
        );
        return;
      }

      payload = {
        username: username,
        question: "[" + league + "] " + question
      };
    } else {
      const roster = {
        QB: field("qb"),
        RB: field("rb"),
        WR: field("wr"),
        TE: field("te"),
        FLEX: field("flex"),
        BENCH: field("bench")
      };

      const hasPlayers = Object.values(roster).some(Boolean);

      if (!hasPlayers) {
        window.brodstarShowMessage(
          "Please enter at least one player.",
          true
        );
        return;
      }

      const rosterText = Object.entries(roster)
        .filter(function (entry) {
          return entry[1];
        })
        .map(function (entry) {
          return entry[0] + ":\n" + entry[1];
        })
        .join("\n\n");

      payload = {
        username: username,
        question:
          "[ROSTER REVIEW - " + league + "]\n\n" +
          rosterText +
          "\n\nREVIEW REQUEST:\n" +
          (field("rosterQuestion") || "General roster review")
      };
    }

    submitButton.disabled = true;
    window.brodstarShowMessage("Submitting...", false);

    try {
      const result = await db
        .from("questions")
        .insert(payload);

      if (result.error) {
        throw result.error;
      }

      form.reset();
      showMode(mode);

      window.brodstarShowMessage(
        "Submitted! Watch the LIVE for your review.",
        false
      );
    } catch (error) {
      console.error("Submission error:", error);

      window.brodstarShowMessage(
        "Submission failed. Please try again.",
        true
      );
    } finally {
      submitButton.disabled = false;
    }
  });

  showMode("question");
})();
