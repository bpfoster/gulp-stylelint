import { src } from 'gulp';
import gulpCleanCss from 'gulp-clean-css';
import gulpConcat from 'gulp-concat';
import gulpRename from 'gulp-rename';
import { init } from 'gulp-sourcemaps';
import { join } from 'path';
import test from 'tape';

import gulpStylelint from '../src/index.js';

/**
 * Creates a full path to the fixtures glob.
 * @param {String} glob - Src glob.
 * @return {String} Full path.
 */
function fixtures(glob) {
  return join(__dirname, 'fixtures', glob);
}

test('should emit no errors when stylelint rules are satisfied', t => {
  t.plan(1);
  src(fixtures('original-*.css'))
    .pipe(init())
    .pipe(gulpStylelint({
      config: {rules: {}}
    }))
    .on('finish', () => t.pass('no error emitted'));
});

test('should apply sourcemaps correctly', t => {
  t.plan(6);
  src(fixtures('original-*.css'))
    .pipe(init())
    .pipe(gulpCleanCss())
    .pipe(gulpConcat('concatenated.css'))
    .pipe(gulpRename({prefix: 'renamed-'}))
    .pipe(gulpStylelint({
      config: {rules: {
        'declaration-no-important': true
      }},
      reporters: [{
        formatter(lintResult) {
          t.deepEqual(
            lintResult.map(r => r.source),
            ['original-a.css', 'original-b.css'],
            'there are two files'
          );
          t.equal(
            lintResult[0].warnings[0].line,
            2,
            'original-a.css has an error on line 2'
          );
          t.equal(
            lintResult[0].warnings[0].column,
            9,
            'original-a.css has an error on column 9'
          );
          t.equal(
            lintResult[1].warnings[0].line,
            2,
            'original-b.css has an error on line 2'
          );
          t.equal(
            lintResult[1].warnings[0].column,
            9,
            'original-b.css has an error on column 9'
          );
        }
      }]
    }))
    .on('error', () => t.pass('error has been emitted correctly'));
});

test('should ignore empty sourcemaps', t => {
  t.plan(6);
  src(fixtures('original-*.css'))
    .pipe(init()) // empty sourcemaps here
    .pipe(gulpStylelint({
      config: {rules: {
        'declaration-no-important': true
      }},
      reporters: [{
        formatter(lintResult) {
          t.deepEqual(
            lintResult.map(r => r.source),
            [
              join(__dirname, 'fixtures', 'original-a.css'),
              join(__dirname, 'fixtures', 'original-b.css')
            ],
            'there are two files'
          );

          console.log(lintResult.map(r => ({
            source: r.source,
            warnings: r.warnings[0]
          })));

          t.equal(
            lintResult[0].warnings[0].line,
            2,
            'original-a.css has an error on line 2'
          );
          t.equal(
            lintResult[0].warnings[0].column,
            14,
            'original-a.css has an error on column 14'
          );
          t.equal(
            lintResult[1].warnings[0].line,
            2,
            'original-b.css has an error on line 2'
          );
          t.equal(
            lintResult[1].warnings[0].column,
            15,
            'original-b.css has an error on column 15'
          );
        }
      }]
    }))
    .on('error', () => t.pass('error has been emitted correctly'));
});
