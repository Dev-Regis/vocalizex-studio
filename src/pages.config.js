import BatchImages from './pages/BatchImages';
import ImageChat from './pages/ImageChat';
import LyricsImage from './pages/LyricsImage';
import Mp3Extractor from './pages/Mp3Extractor';


export const PAGES = {
    "BatchImages": BatchImages,
    "ImageChat": ImageChat,
    "LyricsImage": LyricsImage,
    "Mp3Extractor": Mp3Extractor,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};