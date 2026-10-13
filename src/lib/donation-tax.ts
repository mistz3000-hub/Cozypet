/** Educational ordinary 1× cash donation example, excluding prototype donations. */
export function hypotheticalDonationTax(netIncome:number,donation:number){
  const income=Number.isFinite(netIncome)?Math.max(0,Math.min(100_000_000,netIncome)):0;
  const gift=Number.isFinite(donation)?Math.max(0,Math.min(100_000_000,donation)):0;
  const deduction=Math.min(gift,income*.1);
  const tax=(amount:number)=>{
    const bands:[[number,number],...[number,number][]]=[[150000,0],[300000,.05],[500000,.1],[750000,.15],[1000000,.2],[2000000,.25],[5000000,.3],[Infinity,.35]];
    let lower=0,total=0;for(const [upper,rate] of bands){total+=Math.max(0,Math.min(amount,upper)-lower)*rate;lower=upper;if(amount<=upper)break;}return total;
  };
  return {deduction,taxBefore:tax(income),taxAfter:tax(income-deduction),saving:tax(income)-tax(income-deduction)};
}
