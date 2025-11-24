/**
 * Icons - Centralized icon exports using Remixicon
 *
 * Mapeo de iconos para mantener consistencia y facilitar migraciones futuras.
 * Todos los componentes deben importar iconos desde este archivo.
 *
 * Uso: import { IconGift, IconUsers } from '../lib/icons';
 */

// Remixicon imports
import {
  RiGiftLine,
  RiGift2Line,
  RiGroupLine,
  RiUserLine,
  RiUserAddLine,
  RiUserUnfollowLine,
  RiCalendarLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiPlayCircleLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiAddLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiSaveLine,
  RiUploadLine,
  RiRefreshLine,
  RiLoader4Line,
  RiAlertLine,
  RiErrorWarningLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiExternalLinkLine,
  RiLink,
  RiArrowDownSLine,
  RiLoginBoxLine,
  RiLogoutBoxLine,
  RiSettings4Line,
  RiSunLine,
  RiMoonLine,
  RiForbidLine,
  RiShieldLine,
  RiLockLine,
  RiGithubLine,
  RiLinkedinLine,
  RiWhatsappLine,
  RiQrCodeLine,
  RiListCheck2,
  RiSparklingLine,
  RiCake2Line,
  RiHomeLine,
  RiVipCrownLine,
} from '@remixicon/react';

// Re-exports con nombres más simples y consistentes
// Navigation
export const IconHome = RiHomeLine;
export const IconArrowLeft = RiArrowLeftLine;
export const IconArrowRight = RiArrowRightLine;
export const IconExternalLink = RiExternalLinkLine;
export const IconLink = RiLink;
export const IconChevronDown = RiArrowDownSLine;

// Actions
export const IconPlus = RiAddLine;
export const IconClose = RiCloseLine;
export const IconCheck = RiCheckLine;
export const IconDelete = RiDeleteBinLine;
export const IconCopy = RiFileCopyLine;
export const IconSave = RiSaveLine;
export const IconUpload = RiUploadLine;
export const IconRefresh = RiRefreshLine;
export const IconPlay = RiPlayCircleLine;
export const IconLogin = RiLoginBoxLine;
export const IconLogout = RiLogoutBoxLine;
export const IconSettings = RiSettings4Line;

// States
export const IconLoader = RiLoader4Line;
export const IconAlert = RiErrorWarningLine;
export const IconWarning = RiAlertLine;
export const IconSuccess = RiCheckboxCircleLine;

// Entities
export const IconGift = RiGiftLine;
export const IconGiftAlt = RiGift2Line;
export const IconUsers = RiGroupLine;
export const IconUser = RiUserLine;
export const IconUserAdd = RiUserAddLine;
export const IconUserRemove = RiUserUnfollowLine;
export const IconCrown = RiVipCrownLine;

// Content
export const IconCalendar = RiCalendarLine;
export const IconClock = RiTimeLine;
export const IconMoney = RiMoneyDollarCircleLine;
export const IconList = RiListCheck2;

// Social
export const IconGithub = RiGithubLine;
export const IconLinkedin = RiLinkedinLine;
export const IconWhatsapp = RiWhatsappLine;
export const IconQrCode = RiQrCodeLine;

// Functional
export const IconBan = RiForbidLine;
export const IconShield = RiShieldLine;
export const IconLock = RiLockLine;
export const IconSun = RiSunLine;
export const IconMoon = RiMoonLine;

// Celebration
export const IconSparkles = RiSparklingLine;
export const IconParty = RiCake2Line;
