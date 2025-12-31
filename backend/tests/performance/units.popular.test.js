const { exec } = require('child_process');
const { readFile: readFileAsync } = require('node:fs/promises');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { TEST_PORT } = require('./jest.setup');

const execAsync = util.promisify(exec);

describe('Performance Smoke Tests', () => {
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

  test('compare', async () => {
    const baseline = await runArtillery('v1.units.popular');
    const candidate = await runArtillery('v2.units.popular');

    const p95Baseline = baseline.aggregate.summaries["http.response_time"].p95;
    const p95Candidate = candidate.aggregate.summaries["http.response_time"].p95;

    console.log(`
      📊 Results:
      Baseline p95:  ${p95Baseline}ms
      Candidate p95: ${p95Candidate}ms
      ----------------------------
      Difference:    ${p95Candidate - p95Baseline}ms
    `);

    expect(p95Candidate).toBeLessThan(p95Baseline);
  }, 120_000);
});
