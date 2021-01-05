const http2 = require('http2');
const http = require('http');
const fs = require('fs');

const handler = (req, res) => {
  let body = '';

  req.on('data', (chunk) => (body += chunk));

  req.on('end', () => {
    const { method, url, httpVersion, connection, headers } = req;
    const { remoteAddress, alpnProtocol } = connection;

    res.write(
      JSON.stringify({
        method,
        url,
        httpVersion: `HTTP/${httpVersion}`,
        ip: remoteAddress,
        headers,
        body,
        tls: {
          alpnProtocol,
        },
      })
    );
    res.end();
  });

  req.on('err', (err) => console.error(err));
};

(async () => {
  http2
    .createSecureServer(
      {
        key: fs.readFileSync('./certs/private.key', 'utf8'),
        cert: fs.readFileSync('./certs/certificate.crt', 'utf8'),
        allowHTTP1: true,
      },
      handler
    )
    .listen(443, () => console.log('Server listening on port ' + 443));

  http.createServer(handler).listen(80, () => console.log('Server listening on port ' + 80));
})();
