import { GridHelper } from 'three';
import { IfcComponent } from '../../base-types';
export class IfcGrid extends IfcComponent {
    constructor(context, size, divisions, colorCenterLine, colorGrid) {
        super(context);
        this.grid = new GridHelper(size, divisions, colorCenterLine, colorGrid);
        // (this.grid.material as Material).depthTest = false;
        this.grid.renderOrder = 0;
        const scene = context.getScene();
        scene.add(this.grid);
    }
}
//# sourceMappingURL=grid.js.map