export type RecyclingCenter = {
  id: string;
  name: string;
  address: string;
  distanceMiles: number;
  acceptedMaterials: string[];
};

export const RECYCLING_CENTERS: RecyclingCenter[] = [
  {
    id: '1',
    name: 'Green Loop Recycling Center',
    address: '1200 Sustainability Ave',
    distanceMiles: 1.2,
    acceptedMaterials: ['Paper', 'Aluminum', 'Plastics'],
  },
  {
    id: '2',
    name: 'City Scrap & Metal Depot',
    address: '48 Industrial Way',
    distanceMiles: 2.8,
    acceptedMaterials: ['Steel', 'Aluminum'],
  },
  {
    id: '3',
    name: 'EcoCycle Drop-Off Station',
    address: '900 Earthday Blvd',
    distanceMiles: 3.5,
    acceptedMaterials: ['Paper', 'Plastics', 'Compostables'],
  },
  {
    id: '4',
    name: 'Community Compost Yard',
    address: '15 Greenbelt Rd',
    distanceMiles: 4.1,
    acceptedMaterials: ['Compostables'],
  },
];
