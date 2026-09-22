export type Theme = {
  dark: boolean;
  background: string;
  panel: string;
  panelInput: string;
  text: string;
  subtext: string;
  button: string;
  buttonText: string;
  danger: string;
  accent: string;
};

export const lightTheme: Theme = {
  dark: false,
  background: '#2CA02C',
  panel: '#2CA02C',
  panelInput: '#3FB33F',
  text: '#FFFFFF',
  subtext: '#EAF7EA',
  button: '#B29B77',
  buttonText: '#FFFFFF',
  danger: '#E5484D',
  accent: '#3FB33F',
};

export const darkTheme: Theme = {
  dark: true,
  background: '#121212',
  panel: '#1C1C1E',
  panelInput: '#2C2C2E',
  text: '#FFFFFF',
  subtext: '#A0A0A5',
  button: '#B29B77',
  buttonText: '#FFFFFF',
  danger: '#E5484D',
  accent: '#3FB33F',
};
