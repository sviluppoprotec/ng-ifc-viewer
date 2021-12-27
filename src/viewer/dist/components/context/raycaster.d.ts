import { Intersection, Object3D } from 'three';
import { IfcComponent, Context } from '../../base-types';
export declare class IfcRaycaster extends IfcComponent {
    private readonly raycaster;
    private readonly mouse;
    private readonly context;
    constructor(context: Context);
    castRay(items: Object3D[]): Intersection<Object3D<import("three").Event>>[];
    castRayIfc(): Intersection<Object3D<import("three").Event>> | null;
    private filterClippingPlanes;
}
