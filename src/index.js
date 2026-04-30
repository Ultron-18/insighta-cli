#!/usr/bin/env node
const os = require('os');
const path = require('path');
require('dotenv').config({ path: path.join(os.homedir(), '.insighta', '.env') });

const { Command } = require('commander');
const { login, logout, whoami } = require('./commands/auth');
const { listProfiles, getProfile, searchProfiles, createProfile, exportProfiles } = require('./commands/profiles');

const program = new Command();

program.name('insighta').description('Insighta Labs CLI').version('1.0.0');

// Auth commands
program.command('login').description('Login with GitHub').action(login);
program.command('logout').description('Logout').action(logout);
program.command('whoami').description('Show current user').action(whoami);

// Profiles commands
const profiles = program.command('profiles').description('Manage profiles');

profiles
  .command('list')
  .description('List profiles')
  .option('--gender <gender>', 'Filter by gender')
  .option('--country <country>', 'Filter by country')
  .option('--age-group <ageGroup>', 'Filter by age group')
  .option('--min-age <minAge>', 'Filter by min age')
  .option('--max-age <maxAge>', 'Filter by max age')
  .option('--sort-by <sortBy>', 'Sort by field')
  .option('--order <order>', 'Sort order (asc/desc)')
  .option('--page <page>', 'Page number')
  .option('--limit <limit>', 'Results per page')
  .action(listProfiles);

profiles
  .command('get <id>')
  .description('Get profile by ID')
  .action(getProfile);

profiles
  .command('search <query>')
  .description('Search profiles')
  .action(searchProfiles);

profiles
  .command('create')
  .description('Create a profile')
  .option('--name <name>', 'Profile name')
  .action(createProfile);

profiles
  .command('export')
  .description('Export profiles as CSV')
  .option('--format <format>', 'Export format', 'csv')
  .option('--gender <gender>', 'Filter by gender')
  .option('--country <country>', 'Filter by country')
  .action(exportProfiles);

program.parse(process.argv);