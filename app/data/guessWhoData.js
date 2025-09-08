// app/data/guessWhoData.js
export const guessWhoCharacters = [
  // الدور الأول - لاعبي ريال مدريد (char1 إلى char10)
  {
    id: 'char1',
    name: 'كاما',
    image: '../../cama.jpg'
  },
  {
    id: 'char2',
    name: 'إندريك',
    image: '../../endrick.jpg'
  },
  {
    id: 'char3',
    name: 'رودريجو',
    image: '../../rodrigojpg.jpg'
  },
  {
    id: 'char4',
    name: 'روديجر',
    image: '../../rodeger.jpg'
  },
  {
    id: 'char5',
    name: 'مبابي',
    image: '../../mbabe.jpg'
  },
  {
    id: 'char6',
    name: 'فينيسيوس',
    image: '../../vini.jpg'
  },
  {
    id: 'char7',
    name: 'أرنولد',
    image: '../../arnold.jpg'
  },
  {
    id: 'char8',
    name: 'كروس',
    image: '../../kros.jpg'
  },
  {
    id: 'char9',
    name: 'فالفيردي',
    image: '../../falverde.jpg'
  },
  {
    id: 'char10',
    name: 'بنزيما',
    image: '../../benzema.jpg'
  },

  // الدور الثاني - الشخصيات الأولى السابقة (char11 إلى char20)
  {
    id: 'char11',
    name: 'الشاب خالد',
    image: '../../alshabkhaled.jpg'
  },
  {
    id: 'char12',
    name: 'مريم',
    image: '../../merem.jpg'
  },
  {
    id: 'char13',
    name: 'ميسي',
    image: '../../messi.jpg'
  },
  {
    id: 'char14',
    name: 'رونالدو',
    image: '../../ronlado.jpg'
  },
  {
    id: 'char15',
    name: 'رايا',
    image: '../../raya.jpg'
  },
  {
    id: 'char16',
    name: 'شاكيرا',
    image: '../../shakera.jpg'
  },
  {
    id: 'char17',
    name: 'نانسي',
    image: '../../nansi.jpg'
  },
  {
    id: 'char18',
    name: 'عادل',
    image: '../../adel.jpg'
  },
  {
    id: 'char19',
    name: 'احمد',
    image: '../../ahmad.jpg'
  },
  {
    id: 'char20',
    name: 'هنيدي',
    image: '../../hnede.jpg'
  },

  // الدور الثالث - الشخصيات الثانية السابقة (char21 إلى char30)
  {
    id: 'char21',
    name: 'دربحة',
    image: '../../darbha.jpg'
  },
  {
    id: 'char22',
    name: 'عبسي',
    image: '../../fabsi.jpg'
  },
  {
    id: 'char23',
    name: 'جورجينا',
    image: '../../georgina.jpg'
  },
  {
    id: 'char24',
    name: 'ماهر',
    image: '../../mahercom.jpg'
  },
  {
    id: 'char25',
    name: 'مستر بيست',
    image: '../../mrbest.jpg'
  },
  {
    id: 'char26',
    name: 'صلاح',
    image: '../../salah.jpg'
  },
  {
    id: 'char27',
    name: 'ترامب',
    image: '../../tramp.jpg'
  },
  {
    id: 'char28',
    name: 'سبيد',
    image: '../../speed.jpg'
  },
  {
    id: 'char29',
    name: 'ام عصام',
    image: '../../omesam.jpg'
  },
  {
    id: 'char30',
    name: 'ابو فلة',
    image: '../../abofalah.jpg'
  }
];

// دالة للحصول على لاعبي ريال مدريد (char1-char10)
export const getMatch1Characters = () => {
  return guessWhoCharacters.filter(char => {
    const charNumber = parseInt(char.id.replace('char', ''));
    return charNumber >= 1 && charNumber <= 10;
  });
};

// دالة للحصول على الشخصيات الأولى السابقة (char11-char20)
export const getMatch2Characters = () => {
  return guessWhoCharacters.filter(char => {
    const charNumber = parseInt(char.id.replace('char', ''));
    return charNumber >= 11 && charNumber <= 20;
  });
};

// دالة للحصول على الشخصيات الثانية السابقة (char21-char30)
export const getMatch3Characters = () => {
  return guessWhoCharacters.filter(char => {
    const charNumber = parseInt(char.id.replace('char', ''));
    return charNumber >= 21 && charNumber <= 30;
  });
};