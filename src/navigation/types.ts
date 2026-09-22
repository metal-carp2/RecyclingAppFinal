import { MaterialKey } from '../data/materials';

export type RewardsPrefill = {
  material: MaterialKey;
  grams: number;
}[];

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Scanner: undefined;
  Map: undefined;
  Rewards: { prefill?: RewardsPrefill } | undefined;
  Settings: undefined;
};
