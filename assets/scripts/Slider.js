class SliderNavigation {
  constructor(options) {
    this.options = options;
    this.container = options.container;
    this.sections = options.sections;

    this.classNames = {
      pin: 'mv__pageNavigation__pin',
      pinActive: 'mv__pageNavigation__pin--active',
    };

    let html = '';
    for (let i = 0; i < this.sections.length; i += 1) {
      html += `<a class= "${this.classNames.pin}" href= "#${this.sections[i].name}"></a>`;
    }

    this.container.innerHTML = html;
    this.pins = [].slice.call(this.container.querySelectorAll(`.${this.classNames.pin}`));

    this.onPinClick = (e) => {
      e.preventDefault();
      this.clickHandler(e.srcElement);
    };

    this.pins.forEach((pin) => {
      pin.addEventListener('click', this.onPinClick);
    });
  }

  clickHandler(pin) {
    const activeName = pin.getAttribute('href').slice(1);
    for (let i = 0; i < this.sections.length; i += 1) {
      if (activeName === this.sections[i].name) {
        this.options.onPinClick(i);
        break;
      }
    }
  }

  updateClasses(activeIndex) {
    for (let i = 0; i < this.pins.length; i += 1) {
      if (i === activeIndex) {
        this.pins[i].classList.add(this.classNames.pinActive);
      } else {
        this.pins[i].classList.remove(this.classNames.pinActive);
      }
    }
  }
}

export default class Slider {
  constructor(options) {
    this.options = options;
    this.parent = options.element;

    this.activeIndexSection = 0;
    this.activeIndexStep = 0;

    this.isAnimationEnd = true;

    this.sections = options.sections;
    this.isActive = false;

    if (options.navigationContainer !== undefined && options.navigationContainer !== null) {
      this.navigation = new SliderNavigation({
        container: options.navigationContainer,
        sections: this.sections,
        onPinClick: (i) => {
          this.changeActiveIndex(i);
        },
      });
    }

    this.updateClasses();
  }

  init() {
    if (this.isActive === true) return;
    this.isActive = true;
    this.activeIndexSection = 0;
    this.activeIndexStep = 0;
    this.isAnimationEnd = true;
    this.updateClasses();
  }

  getIndexByName(name) {
    for (let i = 0; i < this.sections.length; i += 1) {
      if (name === this.sections[i].name) {
        return i;
      }
    }
    return -1;
  }

  changeActiveIndex(newActiveIndex, newActiveIndexStep = 0) {
    if (this.isActive === false) return;
    if (this.isAnimationEnd === false) return;
    if (this.activeIndexSection === newActiveIndex && this.activeIndexStep === newActiveIndexStep) return;

    const lastSection = this.sections[this.activeIndexSection];

    if (newActiveIndex !== undefined) this.activeIndexSection = newActiveIndex;
    this.activeIndexStep = newActiveIndexStep;

    this.updateClasses(lastSection);
  }

  nextStep() {
    if (this.isActive === false) return;
    if (this.isAnimationEnd === false) return;

    if (this.activeIndexSection === this.sections.length - 1
    && this.activeIndexStep === this.sections[this.activeIndexSection].steps) return;

    const lastSection = this.sections[this.activeIndexSection];

    if (this.activeIndexStep < this.sections[this.activeIndexSection].steps) {
      this.activeIndexStep += 1;
    } else if (this.activeIndexSection < this.sections.length - 1) {
      this.activeIndexSection += 1;
      this.activeIndexStep = 0;
    }

    this.updateClasses(lastSection);
  }

  prevStep() {
    if (this.isActive === false) return;
    if (this.isAnimationEnd === false) return;
    if (this.activeIndexSection === 0 && this.activeIndexStep === 0) return;

    const lastSection = this.sections[this.activeIndexSection];

    if (this.activeIndexStep > 0) {
      this.activeIndexStep -= 1;
    } else if (this.activeIndexSection > 0) {
      this.activeIndexSection -= 1;
      this.activeIndexStep = 0;
    }

    this.updateClasses(lastSection);
  }

  updateClasses(lastSection) {
    if (this.isActive === false) return;

    this.isAnimationEnd = false;
    let duration = 0;

    if (this.options.beforeChange !== undefined) this.options.beforeChange(this.sections[this.activeIndexSection], this.activeIndexStep);

    for (let i = 0; i < this.sections.length; i += 1) {
      const { element, steps, name } = this.sections[i];

      if (this.activeIndexSection === i) {
        if (this.navigation !== undefined) this.navigation.updateClasses(this.activeIndexSection);
        element.classList.add('js-slider-children-active');
        element.removeAttribute('data-slider-to');

        for (let j = 0; j <= steps; j += 1) {
          if (j <= this.activeIndexStep) element.classList.add(`js-slider-animation-${j}`);
          else element.classList.remove(`js-slider-animation-${j}`);
        }
        // eslint-disable-next-line prefer-destructuring
        duration = this.sections[i].duration;

        if (lastSection !== undefined && lastSection.name !== name) {
          element.setAttribute('data-slider-from', lastSection.name);
        }
      } else {
        element.classList.remove('js-slider-children-active');
        element.removeAttribute('data-slider-from');
        element.removeAttribute('data-slider-to');

        for (let j = 0; j <= steps; j += 1) {
          element.classList.remove(`js-slider-animation-${j}`);
        }

        if (lastSection !== undefined && lastSection.element === element) {
          lastSection.element.setAttribute('data-slider-to', this.sections[this.activeIndexSection].name);
        }
      }
    }

    if (this.options.afterChange !== undefined) this.options.afterChange(this.sections[this.activeIndexSection], this.activeIndexStep);

    setTimeout(() => {
      this.isAnimationEnd = true;
    }, duration);
  }

  destroy() {
    if (this.isActive === false) return;
    this.isActive = false;
    this.isAnimationEnd = true;

    for (let i = 0; i < this.sections.length; i += 1) {
      const { element, steps } = this.sections[i];

      element.classList.remove('js-slider-children-active');
      element.removeAttribute('data-slider-from');
      element.removeAttribute('data-slider-to');

      for (let j = 0; j <= steps; j += 1) {
        element.classList.remove(`js-slider-animation-${j}`);
      }
    }
  }
}
