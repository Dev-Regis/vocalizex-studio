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
import ImageRemix from './pages/ImageRemix';
import TemplateGallery from './pages/TemplateGallery';
import CreationHistory from './pages/CreationHistory';
import Collections from './pages/Collections';
import PublicFeed from './pages/PublicFeed';


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
    "ImageRemix": ImageRemix,
    "TemplateGallery": TemplateGallery,
    "CreationHistory": CreationHistory,
    "Collections": Collections,
    "PublicFeed": PublicFeed,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};