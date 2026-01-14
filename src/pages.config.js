import BatchImages from './pages/BatchImages';
import Home from './pages/Home';
import ImageChat from './pages/ImageChat';
import LyricsImage from './pages/LyricsImage';
import Mp3Extractor from './pages/Mp3Extractor';


export const PAGES = {
    "BatchImages": BatchImages,
    "Home": Home,
    "ImageChat": ImageChat,
    "LyricsImage": LyricsImage,
    "Mp3Extractor": Mp3Extractor,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};