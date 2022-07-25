import AzgaarReaderData from "./AzgaarData/AzgaarReaderData";
import InformationFilesManager from "./DataInformationLoadAndSave";
import DrawerMap from "./Drawer/DrawerMap";
import PNGDrawsDataManager from "./PNGDrawsDataManager";

// MEJORAR

export default (folderSelected: string) => {
	PNGDrawsDataManager.configPath(__dirname + `/../pngdraws`);
	InformationFilesManager.configPath(__dirname + `/../data/${folderSelected}`);
	AzgaarReaderData.configPath(__dirname + `/../AzgaarData/${folderSelected}`);
	DrawerMap.configPath(__dirname + `/../img/${folderSelected}`);
}