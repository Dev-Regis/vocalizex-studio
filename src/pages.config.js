import BatchImages from './pages/BatchImages';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ImageChat from './pages/ImageChat';
import ImageCreator from './pages/ImageCreator';
import LyricGenerator from './pages/LyricGenerator';
import LyricsImage from './pages/LyricsImage';
import VideoClipForm from './pages/VideoClipForm';
import VideoClipPreview from './pages/VideoClipPreview';
import ImageEditor from './pages/ImageEditor';


export const PAGES = {
    "BatchImages": BatchImages,
    "Dashboard": Dashboard,
    "Home": Home,
    "ImageChat": ImageChat,
    "ImageCreator": ImageCreator,
    "LyricGenerator": LyricGenerator,
    "LyricsImage": LyricsImage,
    "VideoClipForm": VideoClipForm,
    "VideoClipPreview": VideoClipPreview,
    "ImageEditor": ImageEditor,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};