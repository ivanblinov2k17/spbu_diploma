import gcd from "compute-gcd"
import Big from "big.js"

const primeNumberList = [
    131, 137, 139, 149,
    151, 157, 163, 167, 
    173, 179, 181, 191, 
    193, 197, 199, 211, 
    223]

const shares = 5
const threshold = 3
// const p = primeNumberList[Math.floor(Math.random()*primeNumberList.length)]
const p = 197
console.log(p, 'p')
let m = []
for (let i = p+1; i <= 256; i++) {
    let suitable = true;
    m.forEach((mi)=>{
        if (gcd(i, mi)!=1) {
            suitable = false
        }
    })
    if(suitable){
        m.push(i)
    }    
}
let M = Big(1)
m = m.slice(-shares)
console.log(m, 'mi array')
m.forEach((mi) => M = M.times(mi))
console.log(M.toString(), 'M')

let N = Big(1)
const m_thresh = m.slice(-threshold+1)
m_thresh.forEach(mi => N = N.times(mi))
console.log(N.toString(), 'N')

console.log(N.times(p).toString(), 'nmultp')
console.log(M.minus(N.times(p)).toString(), 'equasion1')

if (M.lt(N.times(p))){
    throw new Error('Step 1 requirement is not passed please pick other (k,n values)');
}