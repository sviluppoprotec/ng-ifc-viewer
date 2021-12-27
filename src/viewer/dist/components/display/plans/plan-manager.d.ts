import { Mesh, Vector3 } from 'three';
import { IfcPlane } from '../clipping-planes/planes';
import { IfcClipper } from '../clipping-planes/clipper';
import { Context } from '../../../base-types';
import { IfcManager } from '../../ifc';
export interface PlanViewConfig {
    modelID: number;
    name: string;
    camera: Vector3;
    target: Vector3;
    normal?: Vector3;
    point?: Vector3;
    ortho?: boolean;
    rotation?: number;
}
export interface PlanView extends PlanViewConfig {
    plane?: IfcPlane;
}
export declare class PlanManager {
    private ifc;
    private context;
    private clipper;
    planLists: {
        [modelID: number]: {
            [name: string]: PlanView;
        };
    };
    sectionFill: Mesh;
    active: boolean;
    currentPlan?: PlanView;
    defaultSectionOffset: number;
    defaultCameraOffset: number;
    private previousCamera;
    private previousTarget;
    private previousProjection;
    private storeys;
    constructor(ifc: IfcManager, context: Context, clipper: IfcClipper);
    getAll(): string[];
    create(config: PlanViewConfig): Promise<void>;
    goTo(modelID: number, name: string, animate?: boolean): Promise<void>;
    exitPlanView(animate?: boolean): void;
    computeAllPlanViews(modelID: number): Promise<void>;
}
