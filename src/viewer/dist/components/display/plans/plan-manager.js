import { Mesh, Vector3 } from 'three';
import { IFCBUILDINGSTOREY, IFCBUILDING } from 'web-ifc';
import { CameraProjections, NavigationModes } from '../../../base-types';
import { UnitType } from '../../ifc/units';
export class PlanManager {
    constructor(ifc, context, clipper) {
        this.ifc = ifc;
        this.context = context;
        this.clipper = clipper;
        this.planLists = {};
        this.active = false;
        this.defaultSectionOffset = 1.5;
        this.defaultCameraOffset = 30;
        this.previousCamera = new Vector3();
        this.previousTarget = new Vector3();
        this.previousProjection = CameraProjections.Perspective;
        this.storeys = [];
        this.sectionFill = new Mesh();
    }
    getAll() {
        return Object.keys(this.planLists);
    }
    async create(config) {
        // if (this.planList[config.name] !== undefined) return;
        const { modelID, name, camera, target } = config;
        const ortho = config.ortho || true;
        if (this.planLists[modelID] === undefined) {
            this.planLists[modelID] = {};
        }
        const currentPlanlist = this.planLists[modelID];
        if (currentPlanlist[name])
            return;
        currentPlanlist[name] = { modelID, name, camera, target, ortho };
        if (config.normal && config.point) {
            const { normal, point } = config;
            const plane = this.clipper.createFromNormalAndCoplanarPoint(normal, point, true);
            plane.visible = false;
            plane.active = false;
            currentPlanlist[name].plane = plane;
            await plane.edges.updateEdges();
            plane.edges.visible = false;
        }
    }
    async goTo(modelID, name, animate = false) {
        var _a, _b;
        if (((_a = this.currentPlan) === null || _a === void 0 ? void 0 : _a.modelID) === modelID && this.currentPlan.name === name)
            return;
        if (!this.active) {
            this.context.getCamera().getWorldPosition(this.previousCamera);
            this.context.ifcCamera.cameraControls.getTarget(this.previousTarget);
            this.previousProjection = this.context.ifcCamera.projection;
        }
        this.active = true;
        if (this.planLists[modelID] === undefined)
            throw new Error('The specified plan is undefined!');
        const currentPlanList = this.planLists[modelID];
        if (currentPlanList[name] === undefined)
            throw new Error('The specified plan is undefined!');
        const plane = (_b = this.currentPlan) === null || _b === void 0 ? void 0 : _b.plane;
        if (plane)
            plane.active = false;
        if (!currentPlanList[name])
            return;
        this.currentPlan = currentPlanList[name];
        const { x, y, z } = this.currentPlan.camera;
        const target = this.currentPlan.target;
        this.context.ifcCamera.setNavigationMode(NavigationModes.Plan);
        const mode = this.currentPlan.ortho
            ? CameraProjections.Orthographic
            : CameraProjections.Perspective;
        this.context.ifcCamera.projection = mode;
        if (this.currentPlan.plane) {
            this.currentPlan.plane.active = true;
        }
        await this.context.ifcCamera.cameraControls.setLookAt(x, y, z, target.z, target.y, target.z, animate);
    }
    exitPlanView(animate = false) {
        if (!this.active)
            return;
        this.active = false;
        this.context.ifcCamera.setNavigationMode(NavigationModes.Orbit);
        this.context.ifcCamera.projection = this.previousProjection;
        if (this.currentPlan && this.currentPlan.plane) {
            this.currentPlan.plane.active = false;
        }
        this.currentPlan = undefined;
        this.context.ifcCamera.cameraControls.setLookAt(this.previousCamera.x, this.previousCamera.y, this.previousCamera.z, this.previousTarget.x, this.previousTarget.y, this.previousTarget.z, animate);
    }
    async computeAllPlanViews(modelID) {
        if (!this.storeys[modelID]) {
            this.storeys[modelID] = await this.ifc.getAllItemsOfType(modelID, IFCBUILDINGSTOREY, true);
        }
        const allBuildingsIDs = await this.ifc.getAllItemsOfType(modelID, IFCBUILDING, false);
        const buildingID = allBuildingsIDs[0];
        const building = await this.ifc.getProperties(modelID, buildingID, false, true);
        const unitsScale = await this.ifc.units.getUnits(modelID, UnitType.LENGTHUNIT);
        // const buildingPlace = building.ObjectPlacement.Location;
        // const buildingCoords = buildingPlace.Coordinates.map((coord: any) => coord.value * unitsScale);
        const sitePlace = building.ObjectPlacement.PlacementRelTo.RelativePlacement.Location;
        const siteCoords = sitePlace.Coordinates.map((coord) => coord.value);
        const transformMatrix = await this.ifc.loader.ifcManager.ifcAPI.GetCoordinationMatrix(modelID);
        const transformHeight = transformMatrix[13];
        const storeys = this.storeys[modelID];
        for (let i = 0; i < storeys.length; i++) {
            const storey = storeys[i];
            const baseHeight = storey.Elevation.value;
            const elevation = (baseHeight + siteCoords[2]) * unitsScale + transformHeight;
            // eslint-disable-next-line no-await-in-loop
            await this.create({
                modelID,
                name: storey.LongName.value,
                target: new Vector3(0, 0, 0),
                camera: new Vector3(0, elevation + this.defaultCameraOffset, 0),
                point: new Vector3(0, elevation + this.defaultSectionOffset, 0),
                normal: new Vector3(0, -1, 0),
                rotation: 0,
                ortho: true
            });
        }
    }
}
//# sourceMappingURL=plan-manager.js.map