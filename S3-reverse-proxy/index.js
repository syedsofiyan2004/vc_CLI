#!/usr/bin/env node
require('dotenv').config();
const express     = require('express');
const httpProxy   = require('http-proxy');
const helmet      = require('helmet');
const morgan      = require('morgan');
const compression = require('compression');

const app        = express();
const PORT       = process.env.PORT || 8000;
const BASE_PATH  = process.env.S3_BASE_URL;
if (!BASE_PATH) {
  console.error(' Missing S3_BASE_URL env var');
  process.exit(1);
}

const proxy = httpProxy.createProxyServer();

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

app.use((req, res) => {
  const host = (req.headers.host || '').split(':')[0];
  const sub  = host.split('.')[0] || '';
  if (!/^[a-z0-9-]+$/.test(sub)) {
    return res.status(400).send('Invalid subdomain');
  }
  const targetUrl = `${BASE_PATH}/${sub}${req.url}`;

  proxy.web(req, res, { target: targetUrl, changeOrigin: true }, err => {
    console.error(`Proxy error for ${sub}${req.url}:`, err.message);
    res.status(502).send('Bad gateway');
  });
});

proxy.on('proxyRes', (proxyRes, req, res) => {
  if (proxyRes.statusCode === 404) {
    const host = (req.headers.host || '').split(':')[0];
    const sub  = host.split('.')[0];
    const fallback = `${BASE_PATH}/${sub}/index.html`;
    proxy.web(req, res, { target: fallback, changeOrigin: true });
  }
});

app.listen(PORT, () => {
  console.log(` S3 reverse proxy running on port ${PORT}`);
});
