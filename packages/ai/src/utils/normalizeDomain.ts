export function normalizeDomain(input: string) {
  return input.replace(/^https?:\/\//, '').replace(/^www\./, '');
}
