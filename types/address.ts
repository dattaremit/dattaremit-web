export type AutocompletePrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

export type AddressComponents = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
};
