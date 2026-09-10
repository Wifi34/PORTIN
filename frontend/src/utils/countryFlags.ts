export const COUNTRY_FLAG_MAP: Record<string, string> = {
  'Australia': '🇦🇺',
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'Indonesia': '🇮🇩',
  'Mozambique': '🇲🇿',
  'South Africa': '🇿🇦',
  'Russia': '🇷🇺',
  'Canada': '🇨🇦',
  'Brazil': '🇧🇷',
  'Colombia': '🇨🇴',
  'India': '🇮🇳',
  'China': '🇨🇳',
  'Singapore': '🇸🇬',
  'Netherlands': '🇳🇱',
  'UAE': '🇦🇪',
};

export const getCountryFlag = (country?: string): string => {
  if (!country) return '';
  const trimmed = country.trim();
  if (COUNTRY_FLAG_MAP[trimmed]) return COUNTRY_FLAG_MAP[trimmed];
  
  for (const [key, flag] of Object.entries(COUNTRY_FLAG_MAP)) {
    if (trimmed.toLowerCase().includes(key.toLowerCase())) {
      return flag;
    }
  }
  return '🌐';
};

export const getPortFlag = (portName?: string, fallbackCountry?: string): string => {
  if (!portName) return fallbackCountry ? getCountryFlag(fallbackCountry) : '';
  const lower = portName.toLowerCase();
  
  // Australia
  if (
    lower.includes('australia') ||
    lower.includes('hay point') ||
    lower.includes('gladstone') ||
    lower.includes('newcastle') ||
    lower.includes('abbot point') ||
    lower.includes('port hedland') ||
    lower.includes('dampier') ||
    lower.includes('port kembla')
  ) {
    return '🇦🇺';
  }

  // Indonesia
  if (
    lower.includes('indonesia') ||
    lower.includes('taboneo') ||
    lower.includes('balikpapan') ||
    lower.includes('samarinda') ||
    lower.includes('tanjung bara') ||
    lower.includes('bunati') ||
    lower.includes('tarahan')
  ) {
    return '🇮🇩';
  }

  // Mozambique
  if (
    lower.includes('mozambique') ||
    lower.includes('maputo') ||
    lower.includes('beira') ||
    lower.includes('nacala')
  ) {
    return '🇲🇿';
  }

  // South Africa
  if (
    lower.includes('south africa') ||
    lower.includes('richards bay') ||
    lower.includes('saldanha') ||
    lower.includes('durban')
  ) {
    return '🇿🇦';
  }

  // Russia
  if (
    lower.includes('russia') ||
    lower.includes('vostochny') ||
    lower.includes('vanino') ||
    lower.includes('ust-luga') ||
    lower.includes('taman') ||
    lower.includes('murmansk') ||
    lower.includes('novorossiysk')
  ) {
    return '🇷🇺';
  }

  // United States
  if (
    lower.includes('usa') ||
    lower.includes('united states') ||
    lower.includes('baltimore') ||
    lower.includes('norfolk') ||
    lower.includes('hampton roads') ||
    lower.includes('new orleans') ||
    lower.includes('houston') ||
    lower.includes('mobile') ||
    lower.includes('long beach')
  ) {
    return '🇺🇸';
  }

  // Canada
  if (
    lower.includes('canada') ||
    lower.includes('vancouver') ||
    lower.includes('prince rupert')
  ) {
    return '🇨🇦';
  }

  // Brazil & Colombia
  if (lower.includes('brazil') || lower.includes('tubarao') || lower.includes('itaqui')) {
    return '🇧🇷';
  }
  if (lower.includes('colombia') || lower.includes('puerto bolivar')) {
    return '🇨🇴';
  }

  // India
  if (
    lower.includes('india') ||
    lower.includes('paradip') ||
    lower.includes('visakhapatnam') ||
    lower.includes('gangavaram') ||
    lower.includes('dhamra') ||
    lower.includes('gopalpur') ||
    lower.includes('haldia') ||
    lower.includes('kolkata') ||
    lower.includes('chennai') ||
    lower.includes('kamarajar') ||
    lower.includes('ennore') ||
    lower.includes('mundra') ||
    lower.includes('kandla') ||
    lower.includes('jnpt') ||
    lower.includes('mumbai') ||
    lower.includes('cochin') ||
    lower.includes('tuticorin') ||
    lower.includes('odisha') ||
    lower.includes('andhra') ||
    lower.includes('tamil nadu') ||
    lower.includes('gujarat') ||
    lower.includes('west bengal')
  ) {
    return '🇮🇳';
  }

  if (fallbackCountry) return getCountryFlag(fallbackCountry);
  return '🌐';
};
