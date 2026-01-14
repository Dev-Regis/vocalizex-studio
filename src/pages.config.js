import ImageChat from './pages/ImageChat';
import Mp3Extractor from './pages/Mp3Extractor';
import BatchImages from './pages/BatchImages';
import LyricsImage from './pages/LyricsImage';


export const PAGES = {
    "ImageChat": ImageChat,
    "Mp3Extractor": Mp3Extractor,
    "BatchImages": BatchImages,
    "LyricsImage": LyricsImage,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};