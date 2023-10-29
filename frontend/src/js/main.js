import getFocusableElements from "./get-focusable-elements.js";

class BurgerMenu extends HTMLElement {
  constructor() {
    super();

    const self = this;

    this.state = new Proxy(
      {
        status: "open",
        enabled: false,
      },
      {
        set(state, key, value) {
          const oldValue = state[key];

          state[key] = value;
          if (oldValue !== value) {
            self.processStateChange();
          }
          return state;
        },
      }
    );
  }

  get maxWidth() {
    return parseInt(this.getAttribute("max-width") || 9999, 10);
  }

  connectedCallback() {
    this.initialMarkup = this.innerHTML;
    this.render();

    const observer = new ResizeObserver((observedItems) => {
      const { contentRect } = observedItems[0];
      this.state.enabled = contentRect.width <= this.maxWidth;
    });

    // We want to watch the parent like a hawk
    observer.observe(this.parentNode);
  }

  render() {
    this.innerHTML = `
        <div class="burger-menu" data-element="burger-root">
          <button class="burger-menu__trigger" data-element="burger-menu-trigger" type="button" aria-label="Open menu">
            <span class="burger-menu__bar" aria-hidden="true"></span>
          </button>
          <div class="burger-menu__panel" data-element="burger-menu-panel">
            ${this.initialMarkup} 
          </div>
        </div>
      `;

    this.postRender();
  }

  postRender() {
    this.trigger = this.querySelector('[data-element="burger-menu-trigger"]');
    this.panel = this.querySelector('[data-element="burger-menu-panel"]');
    this.root = this.querySelector('[data-element="burger-root"]');
    this.focusableElements = getFocusableElements(this);

    if (this.trigger && this.panel) {
      this.toggle();

      this.trigger.addEventListener("click", (evt) => {
        evt.preventDefault();

        this.toggle();
      });

      // for accessibility

      document.addEventListener("focusin", () => {
        if (!this.contains(document.activeElement)) {
          this.toggle("closed");
        }
      });

      return;
    }

    this.innerHTML = this.initialMarkup;
  }

  toggle(forcedStatus) {
    if (forcedStatus) {
      if (this.state.status === forcedStatus) {
        return;
      }

      this.state.status = forcedStatus;
    } else {
      this.state.status = this.state.status === "closed" ? "open" : "closed";
    }
  }

  processStateChange() {
    this.root.setAttribute("status", this.state.status);
    this.root.setAttribute("enabled", this.state.enabled ? "true" : "false");

    this.manageFocus();

    switch (this.state.status) {
      case "closed":
        this.trigger.setAttribute("aria-expanded", "false");
        this.trigger.setAttribute("aria-label", "Open menu");
        break;
      case "open":
      case "initial":
        this.trigger.setAttribute("aria-expanded", "true");
        this.trigger.setAttribute("aria-label", "Close menu");
        break;
    }
  }

  manageFocus() {
    if (!this.state.enabled) {
      this.focusableElements.forEach((element) =>
        element.removeAttribute("tabindex")
      );
      return;
    }

    switch (this.state.status) {
      case "open":
        this.focusableElements.forEach((element) =>
          element.removeAttribute("tabindex")
        );
        break;
      case "closed":
        [...this.focusableElements]
          .filter(
            (element) =>
              element.getAttribute("data-element") !== "burger-menu-trigger"
          )
          .forEach((element) => element.setAttribute("tabindex", "-1"));
        break;
    }
  }
}

if ("customElements" in window) {
  customElements.define("burger-menu", BurgerMenu);
}

export default BurgerMenu;

// Scroll Behavior

document.addEventListener("DOMContentLoaded", function () {
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
  };

  document.querySelector(".btn-secondary").addEventListener("click", () => {
    scrollToSection("projects");
  });

  document.querySelector(".btn-primary").addEventListener("click", () => {
    console.log("contact");
    scrollToSection("contact");
  });
});

// Image Links

const cardImages = document.querySelectorAll(".card__img");

cardImages.forEach(function (cardImage) {
  const link = cardImage.getAttribute("data-link");

  cardImage.addEventListener("click", function () {
    window.open(link, "_blank");
  });
});

// Spinner

import { Spinner } from "spin.js";

const opts = {
  lines: 14,
  length: 36,
  width: 17,
  radius: 47,
  scale: 0.15,
  corners: 1,
  speed: 0.9,
  rotate: 0,
  animation: "spinner-line-fade-quick",
  direction: 1,
  color: "#16caca",
  fadeColor: "transparent",
  top: "50%",
  left: "0%",
  shadow: "0 0 1px transparent",
  zIndex: 2000000000,
  className: "spinner",
  position: "absolute",
};

const target = document.querySelector("#spinner-wrapper");

// Form

const form = document.querySelector("#contact-form");
const thanksMessage = document.querySelector("#thanks-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const spinner = new Spinner(opts).spin(target);

  const formData = new FormData(form);
  const response = await fetch(form.action, {
    method: form.method,
    body: new URLSearchParams(formData),
  });

  const result = await response.json();
  spinner.stop();

  if (result.success) {
    spinner.stop();
    thanksMessage.style.display = "block";

    setTimeout(() => {
      thanksMessage.style.display = "none";
    }, 5000);
  } else {
    console.error(result.error);
  }
});
