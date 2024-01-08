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
    // Calculate CPP and EI
    const cpp = income * 0.051; // 5.1% is the current CPP rate
    const ei = income * 0.0158; // 1.58% is the current EI rate
    const taxableIncome = income - cpp - ei;
    // Calculate dividend tax
    const dividendTax = calculateDividendTax(taxableIncome, province);

    // Calculate wage tax
    const wageTax = calculateCombinedMarginalTaxRate(taxableIncome, province);

    // Calculate take home for dividends and wages
    const dividendTakeHome = taxableIncome - (dividendTax.federalTaxCredit + dividendTax.provincialTaxCredit);
    const wageTakeHome = taxableIncome - ((wageTax.federalTaxRate * wageTax.income) + (wageTax.provincialTaxRate * wageTax.income) + cpp + ei);

    // Calculate percentage of income consumed by each tax and EI
    const dividendTaxPercentage = (dividendTax.federalTaxCredit + dividendTax.provincialTaxCredit);
    const wageTaxPercentage = (wageTax.federalTaxRate + wageTax.provincialTaxRate) * 100;
    const cppPercentage = cpp / income * 100;
    const eiPercentage = ei / income * 100;

    return {
      income,
      dividends: {
        taxed: {
          provincial: dividendTax.provincialTaxCredit,
          federal: dividendTax.federalTaxCredit,
          percentage: dividendTaxPercentage,
        },
        takeHome: dividendTakeHome,
      },
      wages: {
        cpp,
        ei,
        taxes: {
          provincial: wageTax.provincialTaxRate,
          federal: wageTax.federalTaxRate,
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
        <div key={index} className="w-1/2">
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-2xl font-bold mb-4">Income: {roundToTwo(result.income)}</h2>
            <div className="flex justify-between">
{/*               <div>
                <h3 className="text-xl font-semibold mb-2">Dividends:</h3>
                <p>Provincial Tax: {roundToTwo(result.dividends.taxed.provincial)}%</p>
                <p>Federal Tax: {roundToTwo(result.dividends.taxed.federal)}%</p>
                <p>Take Home: {roundToTwo(result.dividends.takeHome / result.income * 100)}%</p>
              </div> */}
              <div>
                <h3 className="text-xl font-semibold mb-2">Wages:</h3>
                <p>CPP: ${roundToTwo(result.wages.cpp)} ({roundToTwo(result.wages.cppPercentage)}%)</p>
                <p>EI: ${roundToTwo(result.wages.ei)} ({roundToTwo(result.wages.eiPercentage)}%)</p>
                <p>Provincial Tax: ${roundToTwo(result.wages.taxes.provincial * result.income)} ({roundToTwo(result.wages.taxes.provincial)}%)</p>
                <p>Federal Tax: ${roundToTwo(result.wages.taxes.federal * result.income)} ({roundToTwo(result.wages.taxes.federal * 100)}%)</p>
                <p>Take Home: ${roundToTwo(result.wages.takeHome)} ({roundToTwo(result.wages.takeHome / result.income * 100)}%)</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
