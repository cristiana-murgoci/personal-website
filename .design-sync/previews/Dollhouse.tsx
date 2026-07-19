import { Dollhouse, type ShelfBook } from 'cristiana-murgoci';

// Sample shelf shaped like the live Goodreads feed: deterministic geometry,
// leather-palette colors, realistic titles. The library.sys dialog only opens
// on interaction, so the card shows the closed house.
const shelf: ShelfBook[] = [
  { id: '1', title: 'The Courage to Be Disliked', spine: 'The Courage to Be Disliked', author: 'Ichiro Kishimi', link: 'https://www.goodreads.com', height: 172, width: 40, pattern: 0, color: '#92400E', textColor: '#F7F3EC' },
  { id: '2', title: 'Antifragile', spine: 'Antifragile', author: 'Nassim Nicholas Taleb', link: 'https://www.goodreads.com', height: 188, width: 52, pattern: 1, color: '#1D4ED8', textColor: '#F7F3EC' },
  { id: '3', title: 'Sapiens', spine: 'Sapiens', author: 'Yuval Noah Harari', link: 'https://www.goodreads.com', height: 164, width: 48, pattern: 2, color: '#15803D', textColor: '#F7F3EC' },
  { id: '4', title: 'Brotopia', spine: 'Brotopia', author: 'Emily Chang', link: 'https://www.goodreads.com', height: 148, width: 36, pattern: 0, color: '#86198F', textColor: '#F7F3EC' },
  { id: '5', title: 'Everybody Lies', spine: 'Everybody Lies', author: 'Seth Stephens-Davidowitz', link: 'https://www.goodreads.com', height: 156, width: 42, pattern: 1, color: '#9F1239', textColor: '#F7F3EC' },
  { id: '6', title: 'Never Enough', spine: 'Never Enough', author: 'Jennifer Breheny Wallace', link: 'https://www.goodreads.com', height: 180, width: 38, pattern: 2, color: '#B45309', textColor: '#F7F3EC' },
  { id: '7', title: 'Unmasking AI', spine: 'Unmasking AI', author: 'Joy Buolamwini', link: 'https://www.goodreads.com', height: 160, width: 44, pattern: 0, color: '#4A2E1B', textColor: '#F7F3EC' },
  { id: '8', title: 'Ikigai', spine: 'Ikigai', author: 'Héctor García', link: 'https://www.goodreads.com', height: 136, width: 28, pattern: 1, color: '#23504B', textColor: '#F7F3EC' },
];

export const TheHouse = () => <Dollhouse books={shelf} />;
