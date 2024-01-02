import { TaxCalculationResult } from "./TaxCalculationResult";

export function calculateDividendTax(
  income: number,
  province: string
): TaxCalculationResult {
  // Federal rates for eligible dividends
  const federalGrossUpRate = 0.38;
  const federalTaxCreditRate = 0.150198;

  // Provincial rates vary by province, here are the rates for British Columbia for eligible dividends
  const provincialGrossUpRate = province === "British Columbia" ? 0.12 : 0; // Update for other provinces as needed
  const provincialTaxCreditRate = province === "British Columbia" ? 0.12 : 0; // Update for other provinces as needed


  // Calculate the grossed-up dividend
  const grossedUpDividend = income * (1 + federalGrossUpRate + provincialGrossUpRate);

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
