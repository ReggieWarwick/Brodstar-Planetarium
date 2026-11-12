(function () {
  "use strict";

  const db = window.brodstarDB;
  const form = document.getElementById("form");
  const qtab = document.getElementById("qtab");
  const rtab = document.getElementById("rtab");
  const stab = document.getElementById("stab");
const ttab = document.getElementById("ttab");
  const questionFields = document.getElementById("questionFields");
  const rosterFields = document.getElementById("rosterFields");
  const formtitle = document.getElementById("formtitle");
  const submitButton = document.getElementById("submit");

  let mode = "question";
  const rosterPositions = ["qb", "rb", "wr", "te", "flex", "bench"];

document.querySelectorAll(".addRosterPlayer").forEach(button => {
  button.addEventListener("click", function () {
    const container = document.getElementById(button.dataset.container);
    const input = document.createElement("input");

    input.type = "text";
    input.className = button.dataset.playerClass;
    input.placeholder =
      button.dataset.label + " " + (container.children.length + 1);

    container.appendChild(input);
  });
});

function updateRosterPlayerFields() {
  rosterPositions.forEach(position => {
    const inputs = document.querySelectorAll(
      "#" + position + "Boxes input"
    );

    const players = Array.from(inputs)
      .map(input => input.value.trim())
      .filter(Boolean);

    document.getElementById(position).value = players.join("\n");
  });
}

form.addEventListener("submit", updateRosterPlayerFields, true);

const addStartSitPlayerButton = document.getElementById("addStartSitPlayer");

if (addStartSitPlayerButton) {
  addStartSitPlayerButton.addEventListener("click", function () {
    const container = document.getElementById("startSitPlayerBoxes");
    const input = document.createElement("input");

    input.type = "text";
    input.placeholder = "Player " + (container.children.length + 1);
    input.className = "startSitPlayer";

    container.appendChild(input);
  });
}
function setupTradeAddButton(buttonId, containerId, playerClass) {
  const button = document.getElementById(buttonId);
  const container = document.getElementById(containerId);

  if (!button || !container) return;

  button.addEventListener("click", function () {
    const input = document.createElement("input");
    input.type = "text";
    input.className = playerClass;
    input.placeholder = "Player " + (container.children.length + 1);
    container.appendChild(input);
  });
}

setupTradeAddButton("addTradeGive", "tradeGiveBoxes", "tradeGivePlayer");
setupTradeAddButton("addTradeReceive", "tradeReceiveBoxes", "tradeReceivePlayer");
  function field(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error("Missing form field: " + id);
  }

  return element.value.trim();
}

  function showMessage(text, isError) {
  const message = document.getElementById("message");
  if (!message) return;
  message.textContent = text;
  message.style.color = isError ? "#ff6677" : "#ffdd47";
}

  function showMode(nextMode) {
  mode = nextMode;

  const isRoster = mode === "roster";
  const isQuestion = mode === "question";
  const isStartSit = mode === "startsit";
  const isTrade = mode === "trade";

  qtab.classList.toggle("active", isQuestion);
  rtab.classList.toggle("active", isRoster);
  stab.classList.toggle("active", isStartSit);
  ttab.classList.toggle("active", isTrade);

  questionFields.classList.toggle("hidden", !isQuestion);
  rosterFields.classList.toggle("hidden", !isRoster);
    document.getElementById("startSitFields").classList.toggle("hidden", !isStartSit);
document.getElementById("tradeFields").classList.toggle("hidden", !isTrade);


  formtitle.textContent = isRoster
    ? "Submit your fantasy football roster"
    : isStartSit
    ? "Who should I start or sit?"
    : isTrade
    ? "Get fantasy football trade advice"
    : "Rate My Fantasy Football Matchup";

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

stab.addEventListener("click", function () {
  showMode("startsit");
});

ttab.addEventListener("click", function () {
  showMode("trade");
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
  : mode === "startsit"
  ? "Start/Sit"
  : mode === "trade"
  ? "Trade Advice"
  : "Rate My Matchup",
      question: "",
      league_format: league,
      league_size: mode === "roster" ? Number(field("leagueSize")) : null
    };

    if (mode === "question") {
  const myLineup = field("myLineup");
  const opponentLineup = field("opponentLineup");
  const notes = field("question");

  if (!myLineup || !opponentLineup) {
    showMessage("Enter both starting lineups.", true);
    return;
  }

  payload.question =
    "RATE MY MATCHUP\n\n" +
    "MY STARTING LINEUP:\n" + myLineup +
    "\n\nOPPONENT'S STARTING LINEUP:\n" + opponentLineup +
    (notes ? "\n\nMATCHUP NOTES:\n" + notes : "");
   } else if (mode === "startsit") {
  const players = Array.from(
  document.querySelectorAll(".startSitPlayer")
)
  .map(input => input.value.trim())
  .filter(Boolean);


  if (players.length < 2) {
    showMessage("Enter at least two players.", true);
    return;
  }

const pickCount = document.getElementById("startSitPickCount").value;

payload.question =
  "START / SIT — PICK " + pickCount + ":\n" +
  players.join(" vs ");

} else if (mode === "trade") {
 const giving = Array.from(
  document.querySelectorAll(".tradeGivePlayer")
)
  .map(input => input.value.trim())
  .filter(Boolean);

const receiving = Array.from(
  document.querySelectorAll(".tradeReceivePlayer")
)
  .map(input => input.value.trim())
  .filter(Boolean);


  if (!giving.length || !receiving.length) {
    showMessage("Enter players on both sides of the trade.", true);
    return;
  }

  payload.question =
    "TRADE AWAY: " + giving.join(", ") +
    "\nRECEIVE: " + receiving.join(", ");

} else if (mode === "roster") {
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
