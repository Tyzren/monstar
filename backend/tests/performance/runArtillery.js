const { readFile: readFileAsync } = require('node:fs/promises');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { TEST_PORT } = require('./jest.setup');

const execAsync = util.promisify(exec);

/**
 * Creates a shell and runs artillery
 */
const runArtillery = async (scriptName) => {
  const scriptPath = path.join(__dirname, scriptName + '.yml');
  const reportPath = path.join(__dirname, scriptName + '.report.json');
  const testServerUrl = `http://localhost:${TEST_PORT}`;

  if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);

  console.log(`Running ${scriptName}`);

  try {
    await execAsync(`npx artillery run -t "${testServerUrl}" -o "${reportPath}" "${scriptPath}"`);
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
