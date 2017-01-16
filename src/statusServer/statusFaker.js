const cluster = require('cluster');
const os = require('os');

const CPU_FACTOR = 100 / os.cpus().length;

const fmtMb = function (value) {
  return `${(Math.floor(value / 1048576))}MB`;
};

const fmtLoad = function (load) {
  return `${((load * CPU_FACTOR).toFixed(2))}`;
};

const fmtTime = function (time) {
  let uptime = Math.round(time);
  const upsec = uptime % 60;

  let upstr = `${upsec}s`;
  uptime = (uptime - upsec) / 60;

  if (uptime) {
    const upmin = uptime % 60;
    upstr = `${upmin}m ${upstr}`;
    uptime = (uptime - upmin) / 60;

    if (uptime) {
      const uphr = uptime % 24;
      upstr = `${uphr}h ${upstr}`;
      uptime = (uptime - uphr) / 24;

      if (uptime) {
        upstr = `${uptime}d ${upstr}`;
      }
    }
  }
  return upstr;
};

function loadCpu (req, res) {
  const loadCpu = require('./loadCpu');
  const loadFactor = Math.min(Math.max(parseInt(req.params.loadFactor) || 1, 1), 1000) * 0.001;
  loadCpu(loadFactor, (err, result) => {
    res.status(200).json(result);
  });
}

function fakeStatus (req, res) {
  const mem = process.memoryUsage();
  const load = os.loadavg();

  res.status(200).json({
    process: {
      hostname: req.hostname,
      uptime: fmtTime(process.uptime()),
      mem: {
        rss: fmtMb(mem.rss),
        total: fmtMb(mem.heapTotal),
        used: fmtMb(mem.heapUsed)
      }
    },
    os: {
      hostname: os.hostname(),
      uptime: fmtTime(os.uptime()),
      mem: {
        total: fmtMb(os.totalmem()),
        used: fmtMb(os.totalmem() - os.freemem()),
        free: fmtMb(os.freemem())
      },
      load: {
        '1m': fmtLoad(load[0]),
        '5m': fmtLoad(load[1]),
        '15m': fmtLoad(load[2])
      }
    }
  });
}

function exit (req, res) {
  console.log(`Exiting Worker ${cluster.worker.id}`);
  res.sendStatus(204);
  process.exit(0);
}

module.exports = {
  loadCpu,
  fakeStatus,
  exit
};
