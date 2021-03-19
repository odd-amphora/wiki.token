export default function FormatAddress(address) {
  if (!address) {
    return;
  }
  // TODO(teddywilson) validate addresses properly?
  if (address < 12) {
    return address;
  }
  const beginning = address.substring(0, 6);
  const end = address.substring(address.length - 6);
  return beginning.concat(`...`).concat(end);
}
