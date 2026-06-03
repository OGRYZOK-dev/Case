/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameItem, Case, RarityType } from './types';
import { REAL_API_SKINS } from './realSkins';

// Описание категорий предметов
export const CATEGORY_EMOJIS: Record<string, string> = {
  'Пистолеты': 'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/skins/weapon_usp_s_rust_coat.png',
  'Винтовки': 'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/skins/weapon_ak_47_frontside_mist.png',
  'Пистолеты-пулеметы': 'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/skins/weapon_mac_10_rust_coat.png',
  'Ножи (Экстра)': 'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/skins/knife_karambit_fade.png',
  'Перчатки (Экстра)': 'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/skins/glove_sporty_pandoras_box.png',
  'Особый дроп': 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=300&q=80',
};

// Редкость предметов
export const RARITY_DETAILS: Record<RarityType, { name: string; color: string; bgClass: string; chanceText: string }> = {
  common: {
    name: 'Ширпотреб (Common)',
    color: '#b0c3d9',
    bgClass: 'border-slate-500 shadow-slate-500/20 text-slate-300',
    chanceText: '70%',
  },
  rare: {
    name: 'Засекреченное (Rare)',
    color: '#4b69ff',
    bgClass: 'border-blue-500 shadow-blue-500/20 text-blue-300',
    chanceText: '20%',
  },
  epic: {
    name: 'Запрещенное (Epic)',
    color: '#8847ff',
    bgClass: 'border-purple-500 shadow-purple-500/20 text-purple-300',
    chanceText: '7.5%',
  },
  legendary: {
    name: 'Тайное (Legendary)',
    color: '#eb4b4b',
    bgClass: 'border-red-500 shadow-red-500/20 text-red-300',
    chanceText: '2%',
  },
  mythical: {
    name: 'Чрезвычайно редкое (Mythical)',
    color: '#e4ae39',
    bgClass: 'border-yellow-500 shadow-yellow-500/20 text-yellow-300 font-bold animate-pulse',
    chanceText: '0.5%',
  },
};

// Константы генерации
const WEAPONS_PISTOLS = ['USP-S', 'Glock-18', 'Desert Eagle', 'P250', 'Five-SeveN', 'CZ75-Auto', 'Dual Berettas'];
const WEAPONS_SMGS = ['MAC-10', 'MP9', 'P90', 'UMP-45', 'MP7', 'PP-Bizon'];
const WEAPONS_RIFLES = ['AK-47', 'AWP', 'M4A4', 'M4A1-S', 'SSG 08', 'SG 553', 'FAMAS', 'GALIL AR'];
const WEAPONS_KNIVES = ['Керамбит', 'Нож-бабочка', 'Штык-нож M9', 'Когтевой нож', 'Нож Скелет', 'Охотничий нож', 'Складной нож', 'Штык-нож'];
const WEAPONS_GLOVES = ['Спортивные перчатки', 'Мотоциклетные перчатки', 'Обмотки рук', 'Водительские перчатки', 'Перчатки спецназа'];

const SKINS_COMMON = ['Пыльник', 'Песчаная дюна', 'Гроза', 'Морской вяз', 'Африканская сетка', 'Поверхность', 'Степная пыль', 'Сажа', 'Пиксельный камуфляж', 'Арктика', 'Белое напыление', 'Урбан', 'Тайга'];
const SKINS_RARE = ['Азимов (Поношенное)', 'Красная линия', 'Орбита', 'Ночной кошмар', 'Ледяной уголь', 'Заговор', 'Вспышка', 'Рельсотрон', 'Световая рамка', 'Мятежник', 'Кровавая тина'];
const SKINS_EPIC = ['Азимов', 'Вулкан', 'Скоростной зверь', 'Неонуар', 'Защитник', 'Заговор (Чистый)', 'Император', 'Медуза (Поношенное)', 'Императрица', 'Хаос', 'Фронтсайд туман'];
const SKINS_LEGENDARY = ['Вой (Поношенное)', 'Поток информации', 'Королева пуль', 'Дикий зверь', 'Ликвидация', 'Поток воды', 'Золотая спираль', 'Градиент (Ширп)', 'Второй пилот', 'Хроматика'];
const SKINS_MYTHICAL_KNIVES = ['Градиент', 'Волны Рубин', 'Волны Сапфир', 'Изум Emerald', 'Легенды', 'Убийство', 'Кровавая паутина', 'Поверхностная закалка (Blue Gem)', 'Мраморный градиент', 'Дамасская сталь', 'Зуб тигра', 'Чистая ваниль'];
const SKINS_MYTHICAL_GLOVES = ['Изумрудный лабиринт', 'Мятная прохлада', 'Ящик Пандоры', 'Живая изгородь', 'Амфибия', 'Гремучая змея', 'Мраморный букет', 'Багряный узор'];

// Описание трансляций для получения реальных изображений с API
const WEAPON_ENG_MAP: Record<string, string> = {
  'USP-S': 'usp_s',
  'Glock-18': 'glock_18',
  'Desert Eagle': 'desert_eagle',
  'P250': 'p250',
  'Five-SeveN': 'five_seven',
  'CZ75-Auto': 'cz75_auto',
  'Dual Berettas': 'dual_berettas',
  'MAC-10': 'mac_10',
  'MP9': 'mp9',
  'P90': 'p90',
  'UMP-45': 'ump_45',
  'MP7': 'mp7',
  'PP-Bizon': 'pp_bizon',
  'AK-47': 'ak_47',
  'AWP': 'awp',
  'M4A4': 'm4a4',
  'M4A1-S': 'm4a1_s',
  'SSG 08': 'ssg_08',
  'SG 553': 'sg_553',
  'FAMAS': 'famas',
  'GALIL AR': 'galil_ar',
  'Керамбит': 'knife_karambit',
  'Нож-бабочка': 'knife_butterfly',
  'Штык-нож M9': 'knife_m9_bayonet',
  'Когтевой нож': 'knife_talon',
  'Нож Скелет': 'knife_skeleton',
  'Охотничий нож': 'knife_tactical',
  'Складной нож': 'knife_flip',
  'Штык-нож': 'knife_bayonet',
  'Спортивные перчатки': 'glove_sporty',
  'Мотоциклетные перчатки': 'glove_motorcycle',
  'Обмотки рук': 'glove_handwrap',
  'Водительские перчатки': 'glove_slick',
  'Перчатки спецназа': 'glove_specialist',
};

const SKIN_ENG_MAP: Record<string, string> = {
  'Пыльник': 'rust_coat',
  'Песчаная дюна': 'sand_dune',
  'Гроза': 'storm',
  'Морской вяз': 'blue_spruce',
  'Африканская сетка': 'safari_mesh',
  'Поверхность': 'groundwater',
  'Степная пыль': 'boreal_forest',
  'Сажа': 'scorched',
  'Пиксельный камуфляж': 'forest_ddpat',
  'Арктика': 'polar_mesh',
  'Белое напыление': 'whiteout',
  'Тайга': 'boreal_forest',
  'Урбан': 'urban_masked',
  'Азимов (Поношенное)': 'asiimov',
  'Красная линия': 'redline',
  'Орбита': 'orbit_mk01',
  'Ночной кошмар': 'nightmare',
  'Ледяной уголь': 'ice_coaled',
  'Заговор': 'conspiracy',
  'Вспышка': 'flashback',
  'Рельсотрон': 'railgun',
  'Световая рамка': 'light_rail',
  'Мятежник': 'wasteland_rebel',
  'Кровавая тина': 'crimson_web',
  'Азимов': 'asiimov',
  'Вулкан': 'vulcan',
  'Скоростной зверь': 'hyper_beast',
  'Неонуар': 'neo_noir',
  'Защитник': 'guardian',
  'Заговор (Чистый)': 'conspiracy',
  'Император': 'the_emperor',
  'Медуза (Поношенное)': 'medusa',
  'Императрица': 'the_empress',
  'Хаос': 'anarchy',
  'Фронтсайд туман': 'frontside_mist',
  'Вой (Поношенное)': 'howl',
  'Поток информации': 'printstream',
  'Королева пуль': 'bullet_queen',
  'Дикий зверь': 'wildfire',
  'Ликвидация': 'kill_confirmed',
  'Поток воды': 'water_elemental',
  'Золотая спираль': 'golden_coil',
  'Градиент (Ширп)': 'fade',
  'Второй пилот': 'copilot',
  'Хроматика': 'chromalizer',
  'Градиент': 'fade',
  'Волны Рубин': 'doppler_ruby',
  'Волны Сапфир': 'doppler_sapphire',
  'Изум Emerald': 'gamma_doppler_emerald',
  'Легенды': 'lore',
  'Убийство': 'slaughter',
  'Кровавая паутина': 'crimson_web',
  'Поверхностная закалка (Blue Gem)': 'case_hardened',
  'Мраморный градиент': 'marble_fade',
  'Дамасская сталь': 'damascus_steel',
  'Зуб тигра': 'tiger_tooth',
  'Чистая ваниль': 'vanilla',
  'Изумрудный лабиринт': 'emerald_web',
  'Мятная прохлада': 'cool_mint',
  'Ящик Пандоры': 'pandoras_box',
  'Живая изгородь': 'hedge_maze',
  'Амфибия': 'amphibious',
  'Гремучая змея': 'rattlesnake',
  'Мраморный букет': 'marble_fade',
  'Багряный узор': 'crimson_weave',
};

export function fixImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  let updated = url;
  if (updated.includes('bymykel.com/CSGO-API') || updated.includes('bymykel.github.io/CSGO-API')) {
    updated = updated
      .replace(/https:\/\/bymykel\.com\/CSGO-API/g, 'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public')
      .replace(/https:\/\/bymykel\.github\.io\/CSGO-API/g, 'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public');
  }
  // Safe migration for previously saved URLs that lacked public/
  if (updated.includes('cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/api/')) {
    updated = updated.replace(
      'cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/api/',
      'cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/'
    );
  }
  return updated;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  const currentSrc = target.src;
  
  if (target.getAttribute('data-err-step') === '2') {
    // Ultimate fallback if nothing works: CS-like abstract placeholder
    target.src = "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=300&q=80";
    return;
  }
  
  if (target.getAttribute('data-err-step') === '1') {
    target.setAttribute('data-err-step', '2');
    if (currentSrc.includes('cdn.jsdelivr.net')) {
      // Step 2 fallback: Raw GitHub User Content branch index
      target.src = currentSrc.replace('cdn.jsdelivr.net/gh/bymykel/CSGO-API@main', 'raw.githubusercontent.com/bymykel/CSGO-API/main');
    } else {
      target.src = "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=300&q=80";
    }
    return;
  }
  
  target.setAttribute('data-err-step', '1');
  if (currentSrc.includes('CSGO-API@main/api/')) {
    // Step 1: Inject /public/ folder name mapping in jsDelivr
    target.src = currentSrc.replace('CSGO-API@main/api/', 'CSGO-API@main/public/api/');
  } else if (currentSrc.includes('bymykel.com/CSGO-API/api/')) {
    target.src = currentSrc.replace('bymykel.com/CSGO-API/api/', 'cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/');
  } else if (currentSrc.includes('bymykel.github.io/CSGO-API/api/')) {
    target.src = currentSrc.replace('bymykel.github.io/CSGO-API/api/', 'cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/');
  } else {
    target.src = "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=300&q=80";
  }
}

export function getSkinImage(name: string): string {
  if (name.includes('Пачка рублей') || name.includes('я рублей')) {
    return 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('Кейс с наличными')) {
    return 'https://images.unsplash.com/photo-1549194388-f61be84a6e9e?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('литок золота') || name.includes('слиток золота')) {
    return 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('пиджак') || name.includes('Малиновый')) {
    return 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('Автограф Бустера') || name.includes('Автограф')) {
    return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('Клавиатура') || name.includes('RGB')) {
    return 'https://images.unsplash.com/photo-1618384887929-16ec33faf9c1?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('цепь') || name.includes('Платиновая')) {
    return 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=300&q=80';
  }

  const cleaned = name.replace('★ ', '').trim();
  const parts = cleaned.split('|');
  const weaponPart = parts[0]?.trim() || '';
  const skinPart = parts[1]?.trim() || '';

  const weapon_eng = WEAPON_ENG_MAP[weaponPart] || 'ak_47';
  const skin_eng = SKIN_ENG_MAP[skinPart] || 'rust_coat';

  let prefix = '';
  if (!weapon_eng.startsWith('knife_') && !weapon_eng.startsWith('glove_')) {
    prefix = 'weapon_';
  }

  return `https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/skins/${prefix}${weapon_eng}_${skin_eng}.png`;
}

// Рендерер картинок кейсов с официального репозитория
const CASE_IMAGE_MAP: string[] = [
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/cs20_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/spectrum_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/chroma_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/shattered_web_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/fracture_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/operation_wildfire_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/huntsman_weapon_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/glove_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/operation_hydra_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/recoil_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/shadow_case.png',
  'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/assets/images/crates/cases/clutch_case.png'
];

export function getCaseImage(itemIndex: number): string {
  const themeIndex = Math.min(
    Math.floor((itemIndex - 1) / 9),
    CASE_IMAGE_MAP.length - 1
  );
  return CASE_IMAGE_MAP[themeIndex] || CASE_IMAGE_MAP[0];
}

// Функция для генерации всех скинов (должно быть не менее 150)
export function generateAllItems(): GameItem[] {
  const items: GameItem[] = [];

  // Добавим особые денежные и мемные дропы
  const specialDrops: GameItem[] = [
    {
      id: 'spec_cash_1',
      name: 'Пачка рублей (1,000 ₽)',
      category: 'Особый дроп',
      rarity: 'rare',
      price: 1000,
      image: getSkinImage('Пачка рублей'),
      color: '#4b69ff',
      bgGradient: 'from-blue-900/30 to-slate-900',
      chanseWeight: 150,
    },
    {
      id: 'spec_cash_2',
      name: 'Кейс с наличными (10,000 ₽)',
      category: 'Особый дроп',
      rarity: 'epic',
      price: 10000,
      image: getSkinImage('Кейс с наличными'),
      color: '#8847ff',
      bgGradient: 'from-purple-900/30 to-slate-900',
      chanseWeight: 50,
    },
    {
      id: 'spec_cash_3',
      name: 'Чистый слиток золота (150,000 ₽)',
      category: 'Особый дроп',
      rarity: 'mythical',
      price: 150000,
      image: getSkinImage('Чистый слиток золота'),
      color: '#e4ae39',
      bgGradient: 'from-yellow-900/40 via-slate-900 to-amber-950/70',
      chanseWeight: 2,
    },
    {
      id: 'spec_meme_bj',
      name: 'Малиновый пиджак Депутата',
      category: 'Особый дроп',
      rarity: 'legendary',
      price: 45000,
      image: getSkinImage('Малиновый пиджак'),
      color: '#eb4b4b',
      bgGradient: 'from-rose-950/40 via-slate-900 to-slate-950',
      chanseWeight: 10,
    },
    {
      id: 'spec_meme_buster',
      name: 'Лимитированный Автограф Бустера',
      category: 'Особый дроп',
      rarity: 'epic',
      price: 8500,
      image: getSkinImage('Автограф Бустера'),
      color: '#8847ff',
      bgGradient: 'from-purple-900/30 to-slate-900',
      chanseWeight: 40,
    },
    {
      id: 'spec_meme_kb',
      name: 'Игровая RGB Клавиатура 80%',
      category: 'Особый дроп',
      rarity: 'rare',
      price: 3200,
      image: getSkinImage('RGB Клавиатура'),
      color: '#4b69ff',
      bgGradient: 'from-blue-900/30 to-slate-900',
      chanseWeight: 100,
    },
    {
      id: 'spec_meme_chain',
      name: 'Платиновая цепь 1.5 кг',
      category: 'Особый дроп',
      rarity: 'legendary',
      price: 95000,
      image: getSkinImage('Платиновая цепь'),
      color: '#eb4b4b',
      bgGradient: 'from-pink-900/40 via-slate-900 to-slate-950',
      chanseWeight: 12,
    },
  ];

  specialDrops.forEach(d => items.push(d));

  // Добавим все реальные скины, скомпилированные из официального ByMykel CSGO-API
  REAL_API_SKINS.forEach(sk => {
    items.push(sk);
  });

  return items;
}

// Порождаем единый тяжелый кэшированный массив скинов
export const ALL_ITEMS = generateAllItems();

// Названия кейсов для генерации 100 уникальных кейсов
const CASE_THEMES = [
  { theme: 'Армейский кейс', priceBase: 60, icon: '📦', minRarity: 'common', maxRarity: 'epic' },
  { theme: 'Спектр', priceBase: 150, icon: '🎨', minRarity: 'common', maxRarity: 'legendary' },
  { theme: 'Хромированный', priceBase: 350, icon: '⛓️', minRarity: 'common', maxRarity: 'legendary' },
  { theme: 'Дикая Роза', priceBase: 700, icon: '🌹', minRarity: 'rare', maxRarity: 'legendary' },
  { theme: 'Ретро Сити', priceBase: 1200, icon: '🌆', minRarity: 'rare', maxRarity: 'legendary' },
  { theme: 'Кейс Блоггера', priceBase: 2500, icon: '📱', minRarity: 'rare', maxRarity: 'mythical' },
  { theme: 'Дикий Волк', priceBase: 5000, icon: '🐺', minRarity: 'epic', maxRarity: 'mythical' },
  { theme: 'Перчаточный Сейф', priceBase: 12000, icon: '🧤', minRarity: 'epic', maxRarity: 'mythical' },
  { theme: 'Мечта Коллекционера', priceBase: 28000, icon: '🏆', minRarity: 'epic', maxRarity: 'mythical' },
  { theme: 'Красная Лихорадка', priceBase: 55000, icon: '🛑', minRarity: 'legendary', maxRarity: 'mythical' },
  { theme: 'Теневой Лорд', priceBase: 90000, icon: '🕶️', minRarity: 'legendary', maxRarity: 'mythical' },
  { theme: 'Космический Нож', priceBase: 180000, icon: '🪐', minRarity: 'mythical', maxRarity: 'mythical' },
];

/**
 * Генерирует ровно 100 уникальных кейсов с постепенным увеличением цены и ценности содержимого.
 */
export function generate100Cases(): Case[] {
  const cases: Case[] = [];
  const totalCasesToGenerate = 100;

  for (let i = 1; i <= totalCasesToGenerate; i++) {
    // Выбираем тему на базе индекса, чтобы шло плавное нарастание цены
    // От 1 до 100 цена плавно ползет вверх
    const themeIndex = Math.min(
      Math.floor((i - 1) / 9), // Плавный сдвиг каждые 9 кейсов
      CASE_THEMES.length - 1
    );

    const theme = CASE_THEMES[themeIndex];
    
    // Вычисляем цену с небольшими шажками и случайной добавкой
    // Кейс №1 ~50 руб, Кейс №100 ~250.000 руб
    const scaleFactor = Math.pow(1.09, i); // Экспоненциальный рост
    const computedPrice = Math.round(theme.priceBase * scaleFactor * (0.85 + Math.random() * 0.3) / 2);
    const finalPrice = Math.max(10, computedPrice < 1000 ? Math.round(computedPrice / 10) * 10 : Math.round(computedPrice / 100) * 100);

    // Определяем редкость кейса по его цене
    let caseRarity: RarityType = 'common';
    let category = 'Бюджетный';
    if (finalPrice >= 50000) {
      caseRarity = 'mythical';
      category = 'Королевский';
    } else if (finalPrice >= 15000) {
      caseRarity = 'legendary';
      category = 'Элитный';
    } else if (finalPrice >= 3500) {
      caseRarity = 'epic';
      category = 'Особый';
    } else if (finalPrice >= 600) {
      caseRarity = 'rare';
      category = 'Средний';
    }

    // Собираем отфильтрованный пул предметов для этого конкретного кейса по редкостям
    // Более дорогие кейсы имеют более крутой пул предметов
    let eligibleItems = ALL_ITEMS;

    // В дорогих кейсах (например, Космический Нож или Перчаточный) отфильтруем только перчатки или только ножи,
    // либо полностью уберем дешевку (common), чтобы оправдать цену!
    if (theme.theme === 'Космический Нож' || finalPrice > 120000) {
      eligibleItems = ALL_ITEMS.filter(item => item.category === 'Ножи (Экстра)' || item.rarity === 'mythical');
    } else if (theme.theme === 'Перчаточный Сейф' || (finalPrice > 50000 && finalPrice <= 120000)) {
      eligibleItems = ALL_ITEMS.filter(item => item.category === 'Перчатки (Экстра)' || item.rarity === 'mythical' || item.rarity === 'legendary');
    } else if (finalPrice >= 15000) {
      // Исключаем common и rare, оставляем Epic+
      eligibleItems = ALL_ITEMS.filter(item => item.rarity === 'epic' || item.rarity === 'legendary' || item.rarity === 'mythical');
    } else if (finalPrice >= 3000) {
      // Исключаем common
      eligibleItems = ALL_ITEMS.filter(item => item.rarity !== 'common');
    } else {
      // Бюджетные кейсы: урезаем шанс супер-выпадений в 3 раза, чтобы они не падали на первом клике слишком легко,
      // либо оставляем весь пул, но вес у mythic снижаем
      eligibleItems = ALL_ITEMS;
    }

    // Берем до 15 случайных уникальных ID предметов для отображения в качестве "содержимого" кейса
    // С обязательным включением лучшего предмета
    const poolIds = eligibleItems.map(item => item.id);
    const sortedByPrice = [...eligibleItems].sort((a,b) => b.price - a.price);
    const topDrop = sortedByPrice[0] ? sortedByPrice[0].id : poolIds[0];

    const displayIdsSet = new Set<string>();
    displayIdsSet.add(topDrop);
    while (displayIdsSet.size < Math.min(12, poolIds.length)) {
      displayIdsSet.add(poolIds[Math.floor(Math.random() * poolIds.length)]);
    }

    cases.push({
      id: i,
      name: `${theme.theme} Case #${i}`,
      price: finalPrice,
      rarity: caseRarity,
      image: getCaseImage(i),
      category: category,
      desc: `Отличный кейс уровня '${category}'. Содержит уникальное тайное и экстра-оружие!`,
      itemPool: Array.from(displayIdsSet),
    });
  }

  return cases;
}

export const ALL_CASES = generate100Cases();

/**
 * Выполняет взвешенный выбор случайного предмета для кейса.
 * Реализует реалистичную систему: чем дороже кейс, тем выше вероятность дорогого дропа!
 */
export function drawItemFromCase(c: Case): GameItem {
  // Нам нужно определить доступный пул предметов для розыгрыша
  let pool = ALL_ITEMS;

  // Ограничения по цене кейса
  if (c.price >= 120000) {
    // Только ножи и перчатки самого высшего класса
    pool = ALL_ITEMS.filter(item => item.category === 'Ножи (Экстра)' || item.category === 'Перчатки (Экстра)' || item.rarity === 'mythical');
  } else if (c.price >= 40000) {
    // Оставляем только эпические, легендарные и мифические
    pool = ALL_ITEMS.filter(item => item.rarity === 'epic' || item.rarity === 'legendary' || item.rarity === 'mythical');
  } else if (c.price >= 8000) {
    // Убираем ширпотреб полностью
    pool = ALL_ITEMS.filter(item => item.rarity !== 'common');
  }

  // Накладываем веса
  // Но! Дополнительно модифицируем веса в зависимости от цены кейса.
  // Снижаем коэффициенты и шансы, чтобы окупаемость была ниже (сложнее окупиться) по просьбе пользователя.
  const priceBonusFactor = Math.min(1.6, 1 + c.price / 30000); // До x1.6 вместо х4.5

  const totalWeight = pool.reduce((sum, item) => {
    let weight = item.chanseWeight;
    if (item.rarity === 'mythical') {
      weight = weight * priceBonusFactor * 0.55; // Уменьшен базовый шанс экстра дропов на 45%
    } else if (item.rarity === 'legendary') {
      weight = weight * (1 + priceBonusFactor * 0.25) * 0.7; // Уменьшен шанс тайных на 30%
    }
    return sum + weight;
  }, 0);

  let randomPoint = Math.random() * totalWeight;

  for (const item of pool) {
    let itemWeight = item.chanseWeight;
    if (item.rarity === 'mythical') {
      itemWeight = itemWeight * priceBonusFactor * 0.55;
    } else if (item.rarity === 'legendary') {
      itemWeight = itemWeight * (1 + priceBonusFactor * 0.25) * 0.7;
    }

    if (randomPoint < itemWeight) {
      return item;
    }
    randomPoint -= itemWeight;
  }

  // Фолбэк на последний предмет в пуле
  return pool[pool.length - 1];
}

/**
 * Синтез звуков в браузере с использованием Web Audio API без внешних файлов!
 */
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    // Поддержка кросс-браузерности
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

export const soundManager = {
  muted: false,

  playClick() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // Игнорируем ошибки неподдерживаемого аудио-контекста
    }
  },

  playTick() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.02);
      
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch (e) {}
  },

  playWin() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const now = ctx.currentTime;
      const playTone = (freq: number, start: number, duration: number, type: 'sine'|'sawtooth' = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      // Мажорный аккорд фанфар
      playTone(261.63, now, 0.15); // C4
      playTone(329.63, now + 0.12, 0.15); // E4
      playTone(392.00, now + 0.24, 0.15); // G4
      playTone(523.25, now + 0.36, 0.5, 'sine'); // C5 торжественный
    } catch (e) {}
  },

  playJackpot() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const now = ctx.currentTime;
      // Восходящая палитра
      for (let i = 0; i < 8; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150 + i * 110, now + i * 0.08);
        
        gain.gain.setValueAtTime(0.04, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      }
    } catch (e) {}
  }
};
