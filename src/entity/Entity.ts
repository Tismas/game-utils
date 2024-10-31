import { Canvas } from "~/Canvas";
import { Vector2 } from "~/math/vector/Vector2";

import { EntityModule } from "./Module";

export abstract class Entity {
  private _position: Vector2 = Vector2.zero();
  private modules: EntityModule[] = [];

  get position() {
    return this._position;
  }

  set position(position: Vector2) {
    this._position = position;
  }

  addModule(...modules: EntityModule[]) {
    for (const module of modules) {
      this.modules.push(module);
    }
    this.modules.forEach((module) => module.init?.());
  }

  removeModule(module: EntityModule) {
    this.modules = this.modules.filter((mod) => mod !== module);
    module.onRemove?.();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findModule<T extends EntityModule>(moduleType: new (...args: any) => T): T | undefined {
    return this.modules.find((module) => module instanceof moduleType) as T;
  }

  update(deltaTime: number, canvas: Canvas): void {
    this.modules.forEach((module) => module.update?.(deltaTime, canvas));
  }

  draw(canvas: Canvas): void {
    this.modules.forEach((module) => module.draw?.(canvas));
  }

  onRemove(): void {
    this.modules.forEach((module) => module.onRemove?.());
  }
}
