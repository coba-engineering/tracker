const SUPABASE_HOST = "https://yjjqcbwwpdxdbnyhbwme.supabase.co/rest/v1/";

// prettier-ignore
function supabase(endpoint, body) {
  return fetch(SUPABASE_HOST + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjk4Mjg1OCwiZXhwIjoxOTQ4NTU4ODU4fQ.uclyC8mUUCjXai6nlEyZAwDit1A0cDiqLrJCCChHsXI",
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjk4Mjg1OCwiZXhwIjoxOTQ4NTU4ODU4fQ.uclyC8mUUCjXai6nlEyZAwDit1A0cDiqLrJCCChHsXI",
    },
    body: JSON.stringify(body),
  });
}

const normalize = (url) => {
  url = url.startsWith("www.") ? url.slice(4) : url;
  url = url.endsWith("/") ? url.slice(0, -1) : url;
  return url;
};

const url = normalize(location.hostname + location.pathname);

const fetchExperiments = () => supabase("rpc/get_experiments", { url });
const pushEvents = (events) => supabase("events", events);

function init(ip) {
  function track(action, override) {
    const event = {
      url,
      ip,
      action,
      timestamp: new Date().toJSON(),
      ...override,
    };
    console.log("tracking", event);
    pushEvents([event]);
  }

  function addConversionListener({ type, trigger }) {
    switch (type) {
      case "click":
        let elements = Array.from(document.getElementsByClassName(trigger));
        elements.forEach((e) => {
          e.addEventListener("click", () => track("click"), { once: true });
        });
        break;

      case "view":
        if (normalize(trigger) === url) track("view");
        break;

      default:
        break;
    }
  }

  setTimeout(() => track("view", { is_conversion: false }), 1000);

  fetchExperiments().then((experiments) =>
    experiments.forEach(addConversionListener)
  );
}

fetch("https://api.ipify.org")
  .then((r) => r.text())
  .then((ip) => init(ip));
