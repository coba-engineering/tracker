import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yjjqcbwwpdxdbnyhbwme.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjk4M" +
  "jg1OCwiZXhwIjoxOTQ4NTU4ODU4fQ.uclyC8mUUCjXai6nlEyZAwDit1A0cDiqLrJCCChHsXI";
const supabase = createClient(supabaseUrl, supabaseKey);

const EID = "";

// prettier-ignore
const f=(a,b)=>{for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b}

const uuid = () => f();

const getCurrentURL = () => {
  const url = window.location.hostname + window.location.pathname;
  return url.startsWith("www.") ? url.slice(4) : url;
};

const fetchExperiments = () =>
  supabase
    .from("experiments")
    .select("*, redirects ( destination )")
    .filter("redirects.destination", "eq", getCurrentURL())
    .then(({ data: experiments }) => experiments);

function pushEvents(events) {
  return supabase.from("events").insert(events);
}

function isURLmatches(pattern, url) {
  const segments = pattern.split("/");
  const b = url.split("/");

  return segments.every((segment, i) => b[i] === segment);
}

function init(ip) {
  const url = getCurrentURL();

  const track = (action) => {
    const event = {
      id: uuid(),
      url,
      ip,
      action,
      timestamp: new Date().toJSON(),
    };
    console.log("tracking", event);
    pushEvents([event]).then(console.log).catch(console.error);
  };

  function addConversionListener({ type, trigger }) {
    switch (type) {
      case "click":
        let elements = Array.from(document.getElementsByClassName(trigger));
        elements.forEach((e) => {
          e.addEventListener("click", () => track("click"), { once: true });
        });
        break;
      case "view":
        if (isURLmatches(trigger, url)) track("view");
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
