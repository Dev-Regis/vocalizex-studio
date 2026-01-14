import BatchImages from './pages/BatchImages';
import Home from './pages/Home';
import ImageChat from './pages/ImageChat';
import LyricsImage from './pages/LyricsImage';


export const PAGES = {
    "BatchImages": BatchImages,
    "Home": Home,
    "ImageChat": ImageChat,
    "LyricsImage": LyricsImage,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};