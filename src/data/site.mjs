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
