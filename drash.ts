import server from './src/server.ts';

const Drash = {
  createServer: createServer
}

/**
 * Create a server.
 *
 * @param {Object} configs
 *     The server configs (not changeable).
 *
 * @return {CrookseNode.Server|void}
 */
function createServer(configs: object) {
  return new server(configs);
}

export default Drash
