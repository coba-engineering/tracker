import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yjjqcbwwpdxdbnyhbwme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjk4M' +
  'jg1OCwiZXhwIjoxOTQ4NTU4ODU4fQ.uclyC8mUUCjXai6nlEyZAwDit1A0cDiqLrJCCChHsXI';
const supabase = createClient(supabaseUrl, supabaseKey);

const EID = '';

// prettier-ignore
const f=(a,b)=>{for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const uuid = () => f();

const getCurrentURL = () => window.location.hostname + window.location.pathname;

const fetchExperiments = async () => {
  let { data: experiments, error } = await supabase
    .from('experiments')
    .select('*')
    .filter('redirects.destination', 'eq', getCurrentURL());

  return experiments;
};

async function pushEvents(events) {
  const { data, error } = await supabase.from('events').insert(events);
}

function isURLmatches(pattern, url) {
  const candidate = url.startsWith('www.') ? url.slice(4) : url;
  const segments = pattern.split('/');
  const b = candidate.split('/');

  return segments.every((segment, i) => b[i] === segment);
}

async function init() {
  const url = getCurrentURL();
  const ip = await fetch('https://api.ipify.org').then((r) => r.text());

  let events = [];
  setInterval(async () => {
    const payload = events.slice();
    await pushEvents(payload);
    events = events.filter((a) => payload.find((b) => a.uuid !== b.uuid));
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
      case 'BUTTON':
        let elements = Array.from(document.getElementsByClassName(trigger));
        elements.forEach((e) => e.addEventListener('click', track('click')));
        break;
      case 'URL':
        if (isURLmatches(trigger, url)) track('view');
        break;

      default:
        break;
    }
  }

  window.addEventListener('load', async () => {
    fetchExperiments().then((experiments) =>
      experiments.forEach(addConversionListener)
    );
  });
}

init()
