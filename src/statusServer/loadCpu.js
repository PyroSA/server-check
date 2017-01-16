function fmtNumber (value, decimals) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

const GENERATION_SIZE = 1000;
let result = Array.apply(null, Array(GENERATION_SIZE));

function generateCpuLoad () {
  for (var i = 1; i <= GENERATION_SIZE; i++) {
    result[i] = (i - 2) * (i - 1) / (i + 1) / (i + 2);
  }
}

function loadCpu (loadFactor, cb) {
  const TOTAL_TIME = 10e9;
  const INTERVAL = 1e9;
  let intervals = 0;
  let lastTime = 0;
  let loadTime = 0;
  let loadDelta = 0;
  let idleTime = 0;
  let idleDelta = 0;

  let totalCalcs = 0;
  let quickIntervals = 0;
  let slowIntervals = 0;
  let startTime;

  let hrtime;
  let time;

  function updateTime () {
    hrtime = process.hrtime(startTime);
    time = hrtime[0] * 1e9 + hrtime[1];
  }

  function updateIdleTime () {
    updateTime();
    idleDelta = time - lastTime;
    idleTime += time - lastTime;
    lastTime = time;
  }

  function updateLoadTime () {
    updateTime();
    loadDelta = time - lastTime;
    loadTime += time - lastTime;
    lastTime = time;
  }

  function interval () {
    updateIdleTime();

    const intervalLoad = ((time + INTERVAL) * loadFactor - loadTime);
    while (time <= intervalLoad + lastTime) {
      generateCpuLoad();
      totalCalcs++;
      updateTime();
    }
    updateLoadTime();

    if (time <= TOTAL_TIME) {
      const intervalIdleMs = ((time + INTERVAL) * (1 - loadFactor) - idleTime) / 1e6;
      intervals++;

      const behind = intervalIdleMs < 10;
      // console.log(time, fmtNumber(intervalIdleMs, 3), fmtNumber(idleDelta/1e6, 3), fmtNumber(loadDelta/1e6, 3), intervalLoad, behind);

      if (intervalLoad >= INTERVAL || behind) {
        quickIntervals++;
        process.nextTick(interval);
      } else {
        slowIntervals++;
        setTimeout(interval, intervalIdleMs);
      }
    } else {
      const loadMs = fmtNumber(loadTime / time * 1e2, 3);
      const idleMs = fmtNumber(idleTime / time * 1e2, 3);
      const calcRate = fmtNumber(totalCalcs / time * 1e6, 3);

      result = {
        time: {
          load: loadMs,
          idle: idleMs,
          totalMs: time / 1e6
        },
        calcRate: calcRate,
        intervals: {
          quick: quickIntervals,
          slow: slowIntervals,
          total: intervals
        }
      };
      cb(undefined, result);
      console.log(`unload: Loaded ${loadMs}%, Idle ${idleMs}% - Rate ${calcRate}`);
      console.log(`unload: Intervals ${intervals}, quick ${quickIntervals}, slow ${slowIntervals}`);
    }
  }
  console.log(`load: Factor ${loadFactor}`);
  generateCpuLoad();

  startTime = process.hrtime();
  interval();
}

module.exports = loadCpu;
