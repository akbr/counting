import { style } from "../lib/ui/stylus";
import { Updater, Transition } from "../lib/ui/types";

export const fade: Updater<Transition> = ($el, props) => {
  if (props === "in") {
    style($el, { opacity: 0, y: -20 });
    return style($el, { opacity: 1, y: 0 }, { duration: 300, easing: "ease" });
  } else if (!props) {
    style($el, { opacity: 1 });
  } else if (props === "out") {
    style($el, { opacity: 1 });
    return style($el, { opacity: 0 }, { duration: 300, easing: "ease" });
  }
};
