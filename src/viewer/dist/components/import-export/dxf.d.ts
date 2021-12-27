import { PlanView } from '../display';
export declare class DXFWriter {
    drawings: {
        [id: string]: any;
    };
    private Drawing;
    initializeJSPDF(drawing: any): void;
    newDrawing(drawingName: string, units?: string): void;
    drawNamedLayer(drawingName: string, plan: PlanView, layerName: string, dxfLayerName: string, color: any, style?: string): void;
    draw(drawingName: string, coordinates: ArrayLike<number>, dxfLayerName: string, color: any, style?: string): void;
    exportDXF(drawingName: string): void;
}
