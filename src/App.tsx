/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Coins, 
  Briefcase, 
  Sparkles, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Search, 
  TrendingUp, 
  ShoppingBag, 
  Download, 
  MousePointerClick, 
  RotateCcw, 
  Check, 
  SlidersHorizontal,
  DollarSign,
  AlertCircle,
  Cpu,
  Package,
  Plus,
  FileText,
  Gamepad
} from 'lucide-react';
import { RarityType, GameItem, Case, InventoryItem, GameUpgrade, GameStats } from './types';
import { ALL_CASES, ALL_ITEMS, drawItemFromCase, soundManager, RARITY_DETAILS, CATEGORY_EMOJIS, fixImageUrl, handleImageError } from './gameData';

export default function App() {
  const getCaseCategoryStyles = (category: string) => {
    switch (category) {
      case 'Бюджетный':
        return { 
          gradient: 'from-slate-500/10 to-slate-500/0', 
          iconColor: 'text-slate-400',
          glow: 'rgba(148,163,184,0.12)',
          badge: 'text-slate-400 border-slate-800 bg-slate-950/40',
          border: 'hover:border-slate-500/30 hover:shadow-[0_4px_25px_rgba(148,163,184,0.12)]'
        };
      case 'Средний':
        return { 
          gradient: 'from-violet-500/10 to-violet-500/0', 
          iconColor: 'text-violet-400',
          glow: 'rgba(139,92,246,0.12)',
          badge: 'text-violet-400 border-violet-900 bg-violet-950/40',
          border: 'hover:border-violet-500/30 hover:shadow-[0_4px_25px_rgba(139,92,246,0.12)]'
        };
      case 'Особый':
        return { 
          gradient: 'from-pink-500/10 to-pink-500/0', 
          iconColor: 'text-pink-400',
          glow: 'rgba(236,72,153,0.12)',
          badge: 'text-pink-400 border-pink-900 bg-pink-950/40',
          border: 'hover:border-pink-500/30 hover:shadow-[0_4px_25px_rgba(236,72,153,0.12)]'
        };
      case 'Элитный':
        return { 
          gradient: 'from-rose-500/10 to-rose-500/0', 
          iconColor: 'text-rose-500',
          glow: 'rgba(244,63,94,0.12)',
          badge: 'text-rose-400 border-rose-900 bg-rose-950/40',
          border: 'hover:border-rose-500/30 hover:shadow-[0_4px_25px_rgba(244,63,94,0.12)]'
        };
      case 'Королевский':
        return { 
          gradient: 'from-amber-500/10 to-amber-500/0', 
          iconColor: 'text-amber-400',
          glow: 'rgba(245,158,11,0.12)',
          badge: 'text-amber-400 border-amber-900 bg-amber-950/40',
          border: 'hover:border-amber-500/30 hover:shadow-[0_4px_25px_rgba(245,158,11,0.12)]'
        };
      default:
        return { 
          gradient: 'from-pink-500/10 to-pink-500/0', 
          iconColor: 'text-pink-400',
          glow: 'rgba(236,72,153,0.12)',
          badge: 'text-pink-400 border-pink-900 bg-pink-950/40',
          border: 'hover:border-pink-500/30 hover:shadow-[0_4px_25px_rgba(236,72,153,0.12)]'
        };
    }
  };

  // --- Состояния игры ---
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('casino_clicker_balance');
    return saved ? Number(saved) : 1000; // Стартовый баланс 1000 ₽
  });

  const [activeTab, setActiveTab] = useState<'clicker' | 'cases' | 'inventory' | 'shop' | 'contracts'>('cases');

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('casino_clicker_inventory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            ...item,
            image: fixImageUrl(item.image)
          }));
        }
      } catch (e) {}
    }
    return [];
  });

  // --- Состояния игры Сапёр (Mines) ---
  const [minesBet, setMinesBet] = useState<number>(100);
  const [minesCount, setMinesCount] = useState<number>(3); // от 1 до 24 мин
  const [minesGameActive, setMinesGameActive] = useState<boolean>(false);
  const [minesGrid, setMinesGrid] = useState<Array<{ id: number; isOpen: boolean; isMine: boolean }>>([]);
  const [minesSuccessfulClicks, setMinesSuccessfulClicks] = useState<number>(0);
  const [minesGameOver, setMinesGameOver] = useState<boolean>(false);
  const [minesGameWon, setMinesGameWon] = useState<boolean>(false);
  const [minesSecretMines, setMinesSecretMines] = useState<number[]>([]);

  // --- Состояния Коинфлипа (Coinflip) ---
  const [coinflipBet, setCoinflipBet] = useState<number>(100);
  const [coinflipSelectedSide, setCoinflipSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [coinflipIsSpinning, setCoinflipIsSpinning] = useState<boolean>(false);
  const [coinflipResult, setCoinflipResult] = useState<'heads' | 'tails' | null>(null);
  const [coinflipStatusText, setCoinflipStatusText] = useState<string>('');

  // --- Активная мини-игра внутри вкладки ---
  const [activeMiniGame, setActiveMiniGame] = useState<'mines' | 'coinflip'>('mines');

  // --- Состояния для новой анимации мульти-крутки (20 полосок) ---
  const [isMultiTrackSpinning, setIsMultiTrackSpinning] = useState<boolean>(false);
  const [multiSpinningTracks, setMultiSpinningTracks] = useState<Array<{
    id: number;
    tape: GameItem[];
    winningItem: GameItem;
    spinOffset: number;
  }>>([]);

  const [clickLvl, setClickLvl] = useState<number>(() => {
    const saved = localStorage.getItem('casino_clicker_click_lvl');
    return saved ? Number(saved) : 1;
  });

  const [autoclickLvl, setAutoclickLvl] = useState<number>(() => {
    const saved = localStorage.getItem('casino_clicker_auto_lvl');
    return saved ? Number(saved) : 0;
  });

  const [luckyLvl, setLuckyLvl] = useState<number>(() => {
    const saved = localStorage.getItem('casino_clicker_lucky_lvl');
    return saved ? Number(saved) : 0;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('casino_clicker_muted');
    return saved ? saved === 'true' : false;
  });

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('casino_clicker_stats');
    return saved ? JSON.parse(saved) : {
      totalClicks: 0,
      totalEarnedFromClicks: 0,
      totalCasesOpened: 0,
      totalSpentOnCases: 0,
      totalSoldPrice: 0,
      maxSingleDropPrice: 0,
    };
  });

  // --- Фильтры и поиск в кейсах ---
  const [caseSearch, setCaseSearch] = useState('');
  const [caseCategoryFilter, setCaseCategoryFilter] = useState('все');

  // --- Фильтры инвентаря ---
  const [invRarityFilter, setInvRarityFilter] = useState('все');
  const [invSortOrder, setInvSortOrder] = useState<'price_desc' | 'price_asc' | 'newest'>('price_desc');
  const [invSearch, setInvSearch] = useState('');
  const [groupDuplicates, setGroupDuplicates] = useState<boolean>(true);
  const [visibleInventoryLimit, setVisibleInventoryLimit] = useState(60);

  // --- Состояния пакетного открытия кейсов ---
  const [multiOpenCount, setMultiOpenCount] = useState<number>(10);
  const [isFastAnimating, setIsFastAnimating] = useState<boolean>(false);
  const [fastAnimItems, setFastAnimItems] = useState<InventoryItem[]>([]);
  const [showMultiOpenModal, setShowMultiOpenModal] = useState<boolean>(false);
  const [multiOpenResults, setMultiOpenResults] = useState<InventoryItem[]>([]);

  // --- Клики и плавающие циферки ---
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; amount: number }>>([]);
  const coinRef = useRef<HTMLButtonElement>(null);

  // --- Состояния прокрутки кейсов (Рулетка) ---
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<GameItem | null>(null);
  const [rouletteItems, setRouletteItems] = useState<GameItem[]>([]);
  const [spinOffset, setSpinOffset] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [justSoldResult, setJustSoldResult] = useState(false);

  // --- Состояния статистики сессии открытия кейса (ROI) ---
  const [caseSpent, setCaseSpent] = useState<number>(0);
  const [caseEarned, setCaseEarned] = useState<number>(0);
  const [caseOpenedCount, setCaseOpenedCount] = useState<number>(0);

  // --- Состояния Контрактов Обмена ---
  const [selectedContractItemIds, setSelectedContractItemIds] = useState<string[]>([]);
  const [contractResultItem, setContractResultItem] = useState<GameItem | null>(null);
  const [showContractResultModal, setShowContractResultModal] = useState<boolean>(false);

  // Реф для отслеживания физической прокрутки и проигрывания тиков
  const rouletteContainerRef = useRef<HTMLDivElement>(null);
  const lastTickItemIndexRef = useRef<number>(-1);

  // Реф для анимации тикера
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Инициализация звука при изменении состояния мута
  useEffect(() => {
    soundManager.muted = isMuted;
  }, [isMuted]);

  // Сохранение состояний при изменении
  useEffect(() => {
    localStorage.setItem('casino_clicker_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('casino_clicker_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('casino_clicker_click_lvl', clickLvl.toString());
  }, [clickLvl]);

  useEffect(() => {
    localStorage.setItem('casino_clicker_auto_lvl', autoclickLvl.toString());
  }, [autoclickLvl]);

  useEffect(() => {
    localStorage.setItem('casino_clicker_lucky_lvl', luckyLvl.toString());
  }, [luckyLvl]);

  useEffect(() => {
    localStorage.setItem('casino_clicker_muted', isMuted.toString());
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('casino_clicker_stats', JSON.stringify(stats));
  }, [stats]);

  // Сброс лимита отображения инвентаря при изменении критериев поиска или фильтрации
  useEffect(() => {
    setVisibleInventoryLimit(60);
  }, [invSearch, invRarityFilter, invSortOrder, groupDuplicates]);

  // --- Симуляция Пассивного Автокликера (каждую секунду) ---
  useEffect(() => {
    if (autoclickLvl === 0) return;

    const interval = setInterval(() => {
      const generated = autoclickLvl * 5; // 5 ₽ в секунду за уровень
      setBalance(prev => prev + generated);
    }, 1000);

    return () => clearInterval(interval);
  }, [autoclickLvl]);

  // --- Расчет силы клика и цен апгрейдов ---
  const clickPower = 1 + (clickLvl - 1) * 3; // +3 ₽ за каждый уровень кликера

  const clickUpgradeCost = Math.round(15 * Math.pow(1.5, clickLvl));
  const autoUpgradeCost = Math.round(80 * Math.pow(1.65, autoclickLvl + 1));
  const luckyUpgradeCost = Math.round(500 * Math.pow(2.2, luckyLvl + 1));

  // --- Функции кликера ---
  const handleCoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundManager.playClick();
    
    // Получаем реальные координаты клика по отношению к кнопке для создания партикла
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticle = {
      id: Date.now() + Math.random(),
      x,
      y,
      amount: clickPower,
    };

    setParticles(prev => [...prev, newParticle]);
    setBalance(prev => prev + clickPower);
    setStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      totalEarnedFromClicks: prev.totalEarnedFromClicks + clickPower
    }));

    // Удаляем частицу спустя секунду
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);
  };

  // --- Купить апгрейды ---
  const buyClickUpgrade = () => {
    if (balance >= clickUpgradeCost) {
      setBalance(prev => prev - clickUpgradeCost);
      setClickLvl(prev => prev + 1);
      soundManager.playWin();
    }
  };

  const buyAutoUpgrade = () => {
    if (balance >= autoUpgradeCost) {
      setBalance(prev => prev - autoUpgradeCost);
      setAutoclickLvl(prev => prev + 1);
      soundManager.playWin();
    }
  };

  const buyLuckyUpgrade = () => {
    if (balance >= luckyUpgradeCost) {
      setBalance(prev => prev - luckyUpgradeCost);
      setLuckyLvl(prev => prev + 1);
      soundManager.playWin();
    }
  };

  // ==================== МИНИ-ИГРЫ НА РУБЛИ ====================

  // Динамический расчет множителя Сапёра с учетом house edge 2%
  const getMinesMultiplier = (clicks: number, totalMines: number) => {
    if (clicks === 0) return 1.0;
    let multiplier = 1.0;
    for (let i = 0; i < clicks; i++) {
      const safeRemaining = 25 - totalMines - i;
      const totalRemaining = 25 - i;
      multiplier *= (totalRemaining / safeRemaining);
    }
    return Math.min(1000000, Number((multiplier * 0.98).toFixed(4)));
  };

  const minesStartGame = () => {
    if (minesBet <= 0) {
      alert('Минимальная ставка должна быть больше 0 ₽!');
      return;
    }
    if (balance < minesBet) {
      alert('Недостаточно рублей на балансе для совершения этой ставки!');
      return;
    }
    if (minesCount < 1 || minesCount > 24) {
      alert('Вы можете спрятать от 1 до 24 мин!');
      return;
    }

    setBalance(prev => prev - minesBet);

    const mineIndices: number[] = [];
    while (mineIndices.length < minesCount) {
      const rand = Math.floor(Math.random() * 25);
      if (!mineIndices.includes(rand)) {
        mineIndices.push(rand);
      }
    }

    const initialGrid = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      isOpen: false,
      isMine: mineIndices.includes(i)
    }));

    setMinesSecretMines(mineIndices);
    setMinesGrid(initialGrid);
    setMinesSuccessfulClicks(0);
    setMinesGameOver(false);
    setMinesGameWon(false);
    setMinesGameActive(true);
    soundManager.playClick();
  };

  const minesClickCell = (index: number) => {
    if (!minesGameActive || minesGameOver || minesGameWon) return;

    const cell = minesGrid[index];
    if (cell.isOpen) return;

    const newGrid = [...minesGrid];
    newGrid[index] = { ...cell, isOpen: true };
    setMinesGrid(newGrid);

    if (cell.isMine) {
      setMinesGameOver(true);
      setMinesGameActive(false);
      soundManager.playClick(); // низкий клик
      setMinesGrid(newGrid.map(c => ({ ...c, isOpen: true })));
    } else {
      const nextClicks = minesSuccessfulClicks + 1;
      setMinesSuccessfulClicks(nextClicks);
      soundManager.playTick(); // щелчок победы

      const maxSafeClicks = 25 - minesCount;
      if (nextClicks === maxSafeClicks) {
        const mult = getMinesMultiplier(nextClicks, minesCount);
        const winAmount = Math.floor(minesBet * mult);
        setBalance(prev => prev + winAmount);
        setMinesGameWon(true);
        setMinesGameActive(false);
        soundManager.playWin();
        setMinesGrid(newGrid.map(c => ({ ...c, isOpen: true })));
      }
    }
  };

  const minesCashout = () => {
    if (!minesGameActive || minesGameOver || minesGameWon || minesSuccessfulClicks === 0) return;

    const mult = getMinesMultiplier(minesSuccessfulClicks, minesCount);
    const winAmount = Math.floor(minesBet * mult);
    setBalance(prev => prev + winAmount);
    setMinesGameActive(false);
    setMinesGameWon(true);
    soundManager.playWin();
    setMinesGrid(prev => prev.map(c => ({ ...c, isOpen: true })));
  };

  const playCoinflip = () => {
    if (coinflipBet <= 0) {
      alert('Минимальная ставка должна быть больше 0 ₽!');
      return;
    }
    if (balance < coinflipBet) {
      alert('Недостаточно рублей на балансе!');
      return;
    }
    if (coinflipIsSpinning) return;

    setBalance(prev => prev - coinflipBet);
    setCoinflipIsSpinning(true);
    setCoinflipResult(null);
    setCoinflipStatusText('Монетка подброшена и летит в воздухе... 🪙');
    soundManager.playClick();

    setTimeout(() => {
      // 48.5% win chance (house edge 3%)
      const isWin = Math.random() < 0.485;
      const resultSide = isWin ? coinflipSelectedSide : (coinflipSelectedSide === 'heads' ? 'tails' : 'heads');

      setCoinflipResult(resultSide);
      setCoinflipIsSpinning(false);

      if (isWin) {
        const winAmount = coinflipBet * 2;
        setBalance(prev => prev + winAmount);
        setCoinflipStatusText(`Выпало: ${resultSide === 'heads' ? 'Орёл (CT)' : 'Решка (T)'}. Поздравляем, победа! +${winAmount.toLocaleString()} ₽ 🎉`);
        soundManager.playWin();
      } else {
        setCoinflipStatusText(`Выпало: ${resultSide === 'heads' ? 'Орёл (CT)' : 'Решка (T)'}. Поражение, ставка пропала.`);
        soundManager.playTick();
      }
    }, 1200);
  };

  // ==================== НОВАЯ ОПТИМИЗИРОВАННАЯ МУЛЬТИ-КРУТКА ====================
  // Устраняет лаги инвентаря благодаря атомному обновлению при остановке

  const executeMultiOpenTracks = (countToOpen: number) => {
    if (!selectedCase) return;
    setIsMultiTrackSpinning(true);

    const tempTracks: typeof multiSpinningTracks = [];
    const newItems: InventoryItem[] = [];
    let localMaxDrop = stats.maxSingleDropPrice;
    let earnedInBatch = 0;

    for (let t = 0; t < countToOpen; t++) {
      const drop = drawItemFromCase(selectedCase);
      earnedInBatch += drop.price;

      // Лента под каждую дорожку
      const trackTape: GameItem[] = [];
      const pool = selectedCase.price >= 120000 
        ? ALL_ITEMS.filter(it => it.category.includes('Нож') || it.category.includes('Перчат') || it.rarity === 'mythical')
        : (selectedCase.price >= 8000 ? ALL_ITEMS.filter(it => it.rarity !== 'common') : ALL_ITEMS);

      for (let i = 0; i < 40; i++) {
        if (i === 32) {
          trackTape.push(drop);
        } else {
          trackTape.push(pool[Math.floor(Math.random() * pool.length)]);
        }
      }

      newItems.push({
        id: Date.now() + t + Math.random().toString(36).substr(2, 5),
        itemId: drop.id,
        name: drop.name,
        category: drop.category,
        rarity: drop.rarity,
        price: drop.price,
        image: drop.image,
        color: drop.color,
        bgGradient: drop.bgGradient,
      });

      if (drop.price > localMaxDrop) {
        localMaxDrop = drop.price;
      }

      tempTracks.push({
        id: t,
        tape: trackTape,
        winningItem: drop,
        spinOffset: 0
      });
    }

    setMultiSpinningTracks(tempTracks);
    setMultiOpenResults(newItems);

    const totalCost = countToOpen * selectedCase.price;
    setBalance(prev => prev - totalCost);

    // Запускаем смещение на ленте
    setTimeout(() => {
      setMultiSpinningTracks(prev => prev.map(track => {
        // Каждая компактная карточка имеет ширину 80px + gap 12px = 92px. 
        // Смещение центрирует 32-й элемент в треке шириной 500px:
        const randomFudge = Math.floor(Math.random() * 32) - 16;
        return {
          ...track,
          spinOffset: 32 * 92 + 40 - 250 + randomFudge
        };
      }));

      // Легкий звук замедления колес
      let delay = 60;
      const playDecayTicks = () => {
        soundManager.playTick();
        delay = delay * 1.10;
        if (delay < 800) {
          setTimeout(playDecayTicks, delay);
        }
      };
      playDecayTicks();
    }, 40);

    // Атомно зачисляем в инвентарь по окончании 4.6 секунд! Инвентарь не лагает во время прокрутки.
    setTimeout(() => {
      setInventory(prev => [...newItems, ...prev]);
      setCaseSpent(prev => prev + totalCost);
      setCaseOpenedCount(prev => prev + countToOpen);
      setCaseEarned(prev => prev + earnedInBatch);

      setStats(prev => ({
        ...prev,
        totalCasesOpened: prev.totalCasesOpened + countToOpen,
        totalSpentOnCases: prev.totalSpentOnCases + totalCost,
        maxSingleDropPrice: Math.max(prev.maxSingleDropPrice, localMaxDrop),
      }));

      setShowMultiOpenModal(true);
      soundManager.playWin();
      setIsMultiTrackSpinning(false);
    }, 4600);
  };

  // --- Симуляция очистки прогресса (Reset) ---
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const resetProgress = () => {
    setBalance(1000);
    setInventory([]);
    setClickLvl(1);
    setAutoclickLvl(0);
    setLuckyLvl(0);
    setStats({
      totalClicks: 0,
      totalEarnedFromClicks: 0,
      totalCasesOpened: 0,
      totalSpentOnCases: 0,
      totalSoldPrice: 0,
      maxSingleDropPrice: 0,
    });
    setShowConfirmReset(false);
    soundManager.playClick();
  };

  // --- Функции продажи предметов ---
  const sellItem = (id: string, price: number) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    setBalance(prev => prev + price);
    setStats(prev => ({
      ...prev,
      totalSoldPrice: prev.totalSoldPrice + price
    }));
    soundManager.playClick();
  };

  const sellMultipleItems = (subIds: string[], pricePerItem: number) => {
    if (subIds.length === 0) return;
    const totalProfit = pricePerItem * subIds.length;
    const idSet = new Set(subIds);
    setInventory(prev => prev.filter(item => !idSet.has(item.id)));
    setBalance(prev => prev + totalProfit);
    setStats(prev => ({
      ...prev,
      totalSoldPrice: prev.totalSoldPrice + totalProfit
    }));
    soundManager.playClick();
  };

  const sellAllInventory = () => {
    if (inventory.length === 0) return;
    const totalProfit = inventory.reduce((sum, item) => sum + item.price, 0);
    setInventory([]);
    setBalance(prev => prev + totalProfit);
    setStats(prev => ({
      ...prev,
      totalSoldPrice: prev.totalSoldPrice + totalProfit
    }));
    soundManager.playJackpot();
  };

  // --- Механика Рулетки (Открытие кейсов) ---
  const openCaseDetails = (c: Case) => {
    if (isSpinning) return;
    setSelectedCase(c);
    setSpinResult(null);
    setShowResultModal(false);
    setJustSoldResult(false);
    setCaseSpent(0);
    setCaseEarned(0);
    setCaseOpenedCount(0);
  };

  const startSpinning = () => {
    if (!selectedCase || isSpinning) return;
    if (balance < selectedCase.price) {
      alert('Недостаточно рублей для открытия этого кейса!');
      return;
    }

    // Снимаем деньги за кейс
    setBalance(prev => prev - selectedCase.price);
    setStats(prev => ({
      ...prev,
      totalCasesOpened: prev.totalCasesOpened + 1,
      totalSpentOnCases: prev.totalSpentOnCases + selectedCase.price
    }));

    setCaseSpent(prev => prev + selectedCase.price);
    setCaseOpenedCount(prev => prev + 1);

    setIsSpinning(true);
    setJustSoldResult(false);
    
    // Генерируем выигранный предмет
    const winningItem = drawItemFromCase(selectedCase);
    
    // Создаем ленту из 45 предметов для красивой прокрутки
    const itemsTape: GameItem[] = [];
    for (let i = 0; i < 45; i++) {
      if (i === 38) {
        // Ставим выигранный предмет вокруг 38 индекса
        itemsTape.push(winningItem);
      } else {
        // Наполняем случайными предметами
        itemsTape.push(ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)]);
      }
    }
    
    setRouletteItems(itemsTape);
    setSpinResult(winningItem);
    lastTickItemIndexRef.current = -1;

    // Скидываем позицию прокрутки колеса в 0
    setSpinOffset(0);

    // Запускаем плавную физическую анимацию горизонтального прокрута
    const cardWidth = 148; // Ширина карточки (120px + 28px margin-right)
    const cardActualWidth = 120;
    const finalOffset = 38 * cardWidth + cardActualWidth / 2; // Точный центр 38-й карточки в ленте
    const randomFudge = Math.floor(Math.random() * 80) - 40; // Небольшой рандом сдвига внутри карточки
    const finalDestination = finalOffset + randomFudge;

    const duration = 5500; // Длина вращения 5.5 секунд
    startTimeRef.current = null;

    const animateRoulette = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Идеальная кривая торможения
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentPos = easeProgress * finalDestination;

      setSpinOffset(currentPos);

      // Рассчитываем, на каком элементе мы находимся сейчас, и играем "тик" при переходе
      const currentItemIndex = Math.floor((currentPos + cardWidth / 2) / cardWidth);
      if (currentItemIndex !== lastTickItemIndexRef.current && currentItemIndex < 45) {
        soundManager.playTick();
        lastTickItemIndexRef.current = currentItemIndex;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateRoulette);
      } else {
        // Вращение завершено!
        setIsSpinning(false);
        soundManager.playWin();
        setShowResultModal(true);

        // Добавляем в инвентарь
        const newInvInstance: InventoryItem = {
          id: Date.now() + Math.random().toString(36).substr(2, 5),
          itemId: winningItem.id,
          name: winningItem.name,
          category: winningItem.category,
          rarity: winningItem.rarity,
          price: winningItem.price,
          image: winningItem.image,
          color: winningItem.color,
          bgGradient: winningItem.bgGradient,
        };

        setInventory(prev => [newInvInstance, ...prev]);
        setCaseEarned(prev => prev + winningItem.price);
        setStats(prev => ({
          ...prev,
          maxSingleDropPrice: Math.max(prev.maxSingleDropPrice, winningItem.price)
        }));
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateRoulette);
  };

  // Ссылка для отмены текущих интервалов batch открытия
  const cancelBatchOpeningRef = useRef<boolean>(false);

  // Пакетное открытие от 2 до 100 кейсов
  const executeMultiOpen = (instant: boolean) => {
    if (!selectedCase || isSpinning || isFastAnimating) return;

    // Рассчитаем сколько мы можем себе позволить
    const maxAffordable = Math.floor(balance / selectedCase.price);
    if (maxAffordable === 0) {
      alert('Недостаточно рублей для открытия кейсов!');
      return;
    }

    const countToOpen = Math.min(maxAffordable, multiOpenCount);
    if (countToOpen < 1) return;

    const totalCost = countToOpen * selectedCase.price;

    if (instant) {
      // 1) ИНСТАНТ ФЛОУ
      const newItems: InventoryItem[] = [];
      let localMaxDrop = stats.maxSingleDropPrice;
      let earnedInBatch = 0;

      for (let i = 0; i < countToOpen; i++) {
        const drop = drawItemFromCase(selectedCase);
        earnedInBatch += drop.price;
        newItems.push({
          id: Date.now() + i + Math.random().toString(36).substr(2, 5),
          itemId: drop.id,
          name: drop.name,
          category: drop.category,
          rarity: drop.rarity,
          price: drop.price,
          image: drop.image,
          color: drop.color,
          bgGradient: drop.bgGradient,
        });
        if (drop.price > localMaxDrop) {
          localMaxDrop = drop.price;
        }
      }

      setBalance(prev => prev - totalCost);
      setInventory(prev => [...newItems, ...prev]);
      
      setCaseSpent(prev => prev + totalCost);
      setCaseOpenedCount(prev => prev + countToOpen);
      setCaseEarned(prev => prev + earnedInBatch);

      setStats(prev => ({
        ...prev,
        totalCasesOpened: prev.totalCasesOpened + countToOpen,
        totalSpentOnCases: prev.totalSpentOnCases + totalCost,
        maxSingleDropPrice: Math.max(prev.maxSingleDropPrice, localMaxDrop),
      }));

      // Отобразим результаты в специальном модальном окне
      setMultiOpenResults(newItems);
      setShowMultiOpenModal(true);
      soundManager.playJackpot();
    } else {
      // 2) С АНИМАЦИЕЙ
      if (countToOpen <= 20) {
        // Запуск нашей новой роскошной анимации из 20 прокручивающихся полосок!
        executeMultiOpenTracks(countToOpen);
        return;
      }

      // КАСКАДНЫЙ ОЧЕНЬ БЫСТРЫЙ РОЛЛ (Применяется только при количестве > 20 кейсов)
      setIsFastAnimating(true);
      setFastAnimItems([]);
      cancelBatchOpeningRef.current = false;

      let currentStep = 0;
      const accumulatedNewItems: InventoryItem[] = [];
      let localBalance = balance;
      let localCaseSpent = caseSpent;
      let localCaseEarned = caseEarned;
      let localCaseOpenedCount = caseOpenedCount;

      const runNextStep = () => {
        if (cancelBatchOpeningRef.current) {
          setIsFastAnimating(false);
          if (accumulatedNewItems.length > 0) {
            setInventory(prev => [...accumulatedNewItems, ...prev]);
          }
          return;
        }

        if (localBalance < selectedCase.price) {
          alert('Баланс исчерпан во время открытия кейсов!');
          setIsFastAnimating(false);
          if (accumulatedNewItems.length > 0) {
            setInventory(prev => [...accumulatedNewItems, ...prev]);
          }
          soundManager.playWin();
          return;
        }

        const drop = drawItemFromCase(selectedCase);
        const newItem: InventoryItem = {
          id: Date.now() + currentStep + Math.random().toString(36).substr(2, 5),
          itemId: drop.id,
          name: drop.name,
          category: drop.category,
          rarity: drop.rarity,
          price: drop.price,
          image: drop.image,
          color: drop.color,
          bgGradient: drop.bgGradient,
        };

        localBalance -= selectedCase.price;
        accumulatedNewItems.unshift(newItem); // Накапливаем локально
        localCaseSpent += selectedCase.price;
        localCaseEarned += drop.price;
        localCaseOpenedCount += 1;

        setBalance(localBalance);
        setCaseSpent(localCaseSpent);
        setCaseEarned(localCaseEarned);
        setCaseOpenedCount(localCaseOpenedCount);
        setStats(prev => ({
          ...prev,
          totalCasesOpened: prev.totalCasesOpened + 1,
          totalSpentOnCases: prev.totalSpentOnCases + selectedCase.price,
          maxSingleDropPrice: Math.max(prev.maxSingleDropPrice, drop.price),
        }));

        setFastAnimItems(prev => [newItem, ...prev]);
        soundManager.playTick();

        currentStep++;
        if (currentStep < countToOpen) {
          setTimeout(runNextStep, 200); // 200мс интервал
        } else {
          setIsFastAnimating(false);
          // Атомарная запись всех накопленных предметов в инвентарь при завершенииunboxing!
          setInventory(prev => [...accumulatedNewItems, ...prev]);
          soundManager.playWin();
        }
      };

      runNextStep();
    }
  };

  // --- Логика Контрактов Обмена ---
  const contractRarity = selectedContractItemIds.length > 0 
    ? inventory.find(it => it.id === selectedContractItemIds[0])?.rarity 
    : null;

  const eligibleForContract = inventory.filter(it => {
    if (selectedContractItemIds.includes(it.id)) return false;
    if (it.rarity === 'mythical') return false; // Экстра-класс не улучшается
    if (contractRarity) {
      return it.rarity === contractRarity;
    }
    return true;
  });

  const toggleItemInContract = (itemId: string) => {
    if (selectedContractItemIds.includes(itemId)) {
      setSelectedContractItemIds(prev => prev.filter(id => id !== itemId));
    } else {
      if (selectedContractItemIds.length >= 10) return;
      setSelectedContractItemIds(prev => [...prev, itemId]);
    }
  };

  const executeTradeUpContract = () => {
    if (selectedContractItemIds.length !== 10) return;
    
    const firstId = selectedContractItemIds[0];
    const firstItem = inventory.find(it => it.id === firstId);
    if (!firstItem) return;
    
    const currentRarity = firstItem.rarity;
    let nextRarity: RarityType;
    if (currentRarity === 'common') nextRarity = 'rare';
    else if (currentRarity === 'rare') nextRarity = 'epic';
    else if (currentRarity === 'epic') nextRarity = 'legendary';
    else if (currentRarity === 'legendary') nextRarity = 'mythical';
    else return;

    // Списываем 10 расходных скинов
    const idSet = new Set(selectedContractItemIds);
    const updatedInventory = inventory.filter(it => !idSet.has(it.id));
    
    // Подбираем случайный скин следующей редкости
    const candidates = ALL_ITEMS.filter(it => it.rarity === nextRarity);
    const winningItem = candidates[Math.floor(Math.random() * candidates.length)] || ALL_ITEMS[0];
    
    const newInvInstance: InventoryItem = {
      id: Date.now() + Math.random().toString(36).substring(2, 7),
      itemId: winningItem.id,
      name: winningItem.name,
      category: winningItem.category,
      rarity: winningItem.rarity,
      price: winningItem.price,
      image: winningItem.image,
      color: winningItem.color,
      bgGradient: winningItem.bgGradient,
    };

    const finalInventory = [newInvInstance, ...updatedInventory];
    setInventory(finalInventory);
    localStorage.setItem('casino_clicker_inventory', JSON.stringify(finalInventory));
    
    // Сбрасываем выбранные слоты
    setSelectedContractItemIds([]);
    
    // Показываем модалку триумфа
    setContractResultItem(winningItem);
    setShowContractResultModal(true);
    soundManager.playWin();
  };

  // Фильтр и сортировка кейсов
  const filteredCases = ALL_CASES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(caseSearch.toLowerCase()) || c.category.toLowerCase().includes(caseSearch.toLowerCase());
    if (caseCategoryFilter === 'все') return matchesSearch;
    if (caseCategoryFilter === 'cheap') return matchesSearch && c.price < 1000;
    if (caseCategoryFilter === 'mid') return matchesSearch && c.price >= 1000 && c.price < 10000;
    if (caseCategoryFilter === 'elite') return matchesSearch && c.price >= 10000 && c.price < 50000;
    if (caseCategoryFilter === 'royal') return matchesSearch && c.price >= 50000;
    return matchesSearch;
  });

  // Оптимизированная логика поиска, группировки и сортировки инвентаря
  const processedInventory = useMemo(() => {
    // 1. Поиск по названию/категории и редкости
    const filtered = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(invSearch.toLowerCase()) || 
                            item.category.toLowerCase().includes(invSearch.toLowerCase());
      if (!matchesSearch) return false;
      if (invRarityFilter === 'все') return true;
      return item.rarity === invRarityFilter;
    });

    // 2. Группировка дубликатов
    if (groupDuplicates) {
      const groups: Record<string, {
        id: string;
        itemId: string;
        name: string;
        category: string;
        rarity: any;
        price: number;
        image: string;
        color: string;
        bgGradient: string;
        count: number;
        allItems: InventoryItem[];
      }> = {};

      filtered.forEach(item => {
        const key = item.itemId;
        if (!groups[key]) {
          groups[key] = {
            id: item.id,
            itemId: item.itemId,
            name: item.name,
            category: item.category,
            rarity: item.rarity,
            price: item.price,
            image: item.image,
            color: item.color,
            bgGradient: item.bgGradient,
            count: 0,
            allItems: []
          };
        }
        groups[key].count += 1;
        groups[key].allItems.push(item);
      });
      
      const list = Object.values(groups);
      // Сортировка сгруппированного списка
      list.sort((a, b) => {
        if (invSortOrder === 'price_desc') return b.price - a.price;
        if (invSortOrder === 'price_asc') return a.price - b.price;
        return 0;
      });
      return list;
    } else {
      // Обычный плоский список
      const list = [...filtered];
      // Сортировка по цене
      list.sort((a, b) => {
        if (invSortOrder === 'price_desc') return b.price - a.price;
        if (invSortOrder === 'price_asc') return a.price - b.price;
        return 0;
      });
      return list.map(item => ({
        ...item,
        count: 1,
        allItems: [item]
      }));
    }
  }, [inventory, invSearch, invRarityFilter, invSortOrder, groupDuplicates]);

  // Фактически отрисовываемая часть коллекции
  const visibleInventory = useMemo(() => {
    return processedInventory.slice(0, visibleInventoryLimit);
  }, [processedInventory, visibleInventoryLimit]);

  // Для совместимости в других проверках (например пустой инвентарь)
  const filteredInventory = processedInventory;

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.price, 0);

  // --- Генерация и скачивание автономного HTML-файла ---
  const generateStandaloneHTML = () => {
    // Сериализуем данные
    const serializedCases = JSON.stringify(ALL_CASES, null, 2);
    const serializedItems = JSON.stringify(ALL_ITEMS, null, 2);
    const serializedRarities = JSON.stringify(RARITY_DETAILS, null, 2);

    const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Симулятор открытия кейсов & Кликер</title>
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #0b0c10;
      color: #c5c6c7;
    }
    .neon-text-blue {
      text-shadow: 0 0 10px rgba(66, 153, 225, 0.6);
    }
    .neon-text-pink {
      text-shadow: 0 0 10px rgba(237, 100, 166, 0.6);
    }
    .neon-border-pink {
      box-shadow: 0 0 15px rgba(237, 100, 166, 0.35);
    }
    .neon-border-blue {
      box-shadow: 0 0 15px rgba(66, 153, 225, 0.35);
    }
    /* Скрываем скроллбар в карусели */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  </style>
</head>
<body class="bg-[#0a0b0d] text-slate-100 min-h-screen">
  <div id="app" class="max-w-6xl mx-auto px-4 py-6">
    <!-- Шапка приложения -->
    <header class="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#13151a] border border-slate-800 rounded-2xl p-6 mb-6">
      <div class="flex items-center gap-3">
        <span class="text-4xl">🎰</span>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            СИМУЛЯТОР КЕЙСОВ & КЛИКЕР
          </h1>
          <p class="text-xs text-slate-400">Автономная симуляция азартных развлечений</p>
        </div>
      </div>
      
      <!-- Зона баланса и настроек -->
      <div class="flex items-center gap-4">
        <div class="bg-black/40 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-3">
          <span class="text-amber-500 text-xl">🪙</span>
          <div class="text-right">
            <div class="text-xs text-slate-400">БАЛАНС МИЛЛИОНЕРА</div>
            <div id="display-balance" class="font-mono text-xl text-green-400 font-bold">1 000 ₽</div>
          </div>
        </div>
        
        <button onclick="toggleMute()" id="mute-btn" class="p-3 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition text-slate-300" title="Звук">
          🔊
        </button>
        <button onclick="confirmReset()" class="p-3 bg-red-950/40 hover:bg-red-900 border border-red-500/20 active:scale-95 rounded-xl transition text-red-300" title="Сбросить прогресс">
          🔄
        </button>
      </div>
    </header>

    <!-- Навигационные вкладки -->
    <nav class="flex border-b border-slate-800 gap-2 mb-6">
      <button onclick="switchTab('clicker')" id="tab-clicker" class="tab-btn py-3 px-6 text-sm font-medium border-b-2 border-pink-500 text-pink-400 transition flex items-center gap-2">
        🎮 Мини-игры
      </button>
      <button onclick="switchTab('cases')" id="tab-cases" class="tab-btn py-3 px-6 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition flex items-center gap-2">
        📦 Кейсы (100 шт)
      </button>
      <button onclick="switchTab('inventory')" id="tab-inventory" class="tab-btn py-3 px-6 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition flex items-center gap-2">
        🎒 Инвентарь
      </button>
      <button onclick="switchTab('shop')" id="tab-shop" class="tab-btn py-3 px-6 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition flex items-center gap-2">
        ⚡ Улучшения
      </button>
    </nav>

    <!-- ВКЛАДКА: КЛИКЕР -->
    <section id="content-clicker" class="tab-content block">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 bg-[#13151a] border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          <div class="text-center mb-6">
            <h2 class="text-lg text-slate-400">КЛИКНИ И СТАНЬ БОГАЧЕ</h2>
            <p class="text-xs text-slate-500">Сила одного клика: <span id="click-power-stat" class="text-pink-400 font-bold">1 ₽</span></p>
          </div>
          
          <!-- Зона огромной монеты -->
          <button onclick="performClick(event)" class="relative w-48 h-48 rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 shadow-[0_0_40px_rgba(236,72,153,0.4)] active:scale-95 transition-transform duration-75 flex items-center justify-center text-6xl outline-none select-none border-4 border-white/10" id="casino-big-coin">
            🎰
            <!-- Контейнер для плавающего текста -->
            <div id="coin-particles" class="absolute inset-0 pointer-events-none"></div>
          </button>
          
          <div class="mt-8 text-center bg-black/30 px-6 py-2 rounded-full border border-slate-800 text-xs text-slate-400">
            Всего кликов совершено: <span id="stat-total-clicks" class="font-mono text-slate-300">0</span>
          </div>
        </div>

        <div class="bg-[#13151a] border border-slate-800 rounded-2xl p-6">
          <h3 class="text-normal font-semibold text-slate-200 mb-4 flex items-center gap-2">
            📈 Финансовая Статистика
          </h3>
          <div class="space-y-4 text-sm">
            <div class="flex justify-between border-b border-slate-800/60 pb-2">
              <span class="text-slate-400">Заработано кликами:</span>
              <span id="stat-earned-clicks" class="font-mono text-slate-200">0 ₽</span>
            </div>
            <div class="flex justify-between border-b border-slate-800/60 pb-2">
              <span class="text-slate-400">Кейсов открыто:</span>
              <span id="stat-cases-opened" class="font-mono text-slate-200">0</span>
            </div>
            <div class="flex justify-between border-b border-slate-800/60 pb-2">
              <span class="text-slate-400">Потрачено на кейсы:</span>
              <span id="stat-cases-spent" class="font-mono text-slate-200">0 ₽</span>
            </div>
            <div class="flex justify-between border-b border-slate-800/60 pb-2">
              <span class="text-slate-400">Заработано на продажах:</span>
              <span id="stat-items-sold" class="font-mono text-slate-200">0 ₽</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Лучший drop:</span>
              <span id="stat-max-drop" class="font-mono text-amber-400 font-semibold">0 ₽</span>
            </div>
          </div>
          
          <!-- Обучение -->
          <div class="mt-6 bg-slate-900/40 border border-slate-800 px-4 py-3 rounded-xl text-xs text-slate-400">
            <p class="font-semibold text-slate-300 mb-1">Совет дня:</p>
            Покупай Кликер в магазине улучшений, чтобы ускорить добычу рублей, а затем скупай элитные кейсы с дропом до миллиона рублей!
          </div>
        </div>
      </div>
    </section>

    <!-- ВКЛАДКА: КЕЙСЫ -->
    <section id="content-cases" class="tab-content hidden">
      <!-- Управление -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <input type="text" id="case-search-input" oninput="searchCases()" placeholder="Поиск кейса по названию..." class="flex-1 bg-[#13151a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-pink-500/50 transition">
        <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button onclick="filterCasesCategory('все')" class="case-cat-tab px-4 py-2 bg-pink-600 text-slate-100 rounded-lg text-xs font-medium transition whitespace-nowrap">Все кейсы</button>
          <button onclick="filterCasesCategory('cheap')" class="case-cat-tab px-4 py-2 bg-[#13151a] text-slate-400 rounded-lg text-xs font-medium transition whitespace-nowrap">Бюджетные (&lt; 1k)</button>
          <button onclick="filterCasesCategory('mid')" class="case-cat-tab px-4 py-2 bg-[#13151a] text-slate-400 rounded-lg text-xs font-medium transition whitespace-nowrap">Средние (1k - 10k)</button>
          <button onclick="filterCasesCategory('elite')" class="case-cat-tab px-4 py-2 bg-[#13151a] text-slate-400 rounded-lg text-xs font-medium transition whitespace-nowrap">Элитные (10k - 50k)</button>
          <button onclick="filterCasesCategory('royal')" class="case-cat-tab px-4 py-2 bg-[#13151a] text-slate-400 rounded-lg text-xs font-medium transition whitespace-nowrap">Королевские (50k+)</button>
        </div>
      </div>

      <!-- Сетка кейсов -->
      <div id="cases-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <!-- Генерируется скриптом -->
      </div>
    </section>

    <!-- ОКНО КЕЙС-ОПЕНЕРА (Карусель открывается отдельно) -->
    <section id="content-opener" class="hidden">
      <button onclick="switchTab('cases')" class="mb-4 text-xs text-slate-400 hover:text-slate-100 transition flex items-center gap-1">
        ← Вернуться к списку кейсов
      </button>

      <div class="bg-[#13151a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden" id="case-view-panel">
        <div class="flex items-center gap-3 mb-6" id="open-case-meta">
          <!-- Заполняется динамически -->
        </div>

        <!-- КАРУСЕЛЬ РУЛЕТКИ -->
        <div class="relative w-full h-36 bg-black/60 border-y border-slate-800 rounded-xl overflow-hidden mb-6 flex items-center">
          <!-- Красная стрелка тикера сверху -->
          <div class="absolute top-0 bottom-0 left-1/2 -ml-[2px] w-[4px] bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.8)] pointer-events-none"></div>
          
          <!-- Прокруточная лента -->
          <div id="roulette-track" class="flex whitespace-nowrap transition-transform duration-0 ease-out" style="padding-left: 50%; transform: translateX(0px);">
            <!-- Карточки генерируются скриптом -->
          </div>
        </div>

        <!-- КНОПКИ ДЕЙСТВИЯ -->
        <div class="flex flex-col sm:flex-row justify-center items-center gap-3" id="opener-controls">
          <button onclick="openOneCaseInstance()" id="open-btn" class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-95 transition rounded-xl font-semibold text-sm shadow-lg shadow-pink-500/20">
            Открыть 1 Кейс за <span id="opener-price-tag">0 ₽</span>
          </button>
          <button onclick="testQuickOpen20()" id="test-20-btn" class="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 hover:text-white transition rounded-xl text-slate-300 text-sm">
            Открыть 20 шт. (Быстро)
          </button>
        </div>

        <!-- Ожидаемые предметы -->
        <div class="mt-8 border-t border-slate-800/80 pt-6">
          <h4 class="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3">Содержимое кейса (Основные дропы)</h4>
          <div id="case-possible-drops" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <!-- Заполняется динамически -->
          </div>
        </div>
      </div>
    </section>

    <!-- ВКЛАДКА: ИНВЕНТАРЬ -->
    <section id="content-inventory" class="tab-content hidden">
      <div class="bg-[#13151a] border border-slate-800 rounded-2xl p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div class="text-xs text-slate-400 mb-1">СТОИМОСТЬ ВСЕХ СКИДОВ</div>
          <div id="inv-valuation" class="text-2xl font-bold font-mono text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]">0 ₽</div>
        </div>
        <div class="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <button onclick="sellAllItems()" class="px-5 py-2.5 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-black border border-green-500/20 rounded-xl text-xs font-semibold transition">
            Продать ВСЕ скины за полную стоимость
          </button>
        </div>
      </div>

      <!-- Сортировка инвентаря -->
      <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
        <div class="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
          <button onclick="filterInvRarity('все')" class="inv-rar-btn px-3 py-1.5 bg-indigo-600 text-xs font-semibold rounded-lg text-slate-100 transition whitespace-nowrap">Все</button>
          <button onclick="filterInvRarity('common')" class="inv-rar-btn px-3 py-1.5 bg-[#13151a] text-slate-400 text-xs font-semibold rounded-lg hover:text-slate-200 transition whitespace-nowrap">Ширпотреб</button>
          <button onclick="filterInvRarity('rare')" class="inv-rar-btn px-3 py-1.5 bg-[#13151a] text-slate-400 text-xs font-semibold rounded-lg hover:text-slate-200 transition whitespace-nowrap">Засекреченное</button>
          <button onclick="filterInvRarity('epic')" class="inv-rar-btn px-3 py-1.5 bg-[#13151a] text-slate-400 text-xs font-semibold rounded-lg hover:text-slate-200 transition whitespace-nowrap">Запрещенное</button>
          <button onclick="filterInvRarity('legendary')" class="inv-rar-btn px-3 py-1.5 bg-[#13151a] text-slate-400 text-xs font-semibold rounded-lg hover:text-slate-200 transition whitespace-nowrap">Тайное</button>
          <button onclick="filterInvRarity('mythical')" class="inv-rar-btn px-3 py-1.5 bg-[#13151a] text-slate-400 text-xs font-semibold rounded-lg hover:text-slate-200 transition whitespace-nowrap">★ Экстра</button>
        </div>
        <select id="inv-sort-select" onchange="sortInv()" class="w-full sm:w-auto bg-[#13151a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
          <option value="price_desc">Сначала самые дорогие</option>
          <option value="price_asc">Сначала самые дешевые</option>
        </select>
      </div>

      <!-- Сетка инвентаря -->
      <div id="inventory-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <!-- Генерируется из состояния -->
      </div>
    </section>

    <!-- ВКЛАДКА: МАГАЗИН УЛУЧШЕНИЙ -->
    <section id="content-shop" class="tab-content hidden">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Кликер сил -->
        <div class="bg-[#13151a] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div class="text-3xl mb-3">🖱️</div>
            <h3 class="font-bold text-slate-200 text-base mb-1">СИЛА КЛИКЕРА</h3>
            <p class="text-xs text-slate-400 mb-4">Увеличивает прибыль с каждого нажатия монеты на +3 рублей.</p>
            <div class="bg-black/30 px-3 py-2 rounded-lg inline-block text-xs text-indigo-300 mb-4 border border-indigo-950/40">
              Текущий Уровень: <span id="shop-click-lvl" class="font-bold">1</span>
            </div>
          </div>
          <button onclick="buyUpgrade('click')" id="upgrade-click-btn" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-xs text-white transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            Улучшить за <span id="price-click-upgrade">15</span> ₽
          </button>
        </div>

        <!-- Автокликер -->
        <div class="bg-[#13151a] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div class="text-3xl mb-3">⚡</div>
            <h3 class="font-bold text-slate-200 text-base mb-1">АВТОКЛИКЕР (РОБОТ)</h3>
            <p class="text-xs text-slate-400 mb-4">Автоматически добывает +5 рублей каждую секунду пассивно (даже во сне!).</p>
            <div class="bg-black/30 px-3 py-2 rounded-lg inline-block text-xs text-pink-300 mb-4 border border-pink-950/40">
              Активный доход: <span id="shop-auto-lvl" class="font-bold">0</span> ₽/сек
            </div>
          </div>
          <button onclick="buyUpgrade('auto')" id="upgrade-auto-btn" class="w-full py-3 bg-pink-600 hover:bg-pink-500 rounded-xl font-semibold text-xs text-white transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            Улучшить за <span id="price-auto-upgrade">80</span> ₽
          </button>
        </div>

        <!-- Счастливая монетка -->
        <div class="bg-[#13151a] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div class="text-3xl mb-3">🍀</div>
            <h3 class="font-bold text-slate-200 text-base mb-1">ВЕЗУЧАЯ МОНЕТКА</h3>
            <p class="text-xs text-slate-400 mb-4">Увеличивает везение! Домножает шансы на тайный и редкий дроп на +15%.</p>
            <div class="bg-black/30 px-3 py-2 rounded-lg inline-block text-xs text-amber-300 mb-4 border border-amber-950/40 font-semibold">
              Удача: +<span id="shop-lucky-lvl" class="font-bold">0</span>% бонус шанса
            </div>
          </div>
          <button onclick="buyUpgrade('lucky')" id="upgrade-lucky-btn" class="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold text-xs text-black transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            Улучшить за <span id="price-lucky-upgrade">500</span> ₽
          </button>
        </div>
      </div>
    </section>

    <!-- МОДАЛЬНОЕ ОКНО ВЫИГРЫША -->
    <div id="win-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-[#13151a] border border-amber-500 rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_50px_rgba(228,174,57,0.3)] animate-scale-up">
        <h3 class="text-amber-400 font-bold tracking-wider text-base uppercase mb-2">🎉 ПОЗДРАВЛЯЕМ! 🎉</h3>
        <p class="text-xs text-slate-400 mb-4">Вы совершили топовое открытие!</p>

        <!-- Карта выпавшего предмета -->
        <div id="modal-card" class="bg-gradient-to-br from-slate-900 to-black border-2 rounded-xl p-6 mb-6 flex flex-col items-center">
          <div id="modal-item-emoji" class="text-5xl mb-3">🔫</div>
          <div id="modal-item-name" class="font-bold text-slate-100 text-lg">AK-47 | Safari Mesh</div>
          <div id="modal-item-rarity" class="text-xs text-slate-400 mt-1 mb-3">Потрепанный ширпотреб</div>
          <div id="modal-item-price" class="font-mono text-xl text-green-400 font-bold bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20 inline-block">10 ₽</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button onclick="sellWinModalItem()" class="py-3 bg-green-500 hover:bg-green-600 text-black font-semibold text-xs rounded-xl transition">
            Продать за <span id="modal-sell-tag">0 ₽</span>
          </button>
          <button onclick="closeWinModal()" class="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition">
            Оставить в инвентаре
          </button>
        </div>
      </div>
    </div>
  </div>

  <footer class="text-center text-xs text-slate-500 py-10 mt-12 border-t border-slate-900">
    <p>© 2026 Симулятор Кейсов. Все права защищены. Все скины и рубли являются виртуальными.</p>
  </footer>

  <!-- Скрипт игры -->
  <script>
    // --- ПАКЕТ ДАННЫХ ИГРЫ (Ориентиры) ---
    const ALL_ITEMS = ${serializedItems};
    const ALL_CASES = ${serializedCases};
    const RARITY_DETAILS = ${serializedRarities};

    // --- ЛОКАЛЬНОЕ СОСТОЯНИЕ ---
    let balance = Number(localStorage.getItem('off_balance')) || 1000;
    let clickLvl = Number(localStorage.getItem('off_click_lvl')) || 1;
    let autoclickLvl = Number(localStorage.getItem('off_auto_lvl')) || 0;
    let luckyLevel = Number(localStorage.getItem('off_lucky_lvl')) || 0;
    let isMuted = localStorage.getItem('off_muted') === 'true';
    let inventory = JSON.parse(localStorage.getItem('off_inventory')) || [];
    inventory = inventory.map(function(item) {
      if (item && item.image) {
        if (item.image.includes('bymykel.com') || item.image.includes('bymykel.github.io')) {
          item.image = item.image
            .replace(/https:\/\/bymykel\.com\/CSGO-API/g, 'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public')
            .replace(/https:\/\/bymykel\.github\.io\/CSGO-API/g, 'https://cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public');
        }
        if (item.image.includes('cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/api/')) {
          item.image = item.image.replace('cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/api/', 'cdn.jsdelivr.net/gh/bymykel/CSGO-API@main/public/api/');
        }
      }
      return item;
    });
    let stats = JSON.parse(localStorage.getItem('off_stats')) || {
      totalClicks: 0,
      totalEarnedFromClicks: 0,
      totalCasesOpened: 0,
      totalSpentOnCases: 0,
      totalSoldPrice: 0,
      maxSingleDropPrice: 0
    };

    let selectedCase = null;
    let isSpinning = false;
    let spinResult = null;
    let winModalItemUniqueId = '';

    // Инициализация звуков через Web Audio API
    let audioCtx = null;
    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    const soundManager = {
      playClick() {
        if (isMuted) return;
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
          osc.start(); osc.stop(ctx.currentTime + 0.08);
        } catch(e){}
      },
      playTick() {
        if (isMuted) return;
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
          osc.start(); osc.stop(ctx.currentTime + 0.02);
        } catch(e){}
      },
      playWin() {
        if (isMuted) return;
        try {
          const ctx = getAudioContext();
          if (ctx.state === 'suspended') ctx.resume();
          const now = ctx.currentTime;
          const playNote = (f, start, dur) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(f, start);
            gain.gain.setValueAtTime(0.08, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(start); osc.stop(start + dur);
          };
          playNote(261.63, now, 0.15);
          playNote(329.63, now + 0.12, 0.15);
          playNote(392, now + 0.24, 0.15);
          playNote(523.25, now + 0.36, 0.5);
        } catch(e){}
      }
    };

    // Мутирование
    function toggleMute() {
      isMuted = !isMuted;
      localStorage.setItem('off_muted', isMuted);
      document.getElementById('mute-btn').innerText = isMuted ? '🔇' : '🔊';
    }

    // Сохранение логов
    function saveAll() {
      localStorage.setItem('off_balance', balance);
      localStorage.setItem('off_click_lvl', clickLvl);
      localStorage.setItem('off_auto_lvl', autoclickLvl);
      localStorage.setItem('off_lucky_lvl', luckyLevel);
      localStorage.setItem('off_inventory', JSON.stringify(inventory));
      localStorage.setItem('off_stats', JSON.stringify(stats));
      updateUI();
    }

    // Рендер баланса и апгрейдов
    function updateUI() {
      document.getElementById('display-balance').innerText = balance.toLocaleString() + ' ₽';
      
      const clickPower = 1 + (clickLvl - 1) * 3;
      document.getElementById('click-power-stat').innerText = clickPower + ' ₽';
      document.getElementById('stat-total-clicks').innerText = stats.totalClicks;
      document.getElementById('stat-earned-clicks').innerText = stats.totalEarnedFromClicks.toLocaleString() + ' ₽';
      document.getElementById('stat-cases-opened').innerText = stats.totalCasesOpened;
      document.getElementById('stat-cases-spent').innerText = stats.totalSpentOnCases.toLocaleString() + ' ₽';
      document.getElementById('stat-items-sold').innerText = stats.totalSoldPrice.toLocaleString() + ' ₽';
      document.getElementById('stat-max-drop').innerText = stats.maxSingleDropPrice.toLocaleString() + ' ₽';

      // Апгрейды цены
      const upClickPrice = Math.round(15 * Math.pow(1.5, clickLvl));
      const upAutoPrice = Math.round(80 * Math.pow(1.65, autoclickLvl + 1));
      const upLuckyPrice = Math.round(500 * Math.pow(2.2, luckyLevel + 1));

      document.getElementById('price-click-upgrade').innerText = upClickPrice.toLocaleString();
      document.getElementById('price-auto-upgrade').innerText = upAutoPrice.toLocaleString();
      document.getElementById('price-lucky-upgrade').innerText = upLuckyPrice.toLocaleString();

      document.getElementById('shop-click-lvl').innerText = clickLvl;
      document.getElementById('shop-auto-lvl').innerText = autoclickLvl * 5;
      document.getElementById('shop-lucky-lvl').innerText = luckyLevel * 15;

      // Кнопки активности
      document.getElementById('upgrade-click-btn').disabled = balance < upClickPrice;
      document.getElementById('upgrade-auto-btn').disabled = balance < upAutoPrice;
      document.getElementById('upgrade-lucky-btn').disabled = balance < upLuckyPrice;

      // Обновление стоимости инвентаря
      const invSum = inventory.reduce((sum, item) => sum + item.price, 0);
      document.getElementById('inv-valuation').innerText = invSum.toLocaleString() + ' ₽';

      renderInventory();
    }

    // Пассивный заработок робота
    setInterval(() => {
      if (autoclickLvl > 0) {
        balance += autoclickLvl * 5;
        saveAll();
      }
    }, 1000);

    // НАВИГАЦИЯ
    function switchTab(t) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('border-pink-500', 'text-pink-400');
        b.classList.add('border-transparent', 'text-slate-400');
      });
      document.getElementById('content-opener').classList.add('hidden');

      const targetContent = document.getElementById('content-' + t);
      if (targetContent) targetContent.classList.remove('hidden');

      const targetBtn = document.getElementById('tab-' + t);
      if (targetBtn) {
        targetBtn.classList.remove('border-transparent', 'text-slate-400');
        targetBtn.classList.add('border-pink-500', 'text-pink-400');
      }

      if (t === 'cases') {
        renderCasesGrid();
      }
    }

    // КЛИКЕР
    function performClick(e) {
      soundManager.playClick();
      const clickPower = 1 + (clickLvl - 1) * 3;
      balance += clickPower;
      stats.totalClicks++;
      stats.totalEarnedFromClicks += clickPower;
      
      // Партикл
      const coin = document.getElementById('casino-big-coin');
      const rect = coin.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const p = document.createElement('div');
      p.className = 'absolute font-mono text-xl text-green-400 font-bold pointer-events-none select-none';
      p.innerText = '+' + clickPower + ' ₽';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
      
      document.getElementById('coin-particles').appendChild(p);
      setTimeout(() => {
        p.style.transform = 'translateY(-100px) scale(0.6)';
        p.style.opacity = '0';
      }, 20);

      setTimeout(() => p.remove(), 900);
      saveAll();
    }

    // ИНВЕНТАРЬ
    let invFilter = 'все';
    let invSort = 'price_desc';

    function filterInvRarity(r) {
      invFilter = r;
      document.querySelectorAll('.inv-rar-btn').forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-slate-100');
        b.classList.add('bg-[#13151a]', 'text-slate-400');
      });
      
      event.target.classList.remove('bg-[#13151a]', 'text-slate-400');
      event.target.classList.add('bg-indigo-600', 'text-slate-100');
      renderInventory();
    }

    function sortInv() {
      invSort = document.getElementById('inv-sort-select').value;
      renderInventory();
    }

    function renderInventory() {
      const grid = document.getElementById('inventory-grid');
      let filtered = [...inventory];
      if (invFilter !== 'все') {
        filtered = filtered.filter(it => it.rarity === invFilter);
      }

      if (invSort === 'price_desc') {
        filtered.sort((a,b) => b.price - a.price);
      } else {
        filtered.sort((a,b) => a.price - b.price);
      }

      grid.innerHTML = '';
      if (filtered.length === 0) {
        grid.innerHTML = \`<div class="col-span-full py-12 text-center text-slate-500 text-xs text-slate-400">Инвентарь пуст. Загляните в кейсы!</div>\`;
        return;
      }

      filtered.forEach(it => {
        const rarNode = RARITY_DETAILS[it.rarity];
        const card = document.createElement('div');
        card.className = \`bg-gradient-to-br \${it.bgGradient} border border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center text-center shadow-lg hover:border-slate-700 hover:-translate-y-0.5 transition duration-200\`;
        card.innerHTML = \`
          \${it.image.startsWith('http') ? \`
            <img src="\${it.image}" alt="\${it.name}" class="w-24 h-16 object-contain filter drop-shadow mb-1 mx-auto" referrerpolicy="no-referrer" />
          \` : \`
            <div class="text-xl mb-1">\${it.image}</div>
          \`}
          <div class="text-xs font-bold text-slate-100 line-clamp-2 min-h-[2rem]">\${it.name}</div>
          <div class="text-[10px] uppercase font-bold tracking-wider mt-1" style="color: \${rarNode.color}">\${rarNode.name.split(' ')[0]}</div>
          <div class="font-mono text-xs text-green-400 font-semibold mt-3 bg-black/40 px-2.5 py-1 rounded-md mb-2">\${it.price.toLocaleString()} ₽</div>
          <button onclick="sellInventoryItem('\${it.id}', \${it.price})" class="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded-lg transition">Продать</button>
        \`;
        grid.appendChild(card);
      });
    }

    function sellInventoryItem(uid, pr) {
      inventory = inventory.filter(it => it.id !== uid);
      balance += pr;
      stats.totalSoldPrice += pr;
      saveAll();
    }

    function sellAllItems() {
      if (inventory.length === 0) return;
      const profit = inventory.reduce((sum, item) => sum + item.price, 0);
      inventory = [];
      balance += profit;
      stats.totalSoldPrice += profit;
      saveAll();
    }

    // АПГРЕЙДЫ
    function buyUpgrade(t) {
      if (t === 'click') {
        const cost = Math.round(15 * Math.pow(1.5, clickLvl));
        if (balance >= cost) {
          balance -= cost; clickLvl++; soundManager.playWin();
        }
      } else if (t === 'auto') {
        const cost = Math.round(80 * Math.pow(1.65, autoclickLvl + 1));
        if (balance >= cost) {
          balance -= cost; autoclickLvl++; soundManager.playWin();
        }
      } else if (t === 'lucky') {
        const cost = Math.round(500 * Math.pow(2.2, luckyLevel + 1));
        if (balance >= cost) {
          balance -= cost; luckyLevel++; soundManager.playWin();
        }
      }
      saveAll();
    }

    // КЕЙСЫ
    let caseSearchStr = '';
    let currCaseCategory = 'все';

    function searchCases() {
      caseSearchStr = document.getElementById('case-search-input').value.toLowerCase();
      renderCasesGrid();
    }

    function filterCasesCategory(cat) {
      currCaseCategory = cat;
      document.querySelectorAll('.case-cat-tab').forEach(b => {
        b.classList.remove('bg-pink-600', 'text-slate-100');
        b.classList.add('bg-[#13151a]', 'text-slate-400');
      });
      event.target.classList.remove('bg-[#13151a]', 'text-slate-400');
      event.target.classList.add('bg-pink-600', 'text-slate-100');
      renderCasesGrid();
    }

    function renderCasesGrid() {
      const grid = document.getElementById('cases-grid');
      grid.innerHTML = '';
      
      const filtered = ALL_CASES.filter(c => {
        const matches = c.name.toLowerCase().includes(caseSearchStr) || c.category.toLowerCase().includes(caseSearchStr);
        if (currCaseCategory === 'все') return matches;
        if (currCaseCategory === 'cheap') return matches && c.price < 1000;
        if (currCaseCategory === 'mid') return matches && c.price >= 1000 && c.price < 10000;
        if (currCaseCategory === 'elite') return matches && c.price >= 10000 && c.price < 50000;
        if (currCaseCategory === 'royal') return matches && c.price >= 50000;
        return matches;
      });

      filtered.forEach(c => {
        const rar = RARITY_DETAILS[c.rarity];
        const card = document.createElement('div');
        card.className = \`bg-[#13151a] border border-slate-800 rounded-xl p-5 flex flex-col justify-between items-center text-center shadow-lg transition-transform hover:-translate-y-1 hover:border-pink-500/30 hover:shadow-[0_4px_20px_rgba(236,72,153,0.15)] duration-200 cursor-pointer\`;
        card.onclick = () => openCaseOpener(c.id);
        card.innerHTML = \`
          \${c.image.startsWith('http') ? \`
            <img src="\${c.image}" alt="\${c.name}" class="w-24 h-24 object-contain filter drop-shadow mb-2" referrerpolicy="no-referrer" />
          \` : \`
            <span class="text-4xl mb-2 inline-block animate-pulse">\${c.image}</span>
          \`}
          <div class="text-xs font-bold text-slate-100 mb-1 line-clamp-1">\${c.name}</div>
          <div class="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-black/40 mb-3 border border-slate-900">\${c.category}</div>
          <div class="font-mono text-sm text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-md w-full mb-2">\${c.price.toLocaleString()} ₽</div>
          <button class="w-full py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-bold rounded-lg transition shadow-md shadow-pink-500/15">Подробнее</button>
        \`;
        grid.appendChild(card);
      });
    }

    // ОТКРЫТИЕ КЕЙСА (ОПЕНЕР)
    function openCaseOpener(id) {
      selectedCase = ALL_CASES.find(c => c.id === id);
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.getElementById('content-opener').classList.remove('hidden');

      // Шапка
      let headerGradientColor = 'from-pink-500/10 to-pink-500/0';
      let headerIconColor = 'text-pink-400';
      let headerGlowColor = 'rgba(236,72,153,0.12)';
      if (selectedCase.category === 'Бюджетный') {
        headerGradientColor = 'from-slate-500/10 to-slate-500/0';
        headerIconColor = 'text-slate-400';
        headerGlowColor = 'rgba(148,163,184,0.12)';
      } else if (selectedCase.category === 'Средний') {
        headerGradientColor = 'from-violet-500/10 to-violet-500/0';
        headerIconColor = 'text-violet-400';
        headerGlowColor = 'rgba(139,92,246,0.12)';
      } else if (selectedCase.category === 'Особый') {
        headerGradientColor = 'from-pink-500/10 to-pink-500/0';
        headerIconColor = 'text-pink-400';
        headerGlowColor = 'rgba(236,72,153,0.12)';
      } else if (selectedCase.category === 'Элитный') {
        headerGradientColor = 'from-rose-500/10 to-rose-500/0';
        headerIconColor = 'text-rose-500';
        headerGlowColor = 'rgba(244,63,94,0.12)';
      } else if (selectedCase.category === 'Королевский') {
        headerGradientColor = 'from-amber-500/10 to-amber-500/0';
        headerIconColor = 'text-amber-400';
        headerGlowColor = 'rgba(245,158,11,0.12)';
      }

      document.getElementById('open-case-meta').innerHTML = \`
        <div class="w-24 h-24 rounded-2xl bg-gradient-to-b \${headerGradientColor} border border-slate-800 flex items-center justify-center relative shadow-sm animate-pulse" style="box-shadow: 0 0 20px \${headerGlowColor}">
          <svg class="w-12 h-12 \${headerIconColor}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-100">\${selectedCase.name}</h2>
          <p class="text-xs text-slate-400">\${selectedCase.desc}</p>
        </div>
      \`;

      document.getElementById('opener-price-tag').innerText = selectedCase.price.toLocaleString() + ' ₽';
      document.getElementById('open-btn').disabled = isSpinning;
      document.getElementById('test-20-btn').disabled = isSpinning;

      document.getElementById('roulette-track').style.transform = 'translateX(0px)';
      
      // Показываем содержимое
      const dropsContainer = document.getElementById('case-possible-drops');
      dropsContainer.innerHTML = '';
      
      const possibleItems = ALL_ITEMS.filter(it => {
        if (selectedCase.price >= 120000) {
          return it.category.includes('Нож') || it.category.includes('Перчат') || it.rarity === 'mythical';
        }
        if (selectedCase.price >= 8000) {
          return it.rarity !== 'common';
        }
        return true;
      }).slice(0, 12);

      possibleItems.forEach(it => {
        const rNode = RARITY_DETAILS[it.rarity];
        dropsContainer.innerHTML += \`
          <div class="bg-gradient-to-br \${it.bgGradient} border border-slate-800/80 rounded-lg p-3 text-center flex flex-col items-center">
            \${it.image.startsWith('http') ? \`
              <img src="\${it.image}" alt="\${it.name}" class="w-16 h-10 object-contain filter drop-shadow mx-auto mb-1" referrerpolicy="no-referrer" />
            \` : \`
              <span class="text-xl mb-1">\${it.image}</span>
            \`}
            <div class="text-[10px] font-semibold text-slate-200 line-clamp-1">\${it.name.split(' | ')[1] || it.name}</div>
            <div class="font-mono text-[9px] text-green-400 mt-2 font-bold">\${it.price.toLocaleString()} ₽</div>
          </div>
        \`;
      });
    }

    // Физика рулетки
    let currentAnimFrame = null;
    function openOneCaseInstance() {
      if (isSpinning) return;
      if (balance < selectedCase.price) {
        alert('Недостаточно рублей!');
        return;
      }

      balance -= selectedCase.price;
      stats.totalCasesOpened++;
      stats.totalSpentOnCases += selectedCase.price;

      isSpinning = true;
      document.getElementById('open-btn').disabled = true;
      document.getElementById('test-20-btn').disabled = true;

      // Генерим победителя по весам
      const winningItem = drawWeightedWinner(selectedCase);
      spinResult = winningItem;

      // Формируем ленту из 45 карточек
      const tape = [];
      for (let i = 0; i < 45; i++) {
        if (i === 38) {
          tape.push(winningItem);
        } else {
          tape.push(ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)]);
        }
      }

      // Отрисовка ленты
      const track = document.getElementById('roulette-track');
      track.innerHTML = '';
      tape.forEach(it => {
        const itemCard = document.createElement('div');
        itemCard.style.width = '120px';
        itemCard.style.marginRight = '28px';
        itemCard.style.flexShrink = '0';
        itemCard.style.display = 'inline-flex';
        itemCard.style.flexDirection = 'column';
        itemCard.style.alignItems = 'center';
        itemCard.style.justifyContent = 'center';
        itemCard.style.height = '120px';
        itemCard.className = \`bg-gradient-to-br \${it.bgGradient} border border-slate-800 rounded-xl p-2 text-center text-ellipsis overflow-hidden\`;
        itemCard.innerHTML = \`
          \${it.image.startsWith('http') ? \`
            <img src="\${it.image}" alt="\${it.name}" class="w-20 h-14 object-contain filter drop-shadow mx-auto mb-1" referrerpolicy="no-referrer" />
          \` : \`
            <div class="text-3xl mb-1">\${it.image}</div>
          \`}
          <div class="text-[10px] font-bold text-slate-100 line-clamp-2 leading-tight">\${it.name.split(' | ')[1] || it.name}</div>
          <div class="text-[8px] uppercase tracking-wider font-semibold font-mono mt-1" style="color: \${RARITY_DETAILS[it.rarity].color}">\${it.rarity}</div>
        \`;
        track.appendChild(itemCard);
      });

      const cardWidth = 148;
      const cardActualWidth = 120;
      const finalOffset = 38 * cardWidth + cardActualWidth / 2;
      const randomFudge = Math.floor(Math.random() * 80) - 40;
      const finalDestination = finalOffset + randomFudge;

      let start = null;
      const duration = 5300;
      let lastTickIndex = -1;

      function rouletteSpin(time) {
        if (!start) start = time;
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        const curX = ease * finalDestination;

        track.style.transform = \`translateX(-\${curX}px)\`;

        // Играем тиканье
        const tickIdx = Math.floor((curX + cardWidth / 2) / cardWidth);
        if (tickIdx !== lastTickIndex && tickIdx < 45) {
          soundManager.playTick();
          lastTickIndex = tickIdx;
        }

        if (progress < 1) {
          currentAnimFrame = requestAnimationFrame(rouletteSpin);
        } else {
          // Стоп
          isSpinning = false;
          document.getElementById('open-btn').disabled = false;
          document.getElementById('test-20-btn').disabled = false;

          // Сохраняем выигрыш
          winModalItemUniqueId = Date.now() + Math.random().toString(36).substr(2, 5);
          inventory.unshift({
            id: winModalItemUniqueId,
            itemId: winningItem.id,
            name: winningItem.name,
            category: winningItem.category,
            rarity: winningItem.rarity,
            price: winningItem.price,
            image: winningItem.image,
            color: winningItem.color,
            bgGradient: winningItem.bgGradient
          });

          if (winningItem.price > stats.maxSingleDropPrice) {
            stats.maxSingleDropPrice = winningItem.price;
          }

          saveAll();
          showCelebration(winningItem);
        }
      }

      currentAnimFrame = requestAnimationFrame(rouletteSpin);
    }

    // Взвешенный рандом
    function drawWeightedWinner(c) {
      let pool = ALL_ITEMS;
      if (c.price >= 120000) {
        pool = ALL_ITEMS.filter(it => it.category.includes('Нож') || it.category.includes('Перчат') || it.rarity === 'mythical');
      } else if (c.price >= 35000) {
        pool = ALL_ITEMS.filter(it => it.rarity === 'epic' || it.rarity === 'legendary' || it.rarity === 'mythical');
      } else if (c.price >= 6000) {
        pool = ALL_ITEMS.filter(it => it.rarity !== 'common');
      }

      const luckBonus = 1 + luckyLevel * 0.15; // Везение добавляет множитель к сверхмощным

      const totalWeight = pool.reduce((sum, item) => {
        let w = item.chanseWeight;
        if (item.rarity === 'mythical') w = w * luckBonus * (1 + c.price / 10000);
        if (item.rarity === 'legendary') w = w * luckBonus;
        return sum + w;
      }, 0);

      let randomPoint = Math.random() * totalWeight;

      for (const item of pool) {
        let w = item.chanseWeight;
        if (item.rarity === 'mythical') w = w * luckBonus * (1 + c.price / 10000);
        if (item.rarity === 'legendary') w = w * luckBonus;

        if (randomPoint < w) return item;
        randomPoint -= w;
      }
      return pool[pool.length - 1];
    }

    // Быстрый авто-открыватель (20 штук за раз)
    function testQuickOpen20() {
      if (isSpinning) return;
      if (balance < selectedCase.price) {
        alert('Недостаточно денег!');
        return;
      }

      const count = Math.min(Math.floor(balance / selectedCase.price), 20);
      const totalCost = count * selectedCase.price;

      const drops = [];
      for (let i = 0; i < count; i++) {
        const drop = drawWeightedWinner(selectedCase);
        drops.push(drop);

        inventory.unshift({
          id: Date.now() + i + Math.random().toString(36).substr(2, 5),
          itemId: drop.id,
          name: drop.name,
          category: drop.category,
          rarity: drop.rarity,
          price: drop.price,
          image: drop.image,
          color: drop.color,
          bgGradient: drop.bgGradient
        });

        if (drop.price > stats.maxSingleDropPrice) {
          stats.maxSingleDropPrice = drop.price;
        }
      }

      balance -= totalCost;
      stats.totalCasesOpened += count;
      stats.totalSpentOnCases += totalCost;

      saveAll();
      soundManager.playWin();

      // Оповестим
      alert(\`⚡ Моментальный анбоксинг! Распаковано \${count} кейсов. Всего ценного выбито. Стоимость нападавшего добавлена в инвентарь!\`);
    }

    // Модальное окно выигрыша
    function showCelebration(item) {
      soundManager.playWin();
      document.getElementById('win-modal').classList.remove('hidden');
      
      const modal = document.getElementById('modal-card');
      modal.className = \`bg-gradient-to-br \${item.bgGradient} border-2 rounded-xl p-6 mb-6 flex flex-col items-center\`;
      modal.style.borderColor = RARITY_DETAILS[item.rarity].color;

      const emojiContainer = document.getElementById('modal-item-emoji');
      if (item.image.startsWith('http')) {
        emojiContainer.innerHTML = \`<img src="\${item.image}" alt="\${item.name}" class="w-40 h-28 object-contain filter drop-shadow animate-pulse" referrerpolicy="no-referrer" />\`;
      } else {
        emojiContainer.innerHTML = \`<span class="text-6xl mb-3 animate-pulse select-none">\${item.image}</span>\`;
      }
      document.getElementById('modal-item-name').innerText = item.name;
      document.getElementById('modal-item-rarity').innerText = RARITY_DETAILS[item.rarity].name;
      document.getElementById('modal-item-price').innerText = item.price.toLocaleString() + ' ₽';
      document.getElementById('modal-sell-tag').innerText = item.price.toLocaleString() + ' ₽';
    }

    function closeWinModal() {
      document.getElementById('win-modal').classList.add('hidden');
    }

    function sellWinModalItem() {
      // Ищем этот предмет
      const idx = inventory.findIndex(it => it.id === winModalItemUniqueId);
      if (idx !== -1) {
        const price = inventory[idx].price;
        inventory.splice(idx, 1);
        balance += price;
        stats.totalSoldPrice += price;
        saveAll();
      }
      closeWinModal();
    }

    // Сброс прогресса
    function confirmReset() {
      if (confirm('Вы уверены, что хотите полностью стереть свой прогресс, включая все балансы, улучшения и инвентарь?')) {
        balance = 1000;
        clickLvl = 1;
        autoclickLvl = 0;
        luckyLevel = 0;
        inventory = [];
        stats = {
          totalClicks: 0,
          totalEarnedFromClicks: 0,
          totalCasesOpened: 0,
          totalSpentOnCases: 0,
          totalSoldPrice: 0,
          maxSingleDropPrice: 0
        };
        saveAll();
        switchTab('clicker');
      }
    }

    // Инициализация при запуске
    updateUI();
  </script>
</body>
</html>`;

    // Создаем файл и скачиваем
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casino_crate_clicker.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    soundManager.playJackpot();
  };

  return (
    <div className="bg-[#0a0b0d] text-slate-100 min-h-screen font-sans flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full px-4 py-6">
        {/* --- Header (Шапка) --- */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#13151a] border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-pink-500 animate-pulse" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tight">
                СИМУЛЯТОР ОТКРЫТИЯ КЕЙСОВ & КЛИКЕР
              </h1>
              <p className="text-xs text-slate-400">Автономное мобильное развлечение для соревнований с друзьями</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Баланс */}
            <div className="bg-black/40 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-3">
              <Coins className="w-5 h-5 text-amber-400" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">БАЛАНС</div>
                <div className="font-mono text-xl text-green-400 font-bold leading-none">
                  {balance.toLocaleString()} <span className="text-xs">₽</span>
                </div>
              </div>
            </div>

            {/* Быстрые Кнопки Экспорта и Мута */}
            <button 
              onClick={generateStandaloneHTML}
              className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold text-xs cursor-pointer rounded-xl flex items-center gap-2 text-white shadow-lg shadow-indigo-950/40 active:scale-95 transition"
              title="Экспортировать игру в один автономный HTML файл для друга"
              id="export-html-btn"
            >
              <Download className="w-4 h-4 text-pink-200" />
              <span className="hidden sm:inline">Скачать .HTML другу</span>
            </button>

            <button 
              onClick={() => setIsMuted(!isMuted)}
              style={{ cursor: 'pointer' }}
              className="p-3 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition text-slate-300"
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
              id="mute-sound-btn"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-green-400" />}
            </button>

            <button 
              onClick={() => setShowConfirmReset(true)}
              style={{ cursor: 'pointer' }}
              className="p-3 bg-red-950/40 hover:bg-red-900/60 border border-red-500/10 rounded-xl transition text-red-300"
              title="Сбросить статистику и баланс"
              id="reset-state-btn"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* --- CONFIRM RESET MODAL --- */}
        {showConfirmReset && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-[#13151a] border border-red-500/30 max-w-sm w-full p-6 rounded-2xl text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-slate-100 mb-2">Сбросить весь прогресс?</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Это действие полностью уничтожит ваш игровой баланс, силу клика, пассивные автокликеры и всю коллекцию выбитых скинов из инвентаря.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={resetProgress}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Да, стереть всё
                </button>
                <button 
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- NAVIGATION TABS --- */}
        <nav className="flex border-b border-slate-800 gap-2 mb-6 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => { setActiveTab('clicker'); setSelectedCase(null); }}
            style={{ cursor: 'pointer' }}
            className={`py-3 px-5 text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'clicker' && !selectedCase
                ? 'border-pink-500 text-pink-400 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            id="tab-btn-clicker"
          >
            <Gamepad className="w-4 h-4 text-pink-400 animate-pulse" />
            Мини-игры 🎮
          </button>
          
          <button 
            onClick={() => { setActiveTab('cases'); setSelectedCase(null); }}
            style={{ cursor: 'pointer' }}
            className={`py-3 px-5 text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cases' || selectedCase
                ? 'border-pink-500 text-pink-400 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            id="tab-btn-cases"
          >
            <Briefcase className="w-4 h-4" />
            Кейсы <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono font-bold">100</span>
          </button>

           <button 
            onClick={() => { setActiveTab('inventory'); setSelectedCase(null); }}
            style={{ cursor: 'pointer' }}
            className={`py-3 px-5 text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'inventory' && !selectedCase
                ? 'border-pink-500 text-pink-400 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            id="tab-btn-inv"
          >
            <Coins className="w-4 h-4" />
            Инвентарь <span className="text-[10px] bg-indigo-950/80 text-indigo-300 px-1.5 py-0.5 rounded-full font-mono font-bold">{inventory.length}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('contracts'); setSelectedCase(null); }}
            style={{ cursor: 'pointer' }}
            className={`py-3 px-5 text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'contracts' && !selectedCase
                ? 'border-pink-500 text-pink-400 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            id="tab-btn-contracts"
          >
            <FileText className="w-4 h-4" />
            Контракты <span className="text-[10px] bg-indigo-950/85 text-emerald-400 px-1.5 py-0.5 rounded-full font-mono font-bold">10-в-1</span>
          </button>

          <button 
            onClick={() => { setActiveTab('shop'); setSelectedCase(null); }}
            style={{ cursor: 'pointer' }}
            className={`py-3 px-5 text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'shop' && !selectedCase
                ? 'border-pink-500 text-pink-400 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            id="tab-btn-shop"
          >
            <Sparkles className="w-4 h-4" />
            Улучшения
          </button>
        </nav>

        {/* ==================== TAB CONTENT ==================== */}

        {/* --- CASE OPENER SCREEN (If selectedCase is active) --- */}
        {selectedCase ? (
          <div className="bg-[#13151a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden" id="active-open-screen">
            <button 
              onClick={() => setSelectedCase(null)}
              className="mb-5 text-xs text-slate-400 hover:text-slate-100 transition flex items-center gap-1 cursor-pointer"
            >
              ← Вернуться к списку из 100 кейсов
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                {(() => {
                  const styles = getCaseCategoryStyles(selectedCase.category);
                  return (
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-b ${styles.gradient} border border-slate-800 flex items-center justify-center relative shadow-sm animate-pulse`} style={{ boxShadow: `0 0 20px ${styles.glow}` }}>
                      <Package className={`w-12 h-12 ${styles.iconColor}`} />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{selectedCase.name}</h2>
                  <p className="text-xs text-slate-400">{selectedCase.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">СТОИМОСТЬ КЕЙСА</div>
                <div className="text-xl font-mono text-green-400 font-bold">{selectedCase.price.toLocaleString()} ₽</div>
              </div>
            </div>

            {/* --- ROULETTE WINDOW (CS:GO-style spinner) or FAST ANIMATION DISPLAY --- */}
            {isMultiTrackSpinning ? (
              <div className="relative w-full bg-black/40 border border-purple-500/20 rounded-2xl p-4 mb-6 animate-fade-in flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-3">
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></span>
                    Синхронная Распаковка {multiSpinningTracks.length} кейсов...
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">Симуляция супероптимизирована • Без лагов</div>
                </div>

                {/* Lanes Viewport Area */}
                <div className="w-full space-y-2 max-h-[360px] overflow-y-auto pr-1 no-scrollbar flex flex-col items-center">
                  {multiSpinningTracks.map(track => (
                    <div key={track.id} className="relative w-full max-w-[460px] h-14 bg-black/65 border border-slate-850/80 rounded-xl overflow-hidden flex items-center shadow-md">
                      {/* Целевой указатель по центру */}
                      <div className="absolute top-0 bottom-0 left-1/2 -ml-[1px] w-[2px] bg-red-500 z-10 shadow-[0_0_8px_rgba(239,68,68,0.9)] pointer-events-none"></div>

                      {/* Бегущая лента предметов */}
                      <div
                        style={{
                          transform: `translateX(${-track.spinOffset}px)`,
                          transition: 'transform 4.5s cubic-bezier(0.1, 0.8, 0.15, 1)'
                        }}
                        className="flex items-center pl-[230px]" // 230px составляет половину ширины полосы (460/2)
                      >
                        {track.tape.map((item, idx) => (
                          <div
                            key={idx}
                            style={{ width: '80px', marginRight: '12px' }}
                            className={`h-11 flex-shrink-0 flex items-center justify-center rounded-lg border border-slate-850/50 bg-gradient-to-br ${item.bgGradient} p-1 relative`}
                          >
                            {/* Картинка */}
                            {item.image.startsWith('http') ? (
                              <img src={item.image} alt={item.name} className="w-12 h-8 object-contain filter drop-shadow animate-fade-in" referrerPolicy="no-referrer" onError={handleImageError} />
                            ) : (
                              <span className="text-lg select-none">{item.image}</span>
                            )}
                            {/* Нижняя светящаяся полоска редкости */}
                            <div className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full" style={{ backgroundColor: RARITY_DETAILS[item.rarity].color }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : isFastAnimating ? (
              <div className="relative w-full min-h-36 bg-black/40 border border-indigo-500/20 rounded-2xl p-5 mb-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-2">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-505 animate-ping"></span>
                    Серийная распаковка: {fastAnimItems.length} из {multiOpenCount}
                  </div>
                  <button
                    onClick={() => { cancelBatchOpeningRef.current = true; setIsFastAnimating(false); }}
                    style={{ cursor: 'pointer' }}
                    className="px-3 py-1.5 bg-red-650 hover:bg-red-500 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider transition active:scale-95 shadow-md border-none"
                  >
                    Остановить 🛑
                  </button>
                </div>
                
                {/* Grid list of recently opened items in this series */}
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                  {fastAnimItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`bg-gradient-to-br ${item.bgGradient} border border-slate-800/80 p-3 rounded-xl text-center flex flex-col justify-center items-center h-[115px] relative animate-fade-in shadow-md`}
                    >
                      {item.image.startsWith('http') ? (
                        <img src={item.image} alt={item.name} className="w-16 h-10 object-contain filter drop-shadow mb-1" referrerPolicy="no-referrer" onError={handleImageError} />
                      ) : (
                        <span className="text-2xl mb-1 select-none filter drop-shadow">{item.image}</span>
                      )}
                      <div className="text-[9px] font-bold text-slate-100 line-clamp-1 truncate w-full px-1 leading-tight">{item.name.includes('|') ? item.name.split('|')[1].trim() : item.name}</div>
                      <div className="font-mono text-[9px] text-green-400 font-bold mt-1.5 bg-black/45 px-1.5 py-0.5 rounded-md">
                        {item.price.toLocaleString()} ₽
                      </div>
                    </div>
                  ))}
                  {fastAnimItems.length === 0 && (
                    <div className="col-span-full text-center text-xs text-slate-500 py-10">
                      Подготовка новой серии скинов...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative w-full h-36 bg-black/60 border-y border-slate-800 rounded-xl overflow-hidden mb-6 flex items-center">
                {/* Краузель-стрелочка по центру */}
                <div className="absolute top-0 bottom-0 left-1/2 -ml-[1.5px] w-[3px] bg-red-500 z-10 shadow-[0_0_12px_rgba(239,68,68,0.9)] pointer-events-none"></div>
                
                {/* Трек */}
                <div 
                  ref={rouletteContainerRef}
                  style={{ transform: `translateX(${-spinOffset}px)` }}
                  className="flex whitespace-nowrap pl-[50%] transition-transform duration-0 ease-out"
                >
                  {rouletteItems.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{ width: '120px', marginRight: '28px' }}
                      className={`h-[110px] flex-shrink-0 flex flex-col justify-center items-center rounded-xl border border-slate-800 p-2 text-center bg-gradient-to-br ${item.bgGradient} transition-opacity duration-100`}
                    >
                      {item.image.startsWith('http') ? (
                        <img src={item.image} alt={item.name} className="w-20 h-14 object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]" referrerPolicy="no-referrer" onError={handleImageError} />
                      ) : (
                        <span className="text-3xl mb-1 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] select-none">{item.image}</span>
                      )}
                      <div className="text-[10px] font-bold text-slate-100 leading-tight truncate w-full px-1">
                        {item.name.includes('|') ? item.name.split('|')[1].trim() : item.name}
                      </div>
                      <div className="text-[8px] uppercase tracking-wider mt-1 font-mono" style={{ color: RARITY_DETAILS[item.rarity].color }}>
                        {item.rarity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Панель управления кейсом */}
            <div className="bg-[#13151a]/80 border border-slate-800 rounded-2xl p-6 mb-6 space-y-6 w-full">
              {/* Верхняя секция: Одиночное открытие */}
              <div className="flex flex-col items-center justify-center border-b border-slate-850 pb-5">
                <button 
                  onClick={startSpinning}
                  disabled={isSpinning || isFastAnimating || balance < selectedCase.price}
                  style={{ cursor: balance >= selectedCase.price && !isSpinning && !isFastAnimating ? 'pointer' : 'not-allowed' }}
                  className="w-full max-w-md px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-40 active:scale-95 font-bold text-sm tracking-wide rounded-xl shadow-lg hover:shadow-purple-500/10 transition text-white select-none text-center border-none"
                >
                  {isSpinning ? 'Прокрутка рулетки...' : `Открыть один за ${selectedCase.price.toLocaleString()} ₽`}
                </button>
              </div>

              {/* Нижняя секция: Пакетное открытие (от 2 до 100) */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="text-xs font-bold text-slate-350 uppercase tracking-wider">
                    Пакетное открытие ({multiOpenCount} кейсов)
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Скины зачисляются в инвентарь автоматически
                  </div>
                </div>

                {/* Базовый слайдер и быстрые пресеты */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-black/20 p-4 rounded-xl border border-slate-850/60">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Количество кейсов:</span>
                      <span className="font-mono text-indigo-400 font-bold">{multiOpenCount} шт.</span>
                    </div>
                    <input 
                      type="range"
                      min={2}
                      max={100}
                      value={multiOpenCount}
                      onChange={e => setMultiOpenCount(Number(e.target.value))}
                      disabled={isSpinning || isFastAnimating}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Быстрый выбор пресета:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {[2, 5, 10, 20, 50, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setMultiOpenCount(val)}
                          disabled={isSpinning || isFastAnimating}
                          style={{ cursor: isSpinning || isFastAnimating ? 'not-allowed' : 'pointer' }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex-1 min-w-[45px] text-center border cursor-pointer select-none ${
                            multiOpenCount === val 
                              ? 'bg-indigo-650/20 border-indigo-500 text-indigo-400' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Две мощные опции активации */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <button 
                    type="button"
                    onClick={() => executeMultiOpen(true)}
                    disabled={isSpinning || isFastAnimating || isMultiTrackSpinning || balance < (selectedCase.price * multiOpenCount)}
                    style={{ cursor: balance >= (selectedCase.price * multiOpenCount) && !isSpinning && !isFastAnimating && !isMultiTrackSpinning ? 'pointer' : 'not-allowed' }}
                    className="px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition text-slate-350 disabled:opacity-40 text-center flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 select-none cursor-pointer"
                  >
                    <span className="text-white text-xs font-bold tracking-widest">⚡ Открыть Моментально</span>
                    <span className="text-[9px] font-mono text-slate-500 font-semibold mt-0.5">Безостановочный клик за {((selectedCase.price * multiOpenCount).toLocaleString())} ₽</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => executeMultiOpen(false)}
                    disabled={isSpinning || isFastAnimating || isMultiTrackSpinning || balance < (selectedCase.price * multiOpenCount) || multiOpenCount > 20}
                    style={{ cursor: balance >= (selectedCase.price * multiOpenCount) && !isSpinning && !isFastAnimating && !isMultiTrackSpinning && multiOpenCount <= 20 ? 'pointer' : 'not-allowed' }}
                    className="px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-xs uppercase tracking-wider rounded-xl transition text-white disabled:opacity-40 text-center flex flex-col items-center justify-center gap-0.5 shadow-lg active:scale-95 select-none cursor-pointer border-none"
                  >
                    <span className="text-white text-xs font-bold tracking-widest">
                      {multiOpenCount > 20 ? '🎬 Анимация (макс. 20 кейсов)' : '🎬 Крутить с Анимацией'}
                    </span>
                    <span className="text-[9px] font-mono text-indigo-200 font-semibold mt-0.5">
                      {multiOpenCount > 20 ? 'Выберите ≤ 20 для полосок на экране' : `${multiOpenCount} горизонтальных полосок`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* ROI / Статистика серии открытий */}
            {caseOpenedCount > 0 && (
              <div className="mt-6 bg-[#000000]/25 border border-slate-800/60 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#13151a]/40 py-2.5 rounded-xl border border-slate-850">
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Открыто кейсов</div>
                  <div className="font-mono text-sm text-slate-200">{caseOpenedCount} шт.</div>
                </div>
                <div className="bg-[#13151a]/40 py-2.5 rounded-xl border border-slate-850">
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Инвестировано</div>
                  <div className="font-mono text-sm text-rose-450 font-bold">{(caseSpent).toLocaleString()} ₽</div>
                </div>
                <div className="bg-[#13151a]/40 py-2.5 rounded-xl border border-slate-850">
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Стоимость дропа (ROI)</div>
                  <div className={`font-mono text-sm font-bold ${caseEarned >= caseSpent ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.2)]' : 'text-amber-500'}`}>
                    {(caseEarned).toLocaleString()} ₽ ({Math.round((caseEarned / (caseSpent || 1)) * 100)}%)
                  </div>
                </div>
              </div>
            )}

            {/* Ожидаемый Дроп */}
            <div className="mt-8 border-t border-slate-800/80 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Основные возможные награды в кейсе</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {ALL_ITEMS.filter(it => {
                  if (selectedCase.price >= 120000) {
                    return it.category.includes('Нож') || it.category.includes('Перчат') || it.rarity === 'mythical';
                  }
                  if (selectedCase.price >= 8000) {
                    return it.rarity !== 'common';
                  }
                  return true;
                }).slice(0, 12).map((item, id) => (
                  <div key={id} className={`bg-gradient-to-br ${item.bgGradient} border border-slate-800/80 rounded-xl p-3 text-center flex flex-col justify-between items-center transition`}>
                    {item.image.startsWith('http') ? (
                      <img src={item.image} alt={item.name} className="w-16 h-12 object-contain" referrerPolicy="no-referrer" onError={handleImageError} />
                    ) : (
                      <span className="text-2xl mb-1 select-none">{item.image}</span>
                    )}
                    <div className="text-[10px] font-semibold text-slate-200 line-clamp-2 leading-tight">
                      {item.name.includes('|') ? item.name.split('|')[1].trim() : item.name}
                    </div>
                    <div className="font-mono text-[9px] text-green-400 font-bold mt-2 bg-black/30 px-1.5 py-0.5 rounded-full border border-green-500/10">
                      {item.price.toLocaleString()} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- REVEAL MODAL --- */}
            {showResultModal && spinResult && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div 
                  style={{ borderColor: RARITY_DETAILS[spinResult.rarity].color }}
                  className="bg-[#13151a] border-2 max-w-sm w-full p-6 text-center rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)]"
                >
                  <h3 className="text-amber-400 font-mono tracking-widest text-sm uppercase mb-1">🎉 НАЙДЕН РЕДКИЙ ПРЕДМЕТ! 🎉</h3>
                  <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-wider">Предмет добавлен в ваш инвентарь</p>
                  
                  {/* Имитация карты CS:GO */}
                  <div className={`bg-gradient-to-br ${spinResult.bgGradient} border border-slate-800 p-6 rounded-xl flex flex-col items-center mb-6`}>
                    {spinResult.image.startsWith('http') ? (
                      <img src={spinResult.image} alt={spinResult.name} className="w-40 h-28 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] animate-pulse" referrerPolicy="no-referrer" onError={handleImageError} />
                    ) : (
                      <span className="text-6xl mb-3 animate-pulse select-none">{spinResult.image}</span>
                    )}
                    <div className="text-sm font-bold text-slate-100">{spinResult.name}</div>
                    <div className="text-[10px] font-medium tracking-wider uppercase mt-1 mb-3" style={{ color: RARITY_DETAILS[spinResult.rarity].color }}>
                      {RARITY_DETAILS[spinResult.rarity].name}
                    </div>
                    <div className="font-mono text-lg text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full">
                      {spinResult.price.toLocaleString()} ₽
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        const index = inventory.findIndex(it => it.itemId === spinResult.id);
                        if (index !== -1) {
                          const target = inventory[index];
                          sellItem(target.id, spinResult.price);
                          setJustSoldResult(true);
                          setShowResultModal(false);
                        }
                      }}
                      className="py-3 bg-green-500 hover:bg-green-600 text-black font-bold text-xs rounded-xl cursor-pointer transition active:scale-95"
                    >
                      Быстрая продажа
                    </button>
                    <button 
                      onClick={() => setShowResultModal(false)}
                      className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition active:scale-95"
                    >
                      В коллекцию
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- CONTRACT REVEAL MODAL --- */}
            {showContractResultModal && contractResultItem && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div 
                  style={{ borderColor: RARITY_DETAILS[contractResultItem.rarity].color }}
                  className="bg-[#13151a] border-2 max-w-sm w-full p-6 text-center rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] animate-fade-in"
                >
                  <h3 className="text-pink-500 font-mono tracking-widest text-sm uppercase mb-1">🔥 КОНТРАКТ ОБМЕНА ВЫПОЛНЕН! 🔥</h3>
                  <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-wider">Ваше полученное улучшенное оружие:</p>

                  <div className={`bg-gradient-to-br ${contractResultItem.bgGradient} border border-slate-800 p-6 rounded-xl flex flex-col items-center mb-6`}>
                    {contractResultItem.image.startsWith('http') ? (
                      <img src={contractResultItem.image} alt={contractResultItem.name} className="w-40 h-28 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] animate-pulse" referrerPolicy="no-referrer" onError={handleImageError} />
                    ) : (
                      <span className="text-6xl mb-3 animate-pulse select-none">{contractResultItem.image}</span>
                    )}
                    <div className="text-sm font-bold text-slate-100">{contractResultItem.name}</div>
                    <div className="text-[10px] font-medium tracking-wider uppercase mt-1 mb-3" style={{ color: RARITY_DETAILS[contractResultItem.rarity].color }}>
                      {RARITY_DETAILS[contractResultItem.rarity].name}
                    </div>
                    <div className="font-mono text-lg text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full">
                      {contractResultItem.price.toLocaleString()} ₽
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowContractResultModal(false)}
                    style={{ cursor: 'pointer' }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition active:scale-95"
                  >
                    Забрать оружие в инвентарь
                  </button>
                </div>
              </div>
            )}

            {/* --- MULTI OPEN RESULTS SUMMARY MODAL --- */}
            {showMultiOpenModal && multiOpenResults.length > 0 && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-[#121418] border border-slate-800 max-w-2xl w-full p-6 rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.2)] max-h-[85vh] flex flex-col">
                  <div className="text-center mb-4">
                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 font-mono tracking-widest text-lg font-black uppercase">
                      ⚡ СЕРИЯ РАСПАКОВАНА! ⚡
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Все скины зачислены в ваш инвентарь</p>
                  </div>

                  {/* Summary ROI Grid */}
                  {(() => {
                    const totalWorth = multiOpenResults.reduce((sum, item) => sum + item.price, 0);
                    const totalCost = selectedCase ? selectedCase.price * multiOpenResults.length : 0;
                    const diff = totalWorth - totalCost;
                    const isProfit = diff >= 0;

                    return (
                      <div className="grid grid-cols-3 gap-3 bg-black/40 border border-slate-850 p-4 rounded-xl mb-4 text-center">
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <div className="text-[9px] text-slate-500 uppercase font-semibold">Распаковано</div>
                          <div className="text-xs font-mono font-bold text-slate-200">{multiOpenResults.length} кейсов</div>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <div className="text-[9px] text-slate-500 uppercase font-semibold">Потрачено</div>
                          <div className="text-xs font-mono font-bold text-rose-400">{totalCost.toLocaleString()} ₽</div>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <div className="text-[9px] text-slate-500 uppercase font-semibold">Окупаемость</div>
                          <div className={`text-xs font-mono font-bold ${isProfit ? 'text-green-450' : 'text-rose-450'}`}>
                            {isProfit ? '+' : ''}{diff.toLocaleString()} ₽ ({Math.round((totalWorth / (totalCost || 1)) * 100)}%)
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Scrollable list of items */}
                  <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 no-scrollbar">
                    {multiOpenResults.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`bg-gradient-to-br ${item.bgGradient} border border-slate-850 p-3 rounded-xl flex flex-col justify-center items-center text-center relative shadow-sm`}
                      >
                        {item.image.startsWith('http') ? (
                          <img src={item.image} alt={item.name} className="w-16 h-10 object-contain filter drop-shadow mb-1" referrerPolicy="no-referrer" onError={handleImageError} />
                        ) : (
                          <span className="text-2xl mb-1 select-none filter drop-shadow">{item.image}</span>
                        )}
                        <div className="text-[9px] font-bold text-slate-100 line-clamp-1 truncate w-full px-1">{item.name.includes('|') ? item.name.split('|')[1].trim() : item.name}</div>
                        <div className="text-[8px] uppercase font-bold tracking-wider mt-0.5" style={{ color: RARITY_DETAILS[item.rarity].color }}>
                          {RARITY_DETAILS[item.rarity].name.split(' ')[0]}
                        </div>
                        <div className="font-mono text-[9px] text-green-400 font-bold mt-1.5 bg-black/40 px-2 py-0.5 rounded-md border border-green-500/5">
                          {item.price.toLocaleString()} ₽
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setShowMultiOpenModal(false)}
                    style={{ cursor: 'pointer' }}
                    className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition active:scale-95 shadow-lg border-none"
                  >
                    Забрать все {multiOpenResults.length} скинов в инвентарь
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'clicker' ? (
          /* --- TAB 1: МИНИ-ИГРЫ (САПЁР И КОИНФЛИП НА ДЕНЬГИ) --- */
          <div className="space-y-6">
            {/* Переключатель игр */}
            <div className="bg-[#13151a] border border-slate-800 p-2 rounded-2xl flex max-w-md mx-auto gap-2">
              <button
                type="button"
                onClick={() => setActiveMiniGame('mines')}
                style={{ cursor: 'pointer' }}
                className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl transition text-center select-none cursor-pointer ${
                  activeMiniGame === 'mines'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md font-black'
                    : 'bg-black/20 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                💣 Сапёр (Mines)
              </button>
              <button
                type="button"
                onClick={() => setActiveMiniGame('coinflip')}
                style={{ cursor: 'pointer' }}
                className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl transition text-center select-none cursor-pointer ${
                  activeMiniGame === 'coinflip'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md font-black'
                    : 'bg-black/20 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                🪙 Коинфлип
              </button>
            </div>

            {activeMiniGame === 'mines' ? (
              /* =================== САПЁР (MINES) =================== */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Панель управления Сапёром */}
                <div className="bg-[#13151a] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 h-full">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Настройка ставки</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Выберите сумму игры и количество скрытых мин</p>
                    </div>

                    {/* Поле Ввода Ставки */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">Ваша ставка, ₽:</span>
                        <span className="font-mono text-green-400">{minesBet.toLocaleString()} ₽</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <input
                          type="number"
                          min={10}
                          value={minesBet}
                          onChange={e => setMinesBet(Math.max(1, Number(e.target.value)))}
                          disabled={minesGameActive}
                          className="col-span-full w-full bg-black/40 border border-slate-850 px-3.5 py-2.5 rounded-xl text-slate-200 outline-none text-xs font-semibold focus:border-pink-500/30 font-mono disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setMinesBet(prev => Math.max(10, Math.floor(prev / 2)))}
                          disabled={minesGameActive}
                          className="py-1.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold hover:text-slate-200 rounded-lg active:scale-95 transition"
                        >
                          / 2
                        </button>
                        <button
                          type="button"
                          onClick={() => setMinesBet(prev => prev * 2)}
                          disabled={minesGameActive}
                          className="py-1.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold hover:text-slate-200 rounded-lg active:scale-95 transition"
                        >
                          x 2
                        </button>
                        <button
                          type="button"
                          onClick={() => setMinesBet(Math.floor(balance))}
                          disabled={minesGameActive}
                          className="py-1.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-450 font-bold hover:text-slate-200 rounded-lg active:scale-95 transition"
                        >
                          Ва-Банк
                        </button>
                      </div>
                    </div>

                    {/* Поле Ввода Мин */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">Количество мин (1 - 24):</span>
                        <span className="font-mono text-rose-450 font-bold">{minesCount} шт.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={1}
                          max={24}
                          value={minesCount}
                          onChange={e => setMinesCount(Number(e.target.value))}
                          disabled={minesGameActive}
                          className="flex-1 accent-rose-500 disabled:opacity-50 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[1, 3, 5, 10, 15, 20].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMinesCount(m)}
                            disabled={minesGameActive}
                            className={`px-2 py-1.5 text-[9px] font-mono font-bold rounded-md transition ${
                              minesCount === m
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-900 border border-slate-850 text-slate-450 hover:text-slate-350'
                            }`}
                          >
                            {m} {m === 1 ? 'мина' : m < 5 ? 'мины' : 'мин'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-slate-850">
                    {minesGameActive && minesSuccessfulClicks > 0 && (
                      <div className="bg-black/30 border border-green-500/10 p-3 rounded-2xl space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Текущий кэшаут:</div>
                        <div className="flex justify-between items-baseline">
                          <span className="font-mono font-bold text-green-400 text-lg">
                            {Math.floor(minesBet * getMinesMultiplier(minesSuccessfulClicks, minesCount)).toLocaleString()} ₽
                          </span>
                          <span className="text-indigo-400 font-mono text-xs font-semibold">
                            x{getMinesMultiplier(minesSuccessfulClicks, minesCount)}
                          </span>
                        </div>
                      </div>
                    )}

                    {!minesGameActive ? (
                      <button
                        type="button"
                        onClick={minesStartGame}
                        style={{ cursor: 'pointer' }}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition select-none cursor-pointer border-none"
                      >
                        🔥 Сделать Ставку
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={minesCashout}
                        disabled={minesSuccessfulClicks === 0}
                        style={{ cursor: minesSuccessfulClicks > 0 ? 'pointer' : 'not-allowed' }}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition select-none border-none"
                      >
                        💵 Забрать Выигрыш ({minesSuccessfulClicks > 0 ? getMinesMultiplier(minesSuccessfulClicks, minesCount) : 1}x)
                      </button>
                    )}
                  </div>
                </div>

                {/* Поле 5x5 */}
                <div className="lg:col-span-2 bg-[#13151a] border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
                  <div className="mb-4 text-center">
                    {!minesGameActive ? (
                      minesGameOver ? (
                        <div className="text-red-400 font-bold text-xs uppercase tracking-wider animate-bounce">
                          💥 БУМ! ВЫ НАСТУПИЛИ НА МИНУ (-{minesBet.toLocaleString()} ₽)
                        </div>
                      ) : minesGameWon ? (
                        <div className="text-green-400 font-bold text-xs uppercase tracking-wider animate-pulse">
                          🎉 УСПЕШНЫЙ ЗАБОР ДЕНЕГ! СИМУЛЯТОР СЧАСТЛИВ
                        </div>
                      ) : (
                        <div className="text-slate-400 font-medium text-xs">
                          Укажите сумму, число мин и нажмите «Сделать ставку»
                        </div>
                      )
                    ) : (
                      <div className="text-indigo-400 font-bold text-xs uppercase tracking-widest">
                        🎯 УСПЕШНЫХ ХОДОВ: <span className="font-mono text-green-400 font-black">{minesSuccessfulClicks}</span> из {25 - minesCount}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-3 w-full max-w-[340px] aspect-square">
                    {minesGrid.length > 0 ? (
                      minesGrid.map(cell => (
                        <button
                          key={cell.id}
                          type="button"
                          onClick={() => minesClickCell(cell.id)}
                          disabled={!minesGameActive || cell.isOpen}
                          style={{
                            cursor: minesGameActive && !cell.isOpen ? 'pointer' : 'default'
                          }}
                          className={`w-full aspect-square rounded-xl border flex items-center justify-center text-xl font-bold transition-all duration-150 select-none ${
                            cell.isOpen
                              ? cell.isMine
                                ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                : 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_12px_rgba(74,222,128,0.25)] flex flex-col justify-center gap-0.5'
                              : 'bg-slate-900 hover:bg-slate-850 hover:scale-[1.03] border-slate-800 text-slate-500'
                          }`}
                        >
                          {cell.isOpen ? (
                            cell.isMine ? (
                              '💣'
                            ) : (
                              <>
                                <span className="text-base">💎</span>
                                <span className="text-[7.5px] font-mono leading-none text-green-400 font-bold">Safe</span>
                              </>
                            )
                          ) : (
                            ''
                          )}
                        </button>
                      ))
                    ) : (
                      /* Плейсхолдер пустого поля до начала игры */
                      Array.from({ length: 25 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-full aspect-square bg-slate-900 border border-slate-800/60 rounded-xl flex items-center justify-center text-xs text-slate-700 select-none font-bold"
                        >
                          ?
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-6 flex gap-4 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">🟢 💎 Без мин</span>
                    <span className="flex items-center gap-1">🔴 💣 Мины</span>
                  </div>
                </div>
              </div>
            ) : (
              /* =================== КОИНФЛИП (COINFLIP) =================== */
              <div className="max-w-2xl mx-auto bg-[#13151a] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-200 uppercase tracking-widest">🪙 КЛАССИЧЕСКИЙ КОИНФЛИП 🪙</h3>
                  <p className="text-xs text-slate-450">Шанс выиграть удвоенную ставку с вероятностью 48.5%!</p>
                </div>

                {/* Анимационный контейнер монеты */}
                <div className="py-8 flex flex-col items-center justify-center">
                  <div
                    className={`w-32 h-32 rounded-full border-4 border-amber-400/40 bg-gradient-to-br from-amber-300 to-yellow-600 shadow-2xl flex items-center justify-center text-5xl select-none relative ${
                      coinflipIsSpinning ? 'animate-spin' : ''
                    }`}
                    style={{
                      animationDuration: '0.15s',
                      boxShadow: '0 0 25px rgba(245,158,11,0.25)'
                    }}
                  >
                    {coinflipResult === 'heads' ? '🦁' : coinflipResult === 'tails' ? '👑' : '🪙'}
                  </div>
                  {coinflipStatusText && (
                    <div className="mt-6 text-xs text-slate-300 font-semibold font-sans py-2 px-6 rounded-full bg-black/30 border border-slate-850 max-w-sm mx-auto">
                      {coinflipStatusText}
                    </div>
                  )}
                </div>

                {/* Настройка стороны */}
                <div className="space-y-2 max-w-sm mx-auto">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Выберите Вашу сторону монетка:</div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCoinflipSelectedSide('heads')}
                      disabled={coinflipIsSpinning}
                      className={`flex-1 py-3 text-xs font-bold rounded-xl border transition select-none flex items-center justify-center gap-1 ${
                        coinflipSelectedSide === 'heads'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-extrabold'
                          : 'bg-black/20 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <span>🦁</span> Орел (CT Side)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoinflipSelectedSide('tails')}
                      disabled={coinflipIsSpinning}
                      className={`flex-1 py-3 text-xs font-bold rounded-xl border transition select-none flex items-center justify-center gap-1 ${
                        coinflipSelectedSide === 'tails'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-extrabold'
                          : 'bg-black/20 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <span>👑</span> Решка (T Side)
                    </button>
                  </div>
                </div>

                {/* Настройка суммы Coinflip */}
                <div className="max-w-sm mx-auto space-y-2 border-t border-slate-850 pt-4">
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Сумма вашей ставки в Coinflip:</span>
                    <span className="font-mono text-green-400">{coinflipBet.toLocaleString()} ₽</span>
                  </div>
                  <input
                    type="number"
                    min={10}
                    value={coinflipBet}
                    onChange={e => setCoinflipBet(Math.max(1, Number(e.target.value)))}
                    disabled={coinflipIsSpinning}
                    className="w-full bg-black/40 border border-slate-850 px-3.5 py-2.5 rounded-xl text-slate-200 outline-none text-xs font-mono font-bold focus:border-purple-500/30 text-center disabled:opacity-50"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCoinflipBet(prev => Math.max(10, Math.floor(prev / 2)))}
                      disabled={coinflipIsSpinning}
                      className="flex-1 py-1 px-2 border border-slate-850 bg-slate-900 text-[10px] text-slate-400 font-semibold rounded-lg hover:text-slate-200"
                    >
                      / 2
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoinflipBet(prev => prev * 2)}
                      disabled={coinflipIsSpinning}
                      className="flex-1 py-1 px-2 border border-slate-850 bg-slate-900 text-[10px] text-slate-400 font-semibold rounded-lg hover:text-slate-200"
                    >
                      x 2
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoinflipBet(Math.floor(balance))}
                      disabled={coinflipIsSpinning}
                      className="flex-1 py-1 px-2 border border-slate-850 bg-slate-900 text-[10px] text-slate-450 font-semibold rounded-lg hover:text-slate-200"
                    >
                      Макс
                    </button>
                  </div>
                </div>

                {/* Кнопка броска */}
                <div className="max-w-sm mx-auto pt-2">
                  <button
                    type="button"
                    onClick={playCoinflip}
                    disabled={coinflipIsSpinning}
                    style={{ cursor: coinflipIsSpinning ? 'not-allowed' : 'pointer' }}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition disabled:opacity-50 border-none"
                  >
                    🎲 Бросить Монетку
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'cases' ? (
          /* --- TAB 2: КЕЙСЫ (СПИСОК ИЗ 100 ШТУК) --- */
          <div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input 
                  type="text" 
                  value={caseSearch}
                  onChange={e => setCaseSearch(e.target.value)}
                  placeholder="Быстрый поиск кейса..." 
                  className="w-full bg-[#13151a] border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-200 outline-none focus:border-pink-500/40 transition"
                />
              </div>
              
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'все', label: 'Все кейсы' },
                  { id: 'cheap', label: 'Бюджетные (<1 000 ₽)' },
                  { id: 'mid', label: 'Средние (1 000 ₽ - 10 000 ₽)' },
                  { id: 'elite', label: 'Элитные (10 000 ₽ - 50 000 ₽)' },
                  { id: 'royal', label: 'Королевские (50 000 ₽+)' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCaseCategoryFilter(cat.id)}
                    style={{ cursor: 'pointer' }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition whitespace-nowrap active:scale-95 cursor-pointer ${
                      caseCategoryFilter === cat.id 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-[#13151a] text-slate-400 border border-slate-850 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Сетка кейсов */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCases.map(c => {
                const styles = getCaseCategoryStyles(c.category);
                return (
                  <div 
                    key={c.id}
                    onClick={() => openCaseDetails(c)}
                    style={{ cursor: 'pointer' }}
                    className={`bg-[#13151a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-md hover:-translate-y-1 transition duration-200 group ${styles.border}`}
                  >
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-b ${styles.gradient} border border-slate-800/80 flex items-center justify-center mb-4 relative shadow-sm`} style={{ boxShadow: `0 0 15px ${styles.glow}` }}>
                      <Package className={`w-10 h-10 ${styles.iconColor} transition duration-300 group-hover:scale-110`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 line-clamp-1 mb-1">{c.name}</div>
                      <span className={`text-[9px] px-2 py-0.5 border rounded-full font-semibold uppercase ${styles.badge}`}>
                        {c.category}
                      </span>
                    </div>
                    <div className="w-full mt-4">
                      <div className="font-mono text-xs text-green-400 font-bold bg-green-500/5 hover:bg-green-500/10 border border-green-500/10 rounded-lg py-1.5 mb-2">
                        {c.price.toLocaleString()} ₽
                      </div>
                      <button className="w-full py-1 bg-pink-600 hover:bg-pink-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors select-none">
                        Смотреть
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredCases.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 text-xs">
                  Кейсов по вашему запросу не найдено.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'inventory' ? (
          /* --- TAB 3: ИНВЕНТАРЬ (ХРАНИЛИЩЕ) --- */
          <div>
            {/* Оценка */}
            <div className="bg-[#13151a] border border-slate-800 rounded-2xl p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">ОБЩАЯ ЦЕННОСТЬ СКИДОВ И ПРЕДМЕТОВ</div>
                <div className="text-2xl font-bold font-mono text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.4)]">
                  {totalInventoryValue.toLocaleString()} <span className="text-sm font-sans">₽</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                <button 
                  onClick={sellAllInventory}
                  disabled={inventory.length === 0}
                  style={{ cursor: inventory.length > 0 ? 'pointer' : 'not-allowed' }}
                  className="px-5 py-2.5 bg-green-500/10 hover:bg-green-500 hover:text-black hover:border-transparent text-green-400 border border-green-500/20 disabled:opacity-50 text-xs font-bold rounded-xl transition cursor-pointer select-none border-none"
                >
                  Продать ВСЁ за наличные
                </button>
              </div>
            </div>

            {/* Фильтры, Поиск и Группировка */}
            <div className="bg-[#13151a] border border-slate-800 rounded-2xl p-5 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Поиск */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={invSearch}
                    onChange={e => setInvSearch(e.target.value)}
                    placeholder="Поиск по названию или оружию..."
                    className="w-full bg-black/30 border border-slate-850 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 outline-none focus:border-indigo-500/40 transition placeholder:text-slate-500"
                  />
                </div>

                {/* Сортировка */}
                <div className="relative">
                  <select
                    value={invSortOrder}
                    onChange={e => setInvSortOrder(e.target.value as any)}
                    className="w-full bg-black/30 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-350 outline-none focus:border-indigo-500/40 transition appearance-none cursor-pointer"
                  >
                    <option value="price_desc">Сначала дорогие скины</option>
                    <option value="price_asc">Сначала дешевые скины</option>
                  </select>
                </div>

                {/* Переключатель группировки дубликатов */}
                <button
                  onClick={() => setGroupDuplicates(prev => !groupDuplicates)}
                  style={{ cursor: 'pointer' }}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border select-none cursor-pointer ${
                    groupDuplicates 
                      ? 'bg-indigo-650/20 border-indigo-500 text-indigo-400 font-black' 
                      : 'bg-black/20 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  {groupDuplicates ? '★ Одинаковые сгруппированы' : 'Сгруппировать одинаковые'}
                </button>
              </div>

              {/* Фильтр редкости */}
              <div className="border-t border-slate-850 pt-3.5 flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'все', label: 'Все редкости' },
                  { id: 'common', label: 'Ширпотреб' },
                  { id: 'rare', label: 'Засекречено' },
                  { id: 'epic', label: 'Запрещено' },
                  { id: 'legendary', label: 'Тайное' },
                  { id: 'mythical', label: '★ Экстра класс' }
                ].map(rar => (
                  <button
                    key={rar.id}
                    onClick={() => setInvRarityFilter(rar.id)}
                    style={{ cursor: 'pointer' }}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold transition whitespace-nowrap cursor-pointer select-none ${
                      invRarityFilter === rar.id 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-black/20 text-slate-400 border border-slate-850 hover:text-slate-200'
                    }`}
                  >
                    {rar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Список скинов */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {visibleInventory.map(item => (
                <div 
                  key={item.id}
                  className={`bg-gradient-to-br ${item.bgGradient} border border-slate-800/85 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-md relative group hover:border-slate-700 hover:-translate-y-0.5 transition duration-150`}
                >
                  {/* Количество сгруппированных предметов */}
                  {item.count > 1 && (
                    <span className="absolute top-2.5 left-2.5 bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-mono font-black text-[10px] z-10 shadow-lg border border-indigo-400/30 animate-pulse select-none">
                      x{item.count}
                    </span>
                  )}
                  
                  {item.image.startsWith('http') ? (
                    <img src={item.image} alt={item.name} className="w-24 h-16 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] mb-1" referrerPolicy="no-referrer" onError={handleImageError} />
                  ) : (
                    <span className="text-3xl mb-1 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] select-none">
                      {item.image}
                    </span>
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-100 line-clamp-2 min-h-[1.75rem] leading-tight mb-1">{item.name}</div>
                    <span className="text-[8px] uppercase tracking-wider font-bold" style={{ color: RARITY_DETAILS[item.rarity].color }}>
                      {RARITY_DETAILS[item.rarity].name.split(' ')[0]}
                    </span>
                  </div>

                  <div className="w-full mt-3 space-y-1.5">
                    <div className="font-mono text-[11px] text-green-400 font-bold bg-black/40 py-1.5 rounded-md">
                      {item.price.toLocaleString()} ₽ {item.count > 1 && <span className="text-[8px] text-slate-400 font-normal">/шт</span>}
                    </div>

                    {item.count > 1 ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button 
                          onClick={() => sellItem(item.id, item.price)}
                          style={{ cursor: 'pointer' }}
                          className="py-1.5 bg-red-650 hover:bg-red-500 text-white font-bold text-[8px] uppercase tracking-wider rounded-lg transition border-none select-none"
                        >
                          Сдать 1
                        </button>
                        <button 
                          onClick={() => sellMultipleItems(item.allItems.map(it => it.id), item.price)}
                          style={{ cursor: 'pointer' }}
                          className="py-1.5 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-650 hover:to-rose-500 text-white font-bold text-[8px] uppercase tracking-wider rounded-lg transition border-none select-none"
                          title={`Сдать все ${item.count} шт. за ${(item.price * item.count).toLocaleString()} ₽`}
                        >
                          Все ({item.count})
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => sellItem(item.id, item.price)}
                        style={{ cursor: 'pointer' }}
                        className="w-full py-1.5 bg-red-650 hover:bg-red-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition border-none select-none"
                      >
                        Продать
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Load more button */}
              {processedInventory.length > visibleInventoryLimit && (
                <div className="col-span-full flex flex-col items-center justify-center py-6 mt-2">
                  <button 
                    onClick={() => setVisibleInventoryLimit(prev => prev + 60)}
                    style={{ cursor: 'pointer' }}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-505 border border-indigo-400/20 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-indigo-500/10 active:scale-95 transition cursor-pointer select-none"
                  >
                    Показать еще (+60)
                  </button>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Отображается {visibleInventoryLimit} из {processedInventory.length} предметов
                  </p>
                </div>
              )}

              {processedInventory.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 text-xs">
                  Инвентарь пуст или ничего не найдено по фильтрам. Самого времени заглянуть в раздел кейсов!
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'contracts' ? (
          /* --- TAB 5: КОНТРАКТЫ ОБМЕНА --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="contracts-container">
            {/* Панель слотов контракта */}
            <div className="lg:col-span-2 bg-[#13151a] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-slate-800 pb-3 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Контракт обмена оружия (10 в 1)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Положите 10 скинов одной редкости, чтобы получить 1 случайный скин более высокого класса.
                  </p>
                </div>
                {selectedContractItemIds.length > 0 && (
                  <button 
                    onClick={() => setSelectedContractItemIds([])}
                    style={{ cursor: 'pointer' }}
                    className="p-1 px-2.5 text-[10px] uppercase font-bold text-slate-400 hover:text-slate-200 border border-slate-800 rounded bg-black/20"
                  >
                    Очистить контракт
                  </button>
                )}
              </div>

              {/* Сетка из 10 слотов */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const itemId = selectedContractItemIds[idx];
                  const item = itemId ? inventory.find(it => it.id === itemId) : null;
                  return item ? (
                    <div 
                      key={idx}
                      onClick={() => toggleItemInContract(item.id)}
                      style={{ cursor: 'pointer' }}
                      className={`bg-gradient-to-br ${item.bgGradient} border border-indigo-500/30 rounded-xl p-2 text-center flex flex-col justify-between items-center h-28 relative group transition`}
                    >
                      <button className="absolute top-1 right-1 w-4 h-4 bg-red-650 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold opacity-0 group-hover:opacity-100 transition shadow">
                        ✕
                      </button>
                      {item.image.startsWith('http') ? (
                        <img src={item.image} alt={item.name} className="w-14 h-10 object-contain drop-shadow" referrerPolicy="no-referrer" onError={handleImageError} />
                      ) : (
                        <span className="text-2xl mt-1 select-none">{item.image}</span>
                      )}
                      <div className="text-[9px] font-bold text-slate-100 line-clamp-1 truncate w-full px-1">{item.name.includes('|') ? item.name.split('|')[1].trim() : item.name}</div>
                      <div className="text-[7px] uppercase tracking-wider font-mono font-bold" style={{ color: RARITY_DETAILS[item.rarity].color }}>
                        {RARITY_DETAILS[item.rarity].name.split(' ')[0]}
                      </div>
                    </div>
                  ) : (
                    <div 
                      key={idx}
                      className="border border-slate-800 border-dashed rounded-xl h-28 flex flex-col items-center justify-center text-center bg-black/10 select-none text-slate-500 text-[10px] p-2 leading-tight"
                    >
                      <Plus className="w-4 h-4 text-slate-700 mb-1" />
                      Слот #{idx + 1}
                    </div>
                  );
                })}
              </div>

              {/* Кнопка запуска контракта */}
              <div className="flex flex-col items-center justify-center bg-black/40 border border-slate-800 rounded-2xl p-5 text-center">
                {selectedContractItemIds.length < 10 ? (
                  <div className="text-xs text-slate-400">
                    Добавьте ровно <span className="text-indigo-400 font-bold">{10 - selectedContractItemIds.length}</span> предметов из инвентаря справа, чтобы запустить контракт.
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="text-xs text-green-400 font-semibold mb-3 animate-pulse uppercase tracking-wider">
                      ★ КОНТРАКТ ГОТОВ К ПОДПИСАНИЮ ★
                    </div>
                    <button 
                      onClick={executeTradeUpContract}
                      style={{ cursor: 'pointer' }}
                      className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-pink-650 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-indigo-950/40 active:scale-95 transition"
                    >
                      Подписать Контракт Обмена
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Выбор предметов справа */}
            <div className="bg-[#13151a] border border-slate-800 rounded-3xl p-6 flex flex-col h-[520px] shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                Доступный инвентарь ({eligibleForContract.length})
              </h3>
              <p className="text-[10px] text-slate-500 mb-4 leading-normal">
                {selectedContractItemIds.length === 0 
                  ? "Выберите предмет из списка редкого, запрещенного, засекреченного или тайного качества, чтобы закрепить редкость у контракта."
                  : `Вы можете добавлять только предметы редкости: ${RARITY_DETAILS[contractRarity!].name.split(' ')[0]}`
                }
              </p>

              <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
                {eligibleForContract.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => toggleItemInContract(item.id)}
                    style={{ cursor: 'pointer' }}
                    className={`flex items-center gap-3 p-2 bg-black/20 hover:bg-black/40 border rounded-xl transition ${
                      selectedContractItemIds.includes(item.id) 
                        ? 'border-indigo-500/50 bg-indigo-950/10' 
                        : 'border-slate-850'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.bgGradient} flex items-center justify-center border border-slate-800 flex-shrink-0`}>
                      {item.image.startsWith('http') ? (
                        <img src={item.image} alt={item.name} className="w-10 h-8 object-contain" referrerPolicy="no-referrer" onError={handleImageError} />
                      ) : (
                        <span className="text-xl select-none">{item.image}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">{item.name}</div>
                      <div className="text-[9px] font-semibold mt-0.5" style={{ color: RARITY_DETAILS[item.rarity].color }}>
                        {RARITY_DETAILS[item.rarity].name.split(' ')[0]}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] text-green-400 font-semibold">{item.price.toLocaleString()} ₽</div>
                      {selectedContractItemIds.includes(item.id) && (
                        <span className="text-[8px] bg-indigo-900/60 text-indigo-350 font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block">
                          Взято
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {eligibleForContract.length === 0 && (
                  <div className="py-24 text-center text-slate-500 text-xs leading-relaxed">
                    Нет доступных предметов для контракта данной редкости.<br/>
                    Открывайте больше кейсов!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* --- TAB 4: УЛУЧШЕНИЯ SHOP --- */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Клик апгрейд */}
            <div className="bg-[#13151a] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <MousePointerClick className="w-10 h-10 text-indigo-400 mb-3" />
                <h3 className="font-bold text-slate-200 text-base mb-1">СИЛА КЛИКЕРА</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Повышает доход от ручного нажатия монеты на +3 рублей за уровень.
                </p>
                <div className="bg-black/40 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-indigo-300 inline-block mb-4 font-mono">
                  Текущий Уровень: <span className="font-bold">{clickLvl}</span>
                </div>
              </div>
              <div>
                <button 
                  onClick={buyClickUpgrade}
                  disabled={balance < clickUpgradeCost}
                  style={{ cursor: balance >= clickUpgradeCost ? 'pointer' : 'not-allowed' }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-50"
                >
                  Купить за {clickUpgradeCost.toLocaleString()} ₽
                </button>
              </div>
            </div>

            {/* Автокликер апгрейд */}
            <div className="bg-[#13151a] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <Cpu className="w-10 h-10 text-pink-400 mb-3" />
                <h3 className="font-bold text-slate-200 text-base mb-1">АВТОКЛИКЕР (РОБОТ)</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Автоматически добывает +5 рублей в секунду за уровень пассивно (робот работает без отдыха!).
                </p>
                <div className="bg-black/40 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-pink-300 inline-block mb-4 font-mono">
                  Авто-заработок: <span className="font-bold">{autoclickLvl * 5}</span> ₽/сек
                </div>
              </div>
              <div>
                <button 
                  onClick={buyAutoUpgrade}
                  disabled={balance < autoUpgradeCost}
                  style={{ cursor: balance >= autoUpgradeCost ? 'pointer' : 'not-allowed' }}
                  className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-50"
                >
                  Купить за {autoUpgradeCost.toLocaleString()} ₽
                </button>
              </div>
            </div>

            {/* Счастливая монетка */}
            <div className="bg-[#13151a] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <Sparkles className="w-10 h-10 text-amber-400 mb-3" />
                <h3 className="font-bold text-slate-200 text-base mb-1">ВЕЗУЧАЯ МОНЕТКА</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Увеличивает ваши шансы на мифические (голубые/золотые) и тайные выигрыши на +15% за уровень.
                </p>
                <div className="bg-black/40 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-amber-300 inline-block mb-4 font-mono">
                  Бонус к Удаче: <span className="font-bold">+{luckyLvl * 15}%</span>
                </div>
              </div>
              <div>
                <button 
                  onClick={buyLuckyUpgrade}
                  disabled={balance < luckyUpgradeCost}
                  style={{ cursor: balance >= luckyUpgradeCost ? 'pointer' : 'not-allowed' }}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-50"
                >
                  Купить за {luckyUpgradeCost.toLocaleString()} ₽
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Footer (Подвал) --- */}
      <footer className="text-center text-[10px] text-slate-500 py-10 mt-12 border-t border-slate-900 leading-relaxed max-w-4xl mx-auto">
        <p className="mb-1">
          🎰 Casino Case Clicker Simulator — шуточный игровой симулятор. Все заработанные рубли, открытые кейсы и полученное оружие (скины) являются исключительно цифровыми игровыми активами без реальной финансовой ценности.
        </p>
        <p>
          Разработано на React & Tailwind CSS. Нажмите «Скачать .HTML другу» для выгрузки автономного файла!
        </p>
      </footer>
    </div>
  );
}
