import { Vector3, Matrix3 } from 'three';
import { IfcComponent } from '../../../base-types';
import { IfcPlane } from './planes';
export class IfcClipper extends IfcComponent {
    constructor(context, ifc) {
        super(context);
        this.orthogonalY = true;
        this.toleranceOrthogonalY = 0.7;
        this.planeSize = 5;
        this.createPlane = () => {
            if (!this.enabled)
                return;
            const intersects = this.context.castRayIfc();
            if (!intersects)
                return;
            this.createPlaneFromIntersection(intersects);
            this.intersection = undefined;
        };
        this.createFromNormalAndCoplanarPoint = (normal, point, isPlan = false) => {
            const plane = new IfcPlane(this.context, this.ifc, point, normal, this.activateDragging, this.deactivateDragging, this.planeSize, this.edgesEnabled);
            plane.isPlan = isPlan;
            this.planes.push(plane);
            this.context.addClippingPlane(plane.plane);
            this.updateMaterials();
            return plane;
        };
        this.deletePlane = (plane) => {
            let existingPlane = plane;
            if (!existingPlane) {
                if (!this.enabled)
                    return;
                existingPlane = this.pickPlane();
            }
            if (!existingPlane)
                return;
            const index = this.planes.indexOf(existingPlane);
            if (index === -1)
                return;
            existingPlane.removeFromScene();
            this.planes.splice(index, 1);
            this.context.removeClippingPlane(existingPlane.plane);
            this.updateMaterials();
        };
        this.deleteAllPlanes = () => {
            this.planes.forEach((plane) => plane.removeFromScene());
            this.planes = [];
            this.updateMaterials();
        };
        this.pickPlane = () => {
            const planeMeshes = this.planes.map((p) => p.planeMesh);
            const arrowMeshes = this.planes.map((p) => p.arrowBoundingBox);
            const intersects = this.context.castRay([...planeMeshes, ...arrowMeshes]);
            if (intersects.length > 0) {
                return this.planes.find((p) => {
                    if (p.planeMesh === intersects[0].object || p.arrowBoundingBox === intersects[0].object) {
                        return p;
                    }
                    return null;
                });
            }
            return null;
        };
        this.createPlaneFromIntersection = (intersection) => {
            var _a;
            const constant = intersection.point.distanceTo(new Vector3(0, 0, 0));
            const normal = (_a = intersection.face) === null || _a === void 0 ? void 0 : _a.normal;
            if (!constant || !normal)
                return;
            const normalMatrix = new Matrix3().getNormalMatrix(intersection.object.matrixWorld);
            const worldNormal = normal.clone().applyMatrix3(normalMatrix).normalize();
            this.normalizePlaneDirectionY(worldNormal);
            const plane = this.newPlane(intersection, worldNormal.negate());
            this.planes.push(plane);
            this.context.addClippingPlane(plane.plane);
            this.updateMaterials();
        };
        this.activateDragging = () => {
            this.dragging = true;
        };
        this.deactivateDragging = () => {
            this.dragging = false;
        };
        this.updateMaterials = () => {
            const planes = this.context.getClippingPlanes();
            // Applying clipping to IfcObjects only. This could be improved.
            this.context.items.ifcModels.forEach((obj) => {
                const mesh = obj;
                if (mesh.material)
                    this.updateMaterial(mesh, planes);
                if (mesh.userData.wireframe)
                    this.updateMaterial(mesh.userData.wireframe, planes);
            });
        };
        this.context = context;
        this.ifc = ifc;
        this.enabled = false;
        this.edgesEnabled = true;
        this.dragging = false;
        this.planes = [];
    }
    get active() {
        return this.enabled;
    }
    set active(state) {
        this.enabled = state;
        this.planes.forEach((plane) => {
            if (!plane.isPlan) {
                plane.visible = state;
                plane.active = state;
            }
        });
        this.updateMaterials();
    }
    get edgesActive() {
        return this.edgesEnabled;
    }
    set edgesActive(state) {
        this.edgesEnabled = state;
        this.planes.forEach((plane) => {
            plane.edgesActive = state;
        });
    }
    normalizePlaneDirectionY(normal) {
        if (this.orthogonalY) {
            if (normal.y > this.toleranceOrthogonalY) {
                normal.x = 0;
                normal.y = 1;
                normal.z = 0;
            }
            if (normal.y < -this.toleranceOrthogonalY) {
                normal.x = 0;
                normal.y = -1;
                normal.z = 0;
            }
        }
    }
    newPlane(intersection, worldNormal) {
        return new IfcPlane(this.context, this.ifc, intersection.point, worldNormal, this.activateDragging, this.deactivateDragging, this.planeSize, this.edgesEnabled);
    }
    updateMaterial(mesh, planes) {
        if (!Array.isArray(mesh.material)) {
            mesh.material.clippingPlanes = planes;
            return;
        }
        mesh.material.forEach((m) => {
            m.clippingPlanes = planes;
        });
    }
}
//# sourceMappingURL=clipper.js.map