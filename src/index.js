import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yjjqcbwwpdxdbnyhbwme.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjk4M" +
  "jg1OCwiZXhwIjoxOTQ4NTU4ODU4fQ.uclyC8mUUCjXai6nlEyZAwDit1A0cDiqLrJCCChHsXI";
const supabase = createClient(supabaseUrl, supabaseKey);

const normalize = (url) => {
  url = url.startsWith("www.") ? url.slice(4) : url;
  url = url.endsWith("/") ? url.slice(0, -1) : url;
  return url;
};

const getCurrentURL = () => normalize(location.hostname + location.pathname);

const fetchExperiments = () =>
  supabase
    .from("experiments")
    .select("*, redirects ( destination )")
    .filter("redirects.destination", "eq", getCurrentURL())
    .then(({ data: experiments }) => experiments);

function pushEvents(events) {
  return supabase.from("events").insert(events);
}

function init(ip) {
  const url = getCurrentURL();

  const track = (action, override) => {
    const event = {
      url,
      ip,
      action,
      timestamp: new Date().toJSON(),
      ...override,
    };
    console.log("tracking", event);
    pushEvents([event]);
  };

  setTimeout(() => track("view", { is_conversion: false }), 3000);

  function addConversionListener({ type, trigger }) {
    switch (type) {
      case "click":
        let elements = Array.from(document.getElementsByClassName(trigger));
        elements.forEach((e) => {
          e.addEventListener("click", () => track("click"), { once: true });
        });
        break;

      case "view":
        if (normalize(trigger) === normalize(url)) track("view");
        break;

      default:
        break;
    }
  }

  fetchExperiments().then((experiments) =>
    experiments.forEach(addConversionListener)
  );
}

fetch("https://api.ipify.org")
  .then((r) => r.text())
  .then((ip) => init(ip));
