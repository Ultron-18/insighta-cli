const fs = require('fs');
const os = require('os');
const path = require('path');

const CREDENTIALS_DIR = path.join(os.homedir(), '.insighta');
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'credentials.json');

const saveCredentials = (data) => {
  if (!fs.existsSync(CREDENTIALS_DIR)) {
    fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
  }
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(data, null, 2));
};

const getCredentials = () => {
  if (!fs.existsSync(CREDENTIALS_FILE)) return null;
  return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
};

const clearCredentials = () => {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    fs.unlinkSync(CREDENTIALS_FILE);
  }
};

module.exports = { saveCredentials, getCredentials, clearCredentials };