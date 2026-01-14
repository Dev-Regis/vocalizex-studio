import BatchImages from './pages/BatchImages';
import Home from './pages/Home';
import ImageChat from './pages/ImageChat';
import LyricsImage from './pages/LyricsImage';
import ImageCreator from './pages/ImageCreator';
import LyricGenerator from './pages/LyricGenerator';


export const PAGES = {
    "BatchImages": BatchImages,
    "Home": Home,
    "ImageChat": ImageChat,
    "LyricsImage": LyricsImage,
    "ImageCreator": ImageCreator,
    "LyricGenerator": LyricGenerator,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};