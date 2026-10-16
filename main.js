
const root = document.querySelector("main");
const component = document.querySelector("#data-component");
const statusMessage = document.querySelector("#component-status");
const dataContent = document.querySelector("#data-content");
const loadButton = document.querySelector("#load-button");

const STATES = {
  IDLE: "IDLE",
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR"
};

let currentState = STATES.IDLE;
let currentData = [];
let currentError = "";



function setState(nextState) {
  const allowedStates = Object.values(STATES);

  if (!allowedStates.includes(nextState)) {
    throw new Error(`Invalid state: ${nextState}`);
  }

  currentState = nextState;
  render();
}


function render() {
  component.setAttribute(
    "aria-busy",
    String(currentState === STATES.LOADING)
  );

  dataContent.replaceChildren();
  statusMessage.className = "";

  if (currentState === STATES.IDLE) {
    statusMessage.textContent = "Ready to load data.";
    loadButton.disabled = false;
    return;
  }

  if (currentState === STATES.LOADING) {
    statusMessage.textContent = "Loading data...";
    loadButton.disabled = true;

    const skeletonTitle = document.createElement("p");
    skeletonTitle.className = "skeleton skeleton-title";
    skeletonTitle.setAttribute("aria-hidden", "true");

    const skeletonLine = document.createElement("p");
    skeletonLine.className = "skeleton skeleton-line";
    skeletonLine.setAttribute("aria-hidden", "true");

    const skeletonShort = document.createElement("p");
    skeletonShort.className = "skeleton skeleton-short";
    skeletonShort.setAttribute("aria-hidden", "true");

    dataContent.append(
      skeletonTitle,
      skeletonLine,
      skeletonShort
    );

    return;
  }


if (currentState === STATES.SUCCESS) {
  statusMessage.className = "success-message";
  statusMessage.textContent = "Data loaded successfully.";
  loadButton.disabled = false;

  const list = document.createElement("ul");

  currentData.forEach((item) => {
    const listItem = document.createElement("li");
    const title = document.createElement("h3");
    const body = document.createElement("p");

    title.textContent = item.title;
    body.textContent = item.body;

    listItem.append(title, body);
    list.append(listItem);
  });

  dataContent.append(list);
  return;
}



if (currentState === STATES.ERROR) {
  statusMessage.className = "error-message";
  statusMessage.textContent = currentError;
  loadButton.disabled = false;

  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.textContent = "Retry Connection";
  retryButton.dataset.action = "retry";

  dataContent.append(retryButton);
}

}



render();


let latestRequestId = 0;

async function loadData() {
  const requestId = ++latestRequestId;

  currentError = "";
  currentData = [];
  statusMessage.className = "";

  setState(STATES.LOADING);

  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=5"
    );

    if (!response.ok) {
      throw new Error("Unable to retrieve data. Please try again.");
    }

    const data = await response.json();

    // Ignore an outdated request.
    if (requestId !== latestRequestId) {
      return;
    }

    if (!Array.isArray(data)) {
      throw new Error("The server returned invalid data.");
    }

    currentData = data;
    setState(STATES.SUCCESS);
  } catch (error) {
    // An older request must not overwrite the latest result.
    if (requestId !== latestRequestId) {
      return;
    }

    currentError =
      "Unable to load data. Check your connection and try again.";

    setState(STATES.ERROR);
  }
}


root.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button || !root.contains(button)) {
    return;
  }

  if (button === loadButton) {
    loadData();
    return;
  }

  if (button.dataset.action === "retry") {
    loadData();
  }
});
