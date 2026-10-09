import { readFileSync, existsSync } from 'node:fs';

const read = path => {
  if (!existsSync(path)) throw new Error(`Missing required file: ${path}`);
  return readFileSync(path, 'utf8');
};
const checks = [];
const check = (name, condition) => {
  checks.push({ name, pass: Boolean(condition) });
  if (!condition) console.error(`FAIL ${name}`);
  else console.log(`PASS ${name}`);
};

const schema = read('supabase/migrations/20261009000100_milestone_1_core_schema.sql');
const viewport = read('supabase/migrations/20261009000200_viewport_rpc_coordinates.sql');
const marker = read('src/components/TipMarker.jsx');
const theme = read('src/theme/tiptripTheme.js');
const categories = read('src/theme/tipCategories.js');
const store = read('src/state/mapPinStore.js');
const app = read('App.js');
const pkg = JSON.parse(read('package.json'));

check('PostGIS extension enabled', /create extension if not exists postgis/i.test(schema));
check('Core profiles, destinations, map_pins, trips, saved_tips tables exist', ['profiles','destinations','map_pins','trips','saved_tips'].every(t => new RegExp(`create table if not exists public\\.${t}\\b`, 'i').test(schema)));
check('Map pins use geography(Point, 4326)', /location extensions\\.geography\\(Point, 4326\\)/i.test(schema));
check('Spatial GIST index exists', /using gist \\(location\\)/i.test(schema));
check('RLS enabled on all core tables', ['profiles','destinations','map_pins','trips','saved_tips'].every(t => new RegExp(`alter table public\\.${t} enable row level security`, 'i').test(schema)));
check('Viewport RPC is SECURITY INVOKER', /get_pins_in_viewport[\\s\\S]*?security invoker/i.test(schema));
check('Viewport RPC returns explicit coordinates', /returns table[\\s\\S]*?latitude double precision[\\s\\S]*?longitude double precision/i.test(viewport));
check('Viewport query intersects geography against envelope', /st_intersects\\([\\s\\S]*?p\\.location,[\\s\\S]*?st_makeenvelope[\\s\\S]*?::extensions\\.geography/i.test(viewport));
check('Marker uses React.memo', /export default memo\\(TipMarker/i.test(marker));
check('Marker disables tracksViewChanges', /tracksViewChanges=\\{false\\}/.test(marker));
check('Theme has the required teal palette', /#0F766E/.test(theme) && /#0D9488/.test(theme));
check('At least 12 categories defined', (categories.match(/\\{ id:/g) || []).length >= 12);
check('Zustand store and dependency exist', /create\\(\\(set, get\\)/.test(store) && Boolean(pkg.dependencies?.zustand));
check('Map viewport requests are debounced', /setTimeout\\(\\(\\) => loadViewport\\(nextRegion\\), 300\\)/.test(app));
check('Stale map requests are ignored', /requestId === requestSequence\\.current/.test(app));
check('Five primary app tabs are present', ['explore','feed','trips','map','profile'].every(t => app.includes(`id: '${t}'`)));

const failed = checks.filter(x => !x.pass);
console.log(`\\nStatic acceptance checks: ${checks.length - failed.length}/${checks.length} passed.`);
if (failed.length) process.exitCode = 1;
