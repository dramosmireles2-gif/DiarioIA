import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Tema = 'oscuro' | 'claro' | 'sistema';

type ThemeContextType = {
  tema: Tema;
  cambiarTema: (tema: Tema) => void;
  colores: typeof temaOscuro;
};

const temaOscuro = {
  fondo: '#121212',
  fondoTarjeta: '#1e1e1e',
  texto: '#e0e0e0',
  textoSecundario: '#9b9b9b',
  acento: '#7c6af7',
};

const temaClaro = {
  fondo: '#f7f7f9',
  fondoTarjeta: '#ffffff',
  texto: '#1a1a2e',
  textoSecundario: '#666666',
  acento: '#7c6af7',
};

const ThemeContext = createContext<ThemeContextType>({
  tema: 'oscuro',
  cambiarTema: () => {},
  colores: temaOscuro,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>('oscuro');
  const sistemaOscuro = useColorScheme() === 'dark';

  useEffect(() => {
    cargarTema();
  }, []);

  const cargarTema = async () => {
    const datos = await AsyncStorage.getItem('tema');
    if (datos) setTema(datos as Tema);
  };

  const cambiarTema = async (nuevoTema: Tema) => {
    setTema(nuevoTema);
    await AsyncStorage.setItem('tema', nuevoTema);
  };

  const resolverColores = () => {
    if (tema === 'claro') return temaClaro;
    if (tema === 'oscuro') return temaOscuro;
    // Sistema: usa el tema del celular
    return sistemaOscuro ? temaOscuro : temaClaro;
  };

  return (
    <ThemeContext.Provider value={{ tema, cambiarTema, colores: resolverColores() }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTema = () => useContext(ThemeContext);