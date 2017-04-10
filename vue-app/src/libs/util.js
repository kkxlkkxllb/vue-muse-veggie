function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function copy(o) {
   let output, v, key
   output = Array.isArray(o) ? [] : {}
   for (key in o) {
     v = o[key];
     output[key] = (typeof v === "object") ? copy(v) : v
   }
   return output
}

function toHHMMSS(str) {
  var sec_num = parseInt(str/1000, 10); // don't forget the second param
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  if (hours > 0)
    return hours+':'+minutes+':'+seconds;
  else
    return minutes+':'+seconds;
}

function accurateInterval(time, fn) {
  var cancel, nextAt, ref, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  if (typeof time === 'function') {
    ref = [time, fn], fn = ref[0], time = ref[1];
  }
  wrapper = function() {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function() {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel
  };
}

function rounded(n, scaleRate) {
  if (scaleRate !== 1)
    return (n * scaleRate) + 0.5 << 0
  else
    return n
}

function maxArray(arr){
  return Math.max.apply(Math,arr)
}

function minArray(arr){
  return Math.min.apply(Math,arr)
}

function getBoundingRect(points){
  const xs = points.map(p => p[0])
  const ys = points.map(p => p[1])
  return([minArray(xs),  minArray(ys),  maxArray(xs), maxArray(ys)])
}

function drawRect(ctx,x,y,w,h, opts = {}) {
  ctx.save()
  ctx.beginPath()
  ctx.setLineWidth = 1
  ctx.rect(x - 1, y - 1, w + 2, h + 2)
  ctx.setStrokeStyle(opts.fill || '#ff8619')
  if(opts.fill){
    ctx.setGlobalAlpha(0.2)
    ctx.setFillStyle(opts.fill)
    ctx.fill()
    ctx.setGlobalAlpha(1)
  }
  ctx.stroke()
  ctx.restore()
  ctx.draw()
}

function clearCurveRect (ctx, points, scaleRate = 1) {
  const r = getBoundingRect(points)
  const x = Math.round(r[0] * scaleRate - ctx.lineWidth - 0.5)
  const y = Math.round(r[1] * scaleRate - ctx.lineWidth - 0.5)
  const w = Math.round((r[2] - r[0]) * scaleRate + 2 * ctx.lineWidth + 0.5)
  const h = Math.round((r[3] - r[1]) * scaleRate + 2 * ctx.lineWidth + 0.5)
  ctx.clearRect(x, y, w, h)
  points = []
}

module.exports = {
  copy: copy,
  formatTime: formatTime,
  toHHMMSS: toHHMMSS,
  accurateInterval: accurateInterval,
  rounded: rounded,
  drawRect: drawRect,
  getBoundingRect: getBoundingRect,
  clearCurveRect: clearCurveRect
}
