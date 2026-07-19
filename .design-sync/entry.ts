// design-sync bundle entry: names the exports for window.CasaCristiana.
// The site itself has no library build, so this file is the package surface.
// globals.css rides along so the site tokens (--bg, --text, …) ship in
// _ds_bundle.css instead of being duplicated into config.
import '../app/globals.css';
export { default as Dollhouse } from '../app/writing/Dollhouse';
export type { ShelfBook } from '../app/writing/Dollhouse';
