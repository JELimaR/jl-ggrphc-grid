import AzgaarReaderData from "./DataFileLoadAndSave/AzgaarReaderData";
import InformationFilesManager from "./DataFileLoadAndSave/InformationFilesManager";
import PNGDrawsDataManager from "./DataFileLoadAndSave/PNGDrawsDataManager";
import CanvasDrawingMap from "./DrawingServer/CanvasDrawingMap";


// MEJORAR

export default (folderSelected: string) => {
	PNGDrawsDataManager.configPath(__dirname + `/../pngdraws`);
	InformationFilesManager.configPath(__dirname + `/../data/${folderSelected}`);
	AzgaarReaderData.configPath(__dirname + `/../AzgaarData/${folderSelected}`);
	const dirs: string[] = AzgaarReaderData.getDirectories(__dirname + `/../AzgaarData/`)
	console.log(dirs)
	CanvasDrawingMap.configPath(__dirname + `/../img/${folderSelected}`);
}