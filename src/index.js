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

const getCurrentURL = () => window.location.hostname + window.location.pathname;

const fetchExperiments = () =>
  supabase
    .from("experiments")
    .select("*")
    .filter("redirects.destination", "eq", getCurrentURL())
    .then(({ data: experiments }) => experiments);

function pushEvents(events) {
  supabase.from("events").insert(events);
}

function isURLmatches(pattern, url) {
  const candidate = url.startsWith("www.") ? url.slice(4) : url;
  const segments = pattern.split("/");
  const b = candidate.split("/");

  return segments.every((segment, i) => b[i] === segment);
}

function init(ip) {
  const url = getCurrentURL();

  let events = [];
  setInterval(() => {
    const payload = events.slice();
    if (!payload.length) return;
    pushEvents(payload).then(() => {
      events = events.filter((a) => payload.find((b) => a.uuid !== b.uuid));
    });
  }, 3000);

  const track = (action) => () => {
    events.push({
      id: uuid(),
      url,
      ip,
      action,
      timestamp: new Date().toJSON(),
    });
  };

  function addConversionListener({ type, trigger }) {
    switch (type) {
      case "BUTTON":
        let elements = Array.from(document.getElementsByClassName(trigger));
        elements.forEach((e) => e.addEventListener("click", track("click")));
        break;
      case "URL":
        if (isURLmatches(trigger, url)) track("view");
        break;

      default:
        break;
    }
  }

  window.addEventListener("load", () => {
    fetchExperiments().then((experiments) =>
      experiments.forEach(addConversionListener)
    );
  });
}

fetch("https://api.ipify.org")
  .then((r) => r.text())
  .then((ip) => init(ip));
