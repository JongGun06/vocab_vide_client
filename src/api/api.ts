const BASE_URL = 'https://vocab-vide-logic.vercel.app/'; 

export const fetchRandomCurse = async () => {
  const res = await fetch(`${BASE_URL}/curses/random`);
  return await res.json();
};