function rafThrottle(fn: Function) {
  let lock = false;
  return function (this: any, ...args: any[]) {
    if (lock) return;
    lock = true;
    window.requestAnimationFrame(() => {
      fn.apply(this, args);
      lock = false;
    });
  };
}

function debounce(fn: Function, delay: number = 300) {
  let timer: number | null = null;
  return function (this: any, ...args: any[]) {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export { rafThrottle, debounce };
