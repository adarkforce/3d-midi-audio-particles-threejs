import "./style.css";
import { Engine } from "./engine.js";
import { gsap } from "gsap";

const canvas = document.querySelector(".webgl");
const overlayElement = document.getElementById("overlay");
const textOverlayElement = document.getElementById("click-to-start");

gsap.fromTo(textOverlayElement, { opacity: 0 }, { opacity: 0.5, duration: 1 });

canvas.style.filter = "blur(4px)";
overlayElement.addEventListener("click", function () {
  gsap.to(canvas, { filter: "blur(0px)", duration: 1 });
  gsap.to(overlayElement, {
    opacity: 0,
    duration: 1,
    onComplete: () => {
      overlayElement.style.display = "none";
    },
  });
});

const engine = new Engine();
engine.debug = false;
engine.run();
