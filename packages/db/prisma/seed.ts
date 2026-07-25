import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Load the repo-root .env before instantiating Prisma (location-independent).
const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, '../../../.env') });

import {
  PrismaClient,
  CategoryKind,
  Currency,
  DepartureStatus,
  InclusionType,
  PackageStatus,
  PackageType,
  PostStatus,
  ReviewStatus,
  TransportType,
  UserStatus,
  VehicleClass,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS ?? 12);

// ---------------------------------------------------------------- RBAC ------

const RESOURCES = [
  'user',
  'role',
  'permission',
  'package',
  'destination',
  'booking',
  'payment',
  'invoice',
  'hotel',
  'flight',
  'visa',
  'post',
  'testimonial',
  'faq',
  'media',
  'setting',
  'review',
  'category',
  'tag',
  'notification',
  'auditlog',
  'contact',
  'newsletter',
  'transport',
] as const;

const ACTIONS = ['create', 'read', 'update', 'delete'] as const;

const EXTRA_PERMISSIONS = ['dashboard:read', 'analytics:read'] as const;

function buildPermissionKeys(): { key: string; group: string }[] {
  const perms: { key: string; group: string }[] = [];
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      perms.push({ key: `${resource}:${action}`, group: resource });
    }
  }
  for (const extra of EXTRA_PERMISSIONS) {
    const [group] = extra.split(':');
    perms.push({ key: extra, group: group ?? extra });
  }
  return perms;
}

const ROLE_DEFINITIONS: {
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  permissions: 'ALL' | ((keys: string[]) => string[]);
}[] = [
  {
    name: 'Super Admin',
    slug: 'super-admin',
    description: 'Full unrestricted access to the entire platform.',
    isSystem: true,
    permissions: 'ALL',
  },
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Operational administrator; manages bookings, catalog and content.',
    isSystem: true,
    permissions: (keys) => keys.filter((k) => !k.startsWith('role:') && !k.startsWith('permission:')),
  },
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Manages marketing content: packages, posts, testimonials, FAQs, media.',
    isSystem: true,
    permissions: (keys) =>
      keys.filter((k) =>
        ['package', 'post', 'testimonial', 'faq', 'media', 'category', 'tag', 'dashboard'].some(
          (g) => k.startsWith(`${g}:`),
        ),
      ),
  },
  {
    name: 'Support',
    slug: 'support',
    description: 'Customer support; reads and updates bookings, visa requests and customers.',
    isSystem: true,
    permissions: (keys) =>
      keys.filter(
        (k) =>
          k === 'dashboard:read' ||
          ['booking', 'visa', 'user', 'notification'].some(
            (g) => k === `${g}:read` || k === `${g}:update`,
          ),
      ),
  },
  {
    name: 'Customer',
    slug: 'customer',
    description: 'Default role for registered customers.',
    isSystem: true,
    permissions: () => [],
  },
];

async function seedRbac(): Promise<void> {
  const permissionDefs = buildPermissionKeys();

  await Promise.all(
    permissionDefs.map((p) =>
      prisma.permission.upsert({
        where: { key: p.key },
        update: { group: p.group },
        create: { key: p.key, group: p.group, description: p.key },
      }),
    ),
  );

  const allKeys = permissionDefs.map((p) => p.key);

  for (const role of ROLE_DEFINITIONS) {
    const record = await prisma.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name, description: role.description, isSystem: role.isSystem },
      create: {
        name: role.name,
        slug: role.slug,
        description: role.description,
        isSystem: role.isSystem,
      },
    });

    const grantedKeys = role.permissions === 'ALL' ? allKeys : role.permissions(allKeys);
    const grantedPerms = await prisma.permission.findMany({
      where: { key: { in: grantedKeys } },
      select: { id: true },
    });

    // Reset & reassign for idempotency.
    await prisma.rolePermission.deleteMany({ where: { roleId: record.id } });
    if (grantedPerms.length > 0) {
      await prisma.rolePermission.createMany({
        data: grantedPerms.map((perm) => ({ roleId: record.id, permissionId: perm.id })),
        skipDuplicates: true,
      });
    }
  }

  console.info(`  ✓ RBAC: ${permissionDefs.length} permissions, ${ROLE_DEFINITIONS.length} roles`);
}

async function seedAdmin(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@saudiluxurytravel.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
  const name = process.env.SEED_ADMIN_NAME ?? 'Platform Administrator';
  const [firstName, ...rest] = name.split(' ');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      firstName: firstName ?? 'Platform',
      lastName: rest.join(' ') || 'Administrator',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      locale: 'en',
    },
  });

  const superAdmin = await prisma.role.findUnique({ where: { slug: 'super-admin' } });
  if (superAdmin) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: superAdmin.id } },
      update: {},
      create: { userId: admin.id, roleId: superAdmin.id },
    });
  }

  console.info(`  ✓ Admin user: ${email}`);
}

async function seedSettings(): Promise<void> {
  const settings: { key: string; group: string; value: unknown }[] = [
    { key: 'site.name', group: 'general', value: 'Saudi Luxury Travel' },
    { key: 'site.defaultLocale', group: 'general', value: 'en' },
    { key: 'site.defaultCurrency', group: 'general', value: 'SAR' },
    { key: 'contact.email', group: 'contact', value: 'support@saudiluxurytravel.com' },
    { key: 'contact.phone', group: 'contact', value: '+966 11 000 0000' },
    { key: 'contact.whatsapp', group: 'contact', value: '+966500000000' },
    { key: 'booking.vatRate', group: 'booking', value: 0.15 },
    { key: 'payment.enabledProviders', group: 'payment', value: ['STRIPE', 'HYPERPAY', 'PAYTABS'] },
    { key: 'features.darkMode', group: 'features', value: true },
  ];

  await Promise.all(
    settings.map((s) =>
      prisma.setting.upsert({
        where: { key: s.key },
        update: { value: s.value as never, group: s.group },
        create: { key: s.key, group: s.group, value: s.value as never },
      }),
    ),
  );

  console.info(`  ✓ Settings: ${settings.length} entries`);
}

async function seedCatalog(): Promise<void> {
  // Destinations
  const makkah = await prisma.destination.upsert({
    where: { slug: 'makkah' },
    update: {},
    create: {
      slug: 'makkah',
      nameEn: 'Makkah',
      nameAr: 'مكة المكرمة',
      country: 'Saudi Arabia',
      city: 'Makkah',
      region: 'Makkah Province',
      isDomestic: true,
      latitude: 21.4225,
      longitude: 39.8262,
      featured: true,
    },
  });

  const madinah = await prisma.destination.upsert({
    where: { slug: 'madinah' },
    update: {},
    create: {
      slug: 'madinah',
      nameEn: 'Madinah',
      nameAr: 'المدينة المنورة',
      country: 'Saudi Arabia',
      city: 'Madinah',
      region: 'Madinah Province',
      isDomestic: true,
      latitude: 24.4686,
      longitude: 39.6142,
      featured: true,
    },
  });

  const alula = await prisma.destination.upsert({
    where: { slug: 'alula' },
    update: {},
    create: {
      slug: 'alula',
      nameEn: 'AlUla',
      nameAr: 'العلا',
      country: 'Saudi Arabia',
      city: 'AlUla',
      region: 'Madinah Province',
      isDomestic: true,
      latitude: 26.6167,
      longitude: 37.9167,
      featured: true,
    },
  });

  // Categories
  const catUmrah = await prisma.category.upsert({
    where: { kind_slug: { kind: CategoryKind.PACKAGE, slug: 'umrah' } },
    update: {},
    create: { kind: CategoryKind.PACKAGE, slug: 'umrah', nameEn: 'Umrah', nameAr: 'العمرة' },
  });
  const catHajj = await prisma.category.upsert({
    where: { kind_slug: { kind: CategoryKind.PACKAGE, slug: 'hajj' } },
    update: {},
    create: { kind: CategoryKind.PACKAGE, slug: 'hajj', nameEn: 'Hajj', nameAr: 'الحج' },
  });
  const catDomestic = await prisma.category.upsert({
    where: { kind_slug: { kind: CategoryKind.PACKAGE, slug: 'domestic-tours' } },
    update: {},
    create: {
      kind: CategoryKind.PACKAGE,
      slug: 'domestic-tours',
      nameEn: 'Domestic Tours',
      nameAr: 'الرحلات الداخلية',
    },
  });

  // Tags
  const tagLuxury = await prisma.tag.upsert({
    where: { slug: 'luxury' },
    update: {},
    create: { slug: 'luxury', nameEn: 'Luxury', nameAr: 'فاخر' },
  });
  const tagFamily = await prisma.tag.upsert({
    where: { slug: 'family' },
    update: {},
    create: { slug: 'family', nameEn: 'Family', nameAr: 'عائلي' },
  });

  const inFourteenDays = new Date();
  inFourteenDays.setDate(inFourteenDays.getDate() + 14);
  const returnUmrah = new Date(inFourteenDays);
  returnUmrah.setDate(returnUmrah.getDate() + 7);

  // Package: Premium Umrah
  await prisma.package.upsert({
    where: { slug: 'premium-umrah-7-nights' },
    update: {},
    create: {
      slug: 'premium-umrah-7-nights',
      type: PackageType.UMRAH,
      status: PackageStatus.PUBLISHED,
      titleEn: 'Premium Umrah — 7 Nights',
      titleAr: 'عمرة فاخرة — 7 ليالٍ',
      summaryEn: '5-star stays steps from the Haram in Makkah and Madinah with private transfers.',
      summaryAr: 'إقامة 5 نجوم على بعد خطوات من الحرم في مكة والمدينة مع تنقلات خاصة.',
      descriptionEn:
        'An elevated Umrah experience combining spiritual focus with genuine luxury: five-star hotels within walking distance of the Haramain, private air-conditioned transfers, guided ziyarat, and 24/7 concierge support throughout your journey.',
      descriptionAr:
        'تجربة عمرة راقية تجمع بين الروحانية والفخامة: فنادق خمس نجوم على مسافة قريبة من الحرمين، وتنقلات خاصة مكيّفة، وزيارات مصحوبة بمرشد، ودعم كونسيرج على مدار الساعة طوال رحلتك.',
      durationDays: 8,
      durationNights: 7,
      basePrice: 8500,
      salePrice: 7650,
      currency: Currency.SAR,
      maxGroupSize: 20,
      rating: 4.9,
      reviewCount: 128,
      featured: true,
      destinationId: makkah.id,
      categoryId: catUmrah.id,
      publishedAt: new Date(),
      images: {
        create: [
          { url: '/images/packages/umrah-1.jpg', altEn: 'Haram at dusk', altAr: 'الحرم عند الغروب', isCover: true, order: 0 },
          { url: '/images/packages/umrah-2.jpg', altEn: 'Luxury hotel suite', altAr: 'جناح فندقي فاخر', order: 1 },
        ],
      },
      itinerary: {
        create: [
          {
            dayNumber: 1,
            titleEn: 'Arrival in Jeddah & transfer to Makkah',
            titleAr: 'الوصول إلى جدة والانتقال إلى مكة',
            descriptionEn: 'Meet & greet at King Abdulaziz International Airport, private transfer to your hotel, and first Umrah with a guide.',
            descriptionAr: 'الاستقبال في مطار الملك عبدالعزيز الدولي، والانتقال الخاص إلى الفندق، وأداء العمرة الأولى مع مرشد.',
            location: 'Makkah',
          },
          {
            dayNumber: 5,
            titleEn: 'Transfer to Madinah',
            titleAr: 'الانتقال إلى المدينة',
            descriptionEn: 'High-comfort transfer to Madinah and check-in near Al-Masjid an-Nabawi.',
            descriptionAr: 'انتقال مريح إلى المدينة والتسجيل قرب المسجد النبوي.',
            location: 'Madinah',
          },
        ],
      },
      inclusions: {
        create: [
          { type: InclusionType.INCLUDED, labelEn: '5-star hotels near the Haram', labelAr: 'فنادق 5 نجوم قرب الحرم', order: 0 },
          { type: InclusionType.INCLUDED, labelEn: 'Private airport & intercity transfers', labelAr: 'تنقلات خاصة من المطار وبين المدن', order: 1 },
          { type: InclusionType.INCLUDED, labelEn: 'Guided ziyarat tours', labelAr: 'جولات زيارة مع مرشد', order: 2 },
          { type: InclusionType.EXCLUDED, labelEn: 'International flights', labelAr: 'الرحلات الدولية', order: 0 },
          { type: InclusionType.EXCLUDED, labelEn: 'Personal expenses', labelAr: 'المصاريف الشخصية', order: 1 },
        ],
      },
      departures: {
        create: [
          {
            departureDate: inFourteenDays,
            returnDate: returnUmrah,
            totalSeats: 20,
            bookedSeats: 6,
            status: DepartureStatus.OPEN,
          },
        ],
      },
      tags: { create: [{ tagId: tagLuxury.id }, { tagId: tagFamily.id }] },
    },
  });

  // Package: AlUla Heritage Escape
  await prisma.package.upsert({
    where: { slug: 'alula-heritage-escape' },
    update: {},
    create: {
      slug: 'alula-heritage-escape',
      type: PackageType.DOMESTIC_TOUR,
      status: PackageStatus.PUBLISHED,
      titleEn: 'AlUla Heritage Escape — 3 Nights',
      titleAr: 'رحلة تراث العلا — 3 ليالٍ',
      summaryEn: 'Discover Hegra, the Old Town and desert stargazing on a curated luxury escape.',
      summaryAr: 'اكتشف الحِجر والبلدة القديمة ومراقبة النجوم في الصحراء ضمن رحلة فاخرة منسقة.',
      descriptionEn:
        'Journey through millennia at AlUla: explore the UNESCO World Heritage site of Hegra, wander the Old Town, and end each day with fine dining under a canopy of stars at a boutique desert resort.',
      descriptionAr:
        'رحلة عبر آلاف السنين في العلا: استكشف موقع الحِجر المدرج في التراث العالمي لليونسكو، وتجول في البلدة القديمة، واختتم كل يوم بعشاء راقٍ تحت سماء مرصعة بالنجوم في منتجع صحراوي فاخر.',
      durationDays: 4,
      durationNights: 3,
      basePrice: 6200,
      currency: Currency.SAR,
      maxGroupSize: 12,
      rating: 4.8,
      reviewCount: 64,
      featured: true,
      destinationId: alula.id,
      categoryId: catDomestic.id,
      publishedAt: new Date(),
      images: {
        create: [
          { url: '/images/packages/alula-1.jpg', altEn: 'Hegra tombs', altAr: 'مقابر الحِجر', isCover: true, order: 0 },
        ],
      },
      inclusions: {
        create: [
          { type: InclusionType.INCLUDED, labelEn: 'Boutique desert resort stay', labelAr: 'إقامة في منتجع صحراوي فاخر', order: 0 },
          { type: InclusionType.INCLUDED, labelEn: 'Guided Hegra & Old Town tours', labelAr: 'جولات مرشدة في الحِجر والبلدة القديمة', order: 1 },
          { type: InclusionType.EXCLUDED, labelEn: 'Domestic flights', labelAr: 'الرحلات الداخلية', order: 0 },
        ],
      },
    },
  });

  // Package: Premium Hajj
  const hajjDeparture = new Date();
  hajjDeparture.setMonth(hajjDeparture.getMonth() + 6);
  const hajjReturn = new Date(hajjDeparture);
  hajjReturn.setDate(hajjReturn.getDate() + 14);

  await prisma.package.upsert({
    where: { slug: 'premium-hajj-14-nights' },
    update: {},
    create: {
      slug: 'premium-hajj-14-nights',
      type: PackageType.HAJJ,
      status: PackageStatus.PUBLISHED,
      titleEn: 'Premium Hajj — 14 Nights',
      titleAr: 'حج فاخر — 14 ليلة',
      summaryEn: 'A fully guided luxury Hajj with VIP camps in Mina and Arafat and five-star stays.',
      summaryAr: 'حج فاخر مصحوب بمرشد مع مخيمات VIP في منى وعرفات وإقامة خمس نجوم.',
      descriptionEn:
        'Perform the fifth pillar of Islam in comfort and tranquillity. This premium Hajj package includes upgraded air-conditioned camps in Mina and Arafat, five-star hotels in Makkah and Madinah, experienced scholars accompanying the group, and complete logistical support at every rite.',
      descriptionAr:
        'أدِّ الركن الخامس من الإسلام في راحة وطمأنينة. تشمل باقة الحج الفاخرة هذه مخيمات مكيّفة راقية في منى وعرفات، وفنادق خمس نجوم في مكة والمدينة، وعلماء متمرسين يرافقون المجموعة، ودعمًا لوجستيًا كاملًا في كل شعيرة.',
      durationDays: 15,
      durationNights: 14,
      basePrice: 32000,
      currency: Currency.SAR,
      maxGroupSize: 40,
      minGroupSize: 2,
      rating: 5,
      reviewCount: 47,
      featured: true,
      destinationId: makkah.id,
      categoryId: catHajj.id,
      publishedAt: new Date(),
      inclusions: {
        create: [
          { type: InclusionType.INCLUDED, labelEn: 'VIP air-conditioned camps in Mina & Arafat', labelAr: 'مخيمات VIP مكيّفة في منى وعرفات', order: 0 },
          { type: InclusionType.INCLUDED, labelEn: 'Five-star hotels in Makkah & Madinah', labelAr: 'فنادق خمس نجوم في مكة والمدينة', order: 1 },
          { type: InclusionType.INCLUDED, labelEn: 'Accompanying scholars & full logistics', labelAr: 'علماء مرافقون ودعم لوجستي كامل', order: 2 },
          { type: InclusionType.EXCLUDED, labelEn: 'International flights', labelAr: 'الرحلات الدولية', order: 0 },
        ],
      },
      departures: {
        create: [
          {
            departureDate: hajjDeparture,
            returnDate: hajjReturn,
            totalSeats: 40,
            bookedSeats: 12,
            status: DepartureStatus.OPEN,
          },
        ],
      },
      tags: { create: [{ tagId: tagLuxury.id }] },
    },
  });

  // Hotels
  await prisma.hotel.upsert({
    where: { slug: 'makkah-clock-royal-tower' },
    update: {},
    create: {
      slug: 'makkah-clock-royal-tower',
      nameEn: 'Makkah Clock Royal Tower',
      nameAr: 'برج الساعة الملكي بمكة',
      descriptionEn: 'Iconic five-star luxury overlooking the Masjid al-Haram.',
      descriptionAr: 'فخامة خمس نجوم أيقونية تطل على المسجد الحرام.',
      starRating: 5,
      city: 'Makkah',
      country: 'Saudi Arabia',
      distanceToHaramMeters: 100,
      basePricePerNight: 1450,
      currency: Currency.SAR,
      amenities: ['Haram view', 'Free WiFi', 'Prayer facilities', 'Fine dining', 'Concierge'],
      featured: true,
      destinationId: makkah.id,
      rooms: {
        create: [
          { nameEn: 'Deluxe Haram View', nameAr: 'ديلوكس بإطلالة على الحرم', capacity: 2, pricePerNight: 1850, boardType: 'BB' },
          { nameEn: 'Executive Suite', nameAr: 'جناح تنفيذي', capacity: 4, pricePerNight: 3200, boardType: 'HB' },
        ],
      },
    },
  });

  await prisma.hotel.upsert({
    where: { slug: 'madinah-hilton' },
    update: {},
    create: {
      slug: 'madinah-hilton',
      nameEn: 'Madinah Hilton',
      nameAr: 'هيلتون المدينة',
      starRating: 5,
      city: 'Madinah',
      country: 'Saudi Arabia',
      distanceToHaramMeters: 250,
      basePricePerNight: 980,
      currency: Currency.SAR,
      amenities: ['Near An-Nabawi', 'Free WiFi', 'Family rooms', 'Buffet restaurant'],
      featured: true,
      destinationId: madinah.id,
    },
  });

  console.info('  ✓ Catalog: destinations, categories, tags, packages, hotels');
}

async function seedTestimonialsAndFaqs(): Promise<void> {
  const testimonials = [
    {
      authorName: 'Ahmed Al-Rashid',
      authorTitle: 'Umrah pilgrim',
      country: 'United Arab Emirates',
      rating: 5,
      quoteEn: 'Flawless from start to finish. The proximity to the Haram and the private transfers made all the difference.',
      quoteAr: 'كل شيء كان مثاليًا من البداية للنهاية. القرب من الحرم والتنقلات الخاصة أحدثا فرقًا كبيرًا.',
    },
    {
      authorName: 'Sarah Thompson',
      authorTitle: 'Traveller',
      country: 'United Kingdom',
      rating: 5,
      quoteEn: 'The AlUla escape was breathtaking — impeccably organised and genuinely luxurious.',
      quoteAr: 'كانت رحلة العلا خلابة — منظمة بإتقان وفاخرة بحق.',
    },
  ];

  for (const [index, t] of testimonials.entries()) {
    const existing = await prisma.testimonial.findFirst({ where: { authorName: t.authorName } });
    if (!existing) {
      await prisma.testimonial.create({
        data: { ...t, status: ReviewStatus.APPROVED, featured: true, order: index },
      });
    }
  }

  const faqs = [
    {
      category: 'umrah',
      questionEn: 'Do I need a visa for Umrah?',
      questionAr: 'هل أحتاج تأشيرة للعمرة؟',
      answerEn: 'Most nationalities require an Umrah or tourist visa. We handle the full application on your behalf.',
      answerAr: 'تتطلب معظم الجنسيات تأشيرة عمرة أو سياحة. نتولى تقديم الطلب بالكامل نيابةً عنك.',
      order: 0,
    },
    {
      category: 'booking',
      questionEn: 'Can I pay in instalments?',
      questionAr: 'هل يمكنني الدفع على أقساط؟',
      answerEn: 'Yes. Many packages support a deposit at booking with the balance due before departure.',
      answerAr: 'نعم. تدعم العديد من الباقات دفع عربون عند الحجز مع سداد المتبقي قبل السفر.',
      order: 1,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({ where: { questionEn: faq.questionEn } });
    if (!existing) {
      await prisma.faq.create({ data: faq });
    }
  }

  console.info(`  ✓ ${testimonials.length} testimonials, ${faqs.length} FAQs`);
}

async function seedPosts(): Promise<void> {
  const admin = await prisma.user.findFirst({ where: { roles: { some: { role: { slug: 'super-admin' } } } } });
  if (!admin) return;

  await prisma.post.upsert({
    where: { slug: 'best-time-for-umrah' },
    update: {},
    create: {
      slug: 'best-time-for-umrah',
      status: PostStatus.PUBLISHED,
      titleEn: 'The Best Time of Year to Perform Umrah',
      titleAr: 'أفضل وقت في السنة لأداء العمرة',
      excerptEn: 'From weather to crowd levels, here is how to choose the perfect month for your Umrah.',
      excerptAr: 'من الطقس إلى مستويات الازدحام، إليك كيفية اختيار الشهر المثالي لعمرتك.',
      contentEn:
        'Choosing when to perform Umrah shapes your entire experience. The cooler months from November to February offer pleasant weather, while the weeks outside Ramadan mean shorter queues and more availability at premium hotels...',
      contentAr:
        'يحدد اختيار وقت أداء العمرة تجربتك بالكامل. توفر الأشهر الأكثر برودة من نوفمبر إلى فبراير طقسًا لطيفًا، بينما تعني الأسابيع خارج رمضان طوابير أقصر وتوفرًا أكبر في الفنادق الفاخرة...',
      readMinutes: 6,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  console.info('  ✓ 1 blog post');
}

async function seedTransport(): Promise<void> {
  const services = [
    {
      slug: 'jeddah-airport-to-makkah',
      type: TransportType.AIRPORT_TRANSFER,
      vehicleClass: VehicleClass.SUV,
      titleEn: 'Jeddah Airport → Makkah (Private SUV)',
      titleAr: 'مطار جدة ← مكة (سيارة دفع رباعي خاصة)',
      descriptionEn:
        'Private meet-and-greet transfer from King Abdulaziz International Airport directly to your Makkah hotel.',
      descriptionAr:
        'خدمة استقبال وتوصيل خاصة من مطار الملك عبدالعزيز الدولي مباشرة إلى فندقك في مكة.',
      fromCity: 'Jeddah',
      toCity: 'Makkah',
      capacity: 6,
      basePrice: 350,
      pricingUnit: 'per_trip',
      featuresEn: ['Meet & greet', 'Air-conditioned', 'Free waiting', 'Child seat on request'],
      featuresAr: ['استقبال وترحيب', 'مكيّف', 'انتظار مجاني', 'مقعد أطفال عند الطلب'],
      featured: true,
    },
    {
      slug: 'madinah-airport-to-hotel',
      type: TransportType.AIRPORT_TRANSFER,
      vehicleClass: VehicleClass.SEDAN,
      titleEn: 'Madinah Airport → Hotel (Private Sedan)',
      titleAr: 'مطار المدينة ← الفندق (سيارة سيدان خاصة)',
      descriptionEn:
        'Comfortable private transfer from Prince Mohammad Bin Abdulaziz Airport to your Madinah hotel.',
      descriptionAr: 'نقل خاص مريح من مطار الأمير محمد بن عبدالعزيز إلى فندقك في المدينة.',
      fromCity: 'Madinah',
      toCity: 'Madinah',
      capacity: 3,
      basePrice: 180,
      pricingUnit: 'per_trip',
      featuresEn: ['Meet & greet', 'Air-conditioned', 'Free waiting'],
      featuresAr: ['استقبال وترحيب', 'مكيّف', 'انتظار مجاني'],
    },
    {
      slug: 'makkah-madinah-intercity',
      type: TransportType.INTERCITY,
      vehicleClass: VehicleClass.VAN,
      titleEn: 'Makkah ⇄ Madinah (Private Van)',
      titleAr: 'مكة ⇄ المدينة (فان خاص)',
      descriptionEn:
        'Private intercity transfer between Makkah and Madinah in a spacious, air-conditioned van with a rest stop en route.',
      descriptionAr: 'نقل خاص بين مكة والمدينة في فان واسع ومكيّف مع استراحة في الطريق.',
      fromCity: 'Makkah',
      toCity: 'Madinah',
      capacity: 8,
      basePrice: 650,
      pricingUnit: 'per_trip',
      featuresEn: ['Spacious luggage space', 'Air-conditioned', 'Rest stop', 'Professional driver'],
      featuresAr: ['مساحة أمتعة واسعة', 'مكيّف', 'استراحة', 'سائق محترف'],
      featured: true,
    },
    {
      slug: 'ziyarat-makkah',
      type: TransportType.ZIYARAT,
      vehicleClass: VehicleClass.VAN,
      titleEn: 'Ziyarat Tour — Makkah Holy Sites',
      titleAr: 'جولة زيارة — المشاعر المقدسة بمكة',
      descriptionEn:
        'Guided ziyarat of the holy sites around Makkah — Mina, Muzdalifah, Arafat, Jabal al-Noor and Jabal Thawr — with a knowledgeable driver-guide.',
      descriptionAr:
        'زيارة مصحوبة بمرشد للأماكن المقدسة حول مكة — منى ومزدلفة وعرفات وجبل النور وجبل ثور — مع سائق مرشد على دراية.',
      city: 'Makkah',
      durationHours: 5,
      capacity: 8,
      basePrice: 450,
      pricingUnit: 'per_trip',
      featuresEn: ['Guided ziyarat', 'Mina · Arafat · Muzdalifah', 'Jabal al-Noor', 'Air-conditioned'],
      featuresAr: ['زيارة مع مرشد', 'منى · عرفات · مزدلفة', 'جبل النور', 'مكيّف'],
      featured: true,
    },
    {
      slug: 'ziyarat-madinah',
      type: TransportType.ZIYARAT,
      vehicleClass: VehicleClass.VAN,
      titleEn: 'Ziyarat Tour — Madinah Holy Sites',
      titleAr: 'جولة زيارة — معالم المدينة المقدسة',
      descriptionEn:
        'Guided ziyarat of Madinah — Quba Mosque, Qiblatain, the Seven Mosques, Mount Uhud and the martyrs of Uhud.',
      descriptionAr:
        'زيارة مصحوبة بمرشد في المدينة — مسجد قباء والقبلتين والمساجد السبعة وجبل أحد وشهداء أحد.',
      city: 'Madinah',
      durationHours: 4,
      capacity: 8,
      basePrice: 380,
      pricingUnit: 'per_trip',
      featuresEn: ['Quba & Qiblatain', 'Mount Uhud', 'Guided', 'Air-conditioned'],
      featuresAr: ['قباء والقبلتين', 'جبل أحد', 'مع مرشد', 'مكيّف'],
    },
    {
      slug: 'luxury-chauffeur-hourly',
      type: TransportType.HOURLY,
      vehicleClass: VehicleClass.LUXURY,
      titleEn: 'Luxury Chauffeur — Hourly',
      titleAr: 'سائق فاخر — بالساعة',
      descriptionEn:
        'A luxury vehicle with a professional chauffeur at your disposal, charged by the hour for maximum flexibility.',
      descriptionAr: 'سيارة فاخرة مع سائق محترف تحت تصرفك، بالحساب بالساعة لأقصى مرونة.',
      city: 'Makkah',
      durationHours: 1,
      capacity: 4,
      basePrice: 120,
      pricingUnit: 'per_hour',
      featuresEn: ['Luxury vehicle', 'Professional chauffeur', 'Flexible itinerary', 'Bottled water'],
      featuresAr: ['سيارة فاخرة', 'سائق محترف', 'برنامج مرن', 'مياه معبأة'],
    },
  ];

  for (const service of services) {
    await prisma.transportService.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }
  console.info(`  ✓ ${services.length} transport services`);
}

async function main(): Promise<void> {
  console.info('🌱 Seeding database...');
  await seedRbac();
  await seedAdmin();
  await seedSettings();
  await seedCatalog();
  await seedTransport();
  await seedTestimonialsAndFaqs();
  await seedPosts();
  console.info('✅ Seed complete.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
