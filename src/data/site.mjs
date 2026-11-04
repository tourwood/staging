// Single source of truth for copy that appears in more than one place.
// Wording is taken from the Tourwood company profile PDF unless noted.

export const site = {
  name: 'Tourwood Property Services',
  legal: 'Antros Services Pty Ltd T/A Tourwood Property Services',
  abn: '31 369 552 480',
  licence: 'VICLHL 06212',
  phone: '03 9853 6330',
  phoneHref: '+61398536330',
  fax: '03 9853 0915',
  addressLines: ['Suite 213, 1 Princess Street', 'Kew, Victoria 3101'],
  // Email is never written into the HTML as plain text; the build encodes it.
  emailUser: 'info',
  emailDomain: 'tourwood.com.au',
  tagline: 'Service & Quality Never Cost As Much As They Save',
};

// Image registry: file stem -> available widths (px) and intrinsic ratio.
export const images = {
  office: { widths: [900, 1785], w: 1785, h: 1095, alt: 'Modern glass office building surrounded by landscaped gardens' },
  highrise: { widths: [900, 1545], w: 1545, h: 735, alt: 'High rise apartment towers with landscaped communal gardens' },
  industrial: { widths: [900, 1545], w: 1545, h: 615, alt: 'Industrial warehouse with roller doors and a concrete forecourt' },
};

export const services = [
  {
    slug: 'commercial-industrial',
    seoTitle: 'Commercial & Industrial Cleaning and Maintenance, Victoria',
    ctaLine: 'Discuss commercial and industrial cleaning / maintenance services for your property.',
    title: 'Commercial & Industrial',
    short: 'Offices, factories, warehouses, retail sites, medical facilities and showrooms.',
    img: 'industrial',
    lead:
      'Cleaning and maintenance for offices, factories, warehouses, retail sites, medical facilities and showrooms, arranged on an ongoing or ad hoc basis.',
    points: [
      ['Ongoing programmes', 'Scheduled cleaning and maintenance, set up around how your site actually operates.'],
      ['Ad hoc services', 'One-off jobs when you need them, without having to find a new contractor each time.'],
      ['Property types we work in', 'Offices, factories, retail sites, medical facilities, warehouses and showrooms.'],
    ],
  },
  {
    slug: 'high-rise-residential',
    seoTitle: 'High Rise Residential Cleaning and Maintenance, Victoria',
    ctaLine: 'Discuss cleaning / maintenance services for your high rise residential property.',
    title: 'High Rise Residential',
    short: 'Common-area cleaning and maintenance with a consistent point of contact.',
    img: 'highrise',
    pos: '88% 50%',
    lead:
      'Maintenance and cleaning for residential building common areas, with coordinated service schedules and a consistent point of contact.',
    points: [
      ['Coordinated schedules', 'Cleaning and maintenance planned together, so residents see fewer disruptions.'],
      ['A consistent point of contact', 'One team to call for requests and follow-up, rather than several contractors.'],
      ['Records you can rely on', 'Requests, interactions and service schedules are logged in our Customer Services Database.'],
    ],
  },
  {
    slug: 'body-corporate',
    seoTitle: 'Body Corporate Cleaning and Maintenance, Victoria',
    ctaLine: 'Discuss cleaning / maintenance services for your body corporate managed property.',
    title: 'Body Corporate',
    short: 'Foyers, corridors, stairwells, car parks and grounds, serviced on a routine.',
    img: 'highrise',
    pos: '8% 70%',
    lead:
      'Cleaning and maintenance of shared spaces, with support for body corporate managers through routine servicing, periodic cleaning and maintenance requests.',
    points: [
      ['Shared spaces', 'Foyers, corridors, stairwells, common amenities, car parks and grounds.'],
      ['Support for managers', 'Routine servicing, periodic cleaning and maintenance requests handled through one team.'],
      ['Signed-off periodic work', 'Periodic carpet, vinyl and window cleaning is scheduled by frequency, flagged for completion and signed off by the client.'],
    ],
  },
  {
    slug: 'maintenance-specialist',
    seoTitle: 'Property Maintenance, Repairs & Specialist Cleaning, Victoria',
    title: 'Maintenance & Specialist Services',
    short: 'Repairs, refurbishment, specialist cleaning, grounds and site support.',
    img: 'office',
    lead:
      'A broad range of building maintenance, repairs and specialist services, backed by our licensed commercial and domestic building units.',
    points: [
      ['Building maintenance & repairs', 'Repairs, refurbishment and fit-out; painting, carpentry, glazing and structural work; plumbing and electrical services.'],
      ['Specialist cleaning', 'Window cleaning, carpet and upholstery cleaning, high pressure washing, car park cleaning, commercial sweeping and solid surface buffing.'],
      ['Site support & grounds', 'Waste removal, toilet supplies, washroom hygiene services, garden and grounds maintenance.'],
      ['Concrete, asphalt & fencing', 'Concrete installation and repairs, asphalt works and fencing of all types.'],
    ],
  },
];

export const marquee = [
  'Window cleaning', 'Carpet & upholstery', 'High pressure washing', 'Car park cleaning',
  'Commercial sweeping', 'Solid surface buffing', 'Painting & carpentry', 'Plumbing & electrical',
  'Grounds maintenance', 'Waste removal', 'Washroom hygiene',
];

// Extra pages kept at the SAME URLs as the old WordPress site so existing rankings and inbound links carry over.
// Wording is based on the old site (and the company profile PDF); the client should confirm it is still accurate.
export const extras = [
  {
    slug: 'why-tourwood',
    title: 'Why Tourwood',
    seoTitle: 'Why choose Tourwood Property Services',
    desc: 'Prompt, reliable cleaning and property maintenance across metro and regional Victoria, with one single point of contact.',
    lead: 'Cleaning and property maintenance affect your building, your staff and your tenants every single day. We take that responsibility seriously, and we plan our work to be prompt, efficient and seamless.',
    points: [
      ['Prompt and reliable', 'On time, every time, with emergency fixes and same-day attention where the issue is critical.'],
      ['Metro and regional', 'We service properties across Victoria, in Melbourne and in regional areas.'],
      ['A one-stop shop', 'One team for all of your property service requirements, rather than a list of separate contractors.'],
      ['One single point of contact', 'This greatly reduces the time you spend organising your property maintenance and cleaning.'],
      ['Detailed records', 'Our Customer Services Database logs client interaction and history, along with periodic maintenance requirements such as window cleaning, carpet and hard floor maintenance, car park cleaning and gardening, plus agreed tasks and frequencies.'],
      ['Discreet and thorough', 'Everyday services are delivered in a timely, discreet, thorough and reliable manner.'],
    ],
  },
  {
    slug: 'emergencies',
    title: 'Emergencies',
    seoTitle: 'Emergency property maintenance and repairs, Victoria',
    desc: 'Emergency fixes for commercial, industrial and residential properties across Victoria, with same-day attention where the issue is critical.',
    lead: 'When something goes wrong at your property, you need one team to call. Emergency fixes, with same-day attention where the issue is critical, are part of how Tourwood works.',
    points: [
      ['One number to call', 'Our single point of contact means you are not hunting for the right trade in the middle of a problem.'],
      ['Licensed trades in-house', 'Plumbing and electrical services, glazing, carpentry, and building repairs through our licensed commercial and domestic building units.'],
      ['Metro and regional', 'We service properties across Melbourne and regional Victoria.'],
      ['Cleaning and site support', 'Specialist cleaning, waste removal and washroom hygiene support when a site needs to get back to normal quickly.'],
    ],
  },
  {
    slug: 'covid-deep-cleaning',
    title: 'COVID Safety & Deep Cleaning',
    seoTitle: 'COVID safety, deep cleaning and decontamination, Victoria',
    desc: 'Deep cleaning to a very high standard, and decontamination cleaning after a positive case at a managed site, backed by a COVID Safe Plan.',
    lead: 'Tourwood operates with a detailed COVID Safe Plan covering our staff and clients. We can also provide the following services on an ongoing, or as-required, basis.',
    points: [
      ['Deep cleaning', 'For clients who want a very high level of cleanliness (hospital grade), either periodically or on a regular schedule.'],
      ['COVID cleaning', 'Decontamination cleaning if there is a positive case at one of our managed sites.'],
      ['Our COVID Safe Plan', 'Covers our staff and our clients. Contact us if you would like a copy.'],
    ],
  },
  {
    slug: 'quality-assurance',
    title: 'Quality Assurance',
    seoTitle: 'Quality assurance: inspections, reports and service records',
    desc: 'How Tourwood inspects, records and reports on its cleaning and maintenance work, so clients are always serviced to a high standard.',
    lead: 'Our quality assurance programme is comprehensive, ongoing and continually monitored, so clients are always serviced in a professional and high quality manner.',
    points: [
      ['Regular site inspections', 'Operations Management inspects sites fortnightly or as required, with detailed inspection reports shared with clients and cleaning staff, signed off by a client representative and followed up at the next inspection or service call.'],
      ['Customer contact', 'Monthly customer service calls support the inspections, so issues are raised and dealt with early.'],
      ['A complete client history', 'Our Customer Services Database logs all discussions and contact with each client, so a full history can be referred to at any time.'],
      ['Scheduled periodic work', 'Periodic carpet, hard surface and window cleaning is scheduled by frequency without client involvement, flagged for completion and signed off by the client. A site Communication Book records special requests and completed tasks.'],
    ],
  },
  {
    slug: 'environment',
    title: 'Environment',
    seoTitle: 'Environmental commitment: biodegradable cleaning products',
    desc: 'Biodegradable cleaning products, safety documentation for each site on request, and a commitment to minimise plastic use.',
    lead: 'Tourwood has a firm commitment to the environment.',
    points: [
      ['Biodegradable products', 'Our cleaning products are biodegradable and designed to break down without negative environmental effects.'],
      ['Safety documentation', 'We can provide Material Safety Data Sheets (MSDS) for the products used, site by site, as required.'],
      ['Less plastic', 'Where possible, and subject to client requirements, we aim to minimise plastic use to reduce the environmental impact of our work.'],
    ],
  },
];
