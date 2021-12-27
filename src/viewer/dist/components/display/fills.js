import { BackSide } from 'three';
export class SectionFillManager {
    constructor(IFC, context) {
        this.IFC = IFC;
        this.context = context;
        this.fills = {};
    }
    get(name) {
        return this.fills[name];
    }
    create(name, modelID, ids, material) {
        if (this.fills[name] !== undefined)
            throw new Error('The specified fill already exists');
        material.clippingPlanes = this.context.getClippingPlanes();
        const model = this.context.items.ifcModels.find((model) => model.modelID === modelID);
        if (!model)
            throw new Error('The requested model to fill was not found.');
        this.setupMaterial(material);
        const subset = this.getSubset(modelID, ids, material, name);
        if (!subset)
            return null;
        this.context.items.ifcModels.push(model);
        this.context.items.pickableIfcModels.push(model);
        model.add(subset);
        this.fills[name] = subset;
        // subset.renderOrder = 2;
        return subset;
    }
    delete(name) {
        const subset = this.fills[name];
        delete this.fills[name];
        this.context.scene.removeModel(subset);
        subset.geometry.dispose();
    }
    setupMaterial(material) {
        material.clippingPlanes = this.context.getClippingPlanes();
        material.side = BackSide;
        material.polygonOffset = true;
        material.polygonOffsetFactor = -1;
        material.polygonOffsetUnits = 1;
    }
    getSubset(modelID, ids, material, name) {
        return this.IFC.loader.ifcManager.createSubset({
            modelID,
            ids,
            scene: this.context.getScene(),
            removePrevious: true,
            material,
            customID: name
        });
    }
}
//# sourceMappingURL=fills.js.map