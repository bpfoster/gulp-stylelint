import { blue } from 'ansi-colors';
import { statSync, readFileSync, unlinkSync, rmdirSync } from 'fs';
import { resolve, join } from 'path';
import test from 'tape';
import { stub } from 'sinon';

import writer from '../src/writer.js';

const tmpDir = resolve(__dirname, '../tmp');

test('writer should write to cwd if base dir is not specified', t => {
  stub(process, 'cwd').returns(tmpDir);
  const reportFilePath = join(process.cwd(), 'foo.txt');

  t.plan(2);

  writer('footext', 'foo.txt')
    .then(() => {
      t.true(
        statSync(reportFilePath).isFile(),
        'report file has been created in the current working directory'
      );
      t.equal(
        readFileSync(reportFilePath, 'utf8'),
        'footext',
        'report file has correct contents'
      );
    })
    .catch(e => t.fail(`failed to create report file: ${e.message}`))
    .then(() => {
      process.cwd.restore();
      unlinkSync(reportFilePath);
    });
});

test('writer should write to a base folder if it is specified', t => {
  stub(process, 'cwd').returns(tmpDir);
  const reportDirPath = join(process.cwd(), 'foodir');
  const reportSubdirPath = join(reportDirPath, '/subdir');
  const reportFilePath = join(reportSubdirPath, 'foo.txt');

  t.plan(2);

  writer('footext', 'foo.txt', 'foodir/subdir')
    .then(() => {
      t.true(
        statSync(reportFilePath).isFile(),
        'report file has been created in the specified base folder'
      );
      t.equal(
        readFileSync(reportFilePath, 'utf8'),
        'footext',
        'report file has correct contents'
      );
    })
    .catch(e => t.fail(`failed to create report file: ${e.message}`))
    .then(() => {
      process.cwd.restore();
      unlinkSync(reportFilePath);
      rmdirSync(reportSubdirPath);
      rmdirSync(reportDirPath);
    });
});

test('writer should strip colors from formatted output', t => {
  stub(process, 'cwd').returns(tmpDir);
  const reportFilePath = join(process.cwd(), 'foo.txt');

  t.plan(1);

  writer(blue('footext'), 'foo.txt')
    .then(() => {
      t.equal(
        readFileSync(reportFilePath, 'utf8'),
        'footext',
        'colors have been stripped in report file'
      );
    })
    .catch(e => t.fail(`failed to create report file: ${e.message}`))
    .then(() => {
      process.cwd.restore();
      unlinkSync(reportFilePath);
    });
});
