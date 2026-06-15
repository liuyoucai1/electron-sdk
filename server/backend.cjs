const http = require('http');
const {
  saveScreenshotAsset,
  releaseScreenshotAsset
} = require('./sessionAssets.cjs');

function createBackend() {
  let server;
  const port = 17890;

  const routeMeta = {
    ask: {
      title: '问',
      description: '这里承载问答、提问和知识查询页面。'
    },
    test: {
      title: '测',
      description: '这里承载测试、测验和练习页面。'
    },
    analysis: {
      title: '析',
      description: '这里承载分析、报告和结果解读页面。'
    }
  };

  function normalizeRoute(route) {
    if (route === 'ask' || route === 'test' || route === 'analysis') {
      return route;
    }
    return 'ask';
  }

  async function handleRequest(request = {}) {
    const type = request.type || 'route-meta';

    if (type === 'route-meta') {
      const route = normalizeRoute(request.route);
      return {
        ok: true,
        data: {
          route,
          ...routeMeta[route],
          timestamp: new Date().toISOString()
        }
      };
    }

    if (type === 'ping') {
      return {
        ok: true,
        data: {
          message: 'pong',
          timestamp: new Date().toISOString()
        }
      };
    }

    // 会话结束：截屏题目落本地库，等待 Node 有网后同步 OSS / 后端。
    if (type === 'save-session-screenshot') {
      return saveScreenshotAsset(request);
    }

    // 同步完成后释放本地截屏文件。
    if (type === 'release-session-screenshot') {
      return releaseScreenshotAsset(request.assetId);
    }

    return {
      ok: false,
      error: `Unknown request type: ${type}`
    };
  }

  function start() {
    if (server) {
      return Promise.resolve();
    }

    server = http.createServer(async (req, res) => {
      if (req.method === 'GET' && req.url === '/health') {
        const result = await handleRequest({ type: 'ping' });
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
        return;
      }

      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'Not found' }));
    });

    return new Promise((resolve, reject) => {
      server.once('error', (error) => {
        server = undefined;
        reject(error);
      });
      server.listen(port, '127.0.0.1', resolve);
    });
  }

  function stop() {
    if (!server) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      server.close(() => {
        server = undefined;
        resolve();
      });
    });
  }

  return {
    handleRequest,
    start,
    stop
  };
}

module.exports = {
  createBackend
};
