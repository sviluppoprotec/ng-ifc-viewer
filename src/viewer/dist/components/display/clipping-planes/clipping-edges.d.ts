import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { BufferGeometry, Mesh, Plane } from 'three';
import { Context } from '../../../base-types';
import { IfcManager } from '../../ifc';
export interface Style {
    ids: number[];
    categories: number[];
    subsets: Mesh[];
    material: LineMaterial;
}
export interface StyleList {
    [styleName: string]: Style;
}
export interface EdgesItems {
    [styleName: string]: {
        generatorGeometry: BufferGeometry;
        mesh: LineSegments2;
    };
}
export declare class ClippingEdges {
    static readonly styles: StyleList;
    private static invisibleMaterial;
    private static defaultMaterial;
    private static readonly basicEdges;
    edges: EdgesItems;
    private isVisible;
    private inverseMatrix;
    private localPlane;
    private tempLine;
    private tempVector;
    private context;
    private clippingPlane;
    private ifc;
    private stylesInitialized;
    constructor(context: Context, clippingPlane: Plane, ifc: IfcManager);
    get visible(): boolean;
    set visible(visible: boolean);
    private static newGeneratorGeometry;
    remove(): void;
    updateEdges(): Promise<void>;
    newStyle(styleName: string, categories: number[], material?: LineMaterial): Promise<void>;
    private createDefaultStyles;
    private newSubset;
    private getItemIDs;
    private newThickEdges;
    private drawEdges;
}
