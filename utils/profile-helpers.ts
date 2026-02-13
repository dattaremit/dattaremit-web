import type { Address as ApiAddress } from "@/types/api";

export interface AddressForm {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function apiAddressToForm(addr: ApiAddress): AddressForm {
  return {
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2 || "",
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country,
  };
}

export function addressesEqual(a: AddressForm, b: AddressForm): boolean {
  return (
    a.addressLine1 === b.addressLine1 &&
    a.addressLine2 === b.addressLine2 &&
    a.city === b.city &&
    a.state === b.state &&
    a.postalCode === b.postalCode &&
    a.country === b.country
  );
}
