import BatchImages from './pages/BatchImages';
import ImageChat from './pages/ImageChat';
import ImageCreator from './pages/ImageCreator';
import LyricGenerator from './pages/LyricGenerator';
import LyricsImage from './pages/LyricsImage';
import Home from './pages/Home';


export const PAGES = {
    "BatchImages": BatchImages,
    "ImageChat": ImageChat,
    "ImageCreator": ImageCreator,
    "LyricGenerator": LyricGenerator,
    "LyricsImage": LyricsImage,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};