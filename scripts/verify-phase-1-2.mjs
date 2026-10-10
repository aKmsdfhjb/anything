import { readFileSync, existsSync } from 'node:fs';

const read = path => {
  if (!existsSync(path)) throw new Error(`Missing required file: ${path}`);
  return readFileSync(path, 'utf8');
};
const checks = [];
const check = (name, condition) => {
  checks.push({ name, pass: Boolean(condition) });
  console.log(`${condition ? 'PASS' : 'FAIL'} ${name}`);
};

const schema = read('supabase/migrations/20261009000100_milestone_1_core_schema.sql');
const viewport = read('supabase/migrations/20261009000200_viewport_rpc_coordinates.sql');
const marker = read('src/components/TipMarker.jsx');
const theme = read('src/theme/tiptripTheme.js');
const categories = read('src/theme/tipCategories.js');
const store = read('src/state/mapPinStore.js');
const app = read('App.js');
const geocoding = read('src/services/geocoding.js');
const tripRepository = read('src/services/tripRepository.js');
const benchmark = read('supabase/verification/benchmark_map_pins.sql');
const postMigration = read('supabase/verification/milestone_1_phase_1_2.sql');
const readme = read('README.md');
const env = read('.env.example');
const pkg = JSON.parse(read('package.json'));
const workflow = read('.github/workflows/milestone1-verification.yml');
const appConfig = read('app.config.js');

check('PostGIS extension enabled', /create extension if not exists postgis/i.test(schema));
check('Five core tables exist', ['profiles','destinations','map_pins','trips','saved_tips'].every(t => new RegExp(`create table if not exists public\\.${t}\\b`, 'i').test(schema)));
check('Map pins use geography(Point, 4326)', /location extensions\.geography\(Point, 4326\)/i.test(schema));
check('Spatial GIST index exists', /using gist \(location\)/i.test(schema));
check('RLS enabled on all core tables', ['profiles','destinations','map_pins','trips','saved_tips'].every(t => new RegExp(`alter table public\\.${t} enable row level security`, 'i').test(schema)));
check('Viewport RPC uses SECURITY INVOKER', /get_pins_in_viewport[\s\S]*?security invoker/i.test(schema));
check('Viewport RPC returns explicit coordinates', /returns table[\s\S]*?latitude double precision[\s\S]*?longitude double precision/i.test(viewport));
check('Viewport query uses geography intersection', /st_intersects\([\s\S]*?p\.location,[\s\S]*?st_makeenvelope[\s\S]*?::extensions\.geography/i.test(viewport));
check('Post-migration SQL verifier exists', /to_regprocedure\('public\.get_pins_in_viewport/i.test(postMigration));
check('Rollback-safe benchmark creates 1,000 temporary pins', /generate_series\(1, 1000\)/i.test(benchmark) && /rollback;/i.test(benchmark));
check('Marker uses React.memo', /export default memo\(TipMarker/i.test(marker));
check('Marker disables tracksViewChanges', /tracksViewChanges=\{false\}/.test(marker));
check('Theme uses required teal tokens', /#0F766E/.test(theme) && /#0D9488/.test(theme));
check('At least 12 categories defined', (categories.match(/\{ id:/g) || []).length >= 12);
check('Zustand store and dependency exist', /create\(\(set, get\)/.test(store) && Boolean(pkg.dependencies?.zustand));
check('Map viewport requests are debounced', /setTimeout\(\(\) => loadViewport\(nextRegion\), 300\)/.test(app));
check('Stale viewport responses are ignored', /requestId === requestSequence\.current/.test(app));
check('Five primary app tabs exist', ['explore','feed','trips','map','profile'].every(t => app.includes(`id: '${t}'`)));
check('Destination geocoding service exists', /mapbox\.com\/geocoding/.test(geocoding) && /bbox/.test(geocoding));
check('Search UI handles remote results and no-results fallback', /searchDestinations\(search/.test(app) && /Don't see your place/.test(app));
check('Camera animation command is wired', /animateToRegion\(region, 550\)/.test(app) && /cameraCommand=\{cameraCommand\}/.test(app));
check('Tip creation writes a PostGIS point', /st_set|POINT\(/i.test(tripRepository) && /from\('map_pins'\)/.test(tripRepository));
check('Save-to-trip uses relational saved_tips pointers', /from\('saved_tips'\)/.test(tripRepository) && /trip_id,map_pin_id/.test(tripRepository));
check('Profile supports sign-up and sign-in', /signUp\(/.test(app) && /signInWithPassword\(/.test(app));
check('Teal fallback and modal UI styles exist', /mapEmptyOverlay/.test(app) && /modalCard/.test(app) && /borderRadius: radii\.lg/.test(app));
check('Feed empty-state conditional is closed correctly', /visible\.map\(item => <TipCard.*?\/>\) : <EmptyState/.test(app));
check('Trips screen renders saved relational tip pointers', /listSavedTips\(client, trip\.id\)/.test(app) && /savedByTrip\[trip\.id\]/.test(app));
check('Shared card radius matches the 16px spec', /radii = \{ sm: 10, md: 16, lg: 16, pill: 999 \}/.test(theme));
check('Mapbox token is documented without a real secret', /EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=YOUR_/.test(env));
check('Android Google Maps key is configured from environment', /GOOGLE_MAPS_API_KEY/.test(appConfig) && /GOOGLE_MAPS_API_KEY=YOUR_/.test(env));
check('README documents user acceptance steps', /sign up\/sign in/i.test(readme) && /benchmark_map_pins\.sql/.test(readme));
check('CI workflow installs dependencies and bundles app', /npm ci|npm install/.test(workflow) && /expo export/.test(workflow));

const failed = checks.filter(x => !x.pass);
console.log(`\nStatic acceptance checks: ${checks.length - failed.length}/${checks.length} passed.`);
if (failed.length) {
  console.error('Failed checks:', failed.map(x => x.name).join(', '));
  process.exitCode = 1;
}
