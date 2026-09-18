const fs = require('node:fs');
const path = require('node:path');
function openPreferences(directory) {
  const filename = path.join(directory, 'preferences.json');
  const defaults = { appLanguage: 'ar', terminalLanguage: 'en' };
  let value = defaults;
  if (fs.existsSync(filename)) {
    try { const input = JSON.parse(fs.readFileSync(filename, 'utf8')); value = { appLanguage: ['ar','en'].includes(input.appLanguage) ? input.appLanguage : 'ar', terminalLanguage: ['ar','en'].includes(input.terminalLanguage) ? input.terminalLanguage : 'en' }; }
    catch { /* Recover invalid preferences without touching sketches or the database. */ }
  }
  return {
    get: () => ({ ...value }),
    set(input) {
      if (!input || !['ar','en'].includes(input.appLanguage) || !['ar','en'].includes(input.terminalLanguage)) throw new Error('Invalid language preference');
      const next = { appLanguage: input.appLanguage, terminalLanguage: input.terminalLanguage };
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(filename + '.tmp', JSON.stringify(next, null, 2), { mode: 0o600 });
      fs.renameSync(filename + '.tmp', filename); value = next; return { ...value };
    },
  };
}
module.exports = { openPreferences };
