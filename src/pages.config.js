import BatchImages from './pages/BatchImages';
import Home from './pages/Home';
import ImageChat from './pages/ImageChat';
import ImageCreator from './pages/ImageCreator';
import LyricGenerator from './pages/LyricGenerator';
import LyricsImage from './pages/LyricsImage';
import GerarLetras from './pages/GerarLetras';
import Dashboard from './pages/Dashboard';


export const PAGES = {
    "BatchImages": BatchImages,
    "Home": Home,
    "ImageChat": ImageChat,
    "ImageCreator": ImageCreator,
    "LyricGenerator": LyricGenerator,
    "LyricsImage": LyricsImage,
    "GerarLetras": GerarLetras,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "BatchImages",
    Pages: PAGES,
};