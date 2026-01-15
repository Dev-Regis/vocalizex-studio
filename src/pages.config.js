import BatchImages from './pages/BatchImages';
import ImageChat from './pages/ImageChat';
import ImageCreator from './pages/ImageCreator';
import LyricsImage from './pages/LyricsImage';
import LyricGenerator from './pages/LyricGenerator';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';


export const PAGES = {
    "BatchImages": BatchImages,
    "ImageChat": ImageChat,
    "ImageCreator": ImageCreator,
    "LyricsImage": LyricsImage,
    "LyricGenerator": LyricGenerator,
    "Home": Home,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};