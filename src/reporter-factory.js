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
   * Formatter for stylelint results.
   *
   * User has a choice of passing a custom formatter function,
   * or a name of formatter bundled with stylelint by default.
   *
   * @type {Function}
   */
  const formatterPromise = typeof config.formatter === 'string' ?
    formatters[config.formatter] :
    config.formatter ? Promise.resolve(config.formatter) : config.formatter;

  /**
   * Reporter.
   * @param {[Object]} results - Array of stylelint results.
   * @return {Promise} Resolved when writer and logger are done.
   */
  return function reporter(results, returnValue) {
    return formatterPromise.then((formatter) => {
        const formattedText = formatter(results, returnValue)

        /**
         * Async tasks performed by the reporter.
         * @type [Promise]
         */
        const asyncTasks = [];
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
      })
  };
};
