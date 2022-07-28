import AzgaarReaderData from "./DataFileLoadAndSave/AzgaarReaderData";
import InformationFilesManager from "./DataFileLoadAndSave/InformationFilesManager";
import PNGDrawsDataManager from "./DataFileLoadAndSave/PNGDrawsDataManager";
import DrawerMap from "./Drawer/DrawerMap";

// MEJORAR

export default (folderSelected: string) => {
	PNGDrawsDataManager.configPath(__dirname + `/../pngdraws`);
	InformationFilesManager.configPath(__dirname + `/../data/${folderSelected}`);
	AzgaarReaderData.configPath(__dirname + `/../AzgaarData/${folderSelected}`);
	DrawerMap.configPath(__dirname + `/../img/${folderSelected}`);
}