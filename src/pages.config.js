import BatchImages from './pages/BatchImages';
import Dashboard from './pages/Dashboard';
import ImageAnalyzer from './pages/ImageAnalyzer';
import ImageBlender from './pages/ImageBlender';
import ImageChat from './pages/ImageChat';
import ImageCreator from './pages/ImageCreator';
import ImageEditor from './pages/ImageEditor';
import ImageInpainting from './pages/ImageInpainting';
import ImageRemix from './pages/ImageRemix';
import ImageUpscaler from './pages/ImageUpscaler';
import LyricGenerator from './pages/LyricGenerator';
import LyricsImage from './pages/LyricsImage';
import PromptTranslator from './pages/PromptTranslator';
import VideoClipForm from './pages/VideoClipForm';
import VideoClipPreview from './pages/VideoClipPreview';
import VoiceToText from './pages/VoiceToText';
import Home from './pages/Home';


export const PAGES = {
    "BatchImages": BatchImages,
    "Dashboard": Dashboard,
    "ImageAnalyzer": ImageAnalyzer,
    "ImageBlender": ImageBlender,
    "ImageChat": ImageChat,
    "ImageCreator": ImageCreator,
    "ImageEditor": ImageEditor,
    "ImageInpainting": ImageInpainting,
    "ImageRemix": ImageRemix,
    "ImageUpscaler": ImageUpscaler,
    "LyricGenerator": LyricGenerator,
    "LyricsImage": LyricsImage,
    "PromptTranslator": PromptTranslator,
    "VideoClipForm": VideoClipForm,
    "VideoClipPreview": VideoClipPreview,
    "VoiceToText": VoiceToText,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};