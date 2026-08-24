import { useTheme } from '../context/ThemeContext'

const light = {
  bg:             '#f7f4ee',
  card:           '#fcfaf6',
  cardBorder:     '#e6e1d7',
  text:           '#16231f',
  textSecondary:  '#78827a',
  textMuted:      '#879087',
  textLight:      '#abb6ad',
  textHero:       '#b0bab0',
  border:         '#e3ded3',
  borderTable:    '#eee9df',
  dark:           '#17231f',
  darkMid:        '#273731',
  darkBorder:     '#324039',
  primary:        '#e86f3d',
  primaryFg:      '#fff9f1',
  success:        '#627b68',
  successBg:      '#e8eee5',
  warning:        '#f29a69',
  danger:         '#c0392b',
  dangerBg:       '#fde8e8',
}

const dark = {
  bg:             '#101a18',
  card:           '#182824',
  cardBorder:     '#21362f',
  text:           '#f7f2e8',
  textSecondary:  '#9eaea4',
  textMuted:      '#70847b',
  textLight:      '#b9c1b9',
  textHero:       '#b9c1b9',
  border:         '#30463e',
  borderTable:    '#30463e',
  dark:           '#0d1715',
  darkMid:        '#1a2e28',
  darkBorder:     '#253a32',
  primary:        '#e86f3d',
  primaryFg:      '#fff9f1',
  success:        '#4a7a5a',
  successBg:      '#1a2e22',
  warning:        '#f29a69',
  danger:         '#c0392b',
  dangerBg:       '#3a1a1a',
}

export default function useColors() {
  const { darkMode } = useTheme()
  return darkMode ? dark : light
}
