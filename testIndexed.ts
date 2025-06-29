import fs from "fs";
import path from "path";

function loadJsonFile(filePath: string) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return null;
  }
}

function resolveBackgroundPath(bgKey: string, baseDir: string, externalDirs: string[]): string {
  const extMatch = bgKey.match(/^ext::(\d+)::(.+)$/);
  if (extMatch) {
    const extIdx = parseInt(extMatch[1], 10);
    const extKey = extMatch[2];
    if (externalDirs[extIdx]) {
      return path.join(externalDirs[extIdx], extKey);
    }
  }
  return path.join(baseDir, bgKey);
}

function checkBackgrounds(backgroundsJsonPath: string, baseDir: string, externalDirs: string[]) {
  const backgroundsData = loadJsonFile(backgroundsJsonPath);
  if (!backgroundsData) return;

  const { backgrounds } = backgroundsData;

  let mismatched = 0;
  let succeeded = 0;
  let notFound = 0;
  let noBgJson = 0;
  let noData = 0;
  let errorLocalIndexed = 0;

  // Iterate over all backgrounds in the backgrounds.json
  for (const [bgKey, expectedIndexed] of Object.entries(backgrounds)) {
    const folderPath = resolveBackgroundPath(bgKey, baseDir, externalDirs);
    const bgJsonPath = path.join(folderPath, 'bg.json');

    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
      console.log(`Missing folder for background: ${bgKey} (resolved: ${folderPath})`);
      notFound++;
      continue;
    }

    // Check if bg.json exists in the folder
    if (!fs.existsSync(bgJsonPath)) {
      console.log(`Missing bg.json for background: ${bgKey} (resolved: ${bgJsonPath})`);
      noBgJson++;
      continue;
    }

    // Load bg.json from the folder
    const bgData = loadJsonFile(bgJsonPath);
    if (!bgData) {
      console.log(`No data in bg.json for background: ${bgKey} (resolved: ${bgJsonPath})`);
      noData++;
      continue;
    }

    // Compare the 'indexed' value from the 'local' section
    const { local } = bgData;
    if (local && local.indexed !== expectedIndexed) {
      console.log(`Mismatch for ${bgKey}: Expected ${expectedIndexed}, but got ${local.indexed}`);
      mismatched++;
    } else if (local && local.indexed === expectedIndexed) {
      succeeded++;
    } else {
      console.log(`No 'local.indexed' found in bg.json for background: ${bgKey}`);
      errorLocalIndexed++;
    }
  }

  console.log(`\nSummary:`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`backgrounds.json value does not match saved bg.json indexed: ${mismatched}`);
  console.log(`Not found: ${notFound}`);
  console.log(`No bg.json: ${noBgJson}`);
  console.log(`No bg.json data: ${noData}`);
  console.log(`Failures during reading of local.indexed: ${errorLocalIndexed}`);
}

// Get the arguments from the command line
const [, , backgroundsJsonPath, baseDir, ...externalDirs] = process.argv;

if (!backgroundsJsonPath || !baseDir) {
  console.log("Usage: node script.js <backgroundsJsonPath> <directoryPath> <externalPath1> <externalPath2> ...");
  process.exit(1);
}

const absoluteBackgroundsJsonPath = path.resolve(backgroundsJsonPath);
const absoluteBaseDir = path.resolve(baseDir);
const absoluteExternalDirs = externalDirs.map(p => path.resolve(p));

checkBackgrounds(absoluteBackgroundsJsonPath, absoluteBaseDir, absoluteExternalDirs);