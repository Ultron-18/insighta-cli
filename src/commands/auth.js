#!/usr/bin/env node
const os = require('os');
const path = require('path');
// Load from project-local .env first, then fall back to ~/.insighta/.env (for global install)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(os.homedir(), '.insighta', '.env') });

const http = require('http');
const crypto = require('crypto');
const chalk = require('chalk');
const open = require('open');
const axios = require('axios');
const { saveCredentials, getCredentials, clearCredentials } = require('../utils/credentials');

const BASE_URL = process.env.API_URL || 'https://web-production-5347.up.railway.app';

const login = async () => {
  const state = crypto.randomBytes(16).toString('hex');
  const PORT = 9876;

  console.log(chalk.blue('Opening GitHub login in your browser...'));

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname !== '/callback') return;

    // prevent double execution
    if (server.handled) return;
    server.handled = true;

    const returnedState = url.searchParams.get('state');
    const code = url.searchParams.get('code');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Login successful! You can close this tab.</h1>');
    server.close();

    if (returnedState !== state) {
      console.log(chalk.red('State mismatch. Login failed.'));
      process.exit(1);
    }

    try {
      const response = await axios.post(`${BASE_URL}/auth/cli/callback`, {
        code,
      });

      saveCredentials({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        username: response.data.user.username,
      });

      console.log(chalk.green(`\nLogged in as @${response.data.user.username}`));
    } catch (err) {
      console.log(chalk.red('Login failed. Please try again.'));
      console.log(err.response?.data || err.message);
    }

    process.exit(0);
  });

  server.listen(PORT, () => {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLI_CLIENT_ID,
      redirect_uri: `http://localhost:${PORT}/callback`,
      scope: 'read:user user:email',
      state,
    });

    const githubUrl = `https://github.com/login/oauth/authorize?${params}`;
    open(githubUrl);
  });
};

const logout = async () => {
  clearCredentials();
  console.log(chalk.green('Logged out successfully.'));
};

const whoami = () => {
  const creds = getCredentials();
  if (!creds) {
    console.log(chalk.yellow('You are not logged in. Run: insighta login'));
    return;
  }
  console.log(chalk.green(`Logged in as @${creds.username}`));
};

module.exports = { login, logout, whoami }; 