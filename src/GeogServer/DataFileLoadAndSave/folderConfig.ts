import AzgaarReaderData from "./AzgaarReaderData";
import InformationFilesManager from "./InformationFilesManager";
import PNGDrawsDataManager from "./PNGDrawsDataManager";
import CanvasDrawingMap from "../../CanvasDrawing/CanvasDrawingMap";

// MEJORAR

export default (root: string, folderSelected: string) => {
	PNGDrawsDataManager.configPath(root + `/pngdraws`);
	InformationFilesManager.configPath(root + `/data/${folderSelected}`);
	const dirs: string[] = AzgaarReaderData.getDirectories(root + `/AzgaarData/`);
	AzgaarReaderData.configPath(root + `/AzgaarData/`, folderSelected);
	console.log(dirs)
	CanvasDrawingMap.configPath(root + `/img/${folderSelected}`);
}