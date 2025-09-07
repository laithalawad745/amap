// app/arab/page.jsx
import ArabGame from '../../components/ArabGame';

export const metadata = {
  title: 'حول الوطن العربي - Absi',
  description: 'لعبة حول الوطن العربي - اكتشف الدول العربية وأجب على الأسئلة!',
};

export default function ArabGamePage() {
  return <ArabGame />;
}