import BatchImages from './pages/BatchImages';
import Home from './pages/Home';
import ImageChat from './pages/ImageChat';
import ImageCreator from './pages/ImageCreator';
import LyricGenerator from './pages/LyricGenerator';
import LyricsImage from './pages/LyricsImage';


export const PAGES = {
    "BatchImages": BatchImages,
    "Home": Home,
    "ImageChat": ImageChat,
    "ImageCreator": ImageCreator,
    "LyricGenerator": LyricGenerator,
    "LyricsImage": LyricsImage,
}

export const pagesConfig = {
    mainPage: "BatchImages",
    Pages: PAGES,
};