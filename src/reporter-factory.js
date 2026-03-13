import fancyLog from 'fancy-log';
import stylelint from 'stylelint';

import writer from './writer.js';

const { formatters } = stylelint;

/**
 * Creates a reporter from the given config.
 * @param {Object} [config] - Reporter config.
 * @param {Object} [options] - Plugin options.
 * @return {Function} Reporter.
 */
export default function reporterFactory(config = {}, options = {}) {

  /**
   * Reporter.
   * @param {Array<import('stylelint').StylelintResult>} results - The result objects from the stylelint linter.
   * @param {import('stylelint').LinterResult} returnValue - The result object from the stylelint linter.
   * @return {Promise} Resolved when writer and logger are done.
   */
  return async function reporter(results, returnValue) {
    /**
     * Formatter for stylelint results.
     *
     * User has a choice of passing a custom formatter function,
     * or a name of formatter bundled with stylelint by default.
     *
     * @type {Function}
     */
    const formatter = typeof config.formatter === 'string' ?
      await formatters[config.formatter] :
      config.formatter;

    /**
     * Async tasks performed by the reporter.
     * @type [Promise]
     */
    const asyncTasks = [];

    /**
     * Formatter output.
     * @type String
     */
    const formattedText = formatter(results, returnValue || {});

    if (config.console && formattedText.trim()) {
      asyncTasks.push(
        fancyLog.info(`\n${formattedText}\n`)
      );
    }

    if (config.save) {
      asyncTasks.push(
        writer(formattedText, config.save, options.reportOutputDir)
      );
    }

    return Promise.all(asyncTasks);
  };
};
