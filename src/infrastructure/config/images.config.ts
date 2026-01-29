/**
 * Images Configuration - Supabase Storage
 * @file src/infrastructure/config/images.config.ts
 * @description Centralized configuration for all public images
 */

// ============================================
// CONSTANTS
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const BUCKET_NAME = 'public-images';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generates the public URL for an image in Supabase Storage
 * @param path - Path to the image within the bucket
 * @returns Full public URL
 */
export const getImageUrl = (path: string): string => {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
};

// ============================================
// IMAGE PATHS CONFIGURATION
// ============================================

/**
 * Centralized image configuration organized by category
 */
export const imagesConfig = {
  // ============================================
  // DASHBOARD / HOME
  // ============================================
  dashboard: {
    riddlesV1: getImageUrl('dashboard/35d1669e562decf73035b54a0aa5a104d1a6c2c2cee4e704c992cdf8a86427fc.webp'),
    riddlesV2: getImageUrl('dashboard/2286cc1e0edf819ce4256e498dec352e8b6fc05f32263d41104dacaaa3737991.webp'),
    backgroundV1: getImageUrl('dashboard/a076a7e2c35970e29ff54ba0759f8ae275ffd8fda1fa6a500879f473aef9896b.webp'),
  },

  // ============================================
  // CONTENT CATEGORIES
  // ============================================
  stories: {
    v1: getImageUrl('stories/f6fc6f1376e16f01a5c0b713a78a83964301e575238444e395cad7f7f1fe8b03.webp'),
    v2: getImageUrl('stories/fe5be596ef78279cf4a2b738c9f96c2b879a635b66a4ccf54e65d41ab31b1b67.webp'),
  },

  poems: {
    v1: getImageUrl('poems/bddc57c5182caeca5e41c22e495c42415a1dd669bf69a45edd0ee63bf1b65c47.webp'),
    v2: getImageUrl('poems/3b0e0d6c60b06ed3d2e0d142f52476920c53d29721cc430c7d9a6be1a76be5ad.webp'),
  },

  tongueTwisters: {
    v1: getImageUrl('tongue-twisters/f707ecd7d109d1f3bd931e31c1edbd28ea019c445f73d860f536bbb99b9b3c39.webp'),
    v2: getImageUrl('tongue-twisters/7e078a9edc6c04ebd981318790088d3e630a32adbc7867ad4fbde28257f61415.webp'),
  },

  fables: {
    v1: getImageUrl('fables/30df9a0ed349680e986156d21bd9af865758d0e2651010071b137e4cbbd1d372.webp'),
  },

  comics: {
    v1: getImageUrl('comics/95068469bf257cf15b4f94e7cc87f75f28d5fdc4dd1519de50e74d79972058b3.webp'),
  },

  legends: {
    v1: getImageUrl('legends/c66d1de2c1220876dd325b71100c150f00af5ff7aed20e428201d3960a6a36db.webp'),
  },

  rhymes: {
    v1: getImageUrl('rhymes/25595838e1a75687bee294ea26bcb40d320c5a822be0fe460a04f3e91cd0afaa.webp'),
  },

  literacy: {
    v1: getImageUrl('literacy/6ec1cacc28b2f6e869123d93a0cdb67bae367231608d5c14e782357b9d51e616.webp'),
  },

  // ============================================
  // FEATURE TABS (for FeaturesSection)
  // ============================================
  featureTabs: {
    difference: getImageUrl('tabs/diferencia/9997a10622f3b74bfe7d644e5c39baf8400c6350a66547864ce7ba3831e60da1.png'),
    student: getImageUrl('tabs/estudiante/bbf107f2547d1e8623b9571a4f18beb078fbbd77ed6b2b00f89383d9ee3e265b.png'),
    parent: getImageUrl('tabs/padre/3e921843ee47403fcdc7f85e7d08f9e7be1a3336db2859a4ecb19c49dc907c95.png'),
    teacher: getImageUrl('tabs/docente/d611fd590d1beb39e8d854100dd2583ec6f7b0d4e17b8379713a9e84d159be62.png'),
    pricing: getImageUrl('tabs/precio/00f3f50127af3e8df221b3983a925e2a47045bfbfe38a34c317d3ee5b04ef514.png'),
  },

  // ============================================
  // FEATURE TABS (for FeaturesSection)
  // ============================================
  // featureTabs: {
  //   difference: getImageUrl('tabs/diferencia/9997a10622f3b74bfe7d644e5c39baf8400c6350a66547864ce7ba3831e60da1.png'),
  //   student: getImageUrl('tabs/estudiante/bbf107f2547d1e8623b9571a4f18beb078fbbd77ed6b2b00f89383d9ee3e265b.png'),
  //   parent: getImageUrl('tabs/padre/3e921843ee47403fcdc7f85e7d08f9e7be1a3336db2859a4ecb19c49dc907c95.png'),
  //   teacher: getImageUrl('tabs/docente/d611fd590d1beb39e8d854100dd2583ec6f7b0d4e17b8379713a9e84d159be62.png'),
  //   pricing: getImageUrl('tabs/precio/00f3f50127af3e8df221b3983a925e2a47045bfbfe38a34c317d3ee5b04ef514.png'),
  // },

  // ============================================
  // PLACEHOLDERS
  // ============================================
  placeholders: {
    default: '/images/placeholder.jpg',
    book: getImageUrl('placeholders/book.webp'),
    avatar: getImageUrl('placeholders/avatar.webp'),
  },
} as const;

// ============================================
// TYPES
// ============================================

export type ImageCategory = keyof typeof imagesConfig;
export type ImageKey<T extends ImageCategory> = keyof (typeof imagesConfig)[T];