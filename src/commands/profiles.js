const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const fs = require('fs');
const path = require('path');
const api = require('../utils/api');

const listProfiles = async (options) => {
  const spinner = ora('Fetching profiles...').start();

  try {
    const params = {};
    if (options.gender) params.gender = options.gender;
    if (options.country) params.country = options.country;
    if (options.ageGroup) params.age_group = options.ageGroup;
    if (options.minAge) params.min_age = options.minAge;
    if (options.maxAge) params.max_age = options.maxAge;
    if (options.sortBy) params.sort_by = options.sortBy;
    if (options.order) params.order = options.order;
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;

    const res = await api.get('/api/profiles', { params });
    spinner.stop();

    const { data, total, page, total_pages } = res.data;

    const table = new Table({
      head: ['Name', 'Gender', 'Age', 'Age Group', 'Country'].map(h => chalk.cyan(h)),
    });

    data.forEach(p => {
      table.push([p.name, p.gender || '-', p.age || '-', p.age_group || '-', p.country_id || '-']);
    });

    console.log(table.toString());
    console.log(chalk.gray(`Page ${page} of ${total_pages} | Total: ${total}`));
  } catch (err) {
    spinner.stop();
    console.log(chalk.red('Failed to fetch profiles.'), err.response?.data?.message || '');
  }
};

const getProfile = async (id) => {
  const spinner = ora('Fetching profile...').start();

  try {
    const res = await api.get(`/api/profiles/${id}`);
    spinner.stop();

    const p = res.data.data;
    console.log(chalk.cyan('\nProfile Details:'));
    console.log(`Name:        ${p.name}`);
    console.log(`Gender:      ${p.gender || '-'}`);
    console.log(`Age:         ${p.age || '-'}`);
    console.log(`Age Group:   ${p.age_group || '-'}`);
    console.log(`Country:     ${p.country_id || '-'}`);
    console.log(`Created At:  ${p.created_at}`);
  } catch (err) {
    spinner.stop();
    console.log(chalk.red('Profile not found.'));
  }
};

const searchProfiles = async (query) => {
  const spinner = ora('Searching...').start();

  try {
    const res = await api.get('/api/profiles/search', { params: { q: query } });
    spinner.stop();

    const { data, total } = res.data;

    const table = new Table({
      head: ['Name', 'Gender', 'Age', 'Age Group', 'Country'].map(h => chalk.cyan(h)),
    });

    data.forEach(p => {
      table.push([p.name, p.gender || '-', p.age || '-', p.age_group || '-', p.country_id || '-']);
    });

    console.log(table.toString());
    console.log(chalk.gray(`Total results: ${total}`));
  } catch (err) {
    spinner.stop();
    console.log(chalk.red('Search failed.'));
  }
};

const createProfile = async (options) => {
  const spinner = ora('Creating profile...').start();

  try {
    const res = await api.post('/api/profiles', { name: options.name });
    spinner.stop();

    const p = res.data.data;
    console.log(chalk.green('\nProfile created!'));
    console.log(`Name:    ${p.name}`);
    console.log(`Gender:  ${p.gender || '-'}`);
    console.log(`Age:     ${p.age || '-'}`);
    console.log(`Country: ${p.country_id || '-'}`);
  } catch (err) {
  spinner.stop();
  console.log(chalk.red('Failed to create profile.'), err.response?.data?.message || err.message);
  console.log(err.response?.data);
}
};

const exportProfiles = async (options) => {
  const spinner = ora('Exporting profiles...').start();

  try {
    const params = { format: 'csv' };
    if (options.gender) params.gender = options.gender;
    if (options.country) params.country = options.country;

    const res = await api.get('/api/profiles/export', { params, responseType: 'text' });
    spinner.stop();

    const filename = `profiles_${Date.now()}.csv`;
    const filepath = path.join(process.cwd(), filename);
    fs.writeFileSync(filepath, res.data);

    console.log(chalk.green(`Exported to ${filepath}`));
  } catch (err) {
    spinner.stop();
    console.log(chalk.red('Export failed.'));
  }
};

module.exports = { listProfiles, getProfile, searchProfiles, createProfile, exportProfiles };