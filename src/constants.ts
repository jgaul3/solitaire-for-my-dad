import { Rank, Suit } from './types';

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_COLORS: Record<Suit, 'black' | 'red'> = {
  spades: 'black',
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
};

export const RANK_DISPLAY: Record<Rank, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

export const ALL_SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const ALL_RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export const TABLEAU_COLS = 10;
export const INITIAL_DEAL_COUNT = 54; // cards dealt to tableau initially
export const STOCK_DEAL_SIZE = 10; // cards per stock deal
export const SEQUENCE_LENGTH = 13; // K through A
