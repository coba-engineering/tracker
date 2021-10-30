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
  let url = window.location.hostname + window.location.pathname;
  url = url.startsWith("www.") ? url.slice(4) : url;
  url = url.endsWith("/") ? url.slice(0, 1) : url;
  return url;
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

const urlEquals = (a, b) => {
  let A = new URL(a);
  let B = new URL(b);

  return (
    A.hostname === B.hostname &&
    A.pathname.replace(/\//g, "") === B.pathname.replace(/\//g, "")
  );
};

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
        if (urlEquals(trigger, url)) track("view");
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
