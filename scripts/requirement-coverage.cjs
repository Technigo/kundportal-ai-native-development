const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const requirementIdPattern = /^[A-Z]+(?:-[A-Z]+)*-\d{3}$/;
const testFilePattern = /\.test\.[cm]?[jt]sx?$/;
const testTitlePattern = /\b(?:it|test)(?:\.(?:each|skip|only))?\s*\(\s*(['"`])([\s\S]*?)\1/g;
const parameterizedTestTitlePattern =
  /\b(?:it|test)\.each\([\s\S]*?\)\s*\(\s*(['"`])([\s\S]*?)\1/g;

function requirementIdsFromMarkdown(markdown) {
  const ids = new Set();
  for (const line of markdown.split(/\r?\n/)) {
    const firstCell = line.match(/^\s*\|\s*([^|]+)\s*\|/);
    if (!firstCell) continue;

    const id = firstCell[1].trim();
    if (requirementIdPattern.test(id)) ids.add(id);
  }
  return ids;
}

function testTitlesFromContent(content) {
  const titles = [];
  for (const pattern of [testTitlePattern, parameterizedTestTitlePattern]) {
    pattern.lastIndex = 0;
    for (const match of content.matchAll(pattern)) titles.push(match[2]);
  }
  return titles;
}

function testCaseCount(content) {
  return [...content.matchAll(/\b(?:it|test)(?:\.(?:each|skip|only))?\s*\(/g)].length;
}

function validateRequirementCoverage({ requirements, testFiles }) {
  const titles = [...testFiles.values()].flatMap(testTitlesFromContent);
  const errors = [];
  for (const id of requirements) {
    if (!titles.some((title) => title.includes(`[${id}]`))) {
      errors.push(`${id} has no matching test title in the automated test files.`);
    }
  }
  return { errors };
}

function validateNewRequirementTests({ addedRequirementIds, addedTestFiles }) {
  const errors = [];
  for (const id of addedRequirementIds) {
    const hasNewTest = [...addedTestFiles.values()].some(({ addedLines, baseContent, currentContent }) => {
      const addedTitles = testTitlesFromContent(
        addedLines.map((line) => line.replace(/^\+/, '')).join('\n'),
      );
      return (
        testCaseCount(currentContent) > testCaseCount(baseContent) &&
        addedTitles.some((title) => title.includes(`[${id}]`))
      );
    });
    if (!hasNewTest) {
      errors.push(`${id} is new but no matching automated test title was added.`);
    }
  }
  return { errors };
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' });
}

function filesRecursively(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesRecursively(fullPath) : [fullPath];
  });
}

function readCurrentRequirements() {
  const directory = path.resolve('docs/features');
  const documents = filesRecursively(directory).filter((file) => file.endsWith('.md'));
  const requirements = new Set();
  for (const file of documents) {
    for (const id of requirementIdsFromMarkdown(fs.readFileSync(file, 'utf8'))) {
      requirements.add(id);
    }
  }
  return { documents, requirements };
}

function readBaseRequirements(baseSha) {
  const documents = git(['ls-tree', '-r', '--name-only', baseSha, '--', 'docs/features'])
    .split(/\r?\n/)
    .filter((file) => file.endsWith('.md'));
  const requirements = new Set();
  for (const file of documents) {
    const markdown = git(['show', `${baseSha}:${file}`]);
    for (const id of requirementIdsFromMarkdown(markdown)) requirements.add(id);
  }
  return requirements;
}

function readCurrentTestFiles() {
  const files = ['packages', 'scripts']
    .flatMap((directory) => filesRecursively(path.resolve(directory)))
    .filter((file) => testFilePattern.test(file));
  return new Map(files.map((file) => [file, fs.readFileSync(file, 'utf8')]));
}

function readChangedTestFiles(baseSha) {
  const diff = git(['diff', '--unified=0', baseSha, '--']);
  const addedLinesByFile = new Map();
  let currentFile;
  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith('+++ b/')) {
      const file = line.slice('+++ b/'.length);
      currentFile = testFilePattern.test(file) ? file : undefined;
      if (currentFile && !addedLinesByFile.has(currentFile)) {
        addedLinesByFile.set(currentFile, []);
      }
    } else if (line.startsWith('diff --git ')) {
      currentFile = undefined;
    } else if (currentFile && line.startsWith('+') && !line.startsWith('+++')) {
      addedLinesByFile.get(currentFile).push(line);
    }
  }

  const untrackedTestFiles = git([
    'ls-files',
    '--others',
    '--exclude-standard',
    '--',
    'packages',
    'scripts',
  ])
    .split(/\r?\n/)
    .filter((file) => testFilePattern.test(file));
  for (const file of untrackedTestFiles) {
    if (fs.existsSync(file)) {
      addedLinesByFile.set(
        file,
        fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => `+${line}`),
      );
    }
  }

  const baseFiles = new Set(
    git(['ls-tree', '-r', '--name-only', baseSha, '--', 'packages', 'scripts'])
      .split(/\r?\n/)
      .filter((file) => testFilePattern.test(file)),
  );
  return new Map(
    [...addedLinesByFile].map(([file, addedLines]) => [
      file,
      {
        addedLines,
        baseContent: baseFiles.has(file) ? git(['show', `${baseSha}:${file}`]) : '',
        currentContent: fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '',
      },
    ]),
  );
}

function main() {
  const baseSha = process.argv[2] || process.env.BASE_SHA;
  if (!baseSha) {
    console.error('Pass the pull request base commit SHA as an argument or BASE_SHA.');
    process.exitCode = 2;
    return;
  }

  const { requirements } = readCurrentRequirements();
  const testFiles = readCurrentTestFiles();
  const coverage = validateRequirementCoverage({ requirements, testFiles });
  const baseRequirements = readBaseRequirements(baseSha);
  const addedRequirementIds = new Set(
    [...requirements].filter((id) => !baseRequirements.has(id)),
  );
  const newTests = validateNewRequirementTests({
    addedRequirementIds,
    addedTestFiles: readChangedTestFiles(baseSha),
  });
  const errors = [...coverage.errors, ...newTests.errors];

  if (errors.length > 0) {
    console.error('Requirement coverage check failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Requirement coverage check passed: ${requirements.size} requirements have test titles` +
      (addedRequirementIds.size
        ? `; ${addedRequirementIds.size} new requirement(s) have new tests.`
        : '.'),
  );
}

module.exports = {
  requirementIdsFromMarkdown,
  testTitlesFromContent,
  testCaseCount,
  validateRequirementCoverage,
  validateNewRequirementTests,
};

if (require.main === module) main();
