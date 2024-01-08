/* eslint-disable @typescript-eslint/prefer-for-of */

export type TaxCalculationResult = {
  grossedUpDividend: number;
  federalTaxCredit: number;
  provincialTaxCredit: number;
  netDividend: number;
};
export function calculateDividendTax(
  income: number,
  province: string,
): TaxCalculationResult {
  // Federal rates for eligible dividends
  const federalGrossUpRate = 0.38;
  const federalTaxCreditRate = 0.150198;

  // Provincial rates vary by province, here are the rates for British Columbia for eligible dividends
  const provincialGrossUpRate = province === "British Columbia" ? 0.12 : 0; // Update for other provinces as needed
  const provincialTaxCreditRate = province === "British Columbia" ? 0.12 : 0; // Update for other provinces as needed

  // Calculate the grossed-up dividend
  const grossedUpDividend =
    income * (1 + federalGrossUpRate + provincialGrossUpRate);

  // Calculate the federal and provincial tax credits
  const federalTaxCredit = grossedUpDividend * federalTaxCreditRate;
  const provincialTaxCredit = grossedUpDividend * provincialTaxCreditRate;

  // Calculate the net dividend after tax credits
  const netDividend = income - (federalTaxCredit + provincialTaxCredit);

  return {
    grossedUpDividend,
    federalTaxCredit,
    provincialTaxCredit,
    netDividend,
  };
}
export interface TaxBracket {
  upperLimit: number;
  rate: number;
}
export const federalTaxBrackets: TaxBracket[] = [
  { upperLimit: 53359, rate: 0.15 },
  { upperLimit: 106717, rate: 0.205 },
  { upperLimit: 165430, rate: 0.26 },
  { upperLimit: 235675, rate: 0.29 },
  { upperLimit: Infinity, rate: 0.33 },
];
export const provincialTaxBrackets: { [province: string]: TaxBracket[] } = {
  "British Columbia": [
    { upperLimit: 45654, rate: 0.0506 },
    { upperLimit: 91310, rate: 0.077 },
    { upperLimit: 104835, rate: 0.105 },
    { upperLimit: 127299, rate: 0.1229 },
    { upperLimit: 172602, rate: 0.147 },
    { upperLimit: 240716, rate: 0.168 },
    { upperLimit: Infinity, rate: 0.205 },
  ],
  // Other provinces would be added here in the same format
};
export function lookupTaxRate(income: number, brackets: TaxBracket[]): number {
  return brackets.find((bracket) => income <= bracket.upperLimit)!.rate;
}
export interface TaxRateResult {
  income: number;
  combinedMarginalTaxRate: number;
  federalTaxRate: number;
  provincialTaxRate: number;
}
export function calculateCombinedMarginalTaxRate(
  income: number,
  province: string,
): TaxRateResult {
  let remainingIncome = income;
  let federalTax = 0;
  let provincialTax = 0;

  for (let i = 0; i < federalTaxBrackets.length; i++) {
    const bracket = federalTaxBrackets[i];
    if (remainingIncome > bracket.upperLimit) {
      federalTax += bracket.upperLimit * bracket.rate;
      remainingIncome -= bracket.upperLimit;
    } else {
      federalTax += remainingIncome * bracket.rate;
      break;
    }
  }

  for (let i = 0; i < provincialTaxBrackets[province].length; i++) {
    const bracket = provincialTaxBrackets[province][i];
    if (remainingIncome > bracket.upperLimit) {
      provincialTax += bracket.upperLimit * bracket.rate;
      remainingIncome -= bracket.upperLimit;
    } else {
      provincialTax += remainingIncome * bracket.rate;
      break;
    }
  }

  const combinedMarginalTaxRate = (federalTax + provincialTax) / income;

  return {
    income: income,
    combinedMarginalTaxRate: combinedMarginalTaxRate,
    federalTaxRate: federalTax / income,
    provincialTaxRate: provincialTax / income,
  };
}
export interface TaxComparisonResult {
  income: number;
  dividends: {
    taxed: { provincial: number; federal: number; percentage: number };
    takeHome: number;
  };
  wages: {
    cpp: number;
    ei: number;
    taxes: {
      percentage: number;
      provincial: number;
      federal: number;
    };
    takeHome: number;
    cppPercentage: number;
    eiPercentage: number;
  };
}
