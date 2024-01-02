import type { MetaFunction } from "@remix-run/node";

import { calculateDividendTax } from "./TaxCalculationResult";
import { calculateCombinedMarginalTaxRate } from "./TaxCalculationResult";
import { TaxComparisonResult } from "./TaxCalculationResult";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

function roundToTwo(num: number): number {
  return +(Math.round(num + "e+2")  + "e-2");
}

function calculateTaxComparisonForBC(incomes: number[]): TaxComparisonResult[] {
  const province = "British Columbia";
  return incomes.map(income => {
    // Calculate dividend tax
    const dividendTax = calculateDividendTax(income, province);

    // Calculate wage tax
    const wageTax = calculateCombinedMarginalTaxRate(income, province);

    // Calculate CPP and EI
    const cpp = roundToTwo(income * 0.051); // 5.1% is the current CPP rate
    const ei = roundToTwo(income * 0.0158); // 1.58% is the current EI rate

    // Calculate take home for dividends and wages
    const dividendTakeHome =
      roundToTwo(income - (dividendTax.federalTaxCredit + dividendTax.provincialTaxCredit));
    const wageTakeHome =
      roundToTwo(income - (wageTax.federalTaxRate + wageTax.provincialTaxRate + cpp + ei));

    // Calculate percentage of income consumed by each tax and EI
    const dividendTaxPercentage = roundToTwo((dividendTax.federalTaxCredit + dividendTax.provincialTaxCredit));
    const wageTaxPercentage = roundToTwo((wageTax.federalTaxRate + wageTax.provincialTaxRate)) * 100;
    const cppPercentage = roundToTwo(cpp / income * 100);
    const eiPercentage = roundToTwo(ei / income * 100);

    return {
      income,
      dividends: {
        taxed: {
          provincial: roundToTwo(dividendTax.provincialTaxCredit),
          federal: roundToTwo(dividendTax.federalTaxCredit),
          percentage: dividendTaxPercentage,
        },
        takeHome: dividendTakeHome,
      },
      wages: {
        cpp,
        ei,
        taxes: {
          provincial: roundToTwo(wageTax.provincialTaxRate),
          federal: roundToTwo(wageTax.federalTaxRate),
          percentage: wageTaxPercentage,
        },
        cppPercentage,
        eiPercentage,
        takeHome: wageTakeHome,
      },
    } as TaxComparisonResult;
  });
}

export default function Index() {
  const incomes = [50000, 75000/* , 100000, 125000, 150000 */];
  const taxComparisons = calculateTaxComparisonForBC(incomes);
  return (
    <div className="flex flex-wrap justify-around">
      {taxComparisons.map((result, index) => (
        <div key={index} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-2xl font-bold mb-4">Income: {result.income}</h2>
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Dividends:</h3>
                <p>Provincial Tax: {result.dividends.taxed.percentage}%</p>
                <p>Federal Tax: {result.dividends.taxed.percentage}%</p>
                <p>Take Home: {roundToTwo(result.income / result.dividends.takeHome * 100)}%</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Wages:</h3>
                <p>CPP:  {result.wages.cppPercentage}%</p>
                <p>EI:  {result.wages.eiPercentage}%</p>
                <p>Provincial Tax:  {result.wages.taxes.percentage}%</p>
                <p>Federal Tax:  {result.wages.taxes.percentage}%</p>
                <p>Take Home: {roundToTwo(result.income / result.wages.takeHome * 100)}%</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
