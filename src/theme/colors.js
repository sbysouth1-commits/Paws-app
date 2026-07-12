// Pawsitive Kids brand palette (see spec §2)
export const colors = {
  paper: '#FCFAF3', // app background
  purple: '#5B1F8B', // primary text / headings / Kid Mode accent
  yellow: '#EDBB0B', // primary CTA / buttons / price tags
  mauve: '#A085AD', // secondary accent
  green: '#0E5935', // used sparingly — one category accent only

  // derived tints for card backgrounds
  purpleTint: '#EFE7F6',
  yellowTint: '#FBF1CE',
  mauveTint: '#F1ECF3',
  greenTint: '#E3EFE8',

  textMuted: '#7A6E86',
  cardBorder: '#EAE4D8',
  white: '#FFFFFF',
};

export const fonts = {
  heading: 'Fraunces_700Bold',
  headingMedium: 'Fraunces_600SemiBold',
  body: 'PublicSans_400Regular',
  bodyMedium: 'PublicSans_500Medium',
  bodySemiBold: 'PublicSans_600SemiBold',
  bodyBold: 'PublicSans_700Bold',
  kid: 'Baloo2_700Bold', // Kid Mode only
};

// Category → icon (Ionicons) + accent. Green is reserved for exactly one
// category per the brand rules; everything else stays purple/mauve/yellow.
export const categories = {
  Emotions: { icon: 'heart', color: colors.purple, tint: colors.purpleTint },
  Communication: { icon: 'chatbubbles', color: colors.mauve, tint: colors.mauveTint },
  'Social Skills': { icon: 'people', color: colors.purple, tint: colors.purpleTint },
  Sensory: { icon: 'hand-left', color: colors.green, tint: colors.greenTint },
  'Motor Skills': { icon: 'bicycle', color: colors.mauve, tint: colors.mauveTint },
  Routines: { icon: 'sunny', color: colors.yellow, tint: colors.yellowTint },
};

export const categoryList = Object.keys(categories);
