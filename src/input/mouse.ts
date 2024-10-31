import { Vector2 } from "~/math/vector/Vector2";

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}

const mousePosition = new Vector2(0, 0);
const mouseButtons = new Set<MouseButton>();

export const getMousePosition = () => mousePosition.clone();
export const isButtonPressed = (button: MouseButton) => {
  return mouseButtons.has(button);
};

window.addEventListener("blur", () => {
  mouseButtons.clear();
});

window.addEventListener("mousemove", (event: MouseEvent) => {
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
});

window.addEventListener("mousedown", (event: MouseEvent) => {
  mouseButtons.add(event.button);
});
window.addEventListener("mouseup", (event: MouseEvent) => {
  mouseButtons.delete(event.button);
});
