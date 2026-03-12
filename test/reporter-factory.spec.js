import fancyLog from 'fancy-log';
import test from 'tape';
import { stub, match } from 'sinon';

import reporterFactory from '../src/reporter-factory.js';

const SAMPLE_RESULT = {
  "source": "path/to/file.css", // The filepath or PostCSS identifier like <input css 1>
  "errored": true, // This is `true` if at least one rule with an "error"-level severity triggered a warning
  "warnings": [
    // Array of rule problem warning objects, each like the following ...
    {
      "line": 3,
      "column": 12,
      "endLine": 4,
      "endColumn": 15,
      "rule": "block-no-empty",
      "severity": "error",
      "text": "You should not have an empty block (block-no-empty)"
    }
  ],
  "deprecations": [
    // Array of deprecation warning objects, each like the following ...
    {
      "text": "Feature X has been deprecated and will be removed in the next major version.",
      "reference": "https://stylelint.io/docs/feature-x.md"
    }
  ],
  "invalidOptionWarnings": [
    // Array of invalid option warning objects, each like the following ...
    {
      "text": "Invalid option X for rule Y"
    }
  ],
  "ignored": false // This is `true` if the file's path matches a provided ignore pattern
};

const SAMPLE_RETURN_VALUE = {
  "errored": false, // `true` if there were any warnings with "error" severity
  "maxWarningsExceeded": {
    // Present if Stylelint was configured with a `maxWarnings` count
    "maxWarnings": 10,
    "foundWarnings": 15
  },
  "ruleMetadata": {
    "block-no-empty": {
      "url": "https://stylelint.io/user-guide/rules/block-no-empty"
    }
    // other rules...
  }
};

test('reporter factory should return a function', t => {
  t.plan(1);
  t.equal(
    typeof reporterFactory(),
    'function',
    'reporter factory has returned a function'
  );
});

test('reporter should return a promise', t => {
  t.plan(1);

  const reporter = reporterFactory({formatter() {
    // empty formatter
  }});

  t.equal(
    typeof reporter({}).then,
    'function',
    'reporter is then-able'
  );
});

test('reporter should be able to use built-in formatters', async (t) => {
  t.plan(1);

  const info = stub(fancyLog, 'info');
  const reporter = reporterFactory({
    formatter: 'string',
    console: true
  });

  await reporter([SAMPLE_RESULT], SAMPLE_RETURN_VALUE);

  t.true(
    info.calledWithMatch(match((value) => {
      return value.includes('Invalid option X for rule Y');
    })),
    'reporter did not write string formatted error to console'
  );
  info.restore();
});

test('reporter should write to console if console param is true', async (t) => {
  t.plan(1);
  const info = stub(fancyLog, 'info');
  const reporter = reporterFactory({
    formatter() { return 'foo'; },
    console: true
  });

  await reporter([]);

  t.true(
    info.calledWith('\nfoo\n'),
    'reporter has written padded formatter output to console'
  );
  info.restore();
});

test('reporter should NOT write to console if console param is false', async (t) => {
  t.plan(1);
  const info = stub(fancyLog, 'info');
  const reporter = reporterFactory({
    formatter() { return 'foo'; },
    console: false
  });

  await reporter([]);

  t.false(
    info.called,
    'reporter has NOT written anything to console'
  );
  info.restore();
});

test('reporter should NOT write to console if formatter returned only whitespace', async (t) => {
  t.plan(1);
  const info = stub(fancyLog, 'info');
  const reporter = reporterFactory({
    formatter() { return '  \n'; },
    console: true
  });

  await reporter([]);

  t.false(
    info.called,
    'reporter has NOT written anything to console'
  );
  info.restore();
});

test('reporter should NOT write to console by default', async (t) => {
  t.plan(1);
  const info = stub(fancyLog, 'info');
  const reporter = reporterFactory({
    formatter() { return 'foo'; }
  });

  await reporter([]);

  t.false(
    info.called,
    'reporter has NOT written anything to console'
  );
  info.restore();
});
