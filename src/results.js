// Consolidates results in results subfolders into a CSV
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const jsonutil = require('jsonutil');
const json2csv = require('json2csv');

const _ = require('lodash');

const folders = glob.sync('results/*/');

function readResults(resultPath) {
  const result = {}
  const files = glob.sync(path.join(resultPath,'*'), { nodir: true });
  for (file of files) {
    const filename = path.basename(file);
    const base = filename.split('_');
    const data = jsonutil.readFileSync(file);
    if (base.length === 1) {
      result[base[0]] = data;
    } else {
      if (!result[base[0]]) { result[base[0]] = {} };
      result[base[0]][base[1]] = data;
    }
  }
  return result;
};

const results = {};
for (folder of folders) {
  const resultDir = path.basename(folder);
  results[resultDir] = readResults(folder);
}

const mappedResult = _.map(results, (result, key) => {
  const loads = _.omit(result, 'status');
  const loadSummary = _.reduce(loads, (result, load, key) => {
    result.count += 1;
    result.min250 = Math.min(load["250"].calcRate, result.min250 || 100000000);
    result.min500 = Math.min(load["500"].calcRate, result.min500 || 100000000);
    result.min750 = Math.min(load["750"].calcRate, result.min750 || 100000000);
    result.min1000 = Math.min(load["1000"].calcRate, result.min1000 || 100000000);
    result.max250 = Math.max(load["250"].calcRate, result.max250 || 0);
    result.max500 = Math.max(load["500"].calcRate, result.max500 || 0);
    result.max750 = Math.max(load["750"].calcRate, result.max750 || 0);
    result.max1000 = Math.max(load["1000"].calcRate, result.max1000 || 0);
    result.total250 = load["250"].calcRate + (result.total250 || 0);
    result.total500 = load["500"].calcRate + (result.total500 || 0);
    result.total750 = load["750"].calcRate + (result.total750 || 0);
    result.total1000 = load["1000"].calcRate + (result.total1000 || 0);
    return result;
  }, { count: 0 })
  loadSummary.avg250 = loadSummary.total250/loadSummary.count;
  loadSummary.avg500 = loadSummary.total500/loadSummary.count;
  loadSummary.avg750 = loadSummary.total750/loadSummary.count;
  loadSummary.avg1000 = loadSummary.total1000/loadSummary.count;
  delete loadSummary.total250;
  delete loadSummary.total500;
  delete loadSummary.total750;
  delete loadSummary.total1000;
  console.log(loadSummary);

  console.log(key, parseInt(result.status.os.mem.total), parseFloat(result.status.os.load['1m']));
  const summary = _.merge({
    id: key,
    memory: parseInt(result.status.os.mem.total),
    load: parseFloat(result.status.os.load['1m']),
  }, loadSummary);
  return summary;
})

const csv = json2csv({data: mappedResult});
fs.writeFile('results.csv', csv, function(err) {
  if (err) throw err;
  console.log('results.csv written');
});
