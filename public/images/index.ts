const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL as string;

export const images = {
  dashboard: {
    adivinanzasv1: `${baseUrl}/imgs/dashboard/35d1669e562decf73035b54a0aa5a104d1a6c2c2cee4e704c992cdf8a86427fc.webp`,
    adivinanzasv2: `${baseUrl}/imgs/dashboard/2286cc1e0edf819ce4256e498dec352e8b6fc05f32263d41104dacaaa3737991.webp`,
    fondov1:       `${baseUrl}/imgs/dashboard/a076a7e2c35970e29ff54ba0759f8ae275ffd8fda1fa6a500879f473aef9896b.webp`,
  },
  cuentos: {
    v1: `${baseUrl}/imgs/cuentos/f6fc6f1376e16f01a5c0b713a78a83964301e575238444e395cad7f7f1fe8b03.webp`,
    v2: `${baseUrl}/imgs/cuentos/fe5be596ef78279cf4a2b738c9f96c2b879a635b66a4ccf54e65d41ab31b1b67.webp`,
  },
  poemas: {
    v1: `${baseUrl}/imgs/poemas/bddc57c5182caeca5e41c22e495c42415a1dd669bf69a45edd0ee63bf1b65c47.webp`,
    v2: `${baseUrl}/imgs/poemas/3b0e0d6c60b06ed3d2e0d142f52476920c53d29721cc430c7d9a6be1a76be5ad.webp`,
  },
  trabalenguas: {
    v1: `${baseUrl}/imgs/trabalenguas/f707ecd7d109d1f3bd931e31c1edbd28ea019c445f73d860f536bbb99b9b3c39.webp`,
    v2: `${baseUrl}/imgs/trabalenguas/7e078a9edc6c04ebd981318790088d3e630a32adbc7867ad4fbde28257f61415.webp`,
  },
  fabulas: {
    v1: `${baseUrl}/imgs/fabulas/30df9a0ed349680e986156d21bd9af865758d0e2651010071b137e4cbbd1d372.webp`,
  },
  historietas: {
    v1: `${baseUrl}/imgs/historietas/95068469bf257cf15b4f94e7cc87f75f28d5fdc4dd1519de50e74d79972058b3.webp`,
  },
  leyendas: {
    v1: `${baseUrl}/imgs/leyendas/c66d1de2c1220876dd325b71100c150f00af5ff7aed20e428201d3960a6a36db.webp`,
  },
  retahilas: {
    v1: `${baseUrl}/imgs/retahilas/25595838e1a75687bee294ea26bcb40d320c5a822be0fe460a04f3e91cd0afaa.webp`,
  },
  lectoescritura: {
    v1: `${baseUrl}/imgs/lectoescritura/6ec1cacc28b2f6e869123d93a0cdb67bae367231608d5c14e782357b9d51e616.webp`,
  },
};