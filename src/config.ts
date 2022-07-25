import AzgaarReaderData from "./AzgaarData/AzgaarReaderData";
import DataInformationFilesManager from "./DataInformationLoadAndSave";
import DrawerMap from "./Drawer/DrawerMap";
import PNGDrawsDataManager from "./PNGDrawsDataManager";

// MEJORAR

export default (folderSelected: string) => {
	PNGDrawsDataManager.configPath(__dirname + `/../pngdraws`);
	DataInformationFilesManager.configPath(__dirname + `/../data/${folderSelected}`);
	AzgaarReaderData.configPath(__dirname + `/../AzgaarData/${folderSelected}`);
	DrawerMap.configPath(__dirname + `/../img/${folderSelected}`);
}