const { readFile: readFileAsync } = require('node:fs/promises');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

/**
 * Creates a shell and runs artillery
 */
const runArtillery = async (scriptName) => {
  const scriptPath = path.join(__dirname, scriptName + '.yml');
  const reportPath = path.join(__dirname, scriptName + '.report.json');

  if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);

  console.log(`Running ${scriptName}`);

  try {
    await execAsync(`npx artillery run -o "${reportPath}" "${scriptPath}"`);
  } catch (err) {
    console.error(`❌ Artillery CRASHED for ${scriptName}`);
    console.error(err.stdout);
    console.error(err.stderr);
    throw err;
  }

  const report = await readFileAsync(reportPath, 'utf-8');
  return JSON.parse(report);
};

module.exports = { runArtillery };
