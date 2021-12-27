import { IfcModel } from 'web-ifc-three/IFC/BaseDefinitions';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import { LoaderSettings } from 'web-ifc';
import { IfcComponent, Context } from '../../base-types';
import { IfcSelection } from './selection';
import { VisibilityManager } from './visibility-manager';
import { IfcUnits } from './units';
export declare class IfcManager extends IfcComponent {
    loader: IFCLoader;
    visibility: VisibilityManager;
    preselection: IfcSelection;
    selection: IfcSelection;
    highlight: IfcSelection;
    units: IfcUnits;
    private readonly context;
    private readonly defPreselectMat;
    private readonly defSelectMat;
    private readonly defHighlightMat;
    constructor(context: Context);
    /**
     * Loads the given IFC in the current scene.
     * @file IFC as File.
     * @fitToFrame (optional) if true, brings the perspectiveCamera to the loaded IFC.
     * @onError (optional) a callback function to report on loading errors
     */
    loadIfc(file: File, fitToFrame?: boolean, onError?: (err: any) => any): Promise<IfcModel | null>;
    /**
     * Loads the given IFC in the current scene.
     * @file IFC as URL.
     * @fitToFrame (optional) if true, brings the perspectiveCamera to the loaded IFC.
     * @onProgress (optional) a callback function to report on downloading progress
     * @onError (optional) a callback function to report on loading errors
     */
    loadIfcUrl(url: string, fitToFrame?: boolean, onProgress?: (event: ProgressEvent) => void, onError?: (err: any) => any): Promise<IfcModel | null>;
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
    setWasmPath(path: string): void;
    /**
     * Applies a configuration for [web-ifc](https://ifcjs.github.io/info/docs/Guide/web-ifc/Introduction).
     */
    applyWebIfcConfig(settings: LoaderSettings): void;
    /**
     * Gets the spatial structure of the specified model.
     * @modelID ID of the IFC model.
     */
    getSpatialStructure(modelID: number, includeProperties?: boolean): Promise<any>;
    /**
     * Gets the properties of the specified item.
     * @modelID ID of the IFC model.
     * @id Express ID of the item.
     * @indirect If true, also returns psets, qsets and type properties.
     * @recursive If true, this gets the native properties of the referenced elements recursively.
     */
    getProperties(modelID: number, id: number, indirect: boolean, recursive?: boolean): Promise<any>;
    /**
     * Gets the ID of the model pointed by the cursor.
     */
    getModelID(): number | null;
    /**
     * Gets all the items of the specified type in the specified IFC model.
     * @modelID ID of the IFC model.
     * @type type of element. You can import the type from web-ifc.
     * @verbose If true, also gets the properties for all the elements.
     */
    getAllItemsOfType(modelID: number, type: number, verbose?: boolean): Promise<any[]>;
    /**
     * Highlights the item pointed by the cursor.
     */
    prePickIfcItem: () => void;
    /**
     * Highlights the item pointed by the cursor and gets is properties.
     * @focusSelection If true, animate the perspectiveCamera to focus the current selection
     */
    pickIfcItem: (focusSelection?: boolean) => Promise<{
        modelID: number;
        id: number;
    } | null>;
    /**
     * Highlights the item pointed by the cursor and gets is properties, without applying any material to it.
     * @focusSelection If true, animate the perspectiveCamera to focus the current selection
     */
    highlightIfcItem: (focusSelection?: boolean) => Promise<{
        modelID: number;
        id: number;
    } | null>;
    /**
     * Highlights the item with the given ID.
     * @modelID ID of the IFC model.
     * @id Express ID of the item.
     */
    pickIfcItemsByID: (modelID: number, ids: number[], focusSelection?: boolean) => void;
    prepickIfcItemsByID: (modelID: number, ids: number[], focusSelection?: boolean) => void;
    highlightIfcItemsByID: (modelID: number, ids: number[], focusSelection?: boolean) => void;
    unpickIfcItems: () => void;
    unPrepickIfcItems: () => void;
    unHighlightIfcItems: () => void;
    private addIfcModel;
    private setupThreeMeshBVH;
    private initializeDefMaterial;
}
