import { StudyFile } from "@/types/study-file.type";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { Platform } from "react-native";
import uuid from "react-native-uuid";
import { fileViewerService } from "./fileViewer.service";
import { localFileService } from "./localFile.service";
import { metadataService } from "./metadata.service";

interface PdfExportOptions {
    html: string;
    fileName: string;
    addedByRole: StudyFile["addedByRole"];
    tags: string[];
    subjectId?: string;
    classId?: string;
    autoShare?: boolean;
}

interface PdfExportResult {
    file: StudyFile;
    absolutePath: string;
}

const downloadOnWeb = (base64: string, fileName: string) => {
    if (typeof window === "undefined") return;
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters).map((char) => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    window.URL.revokeObjectURL(url);
};

export const pdfService = {
    async exportAndSave(options: PdfExportOptions): Promise<PdfExportResult> {
        const { html, fileName, addedByRole, tags, subjectId, classId, autoShare = true } = options;

        await localFileService.ensureDirectory();

        const printResult = await Print.printToFileAsync({ html, base64: true });
        let sourceUri = printResult.uri;

        if ((Platform.OS === "web" || !sourceUri) && printResult.base64) {
            const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
            if (!baseDir) {
                throw new Error("No writable directory available for PDF export.");
            }
            const tempUri = `${baseDir}${Date.now()}_${fileName}`;
            await FileSystem.writeAsStringAsync(tempUri, printResult.base64, {
                encoding: FileSystem.EncodingType.Base64,
            });
            sourceUri = tempUri;
        }

        if (!sourceUri) {
            throw new Error("Failed to generate PDF.");
        }

        const localPath = await localFileService.saveFile(sourceUri, fileName);
        const absolutePath = localFileService.getAbsolutePath(localPath);
        const info = await FileSystem.getInfoAsync(absolutePath);

        const newFile: StudyFile = {
            id: uuid.v4() as string,
            fileName,
            fileType: "application/pdf",
            localPath,
            fileSize: info.size || 0,
            addedByRole,
            addedAt: new Date().toISOString(),
            tags,
            subjectId,
            classId,
        };

        await metadataService.addFile(newFile);

        if (Platform.OS === "web") {
            if (printResult.base64) {
                downloadOnWeb(printResult.base64, fileName);
            }
        } else if (autoShare) {
            await fileViewerService.shareFile(absolutePath);
        }

        return { file: newFile, absolutePath };
    },
};
