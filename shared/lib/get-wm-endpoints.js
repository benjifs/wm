const parse = require('url').parse;
const hosts = require('./ignored-endpoints');
const wm = require('./endpoint');

/**
 *
 * @param {string[]} urls
 * @param {ProgressCallback} progress
 * @param {number} [limit=10]
 * @returns {Promise<WebMention[]>}
 */
async function main(urls, progress = () => {}, limit = 10) {
  progress('log', `URLs to check: ${urls.length} | ${limit}`);
  progress('progress-update', { type: 'endpoints', value: urls.length });

  return Promise.all(
    urls
      .filter((source) => {
        const hostname = parse(source).hostname;
        return !hosts.find((_) => {
          if (_.indexOf('.') === 0) {
            const test = hostname.endsWith(_) || hostname === _.slice(1);
            if (test) {
              progress('log', 'skipping ' + source);
              return true;
            }
          }
          return hostname === _;
        });
      })
      .map((source) => {
        return wm(source)
          .catch((e) => {
            progress('error', `Get endpoint fail (${source}): ${e.message}`);
            return { source, endpoint: null };
          })
          .then((res) => {
            progress('progress-update', {
              type: 'endpoints-resolved',
              value: 1,
              data: { source, endpoint: res.endpoint },
            });
            return res;
          });
      })
  )
    .then((res) => {
      return urls.map((url) => {
        // Use exact match instead of startsWith to avoid matching
        // https://webmention.rocks/test/1 to https://webmention.rocks
        // Also, normalize URLs by removing trailing slashes for comparison
        const normalizeUrl = (u) => u.endsWith('/') ? u.slice(0, -1) : u;
        return Object.assign(
          { url },
          res.find(({ source }) => normalizeUrl(url) === normalizeUrl(source))
        );
      });
    })
    .then((res) => res.filter((_) => _.endpoint).slice(0, limit || undefined));
}

module.exports = main;
