// app/data/guessWhoData.js
export const guessWhoCharacters = [
  // الدور الأول - char1 إلى char10
  {
    id: 'char1',
    name: 'الشاب خالد',
    image: '../../alshabkhaled.jpg'
  },
  {
    id: 'char2',
    name: 'مريم',
    image: '../../merem.jpg'
  },
  {
    id: 'char3',
    name: 'ميسي',
    image: '../../messi.jpg'
  },
  {
    id: 'char4',
    name: 'رونالدو',
    image: '../../ronlado.jpg'
  },
  {
    id: 'char5',
    name: 'رايا',
    image: '../../raya.jpg'
  },
  {
    id: 'char6',
    name: 'شاكيرا',
    image: '../../shakera.jpg'
  },
  {
    id: 'char7',
    name: 'نانسي',
    image: '../../nansi.jpg'
  },
  {
    id: 'char8',
    name: 'عادل',
    image: '../../adel.jpg'
  },
  {
    id: 'char9',
    name: 'احمد',
    image: '../../ahmad.jpg'
  },
  {
    id: 'char10',
    name: 'هنيدي',
    image: '../../hnede.jpg'
  },

  // الدور الثاني - char11 إلى char20
  {
    id: 'char11',
    name: 'دربحة',
    image: '../../darbha.jpg'
  },
  {
    id: 'char12',
    name: 'عبسي',
    image: '../../fabsi.jpg'
  },
  {
    id: 'char13',
    name: 'جورجينا',
    image: '../../georgina.jpg'
  },
  {
    id: 'char14',
    name: 'ماهر',
    image: '../../mahercom.jpg'
  },
  {
    id: 'char15',
    name: 'مستر بيست',
    image: '../../mrbest.jpg'
  },
  {
    id: 'char16',
    name: 'صلاح',
    image: '../../salah.jpg'
  },
  {
    id: 'char17',
    name: 'ترامب',
    image: '../../tramp.jpg'
  },
  {
    id: 'char18',
    name: 'سبيد',
    image: '../../speed.jpg'
  },
  {
    id: 'char19',
    name: 'ام عصام',
    image: '../../omesam.jpg'
  },
  {
    id: 'char20',
    name: 'ابو فلة',
    image: '../../abofalah.jpg'
  }
];

// دالة للحصول على شخصيات الدور الأول (char1-char10)
export const getMatch1Characters = () => {
  return guessWhoCharacters.filter(char => {
    const charNumber = parseInt(char.id.replace('char', ''));
    return charNumber >= 1 && charNumber <= 10;
  });
};

// دالة للحصول على شخصيات الدور الثاني (char11-char20)
export const getMatch2Characters = () => {
  return guessWhoCharacters.filter(char => {
    const charNumber = parseInt(char.id.replace('char', ''));
    return charNumber >= 11 && charNumber <= 20;
  });
};