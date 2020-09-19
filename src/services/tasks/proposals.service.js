const better = require('better-sqlite3')
const cbdb = better('./data/cbdb.db');

const hooks = require('./tasks.hooks.js')
const taskdb = better('./data/tasks.db');
const { BadRequest } = require('@feathersjs/errors');


module.exports.ProposalService = ProposalService;