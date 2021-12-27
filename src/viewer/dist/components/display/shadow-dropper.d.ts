import { Camera, Group, Mesh, WebGLRenderTarget } from 'three';
import { Context } from '../../base-types';
import { IfcManager } from '../ifc';
export interface Shadow {
    root: Group;
    rt: WebGLRenderTarget;
    rtBlur: WebGLRenderTarget;
    blurPlane: Mesh;
    camera: Camera;
}
export declare class ShadowDropper {
    shadows: {
        [modelID: number]: Shadow;
    };
    cameraHeight: number;
    darkness: number;
    opacity: number;
    resolution: number;
    amount: number;
    private tempMaterial;
    private depthMaterial;
    private context;
    private IFC;
    constructor(context: Context, IFC: IfcManager);
    renderShadow(modelID: number): Promise<void>;
    private createPlanes;
    private initializeShadow;
    private bakeShadow;
    private initializeCamera;
    private initializeRenderTargets;
    private initializeRoot;
    private createGroundColorPlane;
    private createBasePlane;
    private createBlurPlane;
    private createPlaneMaterial;
    private initializeDepthMaterial;
    private createShadow;
    private createCamera;
    private getSizeAndCenter;
    private getLowestYCoordinate;
    private blurShadow;
}
