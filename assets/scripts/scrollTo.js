let animating = false;

export default function scrollTo(element, to, duration, direction) {
  if (animating || !element || to === undefined || !duration) { // stop when already triggered or missing args
    return false;
  }

  const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
  let easeInOutCubic = function (t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; }; // Or get your own: http://gizma.com/easing/
  let end = +new Date() + duration;
  let from = (element === 'window') ? window.pageXOffset : element.scrollLeft;
  animating = true;

  if (direction === 'vertical') {
    from = (element === 'window') ? window.pageYOffset : element.scrollTop;
  }

  var step = function () {
    const current = +new Date();
    let remaining = end - current;

    if (remaining < 0) {
      animating = false;
    } else {
      const ease = easeInOutCubic(1 - remaining / duration);

      if (!direction || direction === 'horizontal') {
        (element === 'window') ? window.scrollTo(from + (ease * (to - from)), window.pageYOffset) : element.scrollLeft = from + (ease * (to - from));
      } else if (direction === 'vertical') {
        (element === 'window') ? window.scrollTo(window.pageXOffset, from + (ease * (to - from))) : element.scrollTop = from + (ease * (to - from));
      }
    }

    requestAnimationFrame(step);
  };
  step();
}
