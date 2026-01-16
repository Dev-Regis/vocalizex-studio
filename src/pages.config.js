import BatchImages from './pages/BatchImages';
import Challenges from './pages/Challenges';
import Collections from './pages/Collections';
import CreationHistory from './pages/CreationHistory';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ImageAnalyzer from './pages/ImageAnalyzer';
import ImageChat from './pages/ImageChat';
import ImageCreator from './pages/ImageCreator';
import ImageEditor from './pages/ImageEditor';
import ImageRemix from './pages/ImageRemix';
import LyricGenerator from './pages/LyricGenerator';
import LyricsImage from './pages/LyricsImage';
import PromptTranslator from './pages/PromptTranslator';
import PublicFeed from './pages/PublicFeed';
import TemplateGallery from './pages/TemplateGallery';
import VideoClipForm from './pages/VideoClipForm';
import VideoClipPreview from './pages/VideoClipPreview';
import VoiceToText from './pages/VoiceToText';
import ImageUpscaler from './pages/ImageUpscaler';
import ImageInpainting from './pages/ImageInpainting';
import ImageBlender from './pages/ImageBlender';


export const PAGES = {
    "BatchImages": BatchImages,
    "Challenges": Challenges,
    "Collections": Collections,
    "CreationHistory": CreationHistory,
    "Dashboard": Dashboard,
    "Home": Home,
    "ImageAnalyzer": ImageAnalyzer,
    "ImageChat": ImageChat,
    "ImageCreator": ImageCreator,
    "ImageEditor": ImageEditor,
    "ImageRemix": ImageRemix,
    "LyricGenerator": LyricGenerator,
    "LyricsImage": LyricsImage,
    "PromptTranslator": PromptTranslator,
    "PublicFeed": PublicFeed,
    "TemplateGallery": TemplateGallery,
    "VideoClipForm": VideoClipForm,
    "VideoClipPreview": VideoClipPreview,
    "VoiceToText": VoiceToText,
    "ImageUpscaler": ImageUpscaler,
    "ImageInpainting": ImageInpainting,
    "ImageBlender": ImageBlender,
}

export const pagesConfig = {
    mainPage: "ImageChat",
    Pages: PAGES,
};