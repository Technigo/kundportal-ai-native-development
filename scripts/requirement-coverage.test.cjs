const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  requirementIdsFromMarkdown,
  validateRequirementCoverage,
  validateNewRequirementTests,
} = require('./requirement-coverage.cjs');

test('[CI-REQ-COVERAGE-001] extracts requirement IDs from requirement table rows only', () => {
  const markdown = [
    '## Krav och testmappning',
    '| Krav-ID | Acceptanskriterium | Test |',
    '|---|---|---|',
    '| CASE-EDIT-001 | Can edit a case | `CaseDetail.test.tsx` |',
    '| Text | References CASE-EDIT-002 |',
  ].join('\n');

  assert.deepEqual([...requirementIdsFromMarkdown(markdown)], ['CASE-EDIT-001']);
});

test('[CI-REQ-COVERAGE-001] requires every documented requirement ID in an automated test title', () => {
  const result = validateRequirementCoverage({
    requirements: new Set(['CASE-EDIT-001', 'CASE-EDIT-002']),
    testFiles: new Map([
      ['CaseDetail.test.tsx', "it('[CASE-EDIT-001] edits a case', () => {});"],
    ]),
  });

  assert.deepEqual(result.errors, [
    'CASE-EDIT-002 has no matching test title in the automated test files.',
  ]);
});

test('[CI-REQ-COVERAGE-002] requires a newly documented requirement to have a test added in the same change', () => {
  const result = validateNewRequirementTests({
    addedRequirementIds: new Set(['CASE-EDIT-003']),
    addedTestFiles: new Map([
      ['CaseDetail.test.tsx', {
        baseContent: '',
        currentContent: "it('[CASE-EDIT-003] displays an editable case', () => {});",
        addedLines: ["+it('[CASE-EDIT-003] displays an editable case', () => {});"],
      }],
    ]),
  });

  assert.deepEqual(result.errors, []);
});

test('[CI-REQ-COVERAGE-002] reports new requirements without a newly added matching test', () => {
  const result = validateNewRequirementTests({
    addedRequirementIds: new Set(['CASE-EDIT-003']),
    addedTestFiles: new Map([
      ['CaseDetail.test.tsx', {
        baseContent: "it('edits an existing case', () => {});",
        currentContent: "it('[CASE-EDIT-003] edits an existing case', () => {});",
        addedLines: ["+it('[CASE-EDIT-003] edits an existing case', () => {});"],
      }],
    ]),
  });

  assert.deepEqual(result.errors, [
    'CASE-EDIT-003 is new but no matching automated test title was added.',
  ]);
});

test('[CI-REQ-COVERAGE-002] rejects relabeling an existing test as a new test', () => {
  const result = validateNewRequirementTests({
    addedRequirementIds: new Set(['CASE-EDIT-003']),
    addedTestFiles: new Map([
      ['CaseDetail.test.tsx', {
        baseContent: "it('edits an existing case', () => {});",
        currentContent: "it('[CASE-EDIT-003] edits an existing case', () => {});",
        addedLines: ["+it('[CASE-EDIT-003] edits an existing case', () => {});"],
      }],
    ]),
  });

  assert.deepEqual(result.errors, [
    'CASE-EDIT-003 is new but no matching automated test title was added.',
  ]);
});

test('[CI-REQ-COVERAGE-003] configures pull requests to run the full test suite', () => {
  const workflow = fs.readFileSync(
    path.join(__dirname, '../.github/workflows/ci.yml'),
    'utf8',
  );

  assert.match(workflow, /^  pull_request:\s*$/m);
  assert.match(workflow, /^\s+run: npm test\s*$/m);
});
