const MIN_ADDRESS_LENGTH = 12;

export function formatAddress(address) {
  if (!address || (typeof address !== "string" && !(address instanceof String))) {
    return;
  }
  if (address < MIN_ADDRESS_LENGTH) {
    return address;
  }
  const beginning = address.substring(0, 6);
  const end = address.substring(address.length - 6);
  return beginning.concat(`...`).concat(end);
}
