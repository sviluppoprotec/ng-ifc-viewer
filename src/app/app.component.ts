import { AfterViewInit, Component } from '@angular/core';
import { IFCCOLUMN, IFCOPENINGELEMENT, IFCROOF, IFCSLAB, IFCSPACE, IFCSTAIR, IFCWALL, IFCWALLSTANDARDCASE } from 'web-ifc';
import { IfcViewerAPI } from '../viewer/dist/ifc-viewer-api'
import { MeshBasicMaterial, LineBasicMaterial, Color, EdgesGeometry } from 'three';
import { createSideMenuButton } from './classes/gui-creator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'ifc-xbim';
  viewer: IfcViewerAPI;
  fills = [];
  model;
  constructor() {
  }

  ngAfterViewInit() {
    this.setViewer();

    //Setup UI
    const inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'file');
    inputElement.classList.add('hidden');
    inputElement.addEventListener('change', this.loadIfc, false);
    document.body.appendChild(inputElement);

    const loadButton = createSideMenuButton('./assets/resources/folder-icon.svg');
    loadButton.addEventListener('click', () => {
      loadButton.blur();
      inputElement.click();
    });

    const sectionButton = createSideMenuButton('./assets/resources/section-plane-down.svg');
    sectionButton.addEventListener('click', () => {
      sectionButton.blur();
      this.viewer.toggleClippingPlanes();
    });

    const dropBoxButton = createSideMenuButton('./assets/resources/dropbox-icon.svg');
    dropBoxButton.addEventListener('click', () => {
      dropBoxButton.blur();
      this.viewer.openDropboxWindow();
    });

  }

  setViewer() {
    const container = document.getElementById('viewer-container');
    this.viewer = new IfcViewerAPI({ container, backgroundColor: new Color(255, 255, 255) });
    this.viewer.addAxes();
    this.viewer.addGrid();
    this.viewer.IFC.setWasmPath('files/');

    this.viewer.IFC.loader.ifcManager.useWebWorkers(true, 'assets/files/IFCWorker.js');

    // Setup loader

    new LineBasicMaterial({ color: 0x555555 });
    new MeshBasicMaterial({ color: 0xffffff, side: 2 });

    let model;
    const loadIfc = async (event) => {
      const overlay = document.getElementById('loading-overlay');
      const progressText = document.getElementById('loading-progress');

      overlay.classList.remove('hidden');
      progressText.innerText = `Loading`;

      this.viewer.IFC.loader.ifcManager.setOnProgress((event) => {
        const percentage = Math.floor((event.loaded * 100) / event.total);
        progressText.innerText = `Loaded ${percentage}%`;
      });

      this.viewer.IFC.loader.ifcManager.parser.setupOptionalCategories({
        [IFCSPACE]: false,
        [IFCOPENINGELEMENT]: false
      });

      model = await this.viewer.IFC.loadIfc(event.target.files[0], true);
      model.material.forEach(mat => mat.side = 2);

      this.createFill(model.modelID);
      // viewer.edges.create(`${model.modelID}`, model.modelID, lineMaterial);
      // viewer.edges.toggle(`${model.modelID}`);

      overlay.classList.add('hidden');
    };
  }


  async createFill(modelID) {
    const wallsStandard = await this.viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCWALLSTANDARDCASE, false);
    const walls = await this.viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCWALL, false);
    const stairs = await this.viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCSTAIR, false);
    const columns = await this.viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCCOLUMN, false);
    const roofs = await this.viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCROOF, false);
    const slabs = await this.viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCSLAB, false);
    const ids = [...walls, ...wallsStandard, ...columns, ...stairs, ...slabs, ...roofs];
    const material = new MeshBasicMaterial({ color: 0x555555 });
    material.polygonOffset = true;
    material.polygonOffsetFactor = 10;
    material.polygonOffsetUnits = 1;
    this.fills.push(this.viewer.fills.create(`${modelID}`, modelID, ids, material));
  }

  loadIfc = async (event) => {
    const overlay = document.getElementById('loading-overlay');
    const progressText = document.getElementById('loading-progress');
  
    overlay.classList.remove('hidden');
    progressText.innerText = `Loading`;
  
    this.viewer.IFC.loader.ifcManager.setOnProgress((event) => {
      const percentage = Math.floor((event.loaded * 100) / event.total);
      progressText.innerText = `Loaded ${percentage}%`;
    });
  
    this.viewer.IFC.loader.ifcManager.parser.setupOptionalCategories({
      [IFCSPACE]: false,
      [IFCOPENINGELEMENT]: false
    });
  
    this.model = await this.viewer.IFC.loadIfc(event.target.files[0], true);
    this.model.material.forEach(mat => mat.side = 2);
  
    this.createFill(this.model.modelID);
    // viewer.edges.create(`${model.modelID}`, model.modelID, lineMaterial);
    // viewer.edges.toggle(`${model.modelID}`);
  
    overlay.classList.add('hidden');
  };

}
