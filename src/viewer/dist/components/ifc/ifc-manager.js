// @ts-ignore
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { DoubleSide, Matrix4, MeshLambertMaterial } from 'three';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import { IfcComponent } from '../../base-types';
import { IfcSelection } from './selection';
import { VisibilityManager } from './visibility-manager';
import { IfcUnits } from './units';
export class IfcManager extends IfcComponent {
    constructor(context) {
        super(context);
        /**
         * Highlights the item pointed by the cursor.
         */
        this.prePickIfcItem = () => {
            const found = this.context.castRayIfc();
            if (!found) {
                this.preselection.hideSelection();
                return;
            }
            this.preselection.pick(found);
        };
        /**
         * Highlights the item pointed by the cursor and gets is properties.
         * @focusSelection If true, animate the perspectiveCamera to focus the current selection
         */
        this.pickIfcItem = async (focusSelection = false) => {
            const found = this.context.castRayIfc();
            if (!found)
                return null;
            const result = await this.selection.pick(found, focusSelection);
            if (result == null || result.modelID == null || result.id == null)
                return null;
            return result;
        };
        /**
         * Highlights the item pointed by the cursor and gets is properties, without applying any material to it.
         * @focusSelection If true, animate the perspectiveCamera to focus the current selection
         */
        this.highlightIfcItem = async (focusSelection = false) => {
            const found = this.context.castRayIfc();
            if (!found)
                return null;
            const result = await this.highlight.pick(found, focusSelection);
            if (result == null || result.modelID == null || result.id == null)
                return null;
            return result;
        };
        /**
         * Highlights the item with the given ID.
         * @modelID ID of the IFC model.
         * @id Express ID of the item.
         */
        this.pickIfcItemsByID = (modelID, ids, focusSelection = false) => {
            this.selection.pickByID(modelID, ids, focusSelection);
        };
        this.prepickIfcItemsByID = (modelID, ids, focusSelection = false) => {
            this.preselection.pickByID(modelID, ids, focusSelection);
        };
        this.highlightIfcItemsByID = (modelID, ids, focusSelection = false) => {
            this.highlight.pickByID(modelID, ids, focusSelection);
        };
        this.unpickIfcItems = () => {
            this.selection.unpick();
        };
        this.unPrepickIfcItems = () => {
            this.preselection.unpick();
        };
        this.unHighlightIfcItems = () => {
            this.highlight.unpick();
        };
        this.context = context;
        this.loader = new IFCLoader();
        this.setupThreeMeshBVH();
        this.visibility = new VisibilityManager(this.loader, this.context);
        this.defSelectMat = this.initializeDefMaterial(0xff33ff, 0.3);
        this.defPreselectMat = this.initializeDefMaterial(0xffccff, 0.5);
        this.defHighlightMat = this.initializeDefMaterial(0xffccff, 0.5);
        this.preselection = new IfcSelection(context, this.loader, this.defPreselectMat);
        this.selection = new IfcSelection(context, this.loader, this.defSelectMat);
        this.highlight = new IfcSelection(context, this.loader, this.defHighlightMat);
        this.units = new IfcUnits(this);
    }
    /**
     * Loads the given IFC in the current scene.
     * @file IFC as File.
     * @fitToFrame (optional) if true, brings the perspectiveCamera to the loaded IFC.
     * @onError (optional) a callback function to report on loading errors
     */
    async loadIfc(file, fitToFrame = false, onError) {
        const url = URL.createObjectURL(file);
        return this.loadIfcUrl(url, fitToFrame, undefined, onError);
    }
    /**
     * Loads the given IFC in the current scene.
     * @file IFC as URL.
     * @fitToFrame (optional) if true, brings the perspectiveCamera to the loaded IFC.
     * @onProgress (optional) a callback function to report on downloading progress
     * @onError (optional) a callback function to report on loading errors
     */
    async loadIfcUrl(url, fitToFrame = false, onProgress, onError) {
        try {
            const firstModel = Boolean(this.context.items.ifcModels.length === 0);
            const settings = this.loader.ifcManager.state.webIfcSettings;
            const fastBools = (settings === null || settings === void 0 ? void 0 : settings.USE_FAST_BOOLS) || true;
            await this.loader.ifcManager.applyWebIfcConfig({
                COORDINATE_TO_ORIGIN: firstModel,
                USE_FAST_BOOLS: fastBools
            });
            const ifcModel = (await this.loader.loadAsync(url, onProgress));
            this.addIfcModel(ifcModel.mesh);
            if (firstModel) {
                const matrixArr = await this.loader.ifcManager.ifcAPI.GetCoordinationMatrix(ifcModel.modelID);
                const matrix = new Matrix4().fromArray(matrixArr);
                this.loader.ifcManager.setupCoordinationMatrix(matrix);
            }
            if (fitToFrame)
                this.context.fitToFrame();
            return ifcModel;
        }
        catch (err) {
            console.error('Error loading IFC.');
            console.error(err);
            if (onError)
                onError(err);
            return null;
        }
    }
    /**
     * Sets the relative path of web-ifc.wasm file in the project.
     * Beware: you **must** serve this file in your page; this means
     * that you have to copy this files from *node_modules/web-ifc*
     * to your deployment directory.
     *
     * If you don't use this methods,
     * IFC.js assumes that you are serving it in the root directory.
     *
     * Example if web-ifc.wasm is in dist/wasmDir:
     * `ifcLoader.setWasmPath("dist/wasmDir/");`
     *
     * @path Relative path to web-ifc.wasm.
     */
    setWasmPath(path) {
        this.loader.ifcManager.setWasmPath(path);
    }
    /**
     * Applies a configuration for [web-ifc](https://ifcjs.github.io/info/docs/Guide/web-ifc/Introduction).
     */
    applyWebIfcConfig(settings) {
        this.loader.ifcManager.applyWebIfcConfig(settings);
    }
    /**
     * Gets the spatial structure of the specified model.
     * @modelID ID of the IFC model.
     */
    getSpatialStructure(modelID, includeProperties) {
        return this.loader.ifcManager.getSpatialStructure(modelID, includeProperties);
    }
    /**
     * Gets the properties of the specified item.
     * @modelID ID of the IFC model.
     * @id Express ID of the item.
     * @indirect If true, also returns psets, qsets and type properties.
     * @recursive If true, this gets the native properties of the referenced elements recursively.
     */
    async getProperties(modelID, id, indirect, recursive) {
        if (modelID == null || id == null)
            return null;
        const props = await this.loader.ifcManager.getItemProperties(modelID, id, recursive);
        if (indirect) {
            props.psets = await this.loader.ifcManager.getPropertySets(modelID, id, recursive);
            props.mats = await this.loader.ifcManager.getMaterialsProperties(modelID, id, recursive);
            props.type = await this.loader.ifcManager.getTypeProperties(modelID, id, recursive);
        }
        return props;
    }
    /**
     * Gets the ID of the model pointed by the cursor.
     */
    getModelID() {
        const found = this.context.castRayIfc();
        if (!found)
            return null;
        const mesh = found.object;
        if (!mesh || mesh.modelID === undefined || mesh.modelID === null)
            return null;
        return mesh.modelID;
    }
    /**
     * Gets all the items of the specified type in the specified IFC model.
     * @modelID ID of the IFC model.
     * @type type of element. You can import the type from web-ifc.
     * @verbose If true, also gets the properties for all the elements.
     */
    getAllItemsOfType(modelID, type, verbose = false) {
        return this.loader.ifcManager.getAllItemsOfType(modelID, type, verbose);
    }
    addIfcModel(ifcMesh) {
        this.context.items.ifcModels.push(ifcMesh);
        this.context.items.pickableIfcModels.push(ifcMesh);
        this.context.getScene().add(ifcMesh);
    }
    setupThreeMeshBVH() {
        this.loader.ifcManager.setupThreeMeshBVH(computeBoundsTree, disposeBoundsTree, acceleratedRaycast);
    }
    initializeDefMaterial(color, opacity) {
        const planes = this.context.getClippingPlanes();
        return new MeshLambertMaterial({
            color,
            opacity,
            transparent: true,
            depthTest: false,
            side: DoubleSide,
            clippingPlanes: planes
        });
    }
}
//# sourceMappingURL=ifc-manager.js.map