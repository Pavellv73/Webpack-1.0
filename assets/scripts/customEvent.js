(() => {
  try {
    /* eslint-disable */
    new CustomEvent("IE has CustomEvent, but doesn't support constructor");
    /* eslint-enable */
  } catch (e) {
    window.CustomEvent = (event_, params_) => {
      const event = event_;
      let params = params_;
      const evt = document.createEvent('CustomEvent');
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined,
      };
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    CustomEvent.prototype = Object.create(window.Event.prototype);
  }
})();
