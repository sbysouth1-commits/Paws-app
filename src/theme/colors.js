import { MessageCircle, Hand, Wind, Ear } from 'lucide-react-native';

// Design tokens lifted straight from the prototype (app_prototype3.jsx)
export const colors = {
  paper: '#FCFAF3',
  ink: '#5B1F8B',
  inkSoft: '#7C5F92',
  sageLight: '#F1EAF3',
  sage: '#A085AD',
  clay: '#EDBB0B',
  clayLight: '#FBF0C7',
  gold: '#EDBB0B',
  rose: '#5B1F8B',
  roseLight: '#EDE1F5',
  line: '#E9DFC9',
  white: '#FFFFFF',
};

export const fonts = {
  heading: 'Fraunces_600SemiBold',
  headingBold: 'Fraunces_700Bold',
  body: 'PublicSans_400Regular',
  bodyMedium: 'PublicSans_500Medium',
  bodySemiBold: 'PublicSans_600SemiBold',
  bodyBold: 'PublicSans_700Bold',
  kid: 'Baloo2_700Bold', // Kid Mode only
};

export const CATEGORY_META = {
  Speech: { icon: MessageCircle, color: '#7C8FBF' },
  OT: { icon: Hand, color: '#0E5935' },
  Sensory: { icon: Wind, color: colors.gold },
  Behaviour: { icon: Ear, color: colors.ink },
};

export const categoryList = Object.keys(CATEGORY_META);
