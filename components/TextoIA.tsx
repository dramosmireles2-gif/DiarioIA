import { useTema } from '@/contexts/ThemeContext';
import Markdown from 'react-native-markdown-display';

type Props = {
  texto: string;
};

export default function TextoIA({ texto }: Props) {
  const { colores } = useTema();

  return (
    <Markdown
      style={{
        body: { color: colores.texto, fontSize: 14, lineHeight: 22 },
        heading1: { color: colores.texto, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
        heading2: { color: colores.texto, fontSize: 17, fontWeight: 'bold', marginBottom: 6 },
        heading3: { color: colores.acento, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
        strong: { color: colores.texto, fontWeight: 'bold' },
        em: { color: colores.textoSecundario, fontStyle: 'italic' },
        blockquote: {
          backgroundColor: colores.acento + '15',
          borderLeftColor: colores.acento,
          borderLeftWidth: 4,
          paddingLeft: 12,
          paddingVertical: 8,
          marginVertical: 8,
          borderRadius: 4,
        },
        bullet_list: { marginVertical: 4 },
        ordered_list: { marginVertical: 4 },
        list_item: { marginVertical: 2 },
        code_inline: {
          backgroundColor: colores.fondoTarjeta,
          color: colores.acento,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
          fontSize: 13,
        },
        fence: {
          backgroundColor: colores.fondoTarjeta,
          padding: 12,
          borderRadius: 8,
          marginVertical: 8,
        },
        hr: { backgroundColor: colores.acento + '30', height: 1, marginVertical: 12 },
        paragraph: { marginVertical: 4 },
        link: { color: colores.acento },
      }}
    >
      {texto}
    </Markdown>
  );
}