import { useTheme as useThemeContext } from '../context/ThemeContext';

export const useTheme = useThemeContext;

export const getThemeColors = (theme: string) => {
  const themeColors = {
    'purple-blue': {
      primary: 'purple-blue-600',
      secondary: 'purple-blue-500',
      accent: 'indigo-cyan-500',
      background: 'purple-blue-50',
      text: 'purple-blue-900',
    },
    'green-teal': {
      primary: 'green-teal-600',
      secondary: 'green-teal-500',
      accent: 'emerald-500',
      background: 'green-teal-50',
      text: 'green-teal-900',
    },
    'orange-pink': {
      primary: 'orange-pink-600',
      secondary: 'orange-pink-500',
      accent: 'pink-500',
      background: 'orange-pink-50',
      text: 'orange-pink-900',
    },
    'indigo-cyan': {
      primary: 'indigo-cyan-600',
      secondary: 'indigo-cyan-500',
      accent: 'sky-500',
      background: 'indigo-cyan-50',
      text: 'indigo-cyan-900',
    },
    'dark': {
      primary: 'dark-600',
      secondary: 'dark-500',
      accent: 'gray-400',
      background: 'dark-900',
      text: 'dark-100',
    },
  };

  return themeColors[theme as keyof typeof themeColors] || themeColors['purple-blue'];
};
